import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../simStore.ts";
import type { Palette } from "../theme/palette.ts";
import { RETINT_MS } from "../theme/retint.ts";
import { sunDirection } from "./sky.ts";

const RADIUS = 900;

const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 zenith;
  uniform vec3 horizon;
  uniform vec3 sunColor;
  uniform vec3 sunDir;
  uniform float sunCos;
  uniform float halo;
  uniform float stars;
  uniform float time;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(horizon, zenith, pow(h, 0.5));
    float mu = dot(d, sunDir);
    float disc = smoothstep(sunCos - 0.0006, sunCos + 0.0004, mu);
    float glow = pow(max(mu, 0.0), 160.0) * 0.9 + pow(max(mu, 0.0), 10.0) * 0.16;
    col += sunColor * (disc + glow * halo);
    if (stars > 0.0 && d.y > 0.02) {
      vec3 scaled = d * 140.0;
      vec3 cell = floor(scaled);
      float s = hash(cell);
      // One small round star per lit cell, offset by the cell's hash.
      vec3 centre = cell + 0.5 + (vec3(hash(cell + 1.0), hash(cell + 2.0), hash(cell + 3.0)) - 0.5) * 0.6;
      float r = length(scaled - centre);
      float dot = smoothstep(0.16, 0.04, r);
      float twinkle = 0.55 + 0.45 * sin(time * 1.3 + s * 40.0);
      float star = step(0.975, s) * dot * twinkle * smoothstep(0.02, 0.25, d.y);
      col += vec3(star) * stars * 0.9;
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function toColor(rgb: { r: number; g: number; b: number }): THREE.Color {
  return new THREE.Color().setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

interface SkyTargets {
  zenith: THREE.Color;
  horizon: THREE.Color;
  sun: THREE.Color;
  dir: THREE.Vector3;
  sunCos: number;
  halo: number;
  stars: number;
}

/** Sky colors derive from the palette so both themes stay on brand. */
export function skyTargets(palette: Palette): SkyTargets {
  const night = palette.bg.r < 0.5;
  const bg = toColor(palette.bg);
  const sky = toColor(palette["hue-sky"]);
  const amber = toColor(palette["hue-amber-vivid"]);
  const snow = toColor(palette.snow);
  if (night) {
    return {
      zenith: bg.clone(),
      horizon: bg.clone().lerp(sky, 0.1),
      sun: snow.clone().multiplyScalar(0.9),
      dir: sunDirection(true),
      sunCos: Math.cos(0.012),
      halo: 0.35,
      stars: 1,
    };
  }
  return {
    zenith: bg.clone().lerp(sky, 0.34),
    horizon: bg.clone().lerp(amber, 0.08),
    sun: new THREE.Color(1, 0.96, 0.86).lerp(amber, 0.15),
    dir: sunDirection(false),
    sunCos: Math.cos(0.02),
    halo: 1,
    stars: 0,
  };
}

/**
 * A gradient sky that follows the camera, with a sun by day and a moon and
 * stars by night, all in palette colors. Owns the fog color so the range
 * dissolves into the horizon tone rather than the page background.
 */
export function SkyDome() {
  const palette = useSim((s) => s.palette);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  const dome = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        zenith: { value: new THREE.Color(0.9, 0.92, 0.95) },
        horizon: { value: new THREE.Color(0.95, 0.95, 0.95) },
        sunColor: { value: new THREE.Color(1, 1, 1) },
        sunDir: { value: new THREE.Vector3(0, 1, 0) },
        sunCos: { value: Math.cos(0.02) },
        halo: { value: 1 },
        stars: { value: 0 },
        time: { value: 0 },
      },
    });
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 48, 24),
      material,
    );
    mesh.name = "sky.dome";
    mesh.frustumCulled = false;
    mesh.renderOrder = -10;
    return mesh;
  }, []);

  const lerp = useMemo(
    () => ({
      from: null as SkyTargets | null,
      to: null as SkyTargets | null,
      elapsed: RETINT_MS,
      current: {
        zenith: new THREE.Color(),
        horizon: new THREE.Color(),
        sun: new THREE.Color(),
        dir: new THREE.Vector3(0, 1, 0),
      },
    }),
    [],
  );

  useEffect(() => {
    if (!palette) return;
    const next = skyTargets(palette);
    lerp.from = lerp.to ?? next;
    lerp.to = next;
    lerp.elapsed = lerp.from === next ? RETINT_MS : 0;
  }, [palette, lerp]);

  useEffect(() => {
    return () => {
      dome.geometry.dispose();
      (dome.material as THREE.Material).dispose();
    };
  }, [dome]);

  useFrame((state, dt) => {
    const { from, to, current } = lerp;
    if (!from || !to) return;
    lerp.elapsed = Math.min(RETINT_MS, lerp.elapsed + dt * 1000);
    const f = lerp.elapsed / RETINT_MS;
    const eased = f * (2 - f);
    current.zenith.copy(from.zenith).lerp(to.zenith, eased);
    current.horizon.copy(from.horizon).lerp(to.horizon, eased);
    current.sun.copy(from.sun).lerp(to.sun, eased);
    current.dir.copy(from.dir).lerp(to.dir, eased).normalize();
    const u = (dome.material as THREE.ShaderMaterial).uniforms;
    (u.zenith.value as THREE.Color).copy(current.zenith);
    (u.horizon.value as THREE.Color).copy(current.horizon);
    (u.sunColor.value as THREE.Color).copy(current.sun);
    (u.sunDir.value as THREE.Vector3).copy(current.dir);
    u.sunCos.value = from.sunCos + (to.sunCos - from.sunCos) * eased;
    u.halo.value = from.halo + (to.halo - from.halo) * eased;
    u.stars.value = from.stars + (to.stars - from.stars) * eased;
    u.time.value = state.clock.elapsedTime;
    dome.position.copy(camera.position);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(current.horizon);
    }
  });

  return <primitive object={dome} />;
}
