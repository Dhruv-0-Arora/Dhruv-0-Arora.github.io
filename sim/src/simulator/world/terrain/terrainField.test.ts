import { describe, expect, it } from "vitest";
import {
  fbm,
  forestWeight,
  hash12,
  TERRAIN,
  treelineAt,
  valueNoise,
} from "./terrainField.ts";

describe("terrain field", () => {
  it("hashes deterministically into [0, 1)", () => {
    expect(hash12(12.5, -300.25)).toBe(hash12(12.5, -300.25));
    for (let i = 0; i < 200; i++) {
      const h = hash12(i * 13.7 - 400, i * 7.1 + 3);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
    expect(hash12(1, 2)).not.toBe(hash12(2, 1));
  });

  it("interpolates noise smoothly within [0, 1]", () => {
    let prev = valueNoise(0.5, 0.5);
    for (let i = 1; i <= 100; i++) {
      const v = valueNoise(0.5 + i * 0.01, 0.5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(Math.abs(v - prev)).toBeLessThan(0.05);
      prev = v;
    }
    const f = fbm(300, -120);
    expect(f).toBeGreaterThanOrEqual(0);
    expect(f).toBeLessThanOrEqual(1);
  });

  it("keeps the treeline within its wobble band", () => {
    const { treeline, treelineWobble } = TERRAIN;
    for (let i = 0; i < 100; i++) {
      const tl = treelineAt(i * 9 - 450, i * 4);
      expect(tl).toBeGreaterThanOrEqual(treeline - treelineWobble);
      expect(tl).toBeLessThanOrEqual(treeline + treelineWobble);
    }
  });

  it("plants forest low and flat, none high or steep", () => {
    const x = 250;
    const z = 80;
    const tl = treelineAt(x, z);
    expect(forestWeight(x, tl - 25, z, 1)).toBeGreaterThan(0.3);
    expect(forestWeight(x, tl + 10, z, 1)).toBe(0);
    expect(forestWeight(x, tl - 25, z, 0.3)).toBe(0);
    expect(forestWeight(x, tl - 25, z, 1)).toBeGreaterThan(
      forestWeight(x, tl - 25, z, 0.5),
    );
  });
});
