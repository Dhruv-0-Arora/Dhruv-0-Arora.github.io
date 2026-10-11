import { describe, expect, it } from "vitest";
import {
  DOM_DELTA_LINE,
  DOM_DELTA_PAGE,
  normaliseDelta,
  WHEEL,
  WheelIntent,
} from "./wheelIntent.ts";

/** Feeds deltas 16 ms apart from `start`; returns the hops and the end time. */
function feed(
  intent: WheelIntent,
  deltas: readonly number[],
  start = 0,
  mode = 0,
  step = 16,
): { hops: number[]; end: number } {
  const hops: number[] = [];
  let time = start;
  for (const d of deltas) {
    const hop = intent.push(d, mode, time, 800);
    if (hop !== 0) hops.push(hop);
    time += step;
  }
  return { hops, end: time - step };
}

/** A trackpad flick: a quick ramp, a peak, then a long exponential tail. */
function flick(peak: number, sign = 1, tailFrames = 120): number[] {
  const out = [peak * 0.1, peak * 0.4, peak * 0.8, peak];
  let v = peak;
  for (let i = 0; i < tailFrames; i++) {
    v *= 0.95;
    out.push(Math.max(1, Math.round(v)));
  }
  return out.map((d) => d * sign);
}

describe("WheelIntent", () => {
  it("turns a flick with a two-second momentum tail into exactly one hop", () => {
    const intent = new WheelIntent();
    expect(feed(intent, flick(120)).hops).toEqual([1]);
  });

  it("swallows a tail that wobbles but never really rises", () => {
    const intent = new WheelIntent();
    const tail = flick(90).map((d, i) => d + (i % 3 === 0 ? 2 : -1));
    expect(feed(intent, tail).hops).toEqual([1]);
  });

  it("keeps a flick whose deltas are still climbing to one hop", () => {
    const intent = new WheelIntent();
    const ramp = [10, 40, 70, 100, 130, 160, 140, 100, 60, 30, 10, 4, 2, 1];
    expect(feed(intent, ramp).hops).toEqual([1]);
  });

  it("gives two hops for two flicks, even when the second lands in the first's tail", () => {
    const intent = new WheelIntent();
    const first = flick(120, 1, 50);
    const second = flick(120, 1, 120);
    expect(feed(intent, [...first, ...second]).hops).toEqual([1, 1]);
  });

  it("gives two hops for two flicks separated by a pause", () => {
    const intent = new WheelIntent();
    const a = feed(intent, flick(100));
    const b = feed(intent, flick(100), a.end + WHEEL.gestureEndMs + 1);
    expect([...a.hops, ...b.hops]).toEqual([1, 1]);
  });

  it("hops once per mouse-wheel notch when the notches are spaced out", () => {
    const intent = new WheelIntent();
    const hops: number[] = [];
    for (let i = 0; i < 4; i++) {
      const hop = intent.push(100, 0, i * 300, 800);
      if (hop !== 0) hops.push(hop);
    }
    expect(hops).toEqual([1, 1, 1, 1]);
  });

  it("treats a quick burst of notches as one gesture", () => {
    const intent = new WheelIntent();
    expect(feed(intent, [100, 100, 100, 100], 0, 0, 40).hops).toEqual([1]);
  });

  it("needs the threshold before it fires", () => {
    const intent = new WheelIntent();
    expect(feed(intent, [10, 10, 10, 10, 10]).hops).toEqual([]);
    expect(intent.push(15, 0, 80, 800)).toBe(1);
  });

  it("reads line-mode deltas as lines and page-mode deltas as pages", () => {
    expect(normaliseDelta(3, DOM_DELTA_LINE, 800)).toBe(3 * WHEEL.lineHeight);
    expect(normaliseDelta(1, DOM_DELTA_PAGE, 800)).toBe(800);
    expect(normaliseDelta(42, 0, 800)).toBe(42);

    const lines = new WheelIntent();
    expect(lines.push(3, DOM_DELTA_LINE, 0, 800)).toBe(0);
    expect(lines.push(3, DOM_DELTA_LINE, 16, 800)).toBe(1);
    expect(lines.push(-3, DOM_DELTA_LINE, 400, 800)).toBe(0);
    expect(lines.push(-3, DOM_DELTA_LINE, 416, 800)).toBe(-1);

    const pages = new WheelIntent();
    expect(pages.push(1, DOM_DELTA_PAGE, 0, 800)).toBe(1);
    expect(pages.push(-1, DOM_DELTA_PAGE, 500, 800)).toBe(-1);
  });

  it("goes back for an upward flick", () => {
    const intent = new WheelIntent();
    expect(feed(intent, flick(120, -1)).hops).toEqual([-1]);
  });

  it("restarts the count when the direction flips before firing", () => {
    const intent = new WheelIntent();
    expect(feed(intent, [40, -30, -20]).hops).toEqual([]);
    expect(intent.push(-15, 0, 48, 800)).toBe(-1);
  });

  it("honours a deliberate reversal inside a momentum tail", () => {
    const intent = new WheelIntent();
    const forward = flick(120, 1, 30);
    const back = flick(120, -1, 60);
    expect(feed(intent, [...forward, ...back]).hops).toEqual([1, -1]);
  });

  it("forgets a half-built gesture after a pause", () => {
    const intent = new WheelIntent();
    intent.push(50, 0, 0, 800);
    expect(intent.push(50, 0, WHEEL.gestureEndMs + 1, 800)).toBe(0);
    expect(intent.push(20, 0, WHEEL.gestureEndMs + 17, 800)).toBe(1);
  });
});
