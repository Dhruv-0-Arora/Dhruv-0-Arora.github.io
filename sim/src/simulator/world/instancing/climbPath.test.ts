import { describe, expect, it } from "vitest";
import type { Vec3 } from "../meta.ts";
import {
  climbCycle,
  cumulativeLengths,
  isMoving,
  sampleRoute,
} from "./climbPath.ts";

const route: Vec3[] = [
  [0, 0, 0],
  [3, 4, 0],
  [3, 4, 10],
];

describe("cumulativeLengths", () => {
  it("accumulates segment lengths from zero", () => {
    expect(cumulativeLengths(route)).toEqual([0, 5, 15]);
    expect(cumulativeLengths([[1, 1, 1]])).toEqual([0]);
  });
});

describe("sampleRoute", () => {
  const cum = cumulativeLengths(route);

  it("returns the endpoints at s = 0 and s = 1 and clamps outside", () => {
    expect(sampleRoute(route, cum, 0).position).toEqual([0, 0, 0]);
    expect(sampleRoute(route, cum, 1).position).toEqual([3, 4, 10]);
    expect(sampleRoute(route, cum, -2).position).toEqual([0, 0, 0]);
    expect(sampleRoute(route, cum, 7).position).toEqual([3, 4, 10]);
  });

  it("interpolates by arc length with a unit tangent", () => {
    const mid = sampleRoute(route, cum, 10 / 15);
    expect(mid.position.map((v) => +v.toFixed(6))).toEqual([3, 4, 5]);
    expect(mid.tangent).toEqual([0, 0, 1]);
    const first = sampleRoute(route, cum, 2.5 / 15);
    expect(first.position.map((v) => +v.toFixed(6))).toEqual([1.5, 2, 0]);
    expect(first.tangent.map((v) => +v.toFixed(6))).toEqual([0.6, 0.8, 0]);
  });

  it("survives a degenerate route", () => {
    const single: Vec3[] = [[2, 3, 4]];
    expect(sampleRoute(single, cumulativeLengths(single), 0.5)).toEqual({
      position: [2, 3, 4],
      tangent: [0, 0, 1],
    });
  });
});

describe("climbCycle", () => {
  const period = 100;

  it("starts at the foot, climbs monotonically, rests, then descends", () => {
    expect(climbCycle(0, period)).toBe(0);
    let last = 0;
    for (let t = 1; t <= 44; t++) {
      const s = climbCycle(t, period);
      expect(s).toBeGreaterThan(last);
      last = s;
    }
    expect(climbCycle(44, period)).toBeCloseTo(1);
    for (let t = 45; t < 56; t++) expect(climbCycle(t, period)).toBe(1);
    expect(climbCycle(78, period)).toBeCloseTo(0.5);
    expect(climbCycle(100, period)).toBe(0);
  });

  it("is symmetric about the summit hold and wraps", () => {
    for (let t = 0; t <= 44; t += 4) {
      expect(climbCycle(t, period)).toBeCloseTo(climbCycle(100 - t, period));
    }
    expect(climbCycle(122, period)).toBeCloseTo(climbCycle(22, period));
    expect(climbCycle(-10, period)).toBeCloseTo(climbCycle(90, period));
  });

  it("reports the summit rest as not moving", () => {
    expect(isMoving(10, period)).toBe(true);
    expect(isMoving(50, period)).toBe(false);
    expect(isMoving(70, period)).toBe(true);
    expect(climbCycle(5, 0)).toBe(0);
    expect(isMoving(5, 0)).toBe(false);
  });
});
