import { describe, expect, it } from "vitest";
import { parseDevCamera } from "./devCamera.ts";

describe("parseDevCamera", () => {
  it("is off without a cam parameter", () => {
    expect(parseDevCamera("")).toBeNull();
    expect(parseDevCamera("?at=1,2,3&fov=30")).toBeNull();
    expect(parseDevCamera("?cam=1,2")).toBeNull();
    expect(parseDevCamera("?cam=1,x,3")).toBeNull();
  });

  it("parses position, target and fov with defaults", () => {
    expect(parseDevCamera("?cam=0,12,40")).toEqual({
      position: [0, 12, 40],
      target: [0, 0, 0],
      fov: 50,
    });
    expect(parseDevCamera("?cam=1,2,3&at=-4,5.5,6&fov=20")).toEqual({
      position: [1, 2, 3],
      target: [-4, 5.5, 6],
      fov: 20,
    });
    expect(parseDevCamera("?cam=1,2,3&fov=999")?.fov).toBe(50);
  });
});
