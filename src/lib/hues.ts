export type Hue = "green" | "sky" | "violet" | "rose" | "amber";

/** CSS var reference for a hue (text-safe tier), falling back to the global accent. */
export function hueVar(hue?: Hue): string {
  return hue ? `var(--c-hue-${hue})` : "var(--c-accent)";
}

/** Decorative tier: punchier in light mode, aliases the text tier in dark. Never for small text. */
export function hueVividVar(hue?: Hue): string {
  return hue ? `var(--c-hue-${hue}-vivid)` : "var(--c-accent)";
}

export function hueSoftVar(hue?: Hue): string {
  return hue ? `var(--c-hue-${hue}-soft)` : "var(--c-accent-soft)";
}

/**
 * Concrete hex values for canvas/WebGL code, where CSS variables cannot
 * resolve. Keep in sync with the --c-hue-* tokens in index.css.
 * `light` passes AA for text on the light bg; `lightVivid` is the decorative
 * tier used where contrast rules do not apply (pane borders, gradients).
 */
export const HUE_HEX: Record<
  Hue,
  { dark: string; light: string; lightVivid: string }
> = {
  green: { dark: "#34d399", light: "#048359", lightVivid: "#059669" },
  sky: { dark: "#38bdf8", light: "#0076c5", lightVivid: "#0284c7" },
  violet: { dark: "#a78bfa", light: "#8747f2", lightVivid: "#7c3aed" },
  rose: { dark: "#fb7185", light: "#dd1a4c", lightVivid: "#e11d48" },
  amber: { dark: "#fbbf24", light: "#b75807", lightVivid: "#d97706" },
};
