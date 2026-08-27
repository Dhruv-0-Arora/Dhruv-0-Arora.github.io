import { describe, expect, it } from "vitest";
import { inputFromKeys } from "./useInputs.ts";

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
