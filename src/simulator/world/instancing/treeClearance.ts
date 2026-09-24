import type { TerraceMeta, Vec3 } from "../meta.ts";

/** Where the forest keeps clear, in metres or as factors. */
export const TREE_CLEARANCE = {
  /** No tree inside this multiple of a terrace's radius. */
  terrace: 1.3,
  /** Half-width of the clear corridor along the rail. */
  rail: 6,
  /** Trail-mask weight above which a spot counts as trail. */
  trail: 0.15,
  /** The hub clearing around the origin. */
  hub: 70,
} as const;

/** Cell size of the rail corridor raster, metres. */
const CORRIDOR_CELL = 1;

/**
 * A raster of every point within `radius` of a polyline in XZ, so the
 * scatter can ask "near the rail?" in O(1) for tens of thousands of
 * candidate trees instead of walking every rail segment for each. Cells
 * are marked when their centre is inside the corridor, so the answer is
 * exact to half a cell.
 */
export class Corridor {
  private readonly cells: Uint8Array;
  private readonly minX: number;
  private readonly minZ: number;
  private readonly cols: number;
  private readonly rows: number;
  private readonly cell: number;

  constructor(
    points: readonly Vec3[],
    closed: boolean,
    radius: number,
    cell = CORRIDOR_CELL,
  ) {
    this.cell = cell;
    if (points.length === 0) {
      this.minX = 0;
      this.minZ = 0;
      this.cols = 0;
      this.rows = 0;
      this.cells = new Uint8Array(0);
      return;
    }
    let minX = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;
    for (const p of points) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minZ = Math.min(minZ, p[2]);
      maxZ = Math.max(maxZ, p[2]);
    }
    this.minX = minX - radius - cell;
    this.minZ = minZ - radius - cell;
    this.cols = Math.ceil((maxX + radius + cell - this.minX) / cell) + 1;
    this.rows = Math.ceil((maxZ + radius + cell - this.minZ) / cell) + 1;
    this.cells = new Uint8Array(this.cols * this.rows);

    const r2 = radius * radius;
    const count = closed ? points.length : points.length - 1;
    for (let s = 0; s < count; s++) {
      const a = points[s];
      const b = points[(s + 1) % points.length];
      const abx = b[0] - a[0];
      const abz = b[2] - a[2];
      const len2 = abx * abx + abz * abz;
      const c0 = Math.max(
        0,
        Math.floor((Math.min(a[0], b[0]) - radius - this.minX) / cell),
      );
      const c1 = Math.min(
        this.cols - 1,
        Math.ceil((Math.max(a[0], b[0]) + radius - this.minX) / cell),
      );
      const r0 = Math.max(
        0,
        Math.floor((Math.min(a[2], b[2]) - radius - this.minZ) / cell),
      );
      const r1 = Math.min(
        this.rows - 1,
        Math.ceil((Math.max(a[2], b[2]) + radius - this.minZ) / cell),
      );
      for (let r = r0; r <= r1; r++) {
        const z = this.minZ + (r + 0.5) * cell;
        for (let c = c0; c <= c1; c++) {
          const k = r * this.cols + c;
          if (this.cells[k]) continue;
          const x = this.minX + (c + 0.5) * cell;
          let f = len2 > 0 ? ((x - a[0]) * abx + (z - a[2]) * abz) / len2 : 0;
          f = f < 0 ? 0 : f > 1 ? 1 : f;
          const dx = x - (a[0] + abx * f);
          const dz = z - (a[2] + abz * f);
          if (dx * dx + dz * dz <= r2) this.cells[k] = 1;
        }
      }
    }
  }

  /** True when (x, z) is inside the corridor. */
  has(x: number, z: number): boolean {
    const c = Math.floor((x - this.minX) / this.cell);
    const r = Math.floor((z - this.minZ) / this.cell);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return false;
    return this.cells[r * this.cols + c] === 1;
  }
}

export interface TreeClearanceInput {
  terraces: readonly TerraceMeta[];
  rail: { points: readonly Vec3[]; closed: boolean };
  /** Trail weight in [0, 1] at a world point. */
  trailAt(x: number, z: number): number;
  /** True in or right beside a lake. */
  inLake(x: number, z: number): boolean;
}

/**
 * The veto the conifer scatter asks for every candidate tree: the hub
 * clearing, any terrace (with a margin for its bank), the rail corridor,
 * a trail, or a lake. Cheapest tests first.
 */
export function treeClearance({
  terraces,
  rail,
  trailAt,
  inLake,
}: TreeClearanceInput): (x: number, z: number) => boolean {
  const hub2 = TREE_CLEARANCE.hub * TREE_CLEARANCE.hub;
  const discs = terraces.map((t) => ({
    x: t.center[0],
    z: t.center[2],
    r2: (t.radius * TREE_CLEARANCE.terrace) ** 2,
  }));
  const corridor = new Corridor(rail.points, rail.closed, TREE_CLEARANCE.rail);
  return (x, z) => {
    if (x * x + z * z < hub2) return true;
    for (const d of discs) {
      const dx = x - d.x;
      const dz = z - d.z;
      if (dx * dx + dz * dz < d.r2) return true;
    }
    if (corridor.has(x, z)) return true;
    return trailAt(x, z) > TREE_CLEARANCE.trail || inLake(x, z);
  };
}
