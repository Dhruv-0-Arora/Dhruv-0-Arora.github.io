/**
 * Everything about how the rail looks, in one place. The rail's shape is
 * data (`meta.rail`, authored as the Blender rail curve), so a new project
 * or a rerouted loop changes nothing here: the track, the ties and the
 * train follow whatever curve the world exports.
 */
export const RAIL = {
  /** Distance between the two rails, m. */
  gauge: 1.2,
  /** Rail section radius, m. */
  radius: 0.06,
  /** Arc-length spacing of the samples the rail tubes are built from, m. */
  sample: 1.0,
  /** Tie spacing along the track, m. */
  tiePitch: 1.6,
  tie: { width: 1.9, height: 0.12, depth: 0.26 },
  /** The beam the ties float on: slightly narrower than the ties. */
  beam: { width: 0.7, height: 0.34 },
  /**
   * The camera rides at the rail curve itself; the rail top sits this far
   * below it, which puts the visitor's eye a standing height above the
   * lead car's floor so the car stays out of a level view.
   */
  drop: 2.4,
} as const;

export const TRAIN = {
  cars: 3,
  car: { length: 3.6, width: 1.7, gap: 0.55 },
  /** How far ahead of the camera the lead car's centre sits, m. */
  headOffset: 0.9,
  wheelRadius: 0.3,
  wheelWidth: 0.09,
  /** Wheel positions along a car, from its centre, m. */
  axles: [-1.15, 1.15],
  /** Car floor top above the rail centreline, m. */
  floor: 0.72,
  wall: 0.52,
} as const;
