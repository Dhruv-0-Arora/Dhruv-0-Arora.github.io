import * as THREE from "three";

/**
 * The drivable terrain as a regular polar grid of exact surface heights,
 * rebuilt once from the loaded range so the Dozer's ground query is two
 * array reads and a bilinear blend instead of a raycast against 200k
 * triangles every substep.
 *
 * Each grid node (ring i at rho = i * rMax / rings, segment j at
 * theta = j * 2pi / segments - pi) takes the height of the mesh triangle
 * that covers it, found by rasterizing every upward-facing triangle into
 * the grid in polar space. That reads the surface itself rather than
 * guessing the authored ring spacing from vertex positions, so it survives
 * the build joining other rock into the mesh, weld and meshopt
 * quantization, and any radial spacing the range session chooses. Where
 * two triangles cover a node (an overhang, a boulder joined into the
 * mesh), the higher one wins: that is the surface a vehicle stands on.
 *
 * Nodes nothing covered stay NaN. A lookup blends the covered corners of
 * its cell and returns null when there are none or the point is outside
 * the disc, which the drive model treats as off the world.
 */
export class TerrainSampler {
  readonly rings: number;
  readonly segments: number;
  readonly rMax: number;
  /** (rings + 1) x segments heights, ring-major; NaN where uncovered. */
  readonly heights: Float32Array;

  constructor(rMax: number, rings: number, segments: number) {
    this.rMax = rMax;
    this.rings = rings;
    this.segments = segments;
    this.heights = new Float32Array((rings + 1) * segments).fill(Number.NaN);
  }

  /**
   * Rasterizes one triangle (world XZ plus height Y) into the grid nodes it
   * covers. Triangles facing down are skipped: they are the underside of
   * something, never ground.
   */
  addTriangle(
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    cx: number,
    cy: number,
    cz: number,
  ): void {
    // Face normal of (b - a) x (c - a); ground faces up. The Y component
    // is minus the signed XZ area, which the barycentrics below reuse.
    const nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
    const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    const nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (ny <= 0.05 * Math.hypot(nx, ny, nz)) return;
    const inv = -1 / ny;

    const { rings, segments, rMax } = this;
    const dr = rMax / rings;
    const dt = (Math.PI * 2) / segments;

    /** Height at (px, pz) if the point lies in the triangle, else NaN. */
    const sample = (px: number, pz: number): number => {
      // Barycentric weights in XZ, with a hair of slack so nodes on a
      // shared edge are never missed by both neighbours.
      const wb = ((px - ax) * (cz - az) - (cx - ax) * (pz - az)) * inv;
      const wc = ((bx - ax) * (pz - az) - (px - ax) * (bz - az)) * inv;
      const wa = 1 - wb - wc;
      const eps = -1e-6;
      if (wa < eps || wb < eps || wc < eps) return Number.NaN;
      return wa * ay + wb * by + wc * cy;
    };
    const write = (k: number, y: number) => {
      if (Number.isNaN(y)) return;
      const prev = this.heights[k];
      if (!(y <= prev)) this.heights[k] = y;
    };

    // Radial extent: the triangle's nearest point to the origin (zero if
    // it contains the origin) out to its farthest vertex.
    const ra = Math.hypot(ax, az);
    const rb = Math.hypot(bx, bz);
    const rc = Math.hypot(cx, cz);
    const containsOrigin = inTriangle(0, 0, ax, az, bx, bz, cx, cz);
    const rLo = containsOrigin
      ? 0
      : Math.min(
          segDist(ax, az, bx, bz),
          segDist(bx, bz, cx, cz),
          segDist(cx, cz, ax, az),
        );
    const rHi = Math.max(ra, rb, rc);
    const i0 = Math.max(0, Math.ceil(rLo / dr - 1e-9));
    const i1 = Math.min(rings, Math.floor(rHi / dr + 1e-9));
    if (i0 > i1) return;

    // Ring 0 is a single point, the origin, repeated once per segment.
    if (i0 === 0 && containsOrigin) {
      const y = sample(0, 0);
      for (let j = 0; j < segments; j++) write(j, y);
    }

    // Angular extent: the whole circle when the origin is strictly inside,
    // else the span of the vertex angles unwrapped around one of them (a
    // triangle that does not straddle the origin subtends at most half a
    // turn; a vertex at the origin makes a wedge of the other two).
    const EPS_R = 1e-6;
    const away: number[] = [];
    if (ra > EPS_R) away.push(Math.atan2(az, ax));
    if (rb > EPS_R) away.push(Math.atan2(bz, bx));
    if (rc > EPS_R) away.push(Math.atan2(cz, cx));
    let j0 = 0;
    let j1 = segments - 1;
    if (!(containsOrigin && away.length === 3)) {
      const ref = away[0];
      let lo = ref;
      let hi = ref;
      for (const t of away) {
        const u = ref + wrapAngle(t - ref);
        if (u < lo) lo = u;
        if (u > hi) hi = u;
      }
      j0 = Math.ceil((lo + Math.PI) / dt - 1e-9);
      j1 = Math.floor((hi + Math.PI) / dt + 1e-9);
      if (j1 - j0 >= segments) {
        j0 = 0;
        j1 = segments - 1;
      }
    }

    for (let i = Math.max(1, i0); i <= i1; i++) {
      const rho = i * dr;
      const row = i * segments;
      for (let jj = j0; jj <= j1; jj++) {
        const j = ((jj % segments) + segments) % segments;
        const theta = j * dt - Math.PI;
        write(row + j, sample(rho * Math.cos(theta), rho * Math.sin(theta)));
      }
    }
  }

