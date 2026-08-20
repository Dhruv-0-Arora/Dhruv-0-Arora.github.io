import { isToken, TOKENS, type TokenName } from "../world/contract.ts";

/** sRGB components in [0, 1] plus alpha. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^rgba?\(\s*([^)]*)\)$/i;

function channel(raw: string): number {
  const s = raw.trim();
  if (s.endsWith("%")) return Number.parseFloat(s) / 100;
  return Number.parseFloat(s) / 255;
}

function alpha(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const s = raw.trim();
  if (s.endsWith("%")) return Number.parseFloat(s) / 100;
  return Number.parseFloat(s);
}

/**
 * Parses the CSS color forms used by `src/index.css`: `#rgb`, `#rrggbb`,
 * `#rrggbbaa`, `rgb(r g b / a)` and the legacy comma syntax.
 * Throws on anything else so a token drift is loud, not silently gray.
 */
export function parseCssColor(input: string): Rgba {
  const value = input.trim();
  const hex = HEX.exec(value);
  if (hex) {
    let digits = hex[1];
    if (digits.length <= 4) {
      digits = [...digits].map((d) => d + d).join("");
    }
    const n = Number.parseInt(digits.padEnd(8, "f"), 16);
    return {
      r: ((n >>> 24) & 0xff) / 255,
      g: ((n >>> 16) & 0xff) / 255,
      b: ((n >>> 8) & 0xff) / 255,
      a: (n & 0xff) / 255,
    };
  }
  const rgb = RGB.exec(value);
  if (rgb) {
    const [colors, alphaPart] = rgb[1].split("/");
    const parts = colors.split(/[\s,]+/).filter(Boolean);
    if (parts.length === 3 || (parts.length === 4 && alphaPart === undefined)) {
      const [r, g, b, legacyAlpha] = parts;
      const result = {
        r: channel(r),
        g: channel(g),
        b: channel(b),
        a: alpha(alphaPart ?? legacyAlpha),
      };
      if (Object.values(result).every(Number.isFinite)) return result;
    }
  }
  throw new Error(`unsupported CSS color '${input}'`);
}

export type Palette = Record<TokenName, Rgba>;

/**
 * Reads every contract token from a CSS custom property reader such as
 * `(name) => getComputedStyle(root).getPropertyValue(name)`.
 * Kept free of DOM access so it is testable and so the simulator has exactly
 * one place that knows tokens are spelled `--c-<token>`.
 */
export function readPalette(read: (property: string) => string): Palette {
  const palette = {} as Palette;
  const missing: string[] = [];
  for (const token of TOKENS) {
    const raw = read(`--c-${token}`);
    if (raw.trim() === "") {
      missing.push(token);
      continue;
    }
    palette[token] = parseCssColor(raw);
  }
  if (missing.length > 0) {
    throw new Error(`palette is missing tokens: ${missing.join(", ")}`);
  }
  return palette;
}

/** What a Blender material name asks the runtime to paint it with. */
export type MaterialBinding =
  | { kind: "token"; token: TokenName }
  | { kind: "ramp"; ramp: string; step: number; steps: number }
  | { kind: "gradient"; gradient: string };

const RAMPS: Record<string, number> = { importance: 5 };
const GRADIENTS: readonly string[] = ["dirnt"];

/**
 * Parses the material-name contract (`tok.accent`, `ramp.importance.3`,
 * `grad.dirnt`). Unknown names throw so a stray Blender material fails fast
 * in development instead of rendering with a fallback color in production.
 */
export function parseMaterialName(name: string): MaterialBinding {
  const [kind, ...rest] = name.split(".");
  if (kind === "tok" && rest.length === 1 && isToken(rest[0])) {
    return { kind: "token", token: rest[0] };
  }
  if (kind === "ramp" && rest.length === 2 && rest[0] in RAMPS) {
    const steps = RAMPS[rest[0]];
    const step = Number(rest[1]);
    if (Number.isInteger(step) && step >= 1 && step <= steps) {
      return { kind: "ramp", ramp: rest[0], step, steps };
    }
  }
  if (kind === "grad" && rest.length === 1 && GRADIENTS.includes(rest[0])) {
    return { kind: "gradient", gradient: rest[0] };
  }
  throw new Error(`material '${name}' is not in the world contract`);
}
