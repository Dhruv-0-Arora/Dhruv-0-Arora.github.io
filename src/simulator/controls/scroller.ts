import { frame, sim } from "../simStore.ts";
import { jumpTarget, plateauCentre, snapTarget } from "./stations.ts";

/** Length of a station-to-station scroll tween, ms. */
export const JUMP_MS = 700;
/** Quiet time after the last scroll before the snap assist steps in, ms. */
export const SNAP_IDLE_MS = 150;

/** Keys that jump to the next or previous station while on rails. */
export const NEXT_KEYS: ReadonlySet<string> = new Set([
  "ArrowRight",
  "KeyN",
  "BracketRight",
  "KeyJ",
]);
export const PREV_KEYS: ReadonlySet<string> = new Set([
  "ArrowLeft",
  "KeyP",
  "BracketLeft",
  "KeyK",
]);

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
  setTimer(cb: () => void, ms: number): number;
  clearTimer(id: number): void;
}

function browserHost(): ScrollHost {
  return {
    scrollY: () => window.scrollY,
    scrollMax,
    scrollTo: (top) => window.scrollTo({ top, behavior: "instant" }),
    now: () => performance.now(),
    requestFrame: (cb) => requestAnimationFrame(cb),
    cancelFrame: (id) => cancelAnimationFrame(id),
    setTimer: (cb, ms) => window.setTimeout(cb, ms),
    clearTimer: (id) => window.clearTimeout(id),
  };
}

function easeInOutCubic(u: number): number {
  return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
}

/**
 * Moves the page between stations: a short eased scroll tween for the
 * next/previous keys and buttons, and a snap assist that finishes a leg
 * the visitor left half done. One instance owns the state so the two can
 * never fight: a jump suppresses the snap, and any input cancels both.
 * Only ever acts on rails; the vehicles own the keys otherwise.
 */
export class Scroller {
  private readonly host: ScrollHost;
  private rafId = 0;
  private timerId = 0;
  /** Station the tween in flight is heading for; null when idle. */
  private destination: number | null = null;
  /** A pointer is down (a scrollbar drag, a touch): never snap under it. */
  private pointerDown = false;

  constructor(host: ScrollHost) {
    this.host = host;
  }

  get tweening(): boolean {
    return this.destination !== null;
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

  /** Scroll to the middle of a station's plateau. */
  jumpTo(index: number): void {
    const layout = frame.layout;
    if (!layout || sim.get().mode !== "rails") return;
    const i = Math.max(0, Math.min(layout.stations.length - 1, index));
    this.tweenTo(plateauCentre(layout, i) * this.host.scrollMax(), i);
  }

  /** Cancel whatever is in flight; the page stays where it is. */
  cancel(): void {
    this.host.cancelFrame(this.rafId);
    this.host.clearTimer(this.timerId);
    this.destination = null;
  }

  /**
   * Called on every page scroll. The tween's own scrolls are ignored so
   * it never arms the assist against itself; any other scroll restarts
   * the idle clock.
   */
  onScroll(): void {
    if (this.tweening) return;
    this.host.clearTimer(this.timerId);
    this.timerId = this.host.setTimer(() => this.snap(), SNAP_IDLE_MS);
  }

  /** A cancelling input: wheel, touch, pointer or key. */
  onInput(): void {
    this.cancel();
  }

  onPointerDown(): void {
    this.pointerDown = true;
    this.cancel();
  }

  onPointerUp(): void {
    this.pointerDown = false;
  }

  /** Finish a half-done leg toward the nearer station. */
  private snap(): void {
    const layout = frame.layout;
    const state = sim.get();
    if (!layout || state.mode !== "rails" || state.reducedMotion) return;
    if (this.tweening || this.pointerDown) return;
    const index = snapTarget(this.progress(), layout);
    if (index === null) return;
    this.tweenTo(plateauCentre(layout, index) * this.host.scrollMax(), index);
  }

  private tweenTo(to: number, index: number): void {
    this.cancel();
    const from = this.host.scrollY();
    if (sim.get().reducedMotion || Math.abs(to - from) < 1) {
      this.host.scrollTo(to);
      return;
    }
    this.destination = index;
    const start = this.host.now();
    const step = (now: number) => {
      const u = Math.min(1, (now - start) / JUMP_MS);
      this.host.scrollTo(from + (to - from) * easeInOutCubic(u));
      if (u < 1) {
        this.rafId = this.host.requestFrame(step);
      } else {
        this.destination = null;
      }
    };
    this.rafId = this.host.requestFrame(step);
  }
}

/** The one scroller for the page. The host touches the DOM lazily. */
export const scroller = new Scroller(browserHost());

/**
 * Wires the scroller to the page. Cancellation listens to inputs only,
 * never to scroll itself, so the tween cannot cancel its own motion; the
 * jump keys are left alone so a key press does not cancel the jump it
 * just started.
 */
export function attachScroller(target: Scroller = scroller): () => void {
  const onScroll = () => target.onScroll();
  const onInput = () => target.onInput();
  const onKey = (e: KeyboardEvent) => {
    if (NEXT_KEYS.has(e.code) || PREV_KEYS.has(e.code)) return;
    target.onInput();
  };
  const onPointerDown = () => target.onPointerDown();
  const onPointerUp = () => target.onPointerUp();
  const passive = { passive: true } as const;
  window.addEventListener("scroll", onScroll, passive);
  window.addEventListener("wheel", onInput, passive);
  window.addEventListener("touchstart", onInput, passive);
  window.addEventListener("keydown", onKey, passive);
  window.addEventListener("pointerdown", onPointerDown, passive);
  window.addEventListener("pointerup", onPointerUp, passive);
  window.addEventListener("pointercancel", onPointerUp, passive);
  return () => {
    target.cancel();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("wheel", onInput);
    window.removeEventListener("touchstart", onInput);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };
}
