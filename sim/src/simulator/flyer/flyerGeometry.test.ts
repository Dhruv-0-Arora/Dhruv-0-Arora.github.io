import { describe, expect, it } from "vitest";
import {
  bladeChord,
  bladeGeometry,
  bladeTwist,
  camberAt,
  surfaceGeometry,
} from "./flyerGeometry.ts";

describe("camber", () => {
  it("is zero at both edges and peaks where asked", () => {
    expect(camberAt(0, 0.1, 0.3)).toBeCloseTo(0, 9);
    expect(camberAt(1, 0.1, 0.3)).toBeCloseTo(0, 9);
    expect(camberAt(0.3, 0.1, 0.3)).toBeCloseTo(0.1, 9);
    expect(camberAt(0.15, 0.1, 0.3)).toBeLessThan(0.1);
    expect(camberAt(0.15, 0.1, 0.3)).toBeGreaterThan(0);
  });
});

describe("surfaceGeometry", () => {
  const spec = {
    span: 12.3,
    chord: 2,
    camber: 0.1,
    peakAt: 0.3,
    droop: 0.14,
    tipRound: 0.7,
    ribPitch: 0.3,
    segmentsSpan: 20,
    segmentsChord: 10,
  };

  it("spans the wing with the leading edge forward and the tips drooping", () => {
    const geo = surfaceGeometry(spec);
    geo.computeBoundingBox();
    const b = geo.boundingBox;
    if (!b) throw new Error("no bounds");
    expect(b.min.x).toBeCloseTo(-6.15, 6);
    expect(b.max.x).toBeCloseTo(6.15, 6);
    expect(b.max.z).toBeCloseTo(1, 6);
    expect(b.min.z).toBeCloseTo(-1, 6);
    expect(b.max.y).toBeCloseTo(0.1, 6);
    expect(b.min.y).toBeCloseTo(-0.14, 6);
  });

  it("rounds the trailing corners at the tips only", () => {
    const geo = surfaceGeometry(spec);
    const pos = geo.getAttribute("position");
    const rows = spec.segmentsChord + 1;
    // Trailing-edge vertex of the tip column versus a mid-span column.
    const tipTe = pos.getZ(rows - 1);
    const midTe = pos.getZ(10 * rows + rows - 1);
    expect(midTe).toBeCloseTo(-1, 6);
    expect(tipTe).toBeGreaterThan(-1);
  });

  it("maps u to rib pitch so ribs share one texture across surfaces", () => {
    const geo = surfaceGeometry(spec);
    const uv = geo.getAttribute("uv");
    const rows = spec.segmentsChord + 1;
    const uTip = uv.getX(0);
    const uMid = uv.getX(10 * rows);
    expect(uMid).toBeCloseTo(0.5, 6);
    expect(uTip).toBeCloseTo(0.5 - 6.15 / (0.3 * 12), 6);
    expect(geo.index?.count).toBe(spec.segmentsSpan * spec.segmentsChord * 6);
  });
});

describe("blade", () => {
  it("twists more at the root than the tip", () => {
    expect(bladeTwist(0.2, 2.4)).toBeGreaterThan(bladeTwist(1.2, 2.4));
    expect(bladeTwist(1.2, 2.4)).toBeGreaterThan(0);
  });

  it("is narrow at the root and widest past mid span", () => {
    expect(bladeChord(0, 0.24)).toBeLessThan(bladeChord(0.6, 0.24));
    expect(bladeChord(0.6, 0.24)).toBeLessThanOrEqual(0.24);
  });

  it("builds a plate from the root radius to the tip", () => {
    const geo = bladeGeometry({
      radius: 1.28,
      rootRadius: 0.12,
      pitch: 2.4,
      chord: 0.24,
      segments: 6,
    });
    geo.computeBoundingBox();
    const b = geo.boundingBox;
    if (!b) throw new Error("no bounds");
    expect(b.min.y).toBeCloseTo(0.12, 6);
    expect(b.max.y).toBeCloseTo(1.28, 6);
    expect(geo.index?.count).toBe(6 * 6);
  });
});
