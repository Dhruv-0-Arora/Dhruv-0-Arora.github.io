import { describe, expect, it } from "vitest";
import type { Vec3 } from "../meta.ts";
import { Corridor, TREE_CLEARANCE, treeClearance } from "./treeClearance.ts";

const open = () => 0;
const dry = () => false;

describe("Corridor", () => {
  it("marks points within the radius of a polyline and nothing beyond", () => {
    const c = new Corridor(
      [
        [0, 0, 0],
        [100, 5, 0],
        [100, 5, 100],
      ],
      false,
      6,
    );
    expect(c.has(50, 0)).toBe(true);
    expect(c.has(50, 5)).toBe(true);
    expect(c.has(50, 7.5)).toBe(false);
    expect(c.has(94.5, 50)).toBe(true);
    expect(c.has(92, 50)).toBe(false);
    // Past the open end, round cap only.
    expect(c.has(-5, 0)).toBe(true);
    expect(c.has(-8, 0)).toBe(false);
    // The closing segment exists only on a loop.
    expect(c.has(50, 50)).toBe(false);
    expect(c.has(1000, 1000)).toBe(false);
  });

  it("closes a loop", () => {
    const pts: Vec3[] = [
      [0, 0, 0],
      [100, 0, 0],
      [100, 0, 100],
    ];
    expect(new Corridor(pts, true, 6).has(50, 50)).toBe(true);
  });

  it("rasterizes a 3 km rail quickly", () => {
    const pts: Vec3[] = [];
    for (let i = 0; i < 1500; i++) {
      const t = (i / 1500) * Math.PI * 2;
      const r = 300 + 40 * Math.sin(t * 7);
      pts.push([r * Math.cos(t), 0, r * Math.sin(t)]);
    }
    const t0 = performance.now();
    const c = new Corridor(pts, true, 6);
    expect(performance.now() - t0).toBeLessThan(200);
    expect(c.has(300, 0)).toBe(true);
    expect(c.has(0, 0)).toBe(false);
  });
});

describe("treeClearance", () => {
  const rail = {
    points: [
      [100, 0, -200],
      [100, 0, 200],
    ] as Vec3[],
    closed: false,
  };
  const terraces = [
    { slug: "cypher" as const, center: [250, 40, 0] as Vec3, radius: 40 },
  ];

  it("keeps the hub, terraces and the rail clear", () => {
    const veto = treeClearance({ terraces, rail, trailAt: open, inLake: dry });
    expect(veto(0, 0)).toBe(true);
    expect(veto(TREE_CLEARANCE.hub - 1, 0)).toBe(true);
    expect(veto(0, TREE_CLEARANCE.hub + 1)).toBe(false);
    expect(veto(250 + 40 * 1.25, 0)).toBe(true);
    expect(veto(250 + 40 * 1.35, 0)).toBe(false);
    expect(veto(104, 150)).toBe(true);
    expect(veto(108, 150)).toBe(false);
  });

  it("defers to the trail mask and the lakes", () => {
    const veto = treeClearance({
      terraces: [],
      rail: { points: [], closed: false },
      trailAt: (x) => (x > 200 ? 0.5 : 0.1),
      inLake: (_x, z) => z > 300,
    });
    expect(veto(150, 150)).toBe(false);
    expect(veto(250, 150)).toBe(true);
    expect(veto(150, 350)).toBe(true);
  });
});
