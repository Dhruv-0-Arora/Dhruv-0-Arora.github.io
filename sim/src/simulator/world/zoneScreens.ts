import type { ZoneSlug } from "./contract.ts";
import type { Vec3 } from "./meta.ts";

/**
 * A floating 16:9 screen anchored on a zone, showing a clip of the project.
 * It yaws to face the point where the railway passes closest to the zone,
 * so it reads from the train wherever the site ends up on the range.
 */
export interface ZoneScreenSpec {
  zone: ZoneSlug;
  /** Offset from the zone center, Y-up meters. */
  offset: Vec3;
  /** Width and height in meters, 16:9. */
  size: [number, number];
  /** `/media/<zone>.webm` once the clip exists; the placeholder until then. */
  src?: string;
}

export const ZONE_SCREENS: ZoneScreenSpec[] = [
  {
    // Above the Orion gantry deck (17 m) on its lakeshore terrace.
    zone: "orion",
    offset: [0, 25, 0],
    size: [16, 9],
  },
  {
    // Beside the FRC field, on the side away from the hub (the field faces
    // the valley, so this is behind it as seen from the railway).
    zone: "synthesis",
    offset: [10, 6.5, -6],
    size: [12, 6.75],
  },
];
