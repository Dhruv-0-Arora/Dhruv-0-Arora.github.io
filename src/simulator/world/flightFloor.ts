import type { LakeMeta } from "./meta.ts";

/** Anything that can answer a surface height, or null where it has none. */
interface HeightSource {
  heightAt(x: number, z: number): number | null;
}

/**
 * The surface the Flyer can hit: the exact terrain where the sampler
 * covers it (falling back to the coarse grid, which errs high), raised to
 * the water level over a lake. Exact matters: the flight floor sits only
 * a metre or so above it, so a crash has to touch the ground it shows.
 */
export function flightFloor(
  sampler: HeightSource | null,
  grid: HeightSource | null,
  lakes: readonly LakeMeta[],
): (x: number, z: number) => number {
  return (x, z) => {
    let h = sampler?.heightAt(x, z) ?? grid?.heightAt(x, z) ?? 0;
    for (const lake of lakes) {
      const dx = x - lake.center[0];
      const dz = z - lake.center[2];
      if (dx * dx + dz * dz < lake.radius * lake.radius) {
        h = Math.max(h, lake.center[1]);
      }
    }
    return h;
  };
}
