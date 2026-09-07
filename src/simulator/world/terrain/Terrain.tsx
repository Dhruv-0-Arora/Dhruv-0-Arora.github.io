import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../../simStore.ts";
import type { Palette, Rgba } from "../../theme/palette.ts";
import { RETINT_MS } from "../../theme/retint.ts";
import { sunDirection } from "../sky.ts";
import {
  createTerrainUniforms,
  patchTerrainMaterial,
} from "./terrainShader.ts";
import { TRAIL_MAP, type TrailMask, trailMaskTexture } from "./trailMask.ts";

const ROCK_NAME = "tok.rock";

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

interface Targets {
  snow: THREE.Color;
  forest: THREE.Color;
  meadow: THREE.Color;
  sun: THREE.Vector3;
}

/** Surface colors from the palette; the meadow is a warmer, lighter forest. */
export function terrainTargets(palette: Palette): Targets {
  const night = palette.bg.r < 0.5;
  const forest = toColor(palette.forest);
  const meadow = forest
    .clone()
    .lerp(toColor(palette["hue-green"]), night ? 0.2 : 0.4)
    .lerp(toColor(palette["hue-amber-vivid"]), night ? 0.06 : 0.16);
  return {
    snow: toColor(palette.snow),
    forest,
    meadow,
    sun: sunDirection(night),
  };
}

interface TerrainProps {
  backdrop: THREE.Object3D;
  /** Trails and lake shores to paint; null paints none. */
  mask: TrailMask | null;
}

/**
 * Attaches the terrain shader to the loaded range and keeps its palette
 * uniforms gliding with the theme, on the same clock as the registry.
 */
export function Terrain({ backdrop, mask }: TerrainProps) {
  const palette = useSim((s) => s.palette);
  const uniforms = useMemo(() => createTerrainUniforms(), []);

  useEffect(() => {
    if (!mask) return;
    const texture = trailMaskTexture(mask);
    const previous = uniforms.uTrail.value;
    uniforms.uTrail.value = texture;
    uniforms.uTrailMap.value.set(TRAIL_MAP.inner, TRAIL_MAP.outer, 1);
    return () => {
      uniforms.uTrail.value = previous;
      uniforms.uTrailMap.value.z = 0;
      texture.dispose();
    };
  }, [mask, uniforms]);
  const lerp = useMemo(
    () => ({
      from: null as Targets | null,
      to: null as Targets | null,
      elapsed: RETINT_MS,
    }),
    [],
  );

  useEffect(() => {
    backdrop.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      for (const m of materials) {
        if (m instanceof THREE.MeshStandardMaterial && m.name === ROCK_NAME) {
          patchTerrainMaterial(m, uniforms);
        }
      }
    });
  }, [backdrop, uniforms]);

  useEffect(() => {
    if (!palette) return;
    const next = terrainTargets(palette);
    lerp.from = lerp.to ?? next;
    lerp.to = next;
    lerp.elapsed = lerp.from === next ? RETINT_MS : 0;
  }, [palette, lerp]);

  useFrame((_, dt) => {
    const { from, to } = lerp;
    if (!from || !to) return;
    if (lerp.elapsed >= RETINT_MS && lerp.from === lerp.to) return;
    lerp.elapsed = Math.min(RETINT_MS, lerp.elapsed + dt * 1000);
    const f = lerp.elapsed / RETINT_MS;
    const eased = f * (2 - f);
    uniforms.uSnow.value.copy(from.snow).lerp(to.snow, eased);
    uniforms.uForest.value.copy(from.forest).lerp(to.forest, eased);
    uniforms.uMeadow.value.copy(from.meadow).lerp(to.meadow, eased);
    uniforms.uSunDir.value.copy(from.sun).lerp(to.sun, eased).normalize();
    if (lerp.elapsed >= RETINT_MS) lerp.from = lerp.to;
  });

  return null;
}
