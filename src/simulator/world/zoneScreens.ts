import type { ZoneSlug } from "./contract.ts";
import type { Vec3 } from "./meta.ts";

/** A floating 16:9 screen anchored on a zone, showing a clip of the project. */
export interface ZoneScreenSpec {
  zone: ZoneSlug;
  /** Offset from the zone center, Y-up meters. */
  offset: Vec3;
  /** Width and height in meters, 16:9. */
  size: [number, number];
  /** The screen yaws to face this point: where the rail camera sits. */
  faceToward: Vec3;
  /** `/media/<zone>.webm` once the clip exists; the placeholder until then. */
  src?: string;
}

export const ZONE_SCREENS: ZoneScreenSpec[] = [
  {
    // Above the Orion gantry deck (17 m); the rail aims at the deck from the east.
    zone: "orion",
    offset: [0, 25, 0],
    size: [16, 9],
    faceToward: [148, 27, 85],
  },
  {
    // Behind the FRC field as seen from the last leg of the rail.
    zone: "synthesis",
    offset: [10, 6.5, -6],
    size: [12, 6.75],
    faceToward: [30, 13, 80],
  },
];
