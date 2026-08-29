import { describe, expect, it } from "vitest";
import { IMC_SHAPE, KERMS_SHAPE, ohlcSeries } from "./ohlc.ts";

describe("ohlcSeries", () => {
  it("is deterministic and well-formed", () => {
    const a = ohlcSeries(KERMS_SHAPE);
    const b = ohlcSeries(KERMS_SHAPE);
    expect(a).toEqual(b);
    expect(a).toHaveLength(KERMS_SHAPE.count);
    for (const c of a) {
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
      expect(c.low).toBeGreaterThan(0);
    }
  });

  it("chains closes into the next open", () => {
    const s = ohlcSeries(IMC_SHAPE);
    for (let i = 1; i < s.length; i++) {
      expect(s[i].open).toBe(s[i - 1].close);
    }
  });

  it("kerms is mostly small wins", () => {
    const s = ohlcSeries(KERMS_SHAPE);
    const ups = s.filter((c) => c.close > c.open).length;
    expect(ups / s.length).toBeGreaterThan(0.6);
    expect(s[s.length - 1].close).toBeGreaterThan(s[0].open);
  });

  it("imc shows the forced round moves", () => {
    const s = ohlcSeries(IMC_SHAPE);
    expect(s[26].close - s[26].open).toBeCloseTo(0.9, 6);
    expect(s[34].close).toBeLessThan(s[34].open);
    expect(s[16].close).toBeLessThan(s[16].open);
  });
});
