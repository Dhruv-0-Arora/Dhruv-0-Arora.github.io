/**
 * Minimum height of the camera eye above the terrain surface, metres.
 * The range mesh is single-sided and hollow underneath, so a camera that
 * dips below it shows the inside of the mountain. This keeps the eye at
 * roughly standing height above whatever ground is under it.
 */
export const CAMERA_CLEARANCE = 1.2;

/**
 * Lifts a camera height so it never sits below the ground beneath it.
 * `ground` is null where there is no terrain (off the disc, open water),
 * in which case the height passes through untouched.
 */
export function clampAboveGround(
  y: number,
  ground: number | null,
  clearance: number = CAMERA_CLEARANCE,
): number {
  if (ground === null || !Number.isFinite(ground)) return y;
  const floor = ground + clearance;
  return y < floor ? floor : y;
}
