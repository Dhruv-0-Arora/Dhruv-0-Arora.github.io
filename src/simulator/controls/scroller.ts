import { frame, sim } from "../simStore.ts";
import { jumpTarget, plateauCentre, railFromScroll } from "./stations.ts";

/**
 * How long a hop takes. A hop is a ride, not a cut: it scales with the
 * metres of rail it covers, so a short hop between neighbours is quick
 * and a long leg round the range takes longer, inside fixed bounds.
 */
export const HOP = {
  minMs: 1100,
  maxMs: 2600,
  msPerMeter: 2.4,
} as const;

/**
 * How far the page may sit from where the tween last put it before the
 * tween decides someone else is scrolling, px. Browsers round scroll
 * positions to device pixels, so this is a little more than one.
 */
const FOREIGN_SCROLL_PX = 3;

/** Duration of a hop covering `metres` of rail, ms. */
export function hopDuration(metres: number): number {
  const ms = HOP.minMs + Math.abs(metres) * HOP.msPerMeter;
  return Math.min(HOP.maxMs, Math.max(HOP.minMs, ms));
}

/** Keys that jump to the next or previous station while on rails. */
export const NEXT_KEYS: ReadonlySet<string> = new Set([
  "ArrowRight",
  "ArrowDown",
  "PageDown",
  "Space",
  "KeyN",
  "BracketRight",
  "KeyJ",
]);
export const PREV_KEYS: ReadonlySet<string> = new Set([
  "ArrowLeft",
  "ArrowUp",
  "PageUp",
  "KeyP",
  "BracketLeft",
  "KeyK",
]);

/** What a key asks of the rails: a hop, the first station, the last, or nothing. */
export type KeyHop = 1 | -1 | "first" | "last" | null;

/** Maps a key press to a station move. Shift+Space goes back, like a page. */
export function keyHop(code: string, shiftKey = false): KeyHop {
  if (code === "Space") return shiftKey ? -1 : 1;
  if (code === "Home") return "first";
  if (code === "End") return "last";
  if (NEXT_KEYS.has(code)) return 1;
  if (PREV_KEYS.has(code)) return -1;
  return null;
}

/** How far the page can scroll, px. */
export function scrollMax(): number {
  return document.documentElement.scrollHeight - window.innerHeight;
}

