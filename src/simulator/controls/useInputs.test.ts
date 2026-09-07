import { describe, expect, it } from "vitest";
import { flightFromKeys, inputFromKeys } from "./useInputs.ts";

describe("inputFromKeys", () => {
  it("maps WASD and arrows", () => {
    expect(inputFromKeys(new Set(["KeyW"]))).toEqual({ throttle: 1, steer: 0 });
    expect(inputFromKeys(new Set(["ArrowDown", "ArrowLeft"]))).toEqual({
      throttle: -1,
      steer: -1,
    });
    expect(inputFromKeys(new Set(["KeyD"]))).toEqual({ throttle: 0, steer: 1 });
  });

  it("cancels opposite keys and clamps duplicates", () => {
    expect(inputFromKeys(new Set(["KeyW", "KeyS"]))).toEqual({
      throttle: 0,
      steer: 0,
    });
    expect(inputFromKeys(new Set(["KeyW", "ArrowUp"]))).toEqual({
      throttle: 1,
      steer: 0,
    });
  });

  it("ignores unrelated keys", () => {
    expect(inputFromKeys(new Set(["KeyF", "Space"]))).toEqual({
      throttle: 0,
      steer: 0,
    });
  });
});

describe("flightFromKeys", () => {
  it("separates throttle, bank and pitch", () => {
    expect(flightFromKeys(new Set(["KeyW", "KeyD", "ArrowUp"]))).toEqual({
      throttle: 1,
      steer: 1,
      pitch: 1,
    });
    expect(flightFromKeys(new Set(["KeyS", "ArrowLeft", "ArrowDown"]))).toEqual(
      {
        throttle: -1,
        steer: -1,
        pitch: -1,
      },
    );
  });

  it("does not let the arrows throttle in the air", () => {
    expect(flightFromKeys(new Set(["ArrowUp"]))).toEqual({
      throttle: 0,
      steer: 0,
      pitch: 1,
    });
    expect(flightFromKeys(new Set(["KeyA", "KeyD"]))).toEqual({
      throttle: 0,
      steer: 0,
      pitch: 0,
    });
  });
});
