import { describe, expect, it } from "vitest";
import { flightFloor } from "./flightFloor.ts";

const at = (h: number | null) => ({ heightAt: () => h });
const lake = {
  slug: "tarn",
  center: [100, 4, 0] as [number, number, number],
  radius: 20,
};

describe("flight floor", () => {
  it("prefers the exact terrain, then the coarse grid, then zero", () => {
    expect(flightFloor(at(3), at(9), [])(0, 0)).toBe(3);
    expect(flightFloor(at(null), at(9), [])(0, 0)).toBe(9);
    expect(flightFloor(null, null, [])(0, 0)).toBe(0);
  });

  it("rises to the water over a lake", () => {
    const floor = flightFloor(at(1), null, [lake]);
    expect(floor(100, 5)).toBe(4);
    expect(floor(130, 0)).toBe(1);
    expect(flightFloor(at(6), null, [lake])(100, 0)).toBe(6);
  });
});
