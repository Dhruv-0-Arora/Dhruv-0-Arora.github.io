import * as THREE from "three";

/**
 * Where the light comes from. One place, so the sky dome's sun disc, the
 * shadow-casting light and any highlight agree.
 *
 * Y-up, north is -z; azimuth is a compass bearing from north. By day the
 * sun sits at 34 degrees in the north-north-east so the volcano behind the
 * hub throws its shadow across the plate toward spawn. By night a moon
 * hangs lower in the south-west.
 */
export function sunDirection(night: boolean): THREE.Vector3 {
  const elevation = night ? 0.42 : 0.6;
  const azimuth = night ? Math.PI * 1.22 : Math.PI * 0.08;
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    -Math.cos(elevation) * Math.cos(azimuth),
  ).normalize();
}

/** Distance the directional light sits from the origin. */
export const SUN_DISTANCE = 700;
/** Half-extent of the orthographic shadow frustum, covering the ring. */
export const SHADOW_EXTENT = 520;
