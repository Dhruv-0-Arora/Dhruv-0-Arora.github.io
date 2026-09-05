import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../simStore.ts";
import { SHADOW_EXTENT, SUN_DISTANCE, sunDirection } from "./sky.ts";

/**
 * The one shadow-casting light. It sits where the sky dome draws the sun
 * (or the moon), covers the whole ring with an orthographic shadow map,
 * and dims for the night sim.
 */
export function SunLight() {
  const palette = useSim((s) => s.palette);
  const night = palette ? palette.bg.r < 0.5 : false;

  const light = useMemo(() => {
    const l = new THREE.DirectionalLight(0xffffff, 1.4);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const cam = l.shadow.camera;
    cam.left = -SHADOW_EXTENT;
    cam.right = SHADOW_EXTENT;
    cam.top = SHADOW_EXTENT;
    cam.bottom = -SHADOW_EXTENT;
    cam.near = 50;
    cam.far = SUN_DISTANCE + SHADOW_EXTENT;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.8;
    l.target.position.set(0, 0, 0);
    return l;
  }, []);

  useEffect(() => {
    const dir = sunDirection(night);
    light.position.copy(dir).multiplyScalar(SUN_DISTANCE);
    light.intensity = night ? 0.55 : 1.5;
    light.color.set(night ? 0xc9d4ea : 0xfff4e0);
    light.shadow.camera.updateProjectionMatrix();
  }, [night, light]);

  useEffect(() => {
    return () => {
      light.shadow.dispose();
      light.dispose();
    };
  }, [light]);

  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
}
