import * as THREE from "three";
import type { TokenName } from "../world/contract.ts";
import {
  type MaterialBinding,
  type Palette,
  parseMaterialName,
  type Rgba,
} from "./palette.ts";

export type ThemeName = "light" | "dark";

/** Retint duration on a theme toggle, matching the page's CSS transition. */
export const RETINT_MS = 200;

/** astute's importance ramp, 1 (quiet) to 5 (urgent), spelled in tokens. */
export const RAMP_IMPORTANCE: readonly TokenName[] = [
  "faint",
  "hue-sky",
  "hue-sky-vivid",
  "hue-amber",
  "hue-rose",
];

/** Authored dirnt meshes take the gradient's dark end; instances shade it. */
export const GRADIENT_TOKENS: Record<string, TokenName> = {
  dirnt: "hue-green",
};

/** Tokens that glow at night: the accents, never the surfaces. */
const EMISSIVE_PREFIXES = ["accent", "hue-"];
const NIGHT_EMISSIVE = 0.55;

export function bindingToken(binding: MaterialBinding): TokenName {
  switch (binding.kind) {
    case "token":
      return binding.token;
    case "ramp":
      return RAMP_IMPORTANCE[binding.step - 1];
    case "gradient":
      return GRADIENT_TOKENS[binding.gradient];
  }
}

function isEmissiveToken(token: TokenName): boolean {
  if (token.endsWith("-soft")) return false;
  return EMISSIVE_PREFIXES.some((p) => token.startsWith(p));
}

interface Tracked {
  material: THREE.MeshStandardMaterial;
  token: TokenName;
  from: THREE.Color;
  to: THREE.Color;
  emissiveTo: number;
  emissiveFrom: number;
  opacity: number;
}

function toColor(rgba: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgba.r, rgba.g, rgba.b, THREE.SRGBColorSpace);
}

/**
 * Owns every world material and repaints it from the palette.
 * Materials are registered by name once (the glb loader creates one per
 * glTF material per file); `apply` sets a new target and `tick` lerps
 * toward it over RETINT_MS so a theme toggle glides like the page does.
 */
export class MaterialRegistry {
  private readonly tracked: Tracked[] = [];
  private elapsed = RETINT_MS;

  /**
   * Adopts a material. Throws on names outside the contract so a stray
   * Blender material fails in development instead of shipping gray.
   */
  register(material: THREE.Material): void {
    const binding = parseMaterialName(material.name);
    const token = bindingToken(binding);
    const std =
      material instanceof THREE.MeshStandardMaterial
        ? material
        : new THREE.MeshStandardMaterial({ name: material.name });
    std.roughness = 0.9;
    std.metalness = 0;
    std.flatShading = false;
    this.tracked.push({
      material: std,
      token,
      from: std.color.clone(),
      to: std.color.clone(),
      emissiveFrom: 0,
      emissiveTo: 0,
      opacity: 1,
    });
  }

  get size(): number {
    return this.tracked.length;
  }

  /** Materials in registration order (for tests and the dev HUD). */
  list(): readonly THREE.MeshStandardMaterial[] {
    return this.tracked.map((t) => t.material);
  }

  /** Sets a new target palette. Pass `immediate` on first paint. */
  apply(palette: Palette, theme: ThemeName, immediate = false): void {
    for (const t of this.tracked) {
      const rgba = palette[t.token];
      t.from.copy(t.material.color);
      toColor(rgba, t.to);
      t.emissiveFrom = t.material.emissiveIntensity;
      t.emissiveTo =
        theme === "dark" && isEmissiveToken(t.token) ? NIGHT_EMISSIVE : 0;
      t.opacity = rgba.a;
      t.material.transparent = rgba.a < 1;
      t.material.opacity = rgba.a;
      t.material.emissive.copy(t.to);
    }
    this.elapsed = immediate ? RETINT_MS : 0;
    this.tick(0);
  }

  /** Advances the retint; returns true while still animating. */
  tick(dtMs: number): boolean {
    this.elapsed = Math.min(RETINT_MS, this.elapsed + dtMs);
    const f = this.elapsed / RETINT_MS;
    const eased = f * (2 - f);
    for (const t of this.tracked) {
      t.material.color.copy(t.from).lerp(t.to, eased);
      t.material.emissiveIntensity =
        t.emissiveFrom + (t.emissiveTo - t.emissiveFrom) * eased;
    }
    return this.elapsed < RETINT_MS;
  }
}
