import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CSM } from "three/examples/jsm/csm/CSM.js";
import { useSim } from "../simStore.ts";
import type { Palette, Rgba } from "../theme/palette.ts";
import { RETINT_MS } from "../theme/retint.ts";
import { cascadeNormalBias, shadowTexel, sweepCsm } from "./csm.ts";
import { sunDirection } from "./sky.ts";

/**
 * The lights: a cascaded shadow map for the sun (the moon at night) that
 * follows the camera, so a strut near the rail throws a crisp shadow and
 * the range 500 m out still throws one; the sky's bounce as a hemisphere
 * in palette colors; and a little ambient so nothing goes black. Every
 * lit material in the scene is composed with the cascade shader once,
 * before its first compile, in `scene.onBeforeRender`.
 */

/** Four cascades, practical split to MAX_FAR; the far one gets 4096. */
const CASCADES = 4;
const MAP_SIZES = [2048, 2048, 2048, 4096];
const MAX_FAR = 700;
/** Casters up-light of a cascade (a 150 m peak at a low sun) still count. */
const LIGHT_MARGIN = 400;
const LIGHT_FAR = 1600;
const SHADOW_BIAS = -0.00004;
const NORMAL_BIAS_TEXELS = 2;

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

export interface LightTargets {
  dir: THREE.Vector3;
  color: THREE.Color;
  intensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  ambient: number;
}

/**
 * Day: a warm sun at full strength over a pale sky-blue bounce. Night: a
 * cool moon at a bit under a third of it, so shadows stay clearly there
 * while the wash from the sky and the ambient keep shaded faces legible.
 */
export function lightTargets(palette: Palette): LightTargets {
  const night = palette.bg.r < 0.5;
  const sky = toColor(palette["hue-sky"]);
  const bg = toColor(palette.bg);
  return {
    dir: sunDirection(night),
    color: new THREE.Color(night ? 0xbfcdf0 : 0xfff4e0),
    // A strong moon: night albedos are dark, so the light has to be bright
    // for a moon shadow to show against the sky's wash.
    intensity: night ? 1.6 : 1.5,
    hemiSky: bg.clone().lerp(sky, night ? 0.4 : 0.42),
    hemiGround: toColor(palette["surface-2"]),
    hemiIntensity: night ? 0.5 : 1.0,
    ambient: night ? 0.16 : 0.1,
  };
}

function tuneCascades(csm: CSM): void {
  csm.lights.forEach((light, i) => {
    const size = MAP_SIZES[i] ?? MAP_SIZES[MAP_SIZES.length - 1];
    light.shadow.normalBias = cascadeNormalBias(
      shadowTexel(light.shadow.camera, size),
      NORMAL_BIAS_TEXELS,
    );
    light.shadow.bias = SHADOW_BIAS;
  });
}

export function SunLight() {
  const palette = useSim((s) => s.palette);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  const rig = useMemo(() => {
    const group = new THREE.Group();
    group.name = "sun.cascades";
    const csm = new CSM({
      camera,
      parent: group,
      cascades: CASCADES,
      maxFar: MAX_FAR,
      mode: "practical",
      shadowMapSize: MAP_SIZES[0],
      shadowBias: SHADOW_BIAS,
      lightDirection: sunDirection(false).negate(),
      lightIntensity: 1.5,
      lightNear: 1,
      lightFar: LIGHT_FAR,
      lightMargin: LIGHT_MARGIN,
    });
    csm.fade = true;
    csm.lights.forEach((light, i) => {
      const size = MAP_SIZES[i] ?? MAP_SIZES[MAP_SIZES.length - 1];
      light.shadow.mapSize.set(size, size);
      light.color.set(0xfff4e0);
    });
    csm.updateFrustums();
    tuneCascades(csm);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8f98, 0.7);
    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    group.add(hemi, ambient);
    return { group, csm, hemi, ambient, projection: new THREE.Matrix4() };
  }, [camera]);

  const lerp = useMemo(
    () => ({
      from: null as LightTargets | null,
      to: null as LightTargets | null,
      elapsed: RETINT_MS,
      dir: new THREE.Vector3(),
      color: new THREE.Color(),
    }),
    [],
  );

  useEffect(() => {
    if (!palette) return;
    const next = lightTargets(palette);
    lerp.from = lerp.to ?? next;
    lerp.to = next;
    lerp.elapsed = lerp.from === next ? RETINT_MS : 0;
  }, [palette, lerp]);

  // Before every render: compose new materials, refit the cascades when
  // the projection changed, and place the cascade lights for this frame.
  useEffect(() => {
    const { csm, group } = rig;
    const previous = scene.onBeforeRender;
    scene.onBeforeRender = () => {
      sweepCsm(csm, scene);
      if (!rig.projection.equals(camera.projectionMatrix)) {
        rig.projection.copy(camera.projectionMatrix);
        csm.updateFrustums();
        tuneCascades(csm);
      }
      csm.update();
      group.updateMatrixWorld(true);
    };
    return () => {
      scene.onBeforeRender = previous;
    };
  }, [rig, scene, camera]);

  useEffect(() => {
    return () => {
      const { csm, hemi, ambient } = rig;
      csm.dispose();
      for (const light of csm.lights) {
        light.shadow.dispose();
        light.dispose();
      }
      hemi.dispose();
      ambient.dispose();
    };
  }, [rig]);

  useFrame((_, dt) => {
    const { from, to } = lerp;
    if (!from || !to) return;
    lerp.elapsed = Math.min(RETINT_MS, lerp.elapsed + dt * 1000);
    const f = lerp.elapsed / RETINT_MS;
    const eased = f * (2 - f);
    const { csm, hemi, ambient } = rig;
    lerp.dir.copy(from.dir).lerp(to.dir, eased).normalize();
    csm.lightDirection.copy(lerp.dir).negate();
    lerp.color.copy(from.color).lerp(to.color, eased);
    const intensity = from.intensity + (to.intensity - from.intensity) * eased;
    for (const light of csm.lights) {
      light.color.copy(lerp.color);
      light.intensity = intensity;
    }
    hemi.color.copy(from.hemiSky).lerp(to.hemiSky, eased);
    hemi.groundColor.copy(from.hemiGround).lerp(to.hemiGround, eased);
    hemi.intensity =
      from.hemiIntensity + (to.hemiIntensity - from.hemiIntensity) * eased;
    ambient.intensity = from.ambient + (to.ambient - from.ambient) * eased;
    if (lerp.elapsed >= RETINT_MS) lerp.from = to;
  });

  return <primitive object={rig.group} />;
}
