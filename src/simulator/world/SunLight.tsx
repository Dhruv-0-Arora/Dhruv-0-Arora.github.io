import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../simStore.ts";
import type { Rgba } from "../theme/palette.ts";
import { SHADOW_EXTENT, SUN_DISTANCE, sunDirection } from "./sky.ts";

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

/**
 * The lights: one shadow-casting sun (or moon) where the sky dome draws
 * it, covering the whole ring with an orthographic shadow map, plus the
 * sky's own bounce as a hemisphere in palette colors, so snow in shadow
 * takes the sky's blue and the ground bounce stays warm.
 */
export function SunLight() {
  const palette = useSim((s) => s.palette);
  const night = palette ? palette.bg.r < 0.5 : false;

  const light = useMemo(() => {
    const l = new THREE.DirectionalLight(0xffffff, 1.4);
    l.castShadow = true;
    l.shadow.mapSize.set(4096, 4096);
    const cam = l.shadow.camera;
    cam.left = -SHADOW_EXTENT;
    cam.right = SHADOW_EXTENT;
    cam.top = SHADOW_EXTENT;
    cam.bottom = -SHADOW_EXTENT;
    cam.near = 50;
    cam.far = SUN_DISTANCE + SHADOW_EXTENT;
    l.shadow.bias = -0.0003;
    l.shadow.normalBias = 0.6;
    l.target.position.set(0, 0, 0);
    return l;
  }, []);

  const hemi = useMemo(
    () => new THREE.HemisphereLight(0xffffff, 0x8a8f98, 0.7),
    [],
  );

  useEffect(() => {
    const dir = sunDirection(night);
    light.position.copy(dir).multiplyScalar(SUN_DISTANCE);
    light.intensity = night ? 0.55 : 1.5;
    light.color.set(night ? 0xc9d4ea : 0xfff4e0);
    light.shadow.camera.updateProjectionMatrix();
    if (palette) {
      const sky = toColor(palette["hue-sky"]);
      const bg = toColor(palette.bg);
      // Day: a pale sky blue from above, the plate's warm off-white below.
      // Night: a faint cool wash, so shapes keep reading.
      hemi.color.copy(bg).lerp(sky, night ? 0.35 : 0.42);
      hemi.groundColor.copy(toColor(palette["surface-2"]));
      hemi.intensity = night ? 0.5 : 1.0;
    }
  }, [night, light, hemi, palette]);

  useEffect(() => {
    return () => {
      light.shadow.dispose();
      light.dispose();
      hemi.dispose();
    };
  }, [light, hemi]);

  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      <primitive object={hemi} />
      <ambientLight intensity={night ? 0.12 : 0.1} />
    </>
  );
}
