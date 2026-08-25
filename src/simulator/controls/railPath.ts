import type { LookMeta, RailMeta, Vec3 } from "../world/meta.ts";

/**
 * Arc-length parametrized polyline from the exported rail.
 * `t` is always in [0, 1] and proportional to distance travelled, so a
 * constant scroll speed is a constant camera speed regardless of how the
 * Bezier was sampled in Blender.
 */
export class RailPath {
  readonly points: Vec3[];
  readonly closed: boolean;
  readonly length: number;
  private readonly cumulative: number[];

  constructor(rail: RailMeta) {
    if (rail.points.length < 2) {
      throw new Error("rail needs at least 2 points");
    }
    this.points = rail.closed
      ? [...rail.points, rail.points[0]]
      : [...rail.points];
    this.closed = rail.closed;
    this.cumulative = [0];
    for (let i = 1; i < this.points.length; i++) {
      this.cumulative.push(
        this.cumulative[i - 1] + dist(this.points[i - 1], this.points[i]),
      );
    }
    this.length = this.cumulative[this.cumulative.length - 1];
    if (this.length <= 0) throw new Error("rail has zero length");
  }

  /** Segment index and local fraction for a global t. */
  private locate(t: number): { i: number; f: number } {
    const target = clamp01(t) * this.length;
    let lo = 0;
    let hi = this.cumulative.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.cumulative[mid] <= target) lo = mid;
      else hi = mid;
    }
    const span = this.cumulative[hi] - this.cumulative[lo];
    const f = span > 0 ? (target - this.cumulative[lo]) / span : 0;
    return { i: lo, f };
  }

  pointAt(t: number, out: Vec3 = [0, 0, 0]): Vec3 {
    const { i, f } = this.locate(t);
    const a = this.points[i];
    const b = this.points[i + 1];
    out[0] = a[0] + (b[0] - a[0]) * f;
    out[1] = a[1] + (b[1] - a[1]) * f;
    out[2] = a[2] + (b[2] - a[2]) * f;
    return out;
  }

  /** Unit tangent of the segment containing t. */
  tangentAt(t: number, out: Vec3 = [0, 0, 0]): Vec3 {
    const { i } = this.locate(t);
    const a = this.points[i];
    const b = this.points[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    out[0] = dx / len;
    out[1] = dy / len;
    out[2] = dz / len;
    return out;
  }

  /** t of the closest point on the path to `p`, by exhaustive segment search. */
  nearestT(p: Vec3): number {
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.points.length - 1; i++) {
      const a = this.points[i];
      const b = this.points[i + 1];
      const abx = b[0] - a[0];
      const aby = b[1] - a[1];
      const abz = b[2] - a[2];
      const ab2 = abx * abx + aby * aby + abz * abz;
      let f = 0;
      if (ab2 > 0) {
        f =
          ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby + (p[2] - a[2]) * abz) /
          ab2;
        f = Math.min(1, Math.max(0, f));
      }
      const qx = a[0] + abx * f;
      const qy = a[1] + aby * f;
      const qz = a[2] + abz * f;
      const d = (p[0] - qx) ** 2 + (p[1] - qy) ** 2 + (p[2] - qz) ** 2;
      if (d < bestDist) {
        bestDist = d;
        const span = this.cumulative[i + 1] - this.cumulative[i];
        best = (this.cumulative[i] + span * f) / this.length;
      }
    }
    return best;
  }
}

function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(x: number): number {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
}

/**
 * Blends the exported look targets: at each look's t the camera aims exactly
 * at it, and between two looks the aim eases from one to the next.
 * Before the first or after the last look the nearest one is held.
 */
export function lookTargetAt(
  looks: readonly LookMeta[],
  t: number,
  out: Vec3 = [0, 0, 0],
): Vec3 {
  if (looks.length === 0) throw new Error("no look targets");
  const tt = clamp01(t);
  let next = looks.findIndex((l) => l.t >= tt);
  if (next === -1) next = looks.length - 1;
  const prev = Math.max(0, next - 1);
  const a = looks[prev];
  const b = looks[next];
  const span = b.t - a.t;
  const f = span > 0 ? smoothstep((tt - a.t) / span) : 1;
  out[0] = a.position[0] + (b.position[0] - a.position[0]) * f;
  out[1] = a.position[1] + (b.position[1] - a.position[1]) * f;
  out[2] = a.position[2] + (b.position[2] - a.position[2]) * f;
  return out;
}
