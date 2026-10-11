import { describe, expect, it } from "vitest";
import { candleBoxes, IMC_SHAPE, KERMS_SHAPE, ohlcSeries } from "./ohlc.ts";

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

describe("candleBoxes", () => {
  const layout = {
    width: 18,
    height: 11,
    bodyWidth: 0.34,
    wickWidth: 0.07,
    minBody: 0.06,
  };

  it("puts each candle's body and wick in its own direction's group", () => {
    const s = ohlcSeries(IMC_SHAPE);
    const { up, down } = candleBoxes(s, layout);
    const ups = s.filter((c) => c.close >= c.open).length;
    expect(ups).toBeGreaterThan(0);
    expect(ups).toBeLessThan(s.length);
    expect(up).toHaveLength(ups * 2);
    expect(down).toHaveLength((s.length - ups) * 2);
    const pitch = layout.width / s.length;
    s.forEach((c, i) => {
      const x = -layout.width / 2 + pitch * (i + 0.5);
      const group = c.close >= c.open ? up : down;
      const here = group.filter((b) => Math.abs(b.x - x) < 1e-9);
      expect(here.map((b) => b.width).sort()).toEqual([
        layout.wickWidth,
        layout.bodyWidth,
      ]);
    });
  });

  it("fills the chart height from the series low to its high", () => {
    const { up, down } = candleBoxes(ohlcSeries(KERMS_SHAPE), layout);
    const all = [...up, ...down];
    expect(Math.min(...all.map((b) => b.y))).toBeCloseTo(0);
    expect(Math.max(...all.map((b) => b.y + b.height))).toBeCloseTo(
      layout.height,
    );
    for (const b of all) expect(b.height).toBeGreaterThan(0);
  });

  it("draws nothing for an empty series", () => {
    expect(candleBoxes([], layout)).toEqual({ up: [], down: [] });
  });
});
