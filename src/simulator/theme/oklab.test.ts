import { describe, expect, it } from "vitest";
import {
  agePosition,
  dirntStops,
  gradientOklab,
  mixOklab,
  oklabToSrgb,
  srgbToOklab,
} from "./oklab.ts";
import { parseCssColor } from "./palette.ts";

describe("oklab", () => {
  it("round-trips sRGB colors", () => {
    for (const hex of ["#048359", "#fafaf8", "#e05e0b", "#000000", "#7c3aed"]) {
      const rgb = parseCssColor(hex);
      const back = oklabToSrgb(srgbToOklab(rgb));
      expect(back.r).toBeCloseTo(rgb.r, 4);
      expect(back.g).toBeCloseTo(rgb.g, 4);
      expect(back.b).toBeCloseTo(rgb.b, 4);
    }
  });

  it("puts white at L=1 and black at L=0", () => {
    expect(srgbToOklab({ r: 1, g: 1, b: 1 }).L).toBeCloseTo(1, 3);
    expect(srgbToOklab({ r: 0, g: 0, b: 0 }).L).toBeCloseTo(0, 6);
  });

  it("mixes linearly and clamps the gradient", () => {
    const a = { L: 0, a: 0, b: 0 };
    const b = { L: 1, a: 0.2, b: -0.2 };
    expect(mixOklab(a, b, 0.25)).toEqual({ L: 0.25, a: 0.05, b: -0.05 });
    expect(gradientOklab([a, b], -1)).toEqual(a);
    expect(gradientOklab([a, b], 2)).toEqual(b);
    const mid = { L: 0.5, a: 0, b: 0 };
    expect(gradientOklab([a, mid, b], 0.5)).toEqual(mid);
    expect(gradientOklab([a, mid, b], 0.75).L).toBeCloseTo(0.75, 9);
    expect(() => gradientOklab([], 0)).toThrow(/stops/);
  });

  it("scales age logarithmically", () => {
    expect(agePosition(0, 365)).toBe(0);
    expect(agePosition(365, 365)).toBe(1);
    expect(agePosition(1, 365)).toBeGreaterThan(1 / 365);
    expect(agePosition(10, 365)).toBeLessThan(agePosition(20, 365));
    expect(agePosition(-5, 365)).toBe(0);
    expect(agePosition(5, 0)).toBe(1);
  });

  it("builds a dirnt gradient that lightens from forest green to near-white", () => {
    const stops = dirntStops({
      "hue-green": parseCssColor("#048359"),
      "hue-amber": parseCssColor("#b75807"),
      surface: parseCssColor("#ffffff"),
    });
    expect(stops).toHaveLength(3);
    expect(stops[0].L).toBeLessThan(stops[1].L);
    expect(stops[1].L).toBeLessThan(stops[2].L);
    const pale = oklabToSrgb(stops[2]);
    expect(pale.r).toBeGreaterThan(0.85);
    expect(pale.g).toBeGreaterThan(pale.r);
  });
});
