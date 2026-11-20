import { describe, expect, it } from "vitest";
import { isZoneSlug } from "./contract.ts";
import { ZONE_SCREENS } from "./zoneScreens.ts";

describe("ZONE_SCREENS", () => {
  it("anchors every screen on a contract zone, once", () => {
    const zones = ZONE_SCREENS.map((s) => s.zone);
    for (const zone of zones) expect(isZoneSlug(zone)).toBe(true);
    expect(new Set(zones).size).toBe(zones.length);
  });

  it("keeps every screen 16:9 and above the ground", () => {
    for (const s of ZONE_SCREENS) {
      const [w, h] = s.size;
      expect(w / h).toBeCloseTo(16 / 9, 6);
      expect(s.offset[1] - h / 2).toBeGreaterThan(1);
    }
  });

  it("only points at web video when a source is set", () => {
    for (const s of ZONE_SCREENS) {
      if (s.src) expect(s.src).toMatch(/^\/media\/.+\.(webm|mp4)$/);
    }
  });
});