/** Page scroll as a fraction of the way down, 0..1. */
export function scrollProgress(): number {
  const max = scrollMax();
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/**
 * What the scroller needs from the page, so the tween can run against a
 * fake in tests and against the window in the browser.
 */
export interface ScrollHost {
  scrollY(): number;
  scrollMax(): number;
  /** Sets the scroll position at once; the tween supplies its own easing. */
  scrollTo(top: number): void;
  now(): number;
  requestFrame(cb: (now: number) => void): number;
  cancelFrame(id: number): void;
}

function browserHost(): ScrollHost {
  return {
    scrollY: () => window.scrollY,
    scrollMax,
    scrollTo: (top) => window.scrollTo({ top, behavior: "instant" }),
    now: () => performance.now(),
    requestFrame: (cb) => requestAnimationFrame(cb),
    cancelFrame: (id) => cancelAnimationFrame(id),
  };
}

export function easeInOutCubic(u: number): number {
  return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
}

/**
 * A hop in flight, as a curve over normalised time u in [0, 1]. A fresh
 * hop eases in and out; a hop chained onto one already moving starts at
 * the speed the page is going (a cubic Hermite with that start slope), so
 * pressing next twice never stalls the ride in between.
 */
interface Tween {
  from: number;
  to: number;
  start: number;
  duration: number;
  /** Start slope, px per unit u; 0 for a fresh hop. */
  v0: number;
}

function tweenAt(tw: Tween, u: number): number {
  if (tw.v0 === 0) return tw.from + (tw.to - tw.from) * easeInOutCubic(u);
  const u2 = u * u;
  const u3 = u2 * u;
  const y =
    tw.from + (tw.to - tw.from) * (3 * u2 - 2 * u3) + tw.v0 * (u3 - 2 * u2 + u);
  // Never past the destination, whatever the start slope.
  return tw.to >= tw.from ? Math.min(y, tw.to) : Math.max(y, tw.to);
}

/** Page speed of a tween at a time, px per ms. */
function tweenSpeed(tw: Tween, now: number): number {
  const u = (now - tw.start) / tw.duration;
  if (u <= 0 || u >= 1) return 0;
  const h = Math.min(1e-3, 1 - u);
  return (tweenAt(tw, u + h) - tweenAt(tw, u)) / (h * tw.duration);
}

/**
 * Moves the page between stations: an eased scroll tween per hop, whose
 * length follows the metres of rail it covers. The page scroll is only
 * ever moved by a hop on rails, so it always rests on a plateau unless a
 * tween is running or the visitor drags the scrollbar.
 * Only ever acts on rails; the vehicles own the keys otherwise.
 */
export class Scroller {
  private readonly host: ScrollHost;
  private rafId = 0;
  private tween: Tween | null = null;
  /** Station the tween in flight is heading for; null when idle. */
  private destination: number | null = null;

  constructor(host: ScrollHost) {
    this.host = host;
  }

  get tweening(): boolean {
    return this.destination !== null;
  }

  /** Station the hop in flight is heading for, or null when idle. */
  get heading(): number | null {
    return this.destination;
  }

  /** Current scroll fraction, 0..1. */
  private progress(): number {
    const max = this.host.scrollMax();
    return max > 0 ? Math.min(1, Math.max(0, this.host.scrollY() / max)) : 0;
  }

  /**
   * Jump one station forward or back. A tween in flight counts as already
   * there, so pressing next twice quickly goes two stations.
   */
  jumpToStation(direction: 1 | -1): void {
    const layout = frame.layout;
    if (!layout || sim.get().mode !== "rails") return;
    this.jumpTo(
      this.destination === null
        ? jumpTarget(this.progress(), layout, direction)
        : this.destination + direction,
    );
  }

  /** Ride to the middle of a station's plateau. */
  jumpTo(index: number): void {
    const layout = frame.layout;
    if (!layout || sim.get().mode !== "rails") return;
    const i = Math.max(0, Math.min(layout.stations.length - 1, index));
    if (i === this.destination) return;
    this.tweenTo(plateauCentre(layout, i) * this.host.scrollMax(), i);
  }

  /** Cancel whatever is in flight; the page stays where it is. */
  cancel(): void {
    this.host.cancelFrame(this.rafId);
    this.tween = null;
    this.destination = null;
  }

  private tweenTo(to: number, index: number): void {
    const layout = frame.layout;
    const now = this.host.now();
    const carried = this.tween ? tweenSpeed(this.tween, now) : 0;
    this.cancel();
    const from = this.host.scrollY();
    if (sim.get().reducedMotion || Math.abs(to - from) < 1) {
      this.host.scrollTo(to);
      return;
    }
    const max = this.host.scrollMax();
    const metres =
      layout && max > 0
        ? Math.abs(
            layout.stations[index].t -
              railFromScroll(Math.min(1, Math.max(0, from / max)), layout),
          ) * layout.railLength
        : 0;
    const duration = hopDuration(metres);
    // Only carry speed that points the way this hop goes.
    const v0 =
      Math.sign(carried) === Math.sign(to - from) ? carried * duration : 0;
    const tw: Tween = { from, to, start: now, duration, v0 };
    this.tween = tw;
    this.destination = index;
    let set = from;
    const step = (t: number) => {
      // Someone else moved the page (a scrollbar drag, find-in-page), or
      // the visitor took a vehicle: the hop gives way rather than fight.
      if (
        sim.get().mode !== "rails" ||
        Math.abs(this.host.scrollY() - set) > FOREIGN_SCROLL_PX
      ) {
        this.cancel();
        return;
      }
      const u = Math.min(1, Math.max(0, (t - tw.start) / tw.duration));
      set = tweenAt(tw, u);
      this.host.scrollTo(set);
      if (u < 1) {
        this.rafId = this.host.requestFrame(step);
      } else {
        this.tween = null;
        this.destination = null;
      }
    };
    this.rafId = this.host.requestFrame(step);
  }
}

/** The one scroller for the page. The host touches the DOM lazily. */
export const scroller = new Scroller(browserHost());

/**
 * Wires the scroller to the page and returns its teardown. Nothing
 * outside cancels a hop any more: the wheel and touch are the hops
 * themselves (see `useInputs`), and the momentum tail of the gesture that
 * started one must never stop it. The tween gives way on its own when
 * something else moves the page or the visitor leaves the rails.
 */
export function attachScroller(target: Scroller = scroller): () => void {
  return () => target.cancel();
}
