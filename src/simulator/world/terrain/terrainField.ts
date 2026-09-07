/**
 * The terrain field: where snow, forest and meadow lie on the range, as
 * pure functions of world position and surface normal (Y-up).
 *
 * The same construction runs on the GPU in `terrainShader.ts`; this copy
 * feeds the conifer scatter and the tests, so a tree is only planted where
 * the shader paints forest floor. Keep the two in step.
 */

export const TERRAIN = {
  /** Trees give way to meadow and rock around this height, metres. */
  treeline: 40,
  treelineWobble: 10,
  treelineScale: 0.018,
  /** Permanent snow begins around here, higher on sunward faces. */
  snowline: 66,
  snowlineWobble: 16,
  snowlineScale: 0.012,
  /** Metres the snowline climbs per unit of sunward aspect. */
  snowlineAspect: 9,
} as const;

const fract = (v: number) => v - Math.floor(v);

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Hash of a 2D point to [0, 1); mirrors `thash` in the shader. */
export function hash12(x: number, y: number): number {
  let px = fract(x * 0.1031);
  let py = fract(y * 0.103);
  let pz = fract(x * 0.0973);
  const d = px * (py + 33.33) + py * (pz + 33.33) + pz * (px + 33.33);
  px += d;
  py += d;
  pz += d;
  return fract((px + py) * pz);
}

/** Smooth value noise in [0, 1]. */
export function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let fx = x - ix;
  let fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash12(ix, iy);
  const b = hash12(ix + 1, iy);
  const c = hash12(ix, iy + 1);
  const d = hash12(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** Four octaves of value noise, normalized to [0, 1]. */
export function fbm(x: number, y: number): number {
  let v = 0;
  let amp = 0.5;
  let px = x;
  let py = y;
  for (let i = 0; i < 4; i++) {
    v += amp * valueNoise(px, py);
    px = px * 2.02 + 17.3;
    py = py * 2.02 + 9.1;
    amp *= 0.5;
  }
  return v / 0.9375;
}

/** Height where the forest ends at this map position. */
export function treelineAt(x: number, z: number): number {
  const t = TERRAIN;
  const n = fbm(x * t.treelineScale + 31.7, z * t.treelineScale - 12.3);
  return t.treeline + t.treelineWobble * (n * 2 - 1);
}

/**
 * Forest floor weight in [0, 1] at a surface point: below the treeline,
 * on gentle enough ground, in patches.
 * `ny` is the up component of the surface normal.
 */
export function forestWeight(
  x: number,
  y: number,
  z: number,
  ny: number,
): number {
  const tl = treelineAt(x, z);
  const below = 1 - smoothstep(tl - 9, tl + 3, y);
  const gentle = smoothstep(0.42, 0.66, ny);
  const patch = smoothstep(0.25, 0.65, fbm(x * 0.045 + 7.1, z * 0.045 + 3.3));
  return below * gentle * (0.35 + 0.65 * patch);
}
