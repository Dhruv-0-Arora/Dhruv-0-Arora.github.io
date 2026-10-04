import type { ZoneSlug } from "../world/contract.ts";
import type { LookMeta, Vec3, WorldMeta, ZoneMeta } from "../world/meta.ts";
import { clamp01, type RailPath } from "./railPath.ts";

/**
 * A stop on the lap: the rail t at which the camera is aimed squarely at
 * a zone. The hub is a station twice, at t = 0 and t = 1, because the
 * loop is closed and the ride ends where it began.
 */
export interface Station {
  zone: ZoneSlug;
  t: number;
}

/**
 * How page scroll is laid out along the lap, in normalised scroll s and
 * rail t, both in [0, 1]. Every station owns a plateau [starts[i], ends[i]]
 * where t is pinned to the station, so the panel for that project holds
 * still while the visitor reads; between two plateaus the transit eases t
 * from one station to the next.
 */
export interface ScrollLayout {
  stations: readonly Station[];
  /** Scroll s where each station's plateau begins. */
  starts: readonly number[];
  /** Scroll s where each station's plateau ends. */
  ends: readonly number[];
}

/**
 * Relative scroll lengths of the pieces of the lap. The units are screens
 * of a nominal lap; the layout is normalised afterwards so the whole lap
 * fits `RAIL_SCREENS`, which is the one knob for overall scroll length.
 * Only the ratios here matter: plateau against transit, short hop against
 * long leg.
 */
export const LAYOUT = {
  /** Scroll a visitor can spend on one station before the train moves. */
  plateauScreens: 0.45,
  /** Every transit costs at least this, so a short hop still feels like travel. */
  transitBaseScreens: 0.3,
  /** Extra scroll per metre of rail, so a long leg does not fly by. */
  transitScreensPerMeter: 1 / 600,
  /** Bounds on one transit, after the base and the distance term. */
  transitMinScreens: 0.3,
  transitMaxScreens: 1.6,
} as const;

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}

/**
 * The look nearest a zone's position is the one the exporter placed on it,
 * and its t is where the camera faces the installation squarely. A zone
 * with no look inside its radius falls back to the rail point nearest it.
 */
function stationT(
  zone: ZoneMeta,
  looks: readonly LookMeta[],
  rail: RailPath,
): number {
  let best: LookMeta | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (const look of looks) {
    const d = distance(look.position, zone.position);
    if (d < bestD) {
      best = look;
      bestD = d;
    }
  }
  if (best && bestD <= zone.radius) return best.t;
  return rail.nearestT(zone.position);
}

/**
 * One station per zone, sorted along the rail, with the hub opening the
 * lap at t = 0 and closing it at t = 1. The hub is pinned rather than
 * measured: the lap starts and ends there by construction of the rail.
 */
