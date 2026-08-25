import { describe, expect, it } from "vitest";
import type { ZoneMeta } from "../world/meta.ts";
import { EXIT_FACTOR, ProximityTracker } from "./proximity.ts";

const zones: ZoneMeta[] = [
  { slug: "astute", position: [0, 0, 0], radius: 10 },
  { slug: "stalk", position: [15, 0, 0], radius: 10 },
  { slug: "orion", position: [100, 0, 100], radius: 5 },
];

describe("ProximityTracker", () => {
  it("enters at the radius and reports the change once", () => {
    const tracker = new ProximityTracker(zones);
    expect(tracker.update(-20, 0)).toEqual({
      entered: null,
      exited: null,
      active: null,
    });
    expect(tracker.update(-9, 0)).toEqual({
      entered: "astute",
      exited: null,
      active: "astute",
    });
    expect(tracker.update(-8, 0)).toEqual({
      entered: null,
      exited: null,
      active: "astute",
    });
  });

  it("holds the zone until 1.25 radii out, then exits", () => {
    const tracker = new ProximityTracker(zones);
    tracker.update(0, 0);
    expect(tracker.update(0, 11).active).toBe("astute");
    expect(tracker.update(0, 10 * EXIT_FACTOR).active).toBe("astute");
    const change = tracker.update(0, 10 * EXIT_FACTOR + 0.01);
    expect(change).toEqual({ entered: null, exited: "astute", active: null });
  });

  it("ignores vertical distance", () => {
    const tracker = new ProximityTracker(zones);
    expect(tracker.update(100, 100).active).toBe("orion");
  });

  it("picks the nearest zone where zones overlap, and does not switch until it exits", () => {
    const tracker = new ProximityTracker(zones);
    expect(tracker.update(6, 0).active).toBe("astute");
    // Now closer to stalk but still within astute's exit band.
    expect(tracker.update(9, 0).active).toBe("astute");
    // Past astute's exit band: hands over to stalk in one update.
    expect(tracker.update(13, 0)).toEqual({
      entered: "stalk",
      exited: "astute",
      active: "stalk",
    });
  });

  it("resets", () => {
    const tracker = new ProximityTracker(zones);
    tracker.update(0, 0);
    tracker.reset();
    expect(tracker.active).toBeNull();
    expect(tracker.update(0, 0).entered).toBe("astute");
  });
});
