import { describe, expect, it } from "vitest";
import {
  buildLayout,
  locateScroll,
  plateauCentre,
} from "../controls/stations.ts";
import {
  headingOf,
  hopTarget,
  locateRail,
  neighbours,
  stationFor,
} from "./useStationIndex.ts";

const layout = buildLayout(
  [
    { zone: "hub", t: 0 },
    { zone: "astute", t: 0.3 },
    { zone: "kerms", t: 0.6 },
    { zone: "hub", t: 1 },
  ],
  1000,
);

const at = (s: number) => locateScroll(s, layout);

/** Scroll s halfway along the transit leaving station i. */
function midLeg(i: number, u = 0.5): number {
  return layout.ends[i] + u * (layout.starts[i + 1] - layout.ends[i]);
}

describe("stationFor", () => {
  it("is the plateau's station at rest", () => {
    for (let i = 0; i < layout.stations.length; i++) {
      expect(stationFor(at(plateauCentre(layout, i)), 0)).toBe(i);
    }
  });

  it("holds the station being left while a hop runs", () => {
    expect(stationFor(at(midLeg(1, 0.9)), 1)).toBe(1);
    expect(stationFor(at(midLeg(1, 0.1)), -1)).toBe(2);
  });

  it("takes the nearer station when stopped mid-leg", () => {
    expect(stationFor(at(midLeg(1, 0.3)), 0)).toBe(1);
    expect(stationFor(at(midLeg(1, 0.7)), 0)).toBe(2);
  });
});

describe("hopTarget", () => {
  const n = layout.stations.length;

  it("steps to the neighbour along the lap", () => {
    expect(hopTarget(1, n, 1)).toEqual({ from: 1, to: 2 });
    expect(hopTarget(2, n, -1)).toEqual({ from: 2, to: 1 });
  });

  it("wraps through the hub at either end", () => {
    expect(hopTarget(0, n, -1)).toEqual({ from: n - 1, to: n - 2 });
    expect(hopTarget(n - 1, n, 1)).toEqual({ from: 0, to: 1 });
    expect(hopTarget(0, n, 1)).toEqual({ from: 0, to: 1 });
    expect(hopTarget(n - 1, n, -1)).toEqual({ from: n - 1, to: n - 2 });
  });
});

describe("neighbours", () => {
  const order = ["astute", "kerms"] as const;

  it("names the sites either side, the hub at the ends", () => {
    expect(neighbours(1, order)).toEqual({ prev: "hub", next: "kerms" });
    expect(neighbours(2, order)).toEqual({ prev: "astute", next: "hub" });
  });

  it("wraps at the hub, from either end of the lap", () => {
    expect(neighbours(0, order)).toEqual({ prev: "kerms", next: "astute" });
    expect(neighbours(3, order)).toEqual({ prev: "kerms", next: "astute" });
  });
});

describe("headingOf", () => {
  const N = layout.stations.length;

  it("reads a hop from the hub to the far end as a wrap", () => {
    expect(headingOf({ kind: "plateau", index: 0 }, N - 2, N)).toBe(-1);
    expect(headingOf({ kind: "plateau", index: N - 1 }, 1, N)).toBe(1);
    expect(headingOf({ kind: "plateau", index: 0 }, 1, N)).toBe(1);
  });

  it("is idle without a destination", () => {
    expect(headingOf(at(plateauCentre(layout, 1)), null, N)).toBe(0);
  });

  it("points at the destination from a plateau or mid-leg", () => {
    expect(headingOf(at(plateauCentre(layout, 1)), 2, N)).toBe(1);
    expect(headingOf(at(plateauCentre(layout, 1)), 0, N)).toBe(-1);
    expect(headingOf(at(midLeg(1)), 2, N)).toBe(1);
    expect(headingOf(at(midLeg(1)), 1, N)).toBe(-1);
  });
});

describe("locateRail", () => {
  it("stands at a station on its t, and between them on a leg", () => {
    expect(locateRail(0, layout)).toEqual({ kind: "plateau", index: 0 });
    expect(locateRail(0.3, layout)).toEqual({ kind: "plateau", index: 1 });
    expect(locateRail(1, layout)).toEqual({ kind: "plateau", index: 3 });
    const mid = locateRail(0.45, layout);
    expect(mid.kind).toBe("transit");
    if (mid.kind === "transit") {
      expect(mid.from).toBe(1);
      expect(mid.u).toBeCloseTo(0.5);
    }
  });
});
