import { describe, expect, it } from "vitest";
import type { LookMeta, Vec3 } from "../world/meta.ts";
import { lookTargetAt, RailPath } from "./railPath.ts";

const square: Vec3[] = [
  [0, 5, 0],
  [10, 5, 0],
  [10, 5, 10],
  [0, 5, 10],
];

const len = (a: Vec3, b: Vec3) =>
  Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);

describe("RailPath", () => {
  it("measures length, closing the loop when the rail is closed", () => {
    expect(new RailPath({ points: square, closed: false }).length).toBe(30);
    expect(new RailPath({ points: square, closed: true }).length).toBe(40);
  });

  it("hits the endpoints at t=0 and t=1", () => {
    const open = new RailPath({ points: square, closed: false });
    expect(open.pointAt(0)).toEqual([0, 5, 0]);
    expect(open.pointAt(1)).toEqual([0, 5, 10]);
    const closed = new RailPath({ points: square, closed: true });
    expect(closed.pointAt(1)).toEqual([0, 5, 0]);
  });

  it("is arc-length parametrized: equal dt is equal distance", () => {
    // Uneven sampling: a long segment then a short one.
    const path = new RailPath({
      points: [
        [0, 0, 0],
        [90, 0, 0],
        [100, 0, 0],
      ],
      closed: false,
    });
    let last = path.pointAt(0);
    for (let k = 1; k <= 20; k++) {
      const p = path.pointAt(k / 20);
      expect(len(last, p)).toBeCloseTo(5, 6);
      last = p;
    }
  });

  it("is monotonic in distance along the path", () => {
    const path = new RailPath({ points: square, closed: true });
    let travelled = 0;
    let last = path.pointAt(0);
    for (let k = 1; k <= 200; k++) {
      const p = path.pointAt(k / 200);
      const step = len(last, p);
      expect(step).toBeGreaterThanOrEqual(0);
      travelled += step;
      last = p;
    }
    expect(travelled).toBeCloseTo(path.length, 6);
  });

  it("clamps t outside [0, 1]", () => {
    const path = new RailPath({ points: square, closed: false });
    expect(path.pointAt(-3)).toEqual(path.pointAt(0));
    expect(path.pointAt(7)).toEqual(path.pointAt(1));
  });

  it("returns unit tangents that follow the segment direction", () => {
    const path = new RailPath({ points: square, closed: true });
    expect(path.tangentAt(0.1)).toEqual([1, 0, 0]);
    expect(path.tangentAt(0.3)).toEqual([0, 0, 1]);
    expect(path.tangentAt(0.9)).toEqual([0, 0, -1]);
  });

  it("finds the nearest t for points on and off the path", () => {
    const path = new RailPath({ points: square, closed: true });
    expect(path.nearestT([5, 5, 0])).toBeCloseTo(0.125, 6);
    expect(path.nearestT([10, 5, 5])).toBeCloseTo(0.375, 6);
    // Off the path: 3 m outside the middle of the far edge.
    expect(path.nearestT([5, 0, 13])).toBeCloseTo(0.625, 6);
    // Round trip for every sampled t.
    for (let k = 0; k <= 40; k++) {
      const t = k / 40;
      const p = path.pointAt(t);
      const back = path.nearestT(p);
      const same = Math.abs(back - t) < 1e-6 || Math.abs(back - t) > 1 - 1e-6;
      expect(same).toBe(true);
    }
  });

  it("rejects degenerate rails", () => {
    expect(() => new RailPath({ points: [[0, 0, 0]], closed: false })).toThrow(
      /at least 2/,
    );
    expect(
      () =>
        new RailPath({
          points: [
            [1, 1, 1],
            [1, 1, 1],
          ],
          closed: false,
        }),
    ).toThrow(/zero length/);
  });
});

describe("lookTargetAt", () => {
  const looks: LookMeta[] = [
    { t: 0.2, position: [0, 0, 0] },
    { t: 0.6, position: [40, 0, 0] },
    { t: 1.0, position: [40, 0, 40] },
  ];

  it("holds the first and last targets outside their range", () => {
    expect(lookTargetAt(looks, 0)).toEqual([0, 0, 0]);
    expect(lookTargetAt(looks, 0.2)).toEqual([0, 0, 0]);
    expect(lookTargetAt(looks, 1)).toEqual([40, 0, 40]);
  });

  it("eases between neighbours and is exact at each look", () => {
    expect(lookTargetAt(looks, 0.6)).toEqual([40, 0, 0]);
    const mid = lookTargetAt(looks, 0.4);
    expect(mid[0]).toBeCloseTo(20, 9);
    expect(mid[2]).toBe(0);
    const quarter = lookTargetAt(looks, 0.3);
    expect(quarter[0]).toBeGreaterThan(0);
    expect(quarter[0]).toBeLessThan(10);
  });

  it("throws without looks", () => {
    expect(() => lookTargetAt([], 0.5)).toThrow(/no look targets/);
  });
});
