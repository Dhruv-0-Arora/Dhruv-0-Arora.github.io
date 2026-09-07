import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../simStore.ts";
import type { Palette } from "../theme/palette.ts";
import { RETINT_MS } from "../theme/retint.ts";
import { galacticPole, sunDirection } from "./sky.ts";

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
  uniform vec3 pole;
  uniform float sunCos;
  uniform float halo;
  uniform float stars;
  uniform float time;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(vec3(i, 0.0));
    float b = hash(vec3(i + vec2(1.0, 0.0), 0.0));
    float c = hash(vec3(i + vec2(0.0, 1.0), 0.0));
    float d = hash(vec3(i + 1.0, 0.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(7.3, 1.9);
      a *= 0.5;
    }
    return v;
  }

  // The Milky Way as seen from a dark valley: a diffuse band around the
  // galactic plane (lat is the sine of galactic latitude, lon runs along
  // the band), wider and warmer at the bulge, torn by dust lanes through
  // the half nearest the bulge, with a faint wide halo around it all.
  vec3 milkyWay(float lat, float lon) {
    float bulge = pow(0.5 + 0.5 * cos(lon - 0.8), 2.0);
    vec2 q = vec2(lon * 2.2, lat * 9.0);
    float warp = (fbm(q * 0.7 + 11.0) - 0.5) * 0.08;
    float l = lat + warp;
    // A broad, soft band: a core that widens toward the bulge inside a
    // faint halo, so there is never a hard edge.
    float width = 0.11 + 0.08 * bulge;
    float core = exp(-l * l / (width * width));
    float halo = exp(-l * l / 0.12) * 0.35;
    // Patchy star clouds along the band at two scales.
    float clouds = 0.25 + 0.75 * fbm(q * 1.6 + 3.1);
    float fine = 0.6 + 0.4 * fbm(q * 5.0 + 9.0);
    // The Great Rift and a lesser lane: dark dust threading the band,
    // strongest toward the bulge, wandering and broken up by noise.
    float laneW = 0.018 + 0.012 * bulge;
    float c1 = l + 0.05 * (fbm(q * 1.1 + 21.0) - 0.5) + 0.02;
    float rift = exp(-c1 * c1 / (laneW * laneW))
      * smoothstep(-0.9, 0.5, cos(lon - 0.3));
    float c2 = l - 0.035 + 0.025 * sin(lon * 2.0 - 0.5);
    rift += exp(-c2 * c2 / (laneW * laneW * 0.5))
      * smoothstep(0.35, 0.65, fbm(q * 2.3 + 5.0));
    rift = clamp(rift, 0.0, 0.85) * (0.6 + 0.4 * bulge);
    float m = (core * clouds * fine + halo) * (0.5 + 0.5 * bulge) * (1.0 - rift);
    vec3 tint = mix(vec3(0.72, 0.78, 0.92), vec3(0.95, 0.86, 0.72), bulge * 0.6 * core);
    return tint * m;
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
      float rise = smoothstep(0.02, 0.28, d.y);
      float lat = dot(d, pole);
      vec3 hp = normalize(vec3(0.0, 1.0, 0.0) - pole * pole.y);
      vec3 hq = cross(pole, hp);
      float lon = atan(dot(d, hq), dot(d, hp));
      float band = exp(-lat * lat / 0.03);
      col += milkyWay(lat, lon) * stars * 0.075 * rise;
      // Bright stars: one small round star per lit cell, offset by the
      // cell's hash; a few more cells light up along the band.
      vec3 scaled = d * 140.0;
      vec3 cell = floor(scaled);
      float s = hash(cell);
      vec3 centre = cell + 0.5 + (vec3(hash(cell + 1.0), hash(cell + 2.0), hash(cell + 3.0)) - 0.5) * 0.6;
      float r = length(scaled - centre);
      float spot = smoothstep(0.16, 0.04, r);
      float twinkle = 0.55 + 0.45 * sin(time * 1.3 + s * 40.0);
      float star = step(0.975 - 0.02 * band, s) * spot * twinkle;
      // Faint stars: a finer lattice, dimmer, denser toward the band.
      vec3 fs = d * 300.0;
      vec3 fc = floor(fs);
      float f = hash(fc + 9.0);
      vec3 fcentre = fc + 0.5 + (vec3(hash(fc + 4.0), hash(fc + 5.0), hash(fc + 6.0)) - 0.5) * 0.7;
      float fr = length(fs - fcentre);
      float faint = step(0.955 - 0.03 * band, f) * smoothstep(0.12, 0.03, fr) * (0.25 + 0.2 * hash(fc + 7.0));
      col += vec3(star * 0.9 + faint) * stars * rise;
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
  pole: THREE.Vector3;
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
      pole: galacticPole(),
      sunCos: Math.cos(0.012),
      halo: 0.35,
      stars: 1,
    };
  }
  // The horizon keeps a little sky in it so snow summits separate from it.
  return {
    zenith: bg.clone().lerp(sky, 0.42),
    horizon: bg.clone().lerp(sky, 0.13).lerp(amber, 0.05),
    sun: new THREE.Color(1, 0.96, 0.86).lerp(amber, 0.15),
    dir: sunDirection(false),
    pole: galacticPole(),
    sunCos: Math.cos(0.02),
    halo: 1,
    stars: 0,
  };
}

/**
 * A gradient sky that follows the camera, with a sun by day and a moon,
 * stars and the Milky Way by night, all in palette colors. Owns the fog
 * color so the range dissolves into the horizon tone rather than the
 * page background.
 */
export function SkyDome() {
  const palette = useSim((s) => s.palette);
  const reducedMotion = useSim((s) => s.reducedMotion);
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
        pole: { value: galacticPole() },
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
    (u.pole.value as THREE.Vector3).copy(to.pole);
    u.sunCos.value = from.sunCos + (to.sunCos - from.sunCos) * eased;
    u.halo.value = from.halo + (to.halo - from.halo) * eased;
    u.stars.value = from.stars + (to.stars - from.stars) * eased;
    // Stars hold still under reduced motion.
    if (!reducedMotion) u.time.value = state.clock.elapsedTime;
    dome.position.copy(camera.position);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(current.horizon);
    }
  });

  return <primitive object={dome} />;
}