  /** Surface height at (x, z), or null off the disc or where nothing was sampled. */
  heightAt(x: number, z: number): number | null {
    const rho = Math.hypot(x, z);
    if (rho > this.rMax) return null;
    const { rings, segments } = this;
    const u = (rho / this.rMax) * rings;
    const i = Math.min(rings - 1, Math.floor(u));
    const fu = u - i;
    const v = ((Math.atan2(z, x) + Math.PI) / (Math.PI * 2)) * segments;
    const j = Math.floor(v) % segments;
    const fv = v - Math.floor(v);
    const j1 = (j + 1) % segments;
    const h = this.heights;
    const r0 = i * segments;
    const r1 = r0 + segments;
    let sum = 0;
    let weight = 0;
    const blend = (k: number, w: number) => {
      const y = h[k];
      if (Number.isNaN(y) || w <= 0) return;
      sum += y * w;
      weight += w;
    };
    blend(r0 + j, (1 - fu) * (1 - fv));
    blend(r0 + j1, (1 - fu) * fv);
    blend(r1 + j, fu * (1 - fv));
    blend(r1 + j1, fu * fv);
    return weight > 0 ? sum / weight : null;
  }
}

function wrapAngle(a: number): number {
  const tau = Math.PI * 2;
  return a - tau * Math.round(a / tau);
}

/** Distance from the origin to the segment a-b. */
function segDist(ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  const f =
    len2 > 0 ? Math.min(1, Math.max(0, -(ax * dx + az * dz) / len2)) : 0;
  return Math.hypot(ax + dx * f, az + dz * f);
}

function inTriangle(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
  cx: number,
  cz: number,
): boolean {
  const d1 = (px - bx) * (az - bz) - (ax - bx) * (pz - bz);
  const d2 = (px - cx) * (bz - cz) - (bx - cx) * (pz - cz);
  const d3 = (px - ax) * (cz - az) - (cx - ax) * (pz - az);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** Material name of the range surface, the theming contract's rock token. */
const ROCK = "tok.rock";

function isRock(mesh: THREE.Mesh): boolean {
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  return materials.some((m) => m.name === ROCK);
}

/**
 * The largest `tok.rock` mesh under `root`: the range surface. The build
 * strips node names, so it is found by material and size.
 */
export function findTerrainMesh(root: THREE.Object3D): THREE.Mesh | null {
  let best: THREE.Mesh | null = null;
  let bestCount = 0;
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !isRock(obj)) return;
    const count = (obj.geometry as THREE.BufferGeometry).getAttribute(
      "position",
    ).count;
    if (count > bestCount) {
      best = obj;
      bestCount = count;
    }
  });
  return best;
}

export interface TerrainSamplerOptions {
  /** Radius of the disc, metres. */
  rMax?: number;
  /** Radial nodes; the default is 1 m spacing on a 470 m disc. */
  rings?: number;
  /** Angular nodes; the default is about 2 m apart at the rim. */
  segments?: number;
}

/**
 * Builds the sampler from the range surface under `root` (world space), or
 * returns null when there is no `tok.rock` mesh.
 */
export function terrainSamplerFromObject(
  root: THREE.Object3D,
  { rMax = 470, rings = 470, segments = 1440 }: TerrainSamplerOptions = {},
): TerrainSampler | null {
  const mesh = findTerrainMesh(root);
  if (!mesh) return null;
  root.updateMatrixWorld(true);
  const geo = mesh.geometry as THREE.BufferGeometry;
  const pos = geo.getAttribute("position");
  const index = geo.getIndex();
  // Transform every vertex once, then rasterize by index.
  const world = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    world[i * 3] = v.x;
    world[i * 3 + 1] = v.y;
    world[i * 3 + 2] = v.z;
  }
  const sampler = new TerrainSampler(rMax, rings, segments);
  const count = index ? index.count : pos.count;
  for (let t = 0; t + 2 < count; t += 3) {
    const a = (index ? index.getX(t) : t) * 3;
    const b = (index ? index.getX(t + 1) : t + 1) * 3;
    const c = (index ? index.getX(t + 2) : t + 2) * 3;
    sampler.addTriangle(
      world[a],
      world[a + 1],
      world[a + 2],
      world[b],
      world[b + 1],
      world[b + 2],
      world[c],
      world[c + 1],
      world[c + 2],
    );
  }
  return sampler;
}
