import { describe, expect, it } from "vitest";
import {
  buildTrailMask,
  LAKE_TREE_CLEARANCE,
  polarUV,
  TRAIL_MAP,
  TRAIL_WIDTH,
} from "./trailMask.ts";

const lake = {
  slug: "tarn",
  center: [280, 24, 0] as [number, number, number],
  radius: 30,
};

describe("trailMask", () => {
  it("maps world points to a wrapping polar texture", () => {
    expect(polarUV(TRAIL_MAP.inner, 0)).toEqual([0.5, 0]);
    expect(polarUV(TRAIL_MAP.outer, 0)[1]).toBeCloseTo(1, 6);
    // +z is a quarter turn on from +x.
    expect(polarUV(0, 300)[0]).toBeCloseTo(0.75, 6);
    // The seam sits on -x: just either side of it reads 0 or 1.
    expect(polarUV(-300, -1e-6)[0]).toBeCloseTo(0, 5);
    expect(polarUV(-300, 1e-6)[0]).toBeCloseTo(1, 5);
  });

  it("paints a soft band along a trail and nothing beside it", () => {
    const mask = buildTrailMask(
      [
        {
          slug: "tarn",
          points: [
            [240, 0, 40],
            [300, 20, 40],
          ],
        },
      ],
      [],
    );
    expect(mask.trailAt(270, 40)).toBeGreaterThan(0.95);
    expect(mask.trailAt(270, 40 + TRAIL_WIDTH / 2 - 0.3)).toBeGreaterThan(0.9);
    expect(mask.trailAt(270, 40 + TRAIL_WIDTH / 2 + 0.5)).toBeGreaterThan(0.1);
    expect(mask.trailAt(270, 40 + TRAIL_WIDTH / 2 + 0.5)).toBeLessThan(0.9);
    expect(mask.trailAt(270, 48)).toBe(0);
    expect(mask.trailAt(200, 40)).toBe(0);
    expect(mask.shoreAt(270, 40)).toBe(0);
  });

  it("wraps across the theta seam", () => {
    const mask = buildTrailMask(
      [
        {
          slug: "seam",
          points: [
            [-300, 0, -6],
            [-300, 0, 6],
          ],
        },
      ],
      [],
    );
    expect(mask.trailAt(-300, -0.2)).toBeGreaterThan(0.9);
    expect(mask.trailAt(-300, 0.2)).toBeGreaterThan(0.9);
    expect(mask.trailAt(-300, 9)).toBe(0);
  });

  it("rings each lake with a shore that fades outward", () => {
    const mask = buildTrailMask([], [lake]);
    expect(mask.shoreAt(280 + 30 * 1.08, 0)).toBeGreaterThan(0.9);
    expect(mask.shoreAt(280, 0)).toBe(0);
    expect(mask.shoreAt(280 + 30 * 1.5, 0)).toBe(0);
    expect(mask.shoreAt(280 + 30 * 1.25, 0)).toBeGreaterThan(0.2);
    expect(mask.shoreAt(280 + 30 * 1.25, 0)).toBeLessThan(0.9);
  });

  it("keeps trees out of the lakes", () => {
    const mask = buildTrailMask([], [lake]);
    expect(mask.inLake(280, 0)).toBe(true);
    expect(mask.inLake(280 + 30 * (LAKE_TREE_CLEARANCE - 0.05), 0)).toBe(true);
    expect(mask.inLake(280 + 30 * (LAKE_TREE_CLEARANCE + 0.05), 0)).toBe(false);
    expect(mask.inLake(280 + 30 * 1.5, 0, 2)).toBe(true);
  });

  it("reads nothing off the ring", () => {
    const mask = buildTrailMask([], [lake]);
    expect(mask.trailAt(0, 0)).toBe(0);
    expect(mask.shoreAt(600, 0)).toBe(0);
  });
});
