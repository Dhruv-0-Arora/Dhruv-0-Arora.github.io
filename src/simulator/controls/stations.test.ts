import { describe, expect, it } from "vitest";
import metaJson from "../../../public/world/meta.json" with { type: "json" };
import type { WorldMeta } from "../world/meta.ts";
import { RailPath } from "./railPath.ts";
import {
  buildLayout,
  buildStations,
  jumpTarget,
  LAYOUT,
  locateScroll,
  plateauCentre,
  projectOrder,
  railFromScroll,
  type ScrollLayout,
  type Station,
  scrollFromRail,
  snapTarget,
} from "./stations.ts";

/**
 * A square lap, 400 m round, with three zones: two with a look placed on
 * them, one (cypher) with no look nearby so it falls back to the nearest
 * rail point.
 */
function syntheticMeta(): { meta: WorldMeta; rail: RailPath } {
  const rail = new RailPath({
    points: [
      [0, 0, 0],
      [100, 0, 0],
      [100, 0, 100],
      [0, 0, 100],
    ],
    closed: true,
  });
  const meta = {
    version: 1,
    rail: { points: rail.points.slice(0, 4), closed: true },
    looks: [
      { t: 0, position: [0, 0, 1] as [number, number, number] },
      { t: 0.25, position: [120, 0, 0] as [number, number, number] },
      { t: 0.5, position: [100, 0, 120] as [number, number, number] },
      { t: 1, position: [0, 0, 1] as [number, number, number] },
    ],
    zones: [
      { slug: "hub", position: [0, 0, 0], radius: 10 },
      { slug: "cypher", position: [40, 0, 110], radius: 5 },
      { slug: "astute", position: [121, 0, 0], radius: 10 },
      { slug: "stalk", position: [100, 0, 121], radius: 10 },
    ],
    routes: [],
    lakes: [],
    trails: [],
    terraces: [],
    colliders: [],
    bounds: { min: [0, 0, 0], max: [100, 0, 100] },
  } as unknown as WorldMeta;
  return { meta, rail };
}

function realMeta(): { meta: WorldMeta; rail: RailPath } {
  const meta = metaJson as unknown as WorldMeta;
  return { meta, rail: new RailPath(meta.rail) };
}

describe("buildStations", () => {
  it("puts the hub at both ends and sorts the projects by rail t", () => {
    const { meta, rail } = syntheticMeta();
    const stations = buildStations(meta, rail);
    expect(stations[0]).toEqual({ zone: "hub", t: 0 });
    expect(stations[stations.length - 1]).toEqual({ zone: "hub", t: 1 });
    expect(stations.map((s) => s.zone)).toEqual([
      "hub",
      "astute",
      "stalk",
      "cypher",
      "hub",
    ]);
    for (let i = 1; i < stations.length; i++) {
      expect(stations[i].t).toBeGreaterThanOrEqual(stations[i - 1].t);
    }
  });

  it("takes the t of the look placed on the zone", () => {
    const { meta, rail } = syntheticMeta();
    const byZone = Object.fromEntries(
      buildStations(meta, rail).map((s) => [s.zone, s.t]),
    );
    expect(byZone.astute).toBe(0.25);
    expect(byZone.stalk).toBe(0.5);
  });

  it("falls back to the nearest rail point when no look is in the zone", () => {
    const { meta, rail } = syntheticMeta();
    const cypher = buildStations(meta, rail).find((s) => s.zone === "cypher");
    // Nearest rail point to (40, 0, 110) is (40, 0, 100) on the third
    // side, 260 m round the 400 m lap.
    expect(cypher?.t).toBeCloseTo(0.65, 6);
  });

  it("finds one station per project in the exported world", () => {
    const { meta, rail } = realMeta();
    const stations = buildStations(meta, rail);
    expect(stations).toHaveLength(meta.zones.length + 1);
    for (let i = 1; i < stations.length - 1; i++) {
      const zone = meta.zones.find((z) => z.slug === stations[i].zone);
      const look = meta.looks.find((l) => l.t === stations[i].t);
      expect(look, stations[i].zone).toBeDefined();
      expect(zone).toBeDefined();
      expect(stations[i].t).toBeGreaterThan(stations[i - 1].t);
    }
  });
});

function layoutOf(stations: Station[], railLength = 400): ScrollLayout {
  return buildLayout(stations, railLength);
}

const stations: Station[] = [
  { zone: "hub", t: 0 },
  { zone: "astute", t: 0.25 },
  { zone: "stalk", t: 0.5 },
  { zone: "cypher", t: 0.9 },
  { zone: "hub", t: 1 },
];

