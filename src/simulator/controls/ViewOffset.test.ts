import { describe, expect, it } from "vitest";
import { followShift, type ShiftInput, shiftGoal } from "./ViewOffset.tsx";

const open: ShiftInput = {
  mode: "rails",
  wide: true,
  present: true,
  collapsed: false,
  panelRight: 676,
};

describe("shiftGoal", () => {
  it("centres the aim in the world right of the open panel", () => {
    // Free area 676..1440 has its middle at 1058, 338 right of 720.
    expect(shiftGoal(open)).toBe(338);
  });

  it("is zero when the panel is collapsed, absent or a bottom sheet", () => {
    expect(shiftGoal({ ...open, collapsed: true })).toBe(0);
    expect(shiftGoal({ ...open, present: false })).toBe(0);
    expect(shiftGoal({ ...open, wide: false })).toBe(0);
  });

  it("holds on the glide back to the rails and drops in a vehicle", () => {
    expect(shiftGoal({ ...open, mode: "returning" })).toBe(338);
    expect(shiftGoal({ ...open, mode: "driving" })).toBe(0);
    expect(shiftGoal({ ...open, mode: "flying" })).toBe(0);
  });
});

describe("followShift", () => {
  it("lands at once under reduced motion", () => {
    expect(followShift(0, 300, 1 / 60, true)).toBe(300);
  });

  it("is most of the way there in a quarter second", () => {
    let x = 0;
    for (let i = 0; i < 15; i++) x = followShift(x, 300, 1 / 60, false);
    expect(x).toBeGreaterThan(280);
    expect(x).toBeLessThan(300);
  });

  it("snaps the last fraction of a pixel", () => {
    expect(followShift(299.9, 300, 1 / 60, false)).toBe(300);
  });
});