export function buildStations(meta: WorldMeta, rail: RailPath): Station[] {
  const projects: Station[] = [];
  for (const zone of meta.zones) {
    if (zone.slug === "hub") continue;
    projects.push({ zone: zone.slug, t: stationT(zone, meta.looks, rail) });
  }
  projects.sort((a, b) => a.t - b.t);
  return [{ zone: "hub", t: 0 }, ...projects, { zone: "hub", t: 1 }];
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Lays the stations out along the scroll: a plateau per station and a
 * transit per gap whose length grows with the rail distance it covers,
 * then normalises the whole lap to s in [0, 1].
 */
export function buildLayout(
  stations: readonly Station[],
  railLength: number,
): ScrollLayout {
  if (stations.length === 0) throw new Error("layout needs a station");
  const starts: number[] = [];
  const ends: number[] = [];
  let cursor = 0;
  for (let i = 0; i < stations.length; i++) {
    if (i > 0) {
      const metres = (stations[i].t - stations[i - 1].t) * railLength;
      cursor += clamp(
        LAYOUT.transitBaseScreens + metres * LAYOUT.transitScreensPerMeter,
        LAYOUT.transitMinScreens,
        LAYOUT.transitMaxScreens,
      );
    }
    starts.push(cursor);
    cursor += LAYOUT.plateauScreens;
    ends.push(cursor);
  }
  const total = cursor;
  return {
    stations,
    starts: starts.map((v) => v / total),
    ends: ends.map((v) => v / total),
  };
}

function smoothstep(u: number): number {
  const c = clamp01(u);
  return c * c * (3 - 2 * c);
}

/** Exact inverse of smoothstep on [0, 1]: the one real root in range. */
function inverseSmoothstep(y: number): number {
  const c = clamp01(y);
  return 0.5 - Math.sin(Math.asin(1 - 2 * c) / 3);
}

/** Where a scroll position falls: resting on a plateau, or in a transit. */
export type ScrollPlace =
  | { kind: "plateau"; index: number }
  | { kind: "transit"; from: number; u: number };

export function locateScroll(s: number, layout: ScrollLayout): ScrollPlace {
  const ss = clamp01(s);
  const { starts, ends } = layout;
  let i = 0;
  for (let k = 1; k < starts.length; k++) {
    if (starts[k] <= ss) i = k;
    else break;
  }
  if (ss <= ends[i] || i === starts.length - 1) {
    return { kind: "plateau", index: i };
  }
  const span = starts[i + 1] - ends[i];
  const u = span > 0 ? (ss - ends[i]) / span : 1;
  return { kind: "transit", from: i, u };
}

/** Rail t for a scroll position: pinned on plateaus, eased across transits. */
export function railFromScroll(s: number, layout: ScrollLayout): number {
  const place = locateScroll(s, layout);
  const { stations } = layout;
  if (place.kind === "plateau") return stations[place.index].t;
  const a = stations[place.from].t;
  const b = stations[place.from + 1].t;
  return a + (b - a) * smoothstep(place.u);
}

/** Scroll s at the middle of a station's plateau. */
export function plateauCentre(layout: ScrollLayout, index: number): number {
  return (layout.starts[index] + layout.ends[index]) / 2;
}

/**
 * Inverse of `railFromScroll`: exact on transits, and the plateau centre
 * for a t that is a station, since the whole plateau maps to that t.
 */
export function scrollFromRail(t: number, layout: ScrollLayout): number {
  const tt = clamp01(t);
  const { stations } = layout;
  let i = 0;
  for (let k = 1; k < stations.length; k++) {
    if (stations[k].t <= tt) i = k;
    else break;
  }
  if (i === stations.length - 1 || tt === stations[i].t) {
    return plateauCentre(layout, i);
  }
  const a = stations[i].t;
  const b = stations[i + 1].t;
  const u = inverseSmoothstep((tt - a) / (b - a));
  return layout.ends[i] + u * (layout.starts[i + 1] - layout.ends[i]);
}

/**
 * The station to jump to from a scroll position. Sitting on a plateau,
 * the next or previous one; mid-transit, the end of the transit in the
 * direction of travel, so "next" always completes the leg underway.
 */
export function jumpTarget(
  s: number,
  layout: ScrollLayout,
  direction: 1 | -1,
): number {
  const place = locateScroll(s, layout);
  const raw =
    place.kind === "plateau"
      ? place.index + direction
      : direction > 0
        ? place.from + 1
        : place.from;
  return clamp(raw, 0, layout.stations.length - 1);
}

/** The nearer station when stopped mid-transit; null while on a plateau. */
export function snapTarget(s: number, layout: ScrollLayout): number | null {
  const place = locateScroll(s, layout);
  if (place.kind === "plateau") return null;
  return place.u < 0.5 ? place.from : place.from + 1;
}

/** Project zones in riding order, the hub left out. */
export function projectOrder(layout: ScrollLayout): ZoneSlug[] {
  return layout.stations.map((s) => s.zone).filter((zone) => zone !== "hub");
}
