import type { Vec3 } from "../meta.ts";

/** Pure math for figures walking a polyline route: arc length and timing. */

export interface RouteSample {
  position: Vec3;
  /** Unit direction of travel at the sample. */
  tangent: Vec3;
}

/** Cumulative arc length at every vertex; `cum[0]` is 0. */
export function cumulativeLengths(points: readonly Vec3[]): number[] {
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay, az] = points[i - 1];
    const [bx, by, bz] = points[i];
    cum.push(cum[i - 1] + Math.hypot(bx - ax, by - ay, bz - az));
  }
  return cum;
}

/**
 * Position and tangent at fraction `s` of the route's arc length.
 * `s` is clamped to [0, 1]; a degenerate route returns its first point.
 */
export function sampleRoute(
  points: readonly Vec3[],
  cum: readonly number[],
  s: number,
): RouteSample {
  const total = cum[cum.length - 1];
  if (points.length < 2 || total <= 0) {
    return { position: [...points[0]] as Vec3, tangent: [0, 0, 1] };
  }
  const target = Math.min(1, Math.max(0, s)) * total;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < target) i++;
  const a = points[i - 1];
  const b = points[i];
  const seg = cum[i] - cum[i - 1];
  const f = seg > 0 ? (target - cum[i - 1]) / seg : 0;
  const tangent: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...tangent) || 1;
  return {
    position: [
      a[0] + tangent[0] * f,
      a[1] + tangent[1] * f,
      a[2] + tangent[2] * f,
    ],
    tangent: [tangent[0] / len, tangent[1] / len, tangent[2] / len],
  };
}

/** Fraction of a cycle spent resting on the summit. */
export const SUMMIT_HOLD = 0.12;

/**
 * Where along the route a climber is at time `t`: up for the first
 * (1 - hold) / 2 of the period, a rest at the top, then back down.
 * Returns the arc-length fraction in [0, 1]; the cycle wraps.
 */
export function climbCycle(
  t: number,
  period: number,
  hold: number = SUMMIT_HOLD,
): number {
  if (period <= 0) return 0;
  const phase = (((t % period) + period) % period) / period;
  const leg = (1 - hold) / 2;
  if (phase < leg) return phase / leg;
  if (phase < leg + hold) return 1;
  return 1 - (phase - leg - hold) / leg;
}

/** True while the figure is walking rather than resting on the summit. */
export function isMoving(
  t: number,
  period: number,
  hold: number = SUMMIT_HOLD,
): boolean {
  if (period <= 0) return false;
  const phase = (((t % period) + period) % period) / period;
  const leg = (1 - hold) / 2;
  return phase < leg || phase >= leg + hold;
}
