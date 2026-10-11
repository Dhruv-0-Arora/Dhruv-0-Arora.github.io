import { beforeEach, describe, expect, it } from "vitest";
import { frame, sim } from "../simStore.ts";
import {
  HOP,
  hopDuration,
  keyHop,
  Scroller,
  type ScrollHost,
} from "./scroller.ts";
import { buildLayout, plateauCentre, type Station } from "./stations.ts";

const MAX = 10_000;

/** A page that only moves when told to, with a hand-cranked clock. */
class FakeHost implements ScrollHost {
  y = 0;
  time = 0;
  frames = new Map<number, (now: number) => void>();
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

  /** Advance the clock and run one animation frame. */
  tick(ms: number): void {
    this.time += ms;
    const due = [...this.frames];
    this.frames.clear();
    for (const [, cb] of due) cb(this.time);
  }

  /** Run frames until nothing is scheduled or `limit` frames have run. */
  settle(limit = 400): void {
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

  it("tweens to the next plateau centre over the hop duration with easing", () => {
    host.y = centre(1);
    scroller.jumpToStation(1);
    expect(scroller.tweening).toBe(true);
    expect(scroller.heading).toBe(2);
    const ms = hopDuration((stations[2].t - stations[1].t) * 400);
    host.tick(ms / 2);
    const mid = host.y;
    expect(mid).toBeGreaterThan(centre(1));
    expect(mid).toBeLessThan(centre(2));
    host.tick(ms / 2);
    expect(host.y).toBeCloseTo(centre(2), 6);
    host.settle();
    expect(scroller.tweening).toBe(false);
    expect(host.y).toBeCloseTo(centre(2), 6);
    // Monotonic: the page never backs up during a forward jump.
    for (let i = 1; i < host.scrolls.length; i++) {
      expect(host.scrolls[i]).toBeGreaterThanOrEqual(host.scrolls[i - 1]);
    }
  });

  it("takes longer for a longer leg, inside the bounds", () => {
    expect(hopDuration(0)).toBe(HOP.minMs);
    expect(hopDuration(10_000)).toBe(HOP.maxMs);
    expect(hopDuration(300)).toBeGreaterThan(hopDuration(100));

    const timeTo = (from: number) => {
      host = new FakeHost();
      scroller = new Scroller(host);
      host.y = centre(from);
      scroller.jumpToStation(1);
      const begin = host.time;
      host.settle();
      return host.time - begin;
    };
    // 0.4 of the rail (stalk to cypher) against 0.1 (cypher to hub).
    expect(timeTo(2)).toBeGreaterThan(timeTo(3));
    expect(timeTo(3)).toBeGreaterThanOrEqual(HOP.minMs);
    expect(timeTo(2)).toBeLessThanOrEqual(HOP.maxMs + 16);
  });

  it("stacks jumps on the destination in flight", () => {
    host.y = centre(1);
    scroller.jumpToStation(1);
    host.tick(100);
    scroller.jumpToStation(1);
    host.settle();
    expect(host.y).toBeCloseTo(centre(3), 6);
  });

  it("keeps its speed when a hop is chained onto one in flight", () => {
    host.y = centre(0);
    scroller.jumpToStation(1);
    for (let i = 0; i < 30; i++) host.tick(16);
    const a = host.scrolls[host.scrolls.length - 2];
    const b = host.scrolls[host.scrolls.length - 1];
    const before = b - a;
    expect(before).toBeGreaterThan(0);
    scroller.jumpToStation(1);
    host.tick(16);
    const after = host.y - b;
    // No stall: the next frame moves about as far as the last one did.
    expect(after).toBeGreaterThan(before * 0.6);
    host.settle();
    expect(host.y).toBeCloseTo(centre(2), 6);
    for (let i = 1; i < host.scrolls.length; i++) {
      expect(host.scrolls[i]).toBeGreaterThanOrEqual(host.scrolls[i - 1]);
    }
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

  it("gives way when something else moves the page, and stays put", () => {
    host.y = centre(0);
    scroller.jumpToStation(1);
    host.tick(200);
    host.y += 500;
    const where = host.y;
    host.tick(16);
    expect(scroller.tweening).toBe(false);
    host.settle();
    expect(host.y).toBe(where);
  });

  it("stops when the visitor leaves the rails", () => {
    host.y = centre(0);
    scroller.jumpToStation(1);
    host.tick(200);
    const where = host.y;
    sim.set({ mode: "driving" });
    host.tick(16);
    expect(scroller.tweening).toBe(false);
    expect(host.y).toBe(where);
  });

  it("is a no-op when asked for the station already in flight", () => {
    host.y = centre(0);
    scroller.jumpTo(2);
    host.tick(100);
    const scrolls = host.scrolls.length;
    scroller.jumpTo(2);
    expect(host.frames.size).toBe(1);
    host.tick(16);
    expect(host.scrolls.length).toBe(scrolls + 1);
  });
});

describe("keyHop", () => {
  it("maps the page keys and the hop keys", () => {
    for (const code of [
      "ArrowRight",
      "ArrowDown",
      "PageDown",
      "KeyN",
      "KeyJ",
    ]) {
      expect(keyHop(code)).toBe(1);
    }
    for (const code of ["ArrowLeft", "ArrowUp", "PageUp", "KeyP", "KeyK"]) {
      expect(keyHop(code)).toBe(-1);
    }
    expect(keyHop("Space")).toBe(1);
    expect(keyHop("Space", true)).toBe(-1);
    expect(keyHop("Home")).toBe("first");
    expect(keyHop("End")).toBe("last");
    expect(keyHop("KeyW")).toBeNull();
  });
});
