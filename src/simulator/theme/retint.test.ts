import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { TOKENS } from "../world/contract.ts";
import { type Palette, parseCssColor, parseMaterialName } from "./palette.ts";
import {
  bindingToken,
  MaterialRegistry,
  RAMP_IMPORTANCE,
  RETINT_MS,
} from "./retint.ts";

function palette(
  fill: string,
  overrides: Partial<Record<string, string>> = {},
) {
  const p = {} as Palette;
  for (const token of TOKENS)
    p[token] = parseCssColor(overrides[token] ?? fill);
  return p;
}

const mat = (name: string) => new THREE.MeshStandardMaterial({ name });

describe("bindingToken", () => {
  it("maps ramps and gradients onto tokens", () => {
    expect(bindingToken(parseMaterialName("tok.text"))).toBe("text");
    expect(bindingToken(parseMaterialName("ramp.importance.1"))).toBe(
      RAMP_IMPORTANCE[0],
    );
    expect(bindingToken(parseMaterialName("ramp.importance.5"))).toBe(
      RAMP_IMPORTANCE[4],
    );
    expect(bindingToken(parseMaterialName("grad.dirnt"))).toBe("hue-green");
  });
});

describe("MaterialRegistry", () => {
  it("rejects materials outside the contract", () => {
    const registry = new MaterialRegistry();
    expect(() => registry.register(mat("Material.001"))).toThrow(
      /not in the world contract/,
    );
    expect(registry.size).toBe(0);
  });

  it("paints immediately on first apply and glows accents only in the dark", () => {
    const registry = new MaterialRegistry();
    const accent = mat("tok.accent");
    const surface = mat("tok.surface");
    const soft = mat("tok.hue-green-soft");
    for (const m of [accent, surface, soft]) registry.register(m);

    registry.apply(
      palette("#000000", {
        accent: "#ff0000",
        surface: "#ffffff",
        "hue-green-soft": "rgb(0 255 0 / 0.18)",
      }),
      "dark",
      true,
    );
    expect(accent.color.r).toBeCloseTo(1, 5);
    expect(accent.color.g).toBeCloseTo(0, 5);
    expect(accent.emissiveIntensity).toBeGreaterThan(0);
    expect(surface.emissiveIntensity).toBe(0);
    expect(soft.emissiveIntensity).toBe(0);
    expect(soft.transparent).toBe(true);
    expect(soft.opacity).toBeCloseTo(0.18, 5);

    registry.apply(palette("#000000", { accent: "#ff0000" }), "light", true);
    expect(accent.emissiveIntensity).toBe(0);
  });

  it("lerps toward the new palette over RETINT_MS", () => {
    const registry = new MaterialRegistry();
    const m = mat("tok.text");
    registry.register(m);
    registry.apply(palette("#000000"), "light", true);
    expect(registry.tick(0)).toBe(false);

    registry.apply(palette("#ffffff"), "light");
    expect(m.color.r).toBe(0);
    expect(registry.tick(RETINT_MS / 2)).toBe(true);
    expect(m.color.r).toBeGreaterThan(0.5);
    expect(m.color.r).toBeLessThan(1);
    expect(registry.tick(RETINT_MS)).toBe(false);
    expect(m.color.r).toBeCloseTo(1, 5);
  });

  it("paints materials registered after a palette was applied", () => {
    const registry = new MaterialRegistry();
    registry.apply(palette("#000000", { accent: "#ff0000" }), "dark", true);
    const late = registry.register(mat("tok.accent"));
    expect(late.color.r).toBeCloseTo(1, 5);
    expect(late.emissiveIntensity).toBeGreaterThan(0);
    expect(registry.tick(0)).toBe(false);
  });

  it("converts sRGB tokens into the linear working space", () => {
    const registry = new MaterialRegistry();
    const m = mat("tok.muted");
    registry.register(m);
    registry.apply(palette("#808080"), "light", true);
    // 0x80 sRGB is ~0.216 linear, not 0.5.
    expect(m.color.r).toBeCloseTo(0.2158, 3);
  });
});

describe("night ground", () => {
  it("lifts the background plate off black in the dark and not by day", () => {
    const registry = new MaterialRegistry();
    const ground = registry.register(mat("tok.bg"));
    const p = palette("#000000", { bg: "#000000", muted: "#ffffff" });
    registry.apply(p, "dark", true);
    expect(ground.color.r).toBeGreaterThan(0.01);
    registry.apply(p, "light", true);
    expect(ground.color.r).toBe(0);
  });
});
