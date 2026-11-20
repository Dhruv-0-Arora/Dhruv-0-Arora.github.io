import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../simStore.ts";
import type { Rgba } from "../theme/palette.ts";

/**
 * The lakes' water. Each lake is a flat `tok.water` disc in the backdrop
 * glb, clipped by the terrain; this patches that material so the surface
 * ripples, goes glassy, and reflects the sky at grazing angles. The water
 * color itself is the palette token, kept current by the registry.
 */

const WATER_NAME = "tok.water";

interface LakeUniforms {
  uTime: { value: number };
  uSky: { value: THREE.Color };
}

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

const waterChunk = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSky;
  varying vec3 vWaterPos;

  float whash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float wnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = whash(i);
    float b = whash(i + vec2(1.0, 0.0));
    float c = whash(i + vec2(0.0, 1.0));
    float d = whash(i + vec2(1.0, 1.0));
    return a + (b - a) * f.x + (c - a) * f.y + (a - b - c + d) * f.x * f.y;
  }

  // Two wind-driven ripple layers drifting different ways, plus a fine one.
  float wheight(vec2 q) {
    float t = uTime;
    float h = wnoise(q * 0.45 + vec2(t * 0.09, t * 0.05));
    h += 0.5 * wnoise(q * 1.1 - vec2(t * 0.06, -t * 0.08) + 7.0);
    h += 0.25 * wnoise(q * 2.3 + vec2(-t * 0.12, t * 0.1) + 19.0);
    return h;
  }

  vec3 waterNormal(vec3 p) {
    vec2 q = p.xz;
    float e = 0.35;
    float h0 = wheight(q);
    float hx = wheight(q + vec2(e, 0.0));
    float hz = wheight(q + vec2(0.0, e));
    float amt = 0.9 * (1.0 - smoothstep(250.0, 700.0, distance(p, cameraPosition)));
    return normalize(vec3(-(hx - h0) * amt, e, -(hz - h0) * amt));
  }
`;

function patchWaterMaterial(
  material: THREE.MeshStandardMaterial,
  uniforms: LakeUniforms,
): void {
  // Opacity comes from the token's alpha through the registry, so the
  // water stays translucent across retints.
  material.roughness = 0.12;
  material.metalness = 0;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vWaterPos;`,
      )
      .replace(
        "#include <fog_vertex>",
        /* glsl */ `#include <fog_vertex>
        vWaterPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${waterChunk}`)
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        {
          // Fresnel: looking across the water you see the sky, looking down
          // you see the water.
          vec3 gn = normalize(vNormal);
          float facing = saturate(dot(normalize(vViewPosition), gn));
          float fres = pow(1.0 - facing, 3.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, uSky, 0.55 * fres);
          diffuseColor.a = mix(diffuseColor.a, 1.0, fres);
        }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          vec3 wn = waterNormal(vWaterPos);
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`,
      );
  };
  material.customProgramCacheKey = () => "lake";
  material.needsUpdate = true;
}

interface LakeProps {
  backdrop: THREE.Object3D;
}

/** Finds the water in the loaded range and animates it. */
export function Lake({ backdrop }: LakeProps) {
  const palette = useSim((s) => s.palette);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const uniforms = useMemo<LakeUniforms>(
    () => ({
      uTime: { value: 0 },
      uSky: { value: new THREE.Color(0.5, 0.7, 0.9) },
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
        if (m instanceof THREE.MeshStandardMaterial && m.name === WATER_NAME) {
          // A sheet of water throws no shadow onto its own bed.
          obj.castShadow = false;
          patchWaterMaterial(m, uniforms);
        }
      }
    });
  }, [backdrop, uniforms]);

  useEffect(() => {
    if (!palette) return;
    toColor(palette["hue-sky"], uniforms.uSky.value);
  }, [palette, uniforms]);

  useFrame((_, dt) => {
    if (reducedMotion) return;
    uniforms.uTime.value += dt;
  });

  return null;
}
