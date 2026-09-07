import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { RailPath } from "../controls/railPath.ts";
import {
  carOffsets,
  quaternionAlong,
  railPoint,
  rightOf,
  trackStations,
  wrapT,
} from "./railTrack.ts";

const square = new RailPath({
  closed: true,
  points: [
    [0, 10, 0],
    [100, 10, 0],
    [100, 10, 100],
    [0, 10, 100],
  ],
});

describe("rail track math", () => {
  it("wraps t on a closed loop and clamps on an open one", () => {
    expect(wrapT(1.25, true)).toBeCloseTo(0.25, 9);
    expect(wrapT(-0.1, true)).toBeCloseTo(0.9, 9);
    expect(wrapT(1.25, false)).toBe(1);
    expect(wrapT(-0.1, false)).toBe(0);
  });

  it("spaces stations by pitch and drops the duplicate on a loop", () => {
    const t = trackStations(square, 1.6);
    expect(t.length).toBe(250);
    expect(t[0]).toBe(0);
    expect(t[t.length - 1]).toBeLessThan(1);
    expect((t[1] - t[0]) * square.length).toBeCloseTo(1.6, 9);
  });

  it("puts the cars nose to tail behind the lead car", () => {
    expect(carOffsets(3, 3.6, 0.55)).toEqual([0, 4.15, 8.3]);
  });

  it("aligns +z with the tangent and keeps the roof up", () => {
    const q = quaternionAlong([1, 0, 0]);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const roof = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    expect(fwd.x).toBeCloseTo(1, 6);
    expect(fwd.z).toBeCloseTo(0, 6);
    expect(roof.y).toBeCloseTo(1, 6);
  });

  it("finds the right-hand side of travel level with the ground", () => {
    // Travelling toward +z with y up, the right-hand side is -x.
    const r = rightOf([0, 0.3, 1]);
    expect(r.x).toBeCloseTo(-1, 6);
    expect(r.y).toBeCloseTo(0, 6);
    expect(r.z).toBeCloseTo(0, 6);
  });

  it("drops the rail point under the camera curve", () => {
    const p = railPoint(square, 0.125, 1.95);
    expect(p.x).toBeCloseTo(50, 6);
    expect(p.y).toBeCloseTo(8.05, 6);
  });
});
