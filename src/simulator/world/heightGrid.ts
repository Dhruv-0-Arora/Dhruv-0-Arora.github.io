import * as THREE from "three";

/**
 * A coarse polar heightmap of the terrain, built once from the loaded
 * range's vertices so the flight floor is a lookup, not a raycast against
 * 138k triangles every frame. Each cell keeps the highest vertex that fell
 * in it; lookups take the highest of the cell and its neighbours, which
 * errs on the side of flying higher.
 */
export class HeightGrid {
  private readonly cells: Float32Array;
  readonly segments: number;
  readonly rings: number;
  readonly rMin: number;
  readonly rMax: number;
  /** Height reported inside `rMin`, where nothing was sampled. */
  readonly inner: number;

  constructor(
    segments: number,
    rings: number,
    rMin: number,
    rMax: number,
    inner = 0,
  ) {
    this.segments = segments;
    this.rings = rings;
    this.rMin = rMin;
    this.rMax = rMax;
    this.inner = inner;
    this.cells = new Float32Array(segments * rings).fill(
      Number.NEGATIVE_INFINITY,
    );
  }

  private cell(x: number, z: number): [number, number] | null {
    const r = Math.hypot(x, z);
    if (r < this.rMin || r > this.rMax) return null;
    const a = Math.atan2(z, x);
    const seg =
      Math.floor(((a + Math.PI) / (Math.PI * 2)) * this.segments) %
      this.segments;
    const ring = Math.min(
      this.rings - 1,
      Math.floor(((r - this.rMin) / (this.rMax - this.rMin)) * this.rings),
    );
    return [seg, ring];
  }

  add(x: number, y: number, z: number): void {
    const c = this.cell(x, z);
    if (!c) return;
    const i = c[1] * this.segments + c[0];
    if (y > this.cells[i]) this.cells[i] = y;
  }

  heightAt(x: number, z: number): number {
    const c = this.cell(x, z);
    if (!c) return this.inner;
    let best = this.inner;
    for (let dr = -1; dr <= 1; dr++) {
      const ring = c[1] + dr;
      if (ring < 0 || ring >= this.rings) continue;
      for (let ds = -1; ds <= 1; ds++) {
        const seg = (c[0] + ds + this.segments) % this.segments;
        const v = this.cells[ring * this.segments + seg];
        if (v > best) best = v;
      }
    }
    return best;
  }
}

/** Samples every mesh vertex under `root` (world space) into a grid. */
export function heightGridFromObject(
  root: THREE.Object3D,
  rMin: number,
  rMax: number,
  segments = 360,
  rings = 72,
): HeightGrid {
  const grid = new HeightGrid(segments, rings, rMin, rMax);
  const v = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const pos = (obj.geometry as THREE.BufferGeometry).getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
      grid.add(v.x, v.y, v.z);
    }
  });
  return grid;
}
