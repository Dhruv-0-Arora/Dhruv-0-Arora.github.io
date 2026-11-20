import { describe, expect, it } from "vitest";
import { DISTRICT_HINTS, districtLoadOrder } from "./loadWorld.ts";

describe("district hints", () => {
  it("puts each sector where the site table has it, in three's Y-up frame", () => {
    // Straight ahead from the spawn is Blender +y, three -z.
    const { terminal, redacted, fabrication, evidence } = DISTRICT_HINTS;
    expect(terminal.x).toBeLessThan(-250);
    expect(Math.hypot(terminal.x, terminal.z)).toBeCloseTo(300, 6);
    expect(redacted.x).toBeLessThan(0);
    expect(redacted.z).toBeLessThan(-200);
    expect(fabrication.x).toBeGreaterThan(0);
    expect(fabrication.z).toBeLessThan(-200);
    expect(evidence.z).toBeGreaterThan(250);
    for (const hint of Object.values(DISTRICT_HINTS)) expect(hint.y).toBe(0);
  });

  it("streams the terrain first from the hub", () => {
    const order = districtLoadOrder(DISTRICT_HINTS.shared, DISTRICT_HINTS);
    expect(order[0]).toBe("backdrop");
    expect(order).not.toContain("shared");
    expect(order).toHaveLength(5);
  });
});
