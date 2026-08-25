import type { ZoneSlug } from "../world/contract.ts";
import type { ZoneMeta } from "../world/meta.ts";

/** Leave a zone only once the probe is this far out, relative to its radius. */
export const EXIT_FACTOR = 1.25;

export interface ProximityChange {
  entered: ZoneSlug | null;
  exited: ZoneSlug | null;
  active: ZoneSlug | null;
}

/**
 * Tracks which zone the probe (camera aim on rails, the Dozer when driving)
 * is in. One zone is active at a time. Hysteresis keeps a zone active until
 * the probe is 1.25 radii away, so a rail that skims an edge does not
 * flicker the dock. Distances are horizontal (XZ).
 */
export class ProximityTracker {
  private activeZone: ZoneMeta | null = null;
  private readonly zones: readonly ZoneMeta[];

  constructor(zones: readonly ZoneMeta[]) {
    this.zones = zones;
  }

  get active(): ZoneSlug | null {
    return this.activeZone?.slug ?? null;
  }

  update(x: number, z: number): ProximityChange {
    let exited: ZoneSlug | null = null;
    if (this.activeZone) {
      const d = distance(this.activeZone, x, z);
      if (d > this.activeZone.radius * EXIT_FACTOR) {
        exited = this.activeZone.slug;
        this.activeZone = null;
      }
    }

    let entered: ZoneSlug | null = null;
    if (!this.activeZone) {
      let best: ZoneMeta | null = null;
      let bestD = Number.POSITIVE_INFINITY;
      for (const zone of this.zones) {
        const d = distance(zone, x, z);
        if (d < zone.radius && d < bestD) {
          best = zone;
          bestD = d;
        }
      }
      if (best) {
        this.activeZone = best;
        entered = best.slug;
      }
    }

    return { entered, exited, active: this.active };
  }

  reset(): void {
    this.activeZone = null;
  }
}

function distance(zone: ZoneMeta, x: number, z: number): number {
  return Math.hypot(zone.position[0] - x, zone.position[2] - z);
}
