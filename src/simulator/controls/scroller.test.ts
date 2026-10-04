import { beforeEach, describe, expect, it } from "vitest";
import { frame, sim } from "../simStore.ts";
import {
  JUMP_MS,
  Scroller,
  type ScrollHost,
  SNAP_IDLE_MS,
} from "./scroller.ts";
import { buildLayout, plateauCentre, type Station } from "./stations.ts";

const MAX = 10_000;

/** A page that only moves when told to, with a hand-cranked clock. */
class FakeHost implements ScrollHost {
  y = 0;
  time = 0;
  frames = new Map<number, (now: number) => void>();
  timers = new Map<number, { at: number; cb: () => void }>();
  private nextId = 1;
  scrolls: number[] = [];

  scrollY = () => this.y;
  scrollMax = () => MAX;
  scrollTo = (top: number) => {
    this.y = top;
    this.scrolls.push(top);
  };
  now = () => this.time;
  requestFrame = (cb: (now: number) => void) => {
    const id = this.nextId++;
    this.frames.set(id, cb);
    return id;
  };
  cancelFrame = (id: number) => {
    this.frames.delete(id);
  };
  setTimer = (cb: () => void, ms: number) => {
    const id = this.nextId++;
    this.timers.set(id, { at: this.time + ms, cb });
    return id;
  };
  clearTimer = (id: number) => {
    this.timers.delete(id);
  };

  /** Advance the clock, firing due timers and one animation frame. */
  tick(ms: number): void {
    this.time += ms;
    for (const [id, timer] of [...this.timers]) {
      if (timer.at <= this.time) {
        this.timers.delete(id);
        timer.cb();
      }
    }
    const due = [...this.frames];
    this.frames.clear();
    for (const [, cb] of due) cb(this.time);
  }

  /** Run frames until nothing is scheduled or `limit` frames have run. */
  settle(limit = 200): void {
    for (let i = 0; i < limit && this.frames.size > 0; i++) this.tick(16);
  }
}

const stations: Station[] = [
  { zone: "hub", t: 0 },
  { zone: "astute", t: 0.25 },
  { zone: "stalk", t: 0.5 },
  { zone: "cypher", t: 0.9 },
  { zone: "hub", t: 1 },
];
const layout = buildLayout(stations, 400);
const centre = (i: number) => plateauCentre(layout, i) * MAX;

describe("Scroller", () => {
  let host: FakeHost;
  let scroller: Scroller;

  beforeEach(() => {
    sim.reset();
    frame.layout = layout;
    host = new FakeHost();
    scroller = new Scroller(host);
  });

  it("does nothing without a layout or off the rails", () => {
    frame.layout = null;
    scroller.jumpToStation(1);
    expect(host.scrolls).toEqual([]);
    frame.layout = layout;
    sim.set({ mode: "driving" });
    scroller.jumpToStation(1);
    expect(host.scrolls).toEqual([]);
  });

  it("tweens to the next plateau centre over JUMP_MS with easing", () => {
    host.y = centre(1);
    scroller.jumpToStation(1);
    expect(scroller.tweening).toBe(true);
    host.tick(JUMP_MS / 2);
    const mid = host.y;
    expect(mid).toBeGreaterThan(centre(1));
    expect(mid).toBeLessThan(centre(2));
    host.tick(JUMP_MS / 2);
    expect(host.y).toBeCloseTo(centre(2), 6);
    host.settle();
    expect(scroller.tweening).toBe(false);
    expect(host.y).toBeCloseTo(centre(2), 6);
    // Monotonic: the page never backs up during a forward jump.
    for (let i = 1; i < host.scrolls.length; i++) {
      expect(host.scrolls[i]).toBeGreaterThanOrEqual(host.scrolls[i - 1]);
    }
  });

  it("stacks jumps on the destination in flight", () => {
    host.y = centre(1);
    scroller.jumpToStation(1);
    host.tick(100);
    scroller.jumpToStation(1);
    host.settle();
    expect(host.y).toBeCloseTo(centre(3), 6);
  });

  it("goes to the hub at both ends and clamps there", () => {
    host.y = centre(1);
    scroller.jumpToStation(-1);
    host.settle();
    expect(host.y).toBeCloseTo(centre(0), 6);
    scroller.jumpToStation(-1);
    host.settle();
    expect(host.y).toBeCloseTo(centre(0), 6);
    host.y = centre(3);
    scroller.jumpToStation(1);
    host.settle();
    expect(host.y).toBeCloseTo(centre(4), 6);
    expect(host.y).toBeCloseTo(
      MAX - ((layout.ends[4] - layout.starts[4]) * MAX) / 2,
      6,
    );
  });

  it("cuts straight there under reduced motion", () => {
    sim.set({ reducedMotion: true });
    host.y = centre(0);
    scroller.jumpToStation(1);
    expect(scroller.tweening).toBe(false);
    expect(host.scrolls).toEqual([centre(1)]);
  });

  it("is cancelled by input and stays put", () => {
    host.y = centre(0);
    scroller.jumpToStation(1);
    host.tick(200);
    const where = host.y;
    scroller.onInput();
    expect(scroller.tweening).toBe(false);
    host.settle();
    expect(host.y).toBe(where);
  });

  it("snaps to the nearer station after the scroll goes quiet", () => {
    const span = layout.starts[2] - layout.ends[1];
    host.y = (layout.ends[1] + span * 0.7) * MAX;
    scroller.onScroll();
    host.tick(SNAP_IDLE_MS - 1);
    expect(scroller.tweening).toBe(false);
    host.tick(1);
    expect(scroller.tweening).toBe(true);
    host.settle();
    expect(host.y).toBeCloseTo(centre(2), 6);
  });

  it("restarts the idle clock on every scroll", () => {
    const span = layout.starts[2] - layout.ends[1];
    host.y = (layout.ends[1] + span * 0.3) * MAX;
    scroller.onScroll();
    host.tick(SNAP_IDLE_MS - 10);
    scroller.onScroll();
    host.tick(SNAP_IDLE_MS - 10);
    expect(scroller.tweening).toBe(false);
    host.tick(10);
    expect(scroller.tweening).toBe(true);
    host.settle();
    expect(host.y).toBeCloseTo(centre(1), 6);
  });

  it("never snaps from a plateau, while tweening, under a pointer or in reduced motion", () => {
    host.y = centre(1);
    scroller.onScroll();
    host.tick(SNAP_IDLE_MS);
    expect(scroller.tweening).toBe(false);

    const span = layout.starts[2] - layout.ends[1];
    const mid = (layout.ends[1] + span * 0.5) * MAX;
    host.y = mid;
    scroller.onPointerDown();
    scroller.onScroll();
    host.tick(SNAP_IDLE_MS);
    expect(scroller.tweening).toBe(false);
    scroller.onPointerUp();

    sim.set({ reducedMotion: true });
    scroller.onScroll();
    host.tick(SNAP_IDLE_MS);
    expect(scroller.tweening).toBe(false);
    sim.set({ reducedMotion: false });

    // The tween's own scrolls do not arm the assist.
    host.y = centre(0);
    scroller.jumpToStation(1);
    scroller.onScroll();
    expect(host.timers.size).toBe(0);
  });

  it("stays quiet off the rails", () => {
    sim.set({ mode: "flying" });
    const span = layout.starts[2] - layout.ends[1];
    host.y = (layout.ends[1] + span * 0.5) * MAX;
    scroller.onScroll();
    host.tick(SNAP_IDLE_MS);
    expect(scroller.tweening).toBe(false);
  });
});
