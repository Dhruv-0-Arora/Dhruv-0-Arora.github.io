import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { galacticPole, sunDirection } from "./sky.ts";

describe("sky directions", () => {
  it("puts the sun and moon above the horizon at their elevations", () => {
    const sun = sunDirection(false);
    const moon = sunDirection(true);
    expect(sun.length()).toBeCloseTo(1, 6);
    expect(sun.y).toBeCloseTo(Math.sin(0.52), 6);
    expect(moon.y).toBeCloseTo(Math.sin(0.42), 6);
  });

  it("arches the Milky Way over the side opposite the moon", () => {
    const pole = galacticPole();
    const moon = sunDirection(true);
    expect(pole.length()).toBeCloseTo(1, 6);
    // The pole sits close to the moon, so the band (90 degrees from the
    // pole) is far from it.
    expect(pole.angleTo(moon)).toBeLessThan(0.1);
    // The band's highest point: the up vector projected into the plane.
    const up = new THREE.Vector3(0, 1, 0);
    const top = up.clone().sub(pole.clone().multiplyScalar(pole.y)).normalize();
    const elevation = Math.asin(top.y);
    expect(elevation).toBeCloseTo(Math.PI / 2 - 0.5, 6);
    expect(top.angleTo(moon)).toBeGreaterThan(Math.PI / 2);
  });
});
