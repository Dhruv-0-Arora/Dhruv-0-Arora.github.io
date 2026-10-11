import { useSyncExternalStore } from "react";
import { scroller, scrollMax, scrollProgress } from "../controls/scroller.ts";
import {
  locateScroll,
  plateauCentre,
  projectOrder,
  type ScrollLayout,
  type ScrollPlace,
} from "../controls/stations.ts";
import { frame } from "../simStore.ts";
import { ZONE_SLUGS, type ZoneSlug } from "../world/contract.ts";

/**
 * Where the train is along the lap, as the overlay needs it: the station
 * it stands at (or last left), the project order for the counter, and
 * which way a hop in flight is heading.
 */
export interface StationReading {
  layout: ScrollLayout | null;
  /** Project zones in riding order, the hub left out. */
  order: readonly ZoneSlug[];
  /** Index into `layout.stations`; 0 before the layout is in. */
  station: number;
  /** +1 or -1 while a hop tween runs, 0 at rest. */
  heading: -1 | 0 | 1;
}

const PROJECT_ZONES: readonly ZoneSlug[] = ZONE_SLUGS.filter(
  (z) => z !== "hub",
);

/** Rail t closer than this to a station's t counts as standing at it. */
const AT_STATION = 1e-4;

/**
 * Where the train is, by rail t: standing at a station, or part way along
 * the leg after `from`. The same shape `locateScroll` gives for a scroll
 * position, so either can feed `stationFor`.
 */
export function locateRail(t: number, layout: ScrollLayout): ScrollPlace {
  const { stations } = layout;
  let k = 0;
  for (let i = 1; i < stations.length; i++) {
    if (stations[i].t <= t + AT_STATION) k = i;
    else break;
  }
  if (Math.abs(t - stations[k].t) <= AT_STATION || k === stations.length - 1) {
    return { kind: "plateau", index: k };
  }
  const span = stations[k + 1].t - stations[k].t;
  return {
    kind: "transit",
    from: k,
    u: span > 0 ? (t - stations[k].t) / span : 1,
  };
}

/**
 * The station a place belongs to. At a station it is that station;
 * part way along a leg it is the one being left while a hop runs, so the
 * counter turns over on arrival rather than halfway, and the nearer one
 * otherwise.
 */
export function stationFor(place: ScrollPlace, heading: -1 | 0 | 1): number {
  if (place.kind === "plateau") return place.index;
  if (heading > 0) return place.from;
  if (heading < 0) return place.from + 1;
  return place.u < 0.5 ? place.from : place.from + 1;
}

/**
 * The neighbour a hop lands on, wrapping through the hub: the hub is a
 * station at both ends of the lap, and both ends are the same place.
 * Returns the station index to tween to, and whether the ride first has
 * to be moved to the other end of the lap to get there the short way.
 */
export function hopTarget(
  station: number,
  stations: number,
  direction: 1 | -1,
): { from: number; to: number } {
  const last = stations - 1;
  if (direction < 0 && station <= 0) return { from: last, to: last - 1 };
  if (direction > 0 && station >= last) return { from: 0, to: 1 };
  return { from: station, to: station + direction };
}

/** The hub opens the lap at station 0 and closes it at the last station. */
export function isHub(station: number, stations: number): boolean {
  return station <= 0 || station >= stations - 1;
}

/**
 * The sites either side of a station, by zone. Station i is project i,
 * counting from 1, so the hub has the last project behind it and the
 * first ahead, whichever end of the lap it is.
 */
export function neighbours(
  station: number,
  order: readonly ZoneSlug[],
): { prev: ZoneSlug; next: ZoneSlug } {
  const n = order.length;
  if (n === 0) return { prev: "hub", next: "hub" };
  if (isHub(station, n + 2)) return { prev: order[n - 1], next: order[0] };
  return {
    prev: station === 1 ? "hub" : order[station - 2],
    next: station === n ? "hub" : order[station],
  };
}

/**
 * Which way a hop to station `destination` runs from a place; 0 when idle.
 * The two hub stations are one spot, so a hop from the hub to the far
 * half of the lap is a wrap through the other end, the short way round.
 */
export function headingOf(
  place: ScrollPlace,
  destination: number | null,
  stations: number,
): -1 | 0 | 1 {
  if (destination === null) return 0;
  let here = place.kind === "plateau" ? place.index : place.from + 0.5;
  if (place.kind === "plateau" && isHub(here, stations)) {
    // Either end of the lap, whichever is nearer the destination.
    here = destination >= stations / 2 ? stations - 1 : 0;
  }
  return destination > here ? 1 : destination < here ? -1 : 0;
}

let reading: StationReading = {
  layout: null,
  order: PROJECT_ZONES,
  station: 0,
  heading: 0,
};
let rafId = 0;
const listeners = new Set<() => void>();

function sample(): void {
  const layout = frame.layout;
  let next = reading;
  if (!layout) {
    if (reading.layout) next = { ...reading, layout: null, heading: 0 };
  } else {
    // The rail t the camera rides, not the scroll: the counter and the
    // names change when the view does, in step with the panel.
    const place = locateRail(frame.railT, layout);
    const heading = headingOf(place, scroller.heading, layout.stations.length);
    const station = stationFor(place, heading);
    if (
      layout !== reading.layout ||
      station !== reading.station ||
      heading !== reading.heading
    ) {
      next = {
        layout,
        order: layout === reading.layout ? reading.order : projectOrder(layout),
        station,
        heading,
      };
    }
  }
  if (next !== reading) {
    reading = next;
    for (const l of listeners) l();
  }
}

function loop(): void {
  sample();
  rafId = requestAnimationFrame(loop);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) rafId = requestAnimationFrame(loop);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) cancelAnimationFrame(rafId);
  };
}

function getSnapshot(): StationReading {
  return reading;
}

/**
 * Reactive station reading, shared by the hop bar and the panel's status
 * line. One animation-frame poll serves every subscriber, and React only
 * hears about it when the station, the heading or the layout changes.
 */
export function useStationIndex(): StationReading {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Hop one site along the lap, wrapping at the hub. The hub closes the
 * lap where it opened it, so going back from the start is a cut to the
 * end (the same spot on the ground) and a hop from there.
 */
export function hop(direction: 1 | -1): void {
  const layout = frame.layout;
  if (!layout) return;
  if (!scroller.tweening) {
    const station = stationFor(locateScroll(scrollProgress(), layout), 0);
    const { from } = hopTarget(station, layout.stations.length, direction);
    if (from !== station) {
      window.scrollTo({
        top: plateauCentre(layout, from) * scrollMax(),
        behavior: "instant",
      });
    }
  }
  scroller.jumpToStation(direction);
}
