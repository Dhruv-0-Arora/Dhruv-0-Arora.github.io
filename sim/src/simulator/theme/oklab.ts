import type { Rgba } from "./palette.ts";

/**
 * Oklab (Bjorn Ottosson, 2020): a perceptual space where linear
 * interpolation reads as an even gradient. dirnt tints directory names by
 * age in this space; the bamboo grove reuses the same math.
 */
export interface Oklab {
  L: number;
  a: number;
  b: number;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.min(1, Math.max(0, v));
}

export function srgbToOklab({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): Oklab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function oklabToSrgb({ L, a, b }: Oklab): Rgba {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a: 1,
  };
}

export function mixOklab(x: Oklab, y: Oklab, t: number): Oklab {
  return {
    L: x.L + (y.L - x.L) * t,
    a: x.a + (y.a - x.a) * t,
    b: x.b + (y.b - x.b) * t,
  };
}

/** Piecewise-linear gradient through `stops` in Oklab, t in [0, 1]. */
export function gradientOklab(stops: readonly Oklab[], t: number): Oklab {
  if (stops.length === 0) throw new Error("gradient needs stops");
  if (stops.length === 1) return stops[0];
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  return mixOklab(stops[i], stops[i + 1], scaled - i);
}

/**
 * dirnt's age-to-position curve: log-scaled so the first day of staleness
 * moves a name much further along the gradient than the hundredth.
 */
export function agePosition(ageDays: number, maxDays: number): number {
  if (maxDays <= 0) return 1;
  const p = Math.log1p(Math.max(0, ageDays)) / Math.log1p(maxDays);
  return Math.min(1, Math.max(0, p));
}

/**
 * The bamboo palette in tokens: forest green, then a bamboo mid-tone (green
 * warmed toward amber and lifted toward the surface), then near-white.
 */
export function dirntStops(palette: {
  "hue-green": Rgba;
  "hue-amber": Rgba;
  surface: Rgba;
}): Oklab[] {
  const green = srgbToOklab(palette["hue-green"]);
  const amber = srgbToOklab(palette["hue-amber"]);
  const surface = srgbToOklab(palette.surface);
  const bamboo = mixOklab(mixOklab(green, amber, 0.35), surface, 0.45);
  const pale = mixOklab(surface, green, 0.12);
  return [green, bamboo, pale];
}
