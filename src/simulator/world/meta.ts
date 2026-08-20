import { contract, isZoneSlug, type ZoneSlug } from "./contract.ts";

/** Shape of `public/world/meta.json`, written by `export_world.py`. */
export type Vec3 = [number, number, number];

export interface RailMeta {
  points: Vec3[];
  closed: boolean;
}

export interface LookMeta {
  /** Rail parameter in [0, 1] at which this look target is fully active. */
  t: number;
  position: Vec3;
}

export interface ZoneMeta {
  slug: ZoneSlug;
  position: Vec3;
  radius: number;
}

export interface BoxColliderMeta {
  name: string;
  min: Vec3;
  max: Vec3;
}

export interface WorldMeta {
  version: number;
  rail: RailMeta;
  looks: LookMeta[];
  zones: ZoneMeta[];
  colliders: BoxColliderMeta[];
  bounds: { min: Vec3; max: Vec3 };
}

function isVec3(v: unknown): v is Vec3 {
  return (
    Array.isArray(v) && v.length === 3 && v.every((n) => Number.isFinite(n))
  );
}

/**
 * Validates untrusted JSON against the contract. Returns every problem found
 * rather than the first, so a broken export is diagnosable in one pass.
 */
export function validateWorldMeta(input: unknown): string[] {
  const errors: string[] = [];
  if (typeof input !== "object" || input === null) {
    return ["meta is not an object"];
  }
  const meta = input as Partial<WorldMeta>;

  if (meta.version !== contract.version) {
    errors.push(
      `meta version ${String(meta.version)} does not match contract ${contract.version}`,
    );
  }

  const points = meta.rail?.points;
  if (!Array.isArray(points) || points.length < 2) {
    errors.push("rail.points needs at least 2 points");
  } else if (!points.every(isVec3)) {
    errors.push("rail.points contains a non-finite point");
  }
  if (typeof meta.rail?.closed !== "boolean") {
    errors.push("rail.closed must be a boolean");
  }

  if (!Array.isArray(meta.looks)) {
    errors.push("looks must be an array");
  } else {
    let last = -1;
    for (const look of meta.looks) {
      if (typeof look.t !== "number" || look.t < 0 || look.t > 1) {
        errors.push(`look at t=${String(look.t)} is outside [0, 1]`);
      } else if (look.t < last) {
        errors.push("looks must be sorted by t");
      }
      last = look.t;
      if (!isVec3(look.position)) errors.push("look has a bad position");
    }
  }

  if (!Array.isArray(meta.zones)) {
    errors.push("zones must be an array");
  } else {
    const seen = new Set<string>();
    for (const zone of meta.zones) {
      if (!isZoneSlug(zone.slug)) {
        errors.push(`zone '${String(zone.slug)}' is not in the contract`);
      }
      if (seen.has(zone.slug)) errors.push(`zone '${zone.slug}' is duplicated`);
      seen.add(zone.slug);
      if (!isVec3(zone.position)) {
        errors.push(`zone '${zone.slug}' has a bad position`);
      }
      if (!(typeof zone.radius === "number" && zone.radius > 0)) {
        errors.push(`zone '${zone.slug}' needs radius > 0`);
      }
    }
    for (const slug of contract.zones) {
      if (!seen.has(slug)) errors.push(`zone '${slug}' is missing`);
    }
  }

  if (!Array.isArray(meta.colliders)) {
    errors.push("colliders must be an array");
  } else {
    for (const box of meta.colliders) {
      if (!isVec3(box.min) || !isVec3(box.max)) {
        errors.push(`collider '${String(box.name)}' has bad bounds`);
      } else if (box.min.some((v, i) => v > box.max[i])) {
        errors.push(`collider '${box.name}' has min > max`);
      }
    }
  }

  if (!isVec3(meta.bounds?.min) || !isVec3(meta.bounds?.max)) {
    errors.push("bounds must have min and max");
  }

  return errors;
}

export function parseWorldMeta(input: unknown): WorldMeta {
  const errors = validateWorldMeta(input);
  if (errors.length > 0) {
    throw new Error(`invalid world meta:\n  ${errors.join("\n  ")}`);
  }
  return input as WorldMeta;
}
