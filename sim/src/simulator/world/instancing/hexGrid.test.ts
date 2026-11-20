import { describe, expect, it } from "vitest";
import { confidenceField, hexLayout, riskField } from "./hexGrid.ts";

describe("hexLayout", () => {
  it("tiles a square with cells inside the bounds", () => {
    const cells = hexLayout(150, 1.6);
    expect(cells.length).toBeGreaterThan(3000);
    expect(cells.length).toBeLessThan(4500);
    for (const c of cells) {
      expect(Math.abs(c.x)).toBeLessThanOrEqual(75);
      expect(Math.abs(c.z)).toBeLessThanOrEqual(75);
      expect(c.risk).toBeGreaterThanOrEqual(0);
      expect(c.risk).toBeLessThanOrEqual(1);
      expect(c.confidence).toBeGreaterThanOrEqual(0.35);
      expect(c.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("keeps neighbours a hex width apart", () => {
    const cells = hexLayout(20, 1);
    const a = cells[0];
    const nearest = Math.min(
      ...cells.slice(1).map((c) => Math.hypot(c.x - a.x, c.z - a.z)),
    );
    expect(nearest).toBeCloseTo(Math.sqrt(3), 6);
  });

  it("is deterministic and mostly quiet", () => {
    const a = hexLayout(150, 1.6);
    const b = hexLayout(150, 1.6);
    expect(a).toEqual(b);
    const hot = a.filter((c) => c.risk > 0.5).length;
    expect(hot / a.length).toBeGreaterThan(0.01);
    expect(hot / a.length).toBeLessThan(0.3);
  });

  it("fields are smooth: neighbours differ little", () => {
    const r0 = riskField(10, 10, 150);
    const r1 = riskField(11, 10, 150);
    expect(Math.abs(r0 - r1)).toBeLessThan(0.1);
    const c0 = confidenceField(10, 10, 150);
    const c1 = confidenceField(11, 10, 150);
    expect(Math.abs(c0 - c1)).toBeLessThan(0.1);
  });
});
