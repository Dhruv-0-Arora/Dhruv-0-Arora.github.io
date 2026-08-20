import contractJson from "../../../assets/blender/contract.json" with {
  type: "json",
};

/**
 * The authoring contract shared with the Blender scripts.
 * `assets/blender/contract.json` is the single source of truth for values.
 * The literal lists below exist only so TypeScript gets string-literal unions
 * (a JSON import infers `string[]`); `contract.test.ts` asserts they match.
 */
export const DISTRICTS = [
  "shared",
  "terminal",
  "evidence",
  "fabrication",
  "redacted",
] as const;

export const ZONE_SLUGS = [
  "astute",
  "stalk",
  "dirnt",
  "cypher",
  "altigoz",
  "nazar",
  "kerms",
  "imc-prosperity-4",
  "wisconsin-racing",
  "orion",
  "agentic-cad-spike",
  "synthesis",
  "swiftlabs-platform",
] as const;

export const TOKENS = [
  "bg",
  "surface",
  "surface-2",
  "border",
  "text",
  "muted",
  "faint",
  "accent",
  "accent-soft",
  "on-accent",
  "hue-green",
  "hue-sky",
  "hue-violet",
  "hue-rose",
  "hue-amber",
  "hue-green-vivid",
  "hue-sky-vivid",
  "hue-violet-vivid",
  "hue-rose-vivid",
  "hue-amber-vivid",
  "hue-green-soft",
  "hue-sky-soft",
  "hue-violet-soft",
  "hue-rose-soft",
  "hue-amber-soft",
] as const;

export type District = (typeof DISTRICTS)[number];
export type ZoneSlug = (typeof ZONE_SLUGS)[number];
export type TokenName = (typeof TOKENS)[number];

export interface TriBudgets {
  districts: Record<District, number>;
  installations: Record<string, number>;
  installationDefault: number;
  authoredTotal: number;
  instancedTotal: number;
  dozer: number;
  ceiling: number;
}

export interface ByteBudgets {
  districts: Record<District, number>;
  totalSoft: number;
  totalHard: number;
}

export interface Contract {
  version: number;
  districts: readonly District[];
  zones: readonly ZoneSlug[];
  materials: {
    tokens: readonly TokenName[];
    ramps: Record<string, number>;
    gradients: readonly string[];
  };
  requiredObjects: readonly string[];
  world: { sizeMeters: number; cullDistanceMeters: number };
  budgets: { tris: TriBudgets; bytes: ByteBudgets };
}

export const contract: Contract = {
  ...contractJson,
  districts: DISTRICTS,
  zones: ZONE_SLUGS,
  materials: { ...contractJson.materials, tokens: TOKENS },
};

/** The raw JSON, for tests that check the literal lists stay in sync. */
export const contractSource: {
  districts: string[];
  zones: string[];
  materials: { tokens: string[] };
} = contractJson;

export function isDistrict(value: string): value is District {
  return (DISTRICTS as readonly string[]).includes(value);
}

export function isZoneSlug(value: string): value is ZoneSlug {
  return (ZONE_SLUGS as readonly string[]).includes(value);
}

export function isToken(value: string): value is TokenName {
  return (TOKENS as readonly string[]).includes(value);
}
