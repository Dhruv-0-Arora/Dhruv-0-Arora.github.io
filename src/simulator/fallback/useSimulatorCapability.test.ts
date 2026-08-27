import { describe, expect, it } from "vitest";
import { decideCapability, MIN_WIDTH } from "./useSimulatorCapability.ts";

describe("decideCapability", () => {
  const ok = { reducedMotion: false, width: 1280, webgl: true };

  it("serves the simulator to a capable desktop", () => {
    expect(decideCapability(ok)).toBe("simulator");
  });

  it("falls back for reduced motion, tiny screens, and no WebGL", () => {
    expect(decideCapability({ ...ok, reducedMotion: true })).toBe("static");
    expect(decideCapability({ ...ok, width: MIN_WIDTH - 1 })).toBe("static");
    expect(decideCapability({ ...ok, width: MIN_WIDTH })).toBe("simulator");
    expect(decideCapability({ ...ok, webgl: false })).toBe("static");
  });
});
