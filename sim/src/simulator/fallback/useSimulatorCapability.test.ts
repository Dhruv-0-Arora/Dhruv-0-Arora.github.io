import { describe, expect, it } from "vitest";
import { decideCapability, MIN_WIDTH } from "./useSimulatorCapability.ts";

describe("decideCapability", () => {
  const ok = { reducedMotion: false, width: 1280, webgl: true };

  it("serves the simulator to a capable desktop", () => {
    expect(decideCapability(ok)).toBe("simulator");
  });

  it("names the reason for each fallback", () => {
    expect(decideCapability({ ...ok, reducedMotion: true })).toBe(
      "reduced-motion",
    );
    expect(decideCapability({ ...ok, width: MIN_WIDTH - 1 })).toBe("narrow");
    expect(decideCapability({ ...ok, width: MIN_WIDTH })).toBe("simulator");
    expect(decideCapability({ ...ok, webgl: false })).toBe("no-webgl");
  });

  it("ranks hard limits above the overridable one", () => {
    expect(
      decideCapability({ reducedMotion: true, width: 200, webgl: false }),
    ).toBe("no-webgl");
    expect(
      decideCapability({ reducedMotion: true, width: 200, webgl: true }),
    ).toBe("narrow");
  });
});
