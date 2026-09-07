import type { District, ZoneSlug } from "../world/contract.ts";

/**
 * Which district each zone sits in, for the panel's status line. The world
 * meta carries positions, not districts, and the overlay must not wait for
 * the world to load to know where a project lives.
 */
export const ZONE_DISTRICT: Record<ZoneSlug, District> = {
  hub: "shared",
  astute: "terminal",
  stalk: "terminal",
  dirnt: "terminal",
  cypher: "evidence",
  altigoz: "evidence",
  nazar: "evidence",
  kerms: "evidence",
  "imc-prosperity-4": "evidence",
  "wisconsin-racing": "fabrication",
  orion: "fabrication",
  "agentic-cad-spike": "fabrication",
  synthesis: "fabrication",
  "swiftlabs-platform": "redacted",
};

/** The districts a visitor can stand in, in rail order; the backdrop is scenery. */
export const WINDOWS: readonly District[] = [
  "shared",
  "terminal",
  "evidence",
  "fabrication",
  "redacted",
];

/** Short window names for the status line; the shared district is the hub. */
export function windowName(district: District): string {
  return district === "shared" ? "hub" : district;
}
