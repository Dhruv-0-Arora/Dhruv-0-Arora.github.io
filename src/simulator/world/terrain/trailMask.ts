import * as THREE from "three";
import type { LakeMeta, TrailMeta } from "../meta.ts";

/**
 * A polar mask of the range's trails and lake shores, rasterized once from
 * `meta.trails` and `meta.lakes`, that the terrain shader samples per pixel
 * and the conifer scatter reads on the CPU. Theta runs across the texture
 * and wraps; rho runs down it from the backdrop's inner edge to its rim,
 * so a texel is about a metre in either direction at the lakes.
 *
 * Red is the beaten tread, green the gravel shore. The mapping here and
 * `trailUv` in the shader must agree, which is why both come from
 * `TRAIL_MAP`.
 */

export const TRAIL_MAP = {
  inner: 205,
  outer: 470,
  width: 2048,
  height: 256,
} as const;

/** Full width of the tread and the soft margin beyond it, in metres. */
export const TRAIL_WIDTH = 3.5;
export const TRAIL_EDGE = 1.0;
/** Spacing of the splats walked along a trail, in metres. */
const TRAIL_STEP = 0.4;
/** The gravel shore as multiples of a lake's water radius. */
export const SHORE_BAND = { from: 0.95, full: 1.02, fade: 1.15, to: 1.35 };
/** Trees keep this far from a lake, as a multiple of its water radius. */
export const LAKE_TREE_CLEARANCE = 1.25;

const TWO_PI = Math.PI * 2;

export interface TrailMask {
  readonly width: number;
  readonly height: number;
  /** RGBA8 rows from the inner edge outward; R is trail, G is shore. */
  readonly data: Uint8Array;
  readonly lakes: readonly LakeMeta[];
  /** Tread weight in [0, 1] at a world point (nearest texel). */
  trailAt(x: number, z: number): number;
  /** Shore weight in [0, 1] at a world point (nearest texel). */
  shoreAt(x: number, z: number): number;
  /** True inside `factor` times any lake's water radius. */
  inLake(x: number, z: number, factor?: number): boolean;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Texture coordinates of a world point, the same formula as the shader. */
export function polarUV(
  x: number,
  z: number,
  map: typeof TRAIL_MAP = TRAIL_MAP,
): [number, number] {
  return [
    Math.atan2(z, x) / TWO_PI + 0.5,
    (Math.hypot(x, z) - map.inner) / (map.outer - map.inner),
  ];
}

export function buildTrailMask(
  trails: readonly TrailMeta[],
  lakes: readonly LakeMeta[],
  map: typeof TRAIL_MAP = TRAIL_MAP,
): TrailMask {
  const { width, height, inner, outer } = map;
  const span = outer - inner;
  const data = new Uint8Array(width * height * 4);

  /** Max-blends `weightAt(distance)` into one channel around a world point. */
  const splat = (
    channel: 0 | 1,
    x: number,
    z: number,
    radius: number,
    weightAt: (d: number) => number,
  ) => {
    const rho = Math.hypot(x, z);
    if (rho + radius < inner || rho - radius > outer) return;
    const theta = Math.atan2(z, x);
    const dTheta = radius / Math.max(rho - radius, 1);
    const i0 = Math.floor(((theta - dTheta) / TWO_PI + 0.5) * width);
    const i1 = Math.ceil(((theta + dTheta) / TWO_PI + 0.5) * width);
    const j0 = Math.max(
      0,
      Math.floor(((rho - radius - inner) / span) * height),
    );
    const j1 = Math.min(
      height - 1,
      Math.ceil(((rho + radius - inner) / span) * height),
    );
    for (let j = j0; j <= j1; j++) {
      const r = inner + ((j + 0.5) / height) * span;
      for (let i = i0; i <= i1; i++) {
        const ii = ((i % width) + width) % width;
        const t = ((ii + 0.5) / width - 0.5) * TWO_PI;
        const d = Math.hypot(r * Math.cos(t) - x, r * Math.sin(t) - z);
        const w = weightAt(d);
        if (w <= 0) continue;
        const k = (j * width + ii) * 4 + channel;
        const v = Math.round(w * 255);
        if (v > data[k]) data[k] = v;
      }
    }
  };

  const half = TRAIL_WIDTH / 2;
  const reach = half + TRAIL_EDGE;
  const tread = (d: number) => 1 - smoothstep(half, reach, d);
  for (const trail of trails) {
    const pts = trail.points;
    for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, , az] = pts[i];
      const [bx, , bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const steps = Math.max(1, Math.ceil(len / TRAIL_STEP));
      for (let s = 0; s <= steps; s++) {
        const f = s / steps;
        splat(0, ax + (bx - ax) * f, az + (bz - az) * f, reach, tread);
      }
    }
  }

  for (const lake of lakes) {
    const [cx, , cz] = lake.center;
    const R = lake.radius;
    splat(1, cx, cz, R * SHORE_BAND.to, (d) => {
      const n = d / R;
      return (
        smoothstep(SHORE_BAND.from, SHORE_BAND.full, n) *
        (1 - smoothstep(SHORE_BAND.fade, SHORE_BAND.to, n))
      );
    });
  }

  const index = (x: number, z: number): number => {
    const [u, v] = polarUV(x, z, map);
    if (v < 0 || v > 1) return -1;
    const i = ((Math.floor(u * width) % width) + width) % width;
    const j = Math.min(height - 1, Math.floor(v * height));
    return (j * width + i) * 4;
  };

  return {
    width,
    height,
    data,
    lakes,
    trailAt(x, z) {
      const k = index(x, z);
      return k < 0 ? 0 : data[k] / 255;
    },
    shoreAt(x, z) {
      const k = index(x, z);
      return k < 0 ? 0 : data[k + 1] / 255;
    },
    inLake(x, z, factor = LAKE_TREE_CLEARANCE) {
      return lakes.some(
        (l) => Math.hypot(x - l.center[0], z - l.center[2]) < l.radius * factor,
      );
    },
  };
}

/** The mask as a wrapping, linearly filtered texture for the shader. */
export function trailMaskTexture(mask: TrailMask): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    mask.data,
    mask.width,
    mask.height,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