describe("buildLayout", () => {
  it("covers s in [0, 1] with plateaus and transits in order", () => {
    const layout = layoutOf(stations);
    expect(layout.starts[0]).toBe(0);
    expect(layout.ends[layout.ends.length - 1]).toBeCloseTo(1, 12);
    for (let i = 0; i < stations.length; i++) {
      expect(layout.ends[i]).toBeGreaterThan(layout.starts[i]);
      if (i > 0) expect(layout.starts[i]).toBeGreaterThan(layout.ends[i - 1]);
    }
  });

  it("charges a longer transit for a longer leg, within the clamps", () => {
    const layout = layoutOf(stations, 2400);
    const transit = (i: number) => layout.starts[i + 1] - layout.ends[i];
    // 600 m, 600 m, 960 m, 240 m legs: the third is the longest, the
    // last the shortest.
    expect(transit(2)).toBeGreaterThan(transit(0));
    expect(transit(3)).toBeLessThan(transit(0));
    // Plateaus are all the same length.
    const plateau = layout.ends[0] - layout.starts[0];
    for (let i = 1; i < stations.length; i++) {
      expect(layout.ends[i] - layout.starts[i]).toBeCloseTo(plateau, 12);
    }
    // In nominal screens the longest leg hits the cap.
    const total =
      stations.length * LAYOUT.plateauScreens +
      LAYOUT.transitMaxScreens +
      2 * (LAYOUT.transitBaseScreens + 600 * LAYOUT.transitScreensPerMeter) +
      (LAYOUT.transitBaseScreens + 240 * LAYOUT.transitScreensPerMeter);
    expect(transit(2) * total).toBeCloseTo(LAYOUT.transitMaxScreens, 9);
  });
});

describe("railFromScroll / scrollFromRail", () => {
  const layout = layoutOf(stations);

  it("maps the ends of the scroll to the ends of the lap", () => {
    expect(railFromScroll(0, layout)).toBe(0);
    expect(railFromScroll(1, layout)).toBe(1);
    expect(railFromScroll(-0.5, layout)).toBe(0);
    expect(railFromScroll(1.5, layout)).toBe(1);
  });

  it("pins t across a plateau", () => {
    for (let i = 0; i < stations.length; i++) {
      expect(railFromScroll(layout.starts[i], layout)).toBe(stations[i].t);
      expect(railFromScroll(plateauCentre(layout, i), layout)).toBe(
        stations[i].t,
      );
      expect(railFromScroll(layout.ends[i], layout)).toBe(stations[i].t);
    }
  });

  it("is monotonic and continuous across the whole scroll", () => {
    let last = 0;
    const steps = 4000;
    for (let k = 0; k <= steps; k++) {
      const t = railFromScroll(k / steps, layout);
      expect(t).toBeGreaterThanOrEqual(last);
      // No kink: one step of scroll never moves t by more than a hair.
      expect(t - last).toBeLessThan(0.01);
      last = t;
    }
  });

  it("round-trips through transits exactly", () => {
    for (let k = 1; k < 200; k++) {
      const s = k / 200;
      const place = locateScroll(s, layout);
      if (place.kind !== "transit") continue;
      const t = railFromScroll(s, layout);
      expect(scrollFromRail(t, layout)).toBeCloseTo(s, 9);
    }
  });

  it("returns the plateau centre for a station t", () => {
    for (let i = 0; i < stations.length; i++) {
      expect(scrollFromRail(stations[i].t, layout)).toBeCloseTo(
        plateauCentre(layout, i),
        12,
      );
    }
  });

  it("inverts monotonically between stations", () => {
    let last = -1;
    for (let k = 0; k <= 1000; k++) {
      const s = scrollFromRail(k / 1000, layout);
      expect(s).toBeGreaterThanOrEqual(last);
      last = s;
    }
  });
});

describe("jumpTarget / snapTarget", () => {
  const layout = layoutOf(stations);

  it("steps to the neighbouring station from a plateau", () => {
    expect(jumpTarget(plateauCentre(layout, 1), layout, 1)).toBe(2);
    expect(jumpTarget(plateauCentre(layout, 1), layout, -1)).toBe(0);
  });

  it("completes the leg underway when mid-transit", () => {
    const mid = (layout.ends[1] + layout.starts[2]) / 2;
    expect(jumpTarget(mid, layout, 1)).toBe(2);
    expect(jumpTarget(mid, layout, -1)).toBe(1);
  });

  it("clamps at the hub on both ends", () => {
    expect(jumpTarget(0, layout, -1)).toBe(0);
    expect(jumpTarget(1, layout, 1)).toBe(stations.length - 1);
    // Previous from the first project is the hub at t = 0; next from the
    // last project is the hub at t = 1.
    expect(stations[jumpTarget(plateauCentre(layout, 1), layout, -1)].t).toBe(
      0,
    );
    expect(stations[jumpTarget(plateauCentre(layout, 3), layout, 1)].t).toBe(1);
  });

  it("snaps to the nearer station only when off a plateau", () => {
    expect(snapTarget(plateauCentre(layout, 2), layout)).toBeNull();
    const span = layout.starts[3] - layout.ends[2];
    expect(snapTarget(layout.ends[2] + span * 0.2, layout)).toBe(2);
    expect(snapTarget(layout.ends[2] + span * 0.8, layout)).toBe(3);
  });
});

describe("projectOrder", () => {
  it("lists the projects in riding order without the hub", () => {
    expect(projectOrder(layoutOf(stations))).toEqual([
      "astute",
      "stalk",
      "cypher",
    ]);
  });
});
