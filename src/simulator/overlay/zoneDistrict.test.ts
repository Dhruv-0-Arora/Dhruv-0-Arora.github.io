import { describe, expect, it } from "vitest";
import { DISTRICTS, ZONE_SLUGS } from "../world/contract.ts";
import { WINDOWS, windowName, ZONE_DISTRICT } from "./zoneDistrict.ts";

describe("zone districts", () => {
  it("places every contract zone in a district a visitor can stand in", () => {
    for (const slug of ZONE_SLUGS) {
      const district = ZONE_DISTRICT[slug];
      expect(DISTRICTS, slug).toContain(district);
      expect(WINDOWS, slug).toContain(district);
    }
  });

  it("names the shared district after the hub", () => {
    expect(windowName("shared")).toBe("hub");
    expect(windowName("evidence")).toBe("evidence");
  });
});
