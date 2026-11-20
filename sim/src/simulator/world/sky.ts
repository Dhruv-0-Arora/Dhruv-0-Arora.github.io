import * as THREE from "three";

/**
 * Where the light comes from. One place, so the sky dome's sun disc, the
 * shadow-casting light and any highlight agree.
 *
 * Y-up, north is -z; azimuth is a compass bearing from north. By day the
 * sun sits at 30 degrees in the east-north-east: morning side light, so
 * the volcano behind the hub is lit on one flank and shaded on the other,
 * its cleavers throw shadows across the glaciers, and the eastern range
 * lays its shadow over the plate. By night a moon hangs lower in the
 * south-west.
 */
export function sunDirection(night: boolean): THREE.Vector3 {
  const elevation = night ? 0.42 : 0.52;
  const azimuth = night ? Math.PI * 1.22 : Math.PI * 0.42;
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    -Math.cos(elevation) * Math.cos(azimuth),
  ).normalize();
}

/**
 * The pole of the Milky Way's plane. The band is the great circle 90
 * degrees from it: with the pole low over the moon's side of the sky the
 * band arches over the opposite side, tilted about 61 degrees to the
 * horizon and well clear of the moon's glow.
 */
export function galacticPole(): THREE.Vector3 {
  const elevation = 0.5;
  const azimuth = Math.PI * 1.22;
  return new THREE.Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    -Math.cos(elevation) * Math.cos(azimuth),
  ).normalize();
}

/** Where the sky dome draws the sun or moon, in meters from the camera. */
export const SUN_DISTANCE = 700;
