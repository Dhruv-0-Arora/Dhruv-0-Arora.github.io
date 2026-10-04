import { describe, expect, it } from "vitest";
import { CAMERA_CLEARANCE, clampAboveGround } from "./cameraGuard.ts";

describe("clampAboveGround", () => {
  it("lifts a camera that is under the surface to clearance height", () => {
    expect(clampAboveGround(10, 12)).toBe(12 + CAMERA_CLEARANCE);
    expect(clampAboveGround(12.5, 12)).toBe(12 + CAMERA_CLEARANCE);
  });

  it("leaves a camera that is already clear of the ground alone", () => {
    expect(clampAboveGround(20, 12)).toBe(20);
    expect(clampAboveGround(12 + CAMERA_CLEARANCE, 12)).toBe(
      12 + CAMERA_CLEARANCE,
    );
  });

  it("passes through where there is no ground", () => {
    expect(clampAboveGround(-5, null)).toBe(-5);
    expect(clampAboveGround(-5, Number.NaN)).toBe(-5);
  });

  it("honours a custom clearance", () => {
    expect(clampAboveGround(0, 0, 3)).toBe(3);
  });
});
