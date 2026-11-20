import * as THREE from "three";
import { clamp01, type RailPath } from "../controls/railPath.ts";
import type { Vec3 } from "../world/meta.ts";

/** Wraps a rail parameter around a closed loop; clamps on an open one. */
export function wrapT(t: number, closed: boolean): number {
  if (!closed) return clamp01(t);
  const r = t % 1;
  return r < 0 ? r + 1 : r;
}

/**
 * Evenly spaced stations along the rail as t values, one per `pitch`
 * metres. A closed loop omits the final station because it coincides with
 * the first.
 */
export function trackStations(rail: RailPath, pitch: number): number[] {
  const n = Math.max(1, Math.round(rail.length / pitch));
  const last = rail.closed ? n - 1 : n;
  const out: number[] = [];
  for (let i = 0; i <= last; i++) out.push(i / n);
  return out;
}

/** Metres behind the lead car's centre for each car's centre. */
export function carOffsets(count: number, length: number, gap: number) {
  const out: number[] = [];
  for (let k = 0; k < count; k++) out.push(k * (length + gap));
  return out;
}

const up = new THREE.Vector3(0, 1, 0);
const origin = new THREE.Vector3();
const m = new THREE.Matrix4();
const tv = new THREE.Vector3();

/**
 * Orientation whose +z is the tangent and whose up stays world up, the
 * way `Object3D.lookAt` orients a non-camera object.
 */
export function quaternionAlong(
  tangent: Vec3,
  out = new THREE.Quaternion(),
): THREE.Quaternion {
  tv.set(tangent[0], tangent[1], tangent[2]);
  if (Math.abs(tv.dot(up)) > 0.999) tv.set(0, 0, 1);
  m.lookAt(tv, origin, up);
  return out.setFromRotationMatrix(m);
}

const rv = new THREE.Vector3();

/** Unit vector to the right of travel, level with the ground. */
export function rightOf(tangent: Vec3, out = new THREE.Vector3()) {
  rv.set(tangent[0], 0, tangent[2]);
  if (rv.lengthSq() < 1e-8) rv.set(0, 0, 1);
  return out.crossVectors(rv, up).normalize();
}

/** Position on the rail centreline, `drop` metres under the camera curve. */
export function railPoint(
  rail: RailPath,
  t: number,
  drop: number,
  out = new THREE.Vector3(),
  scratch: Vec3 = [0, 0, 0],
): THREE.Vector3 {
  rail.pointAt(t, scratch);
  return out.set(scratch[0], scratch[1] - drop, scratch[2]);
}
