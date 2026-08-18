import { featuredProjects } from "../../content/projects";

/** Number of panes in the showcase. */
export const N = featuredProjects.length;

/** Scroll segment width in progress space between adjacent pane centers. */
export const SEG = 1 / (N - 1);

/** Extra viewport-heights of scroll per transition. */
const VH_PER_TRANSITION = 115;

/** Total height of the scroll wrapper that drives the pinned stage. */
export const WRAPPER_HEIGHT = `${100 + (N - 1) * VH_PER_TRANSITION}svh`;

/*
 * Dwell windows, in units of d = smoothed - index.
 * A pane is fully parked for d in [-PARK_IN, PARK_OUT] (~50% of a segment,
 * asymmetric so panes arrive early and hold past their center).
 * Both must stay < 0.5 - the snap assist's round() plateau test relies on it.
 */
export const PARK_IN = 0.2;
export const PARK_OUT = 0.3;

/** Opacity-only ghost hold past d = 1 (5% -> 0), enabling 3-pane overlap frames. */
export const EXIT_LINGER = 0.2;

/* Diagonal trajectory offsets from the park position, in viewport fractions. */
export const ENTRY_DX = 0.2;
export const ENTRY_DY = -0.34;
export const EXIT_DX = -0.57;
export const EXIT_DY = 0.38;

/* Rotation magnitudes (radians) at entry/exit endpoints. */
export const ROT_Y = 0.87;
export const ROT_Z = 0.2;

export const SCALE_ENTRY = 0.28;
export const SCALE_EXIT = 0.2;
export const EXIT_MIN_OPACITY = 0.05;

/** Parallax group x offset as a fraction of viewport width. */
export const PARK_X = 0.16;

export const DAMP_LAMBDA = 5.5;

/* Snap assist. */
export const SNAP_IDLE_MS = 160;
export const SNAP_MS = 450;

export const easeInOutSine = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u);

/**
 * Dwell-aware shaping: d in [-1, 1] -> t in [-1, 1].
 * t = -1 entry start, t = 0 parked (flat plateau), t = +1 exit end.
 * The sine easing lives here so every downstream transform is a plain lerp.
 */
export function shapeD(d: number): number {
  if (d < -PARK_IN) return -1 + easeInOutSine((d + 1) / (1 - PARK_IN));
  if (d > PARK_OUT) return easeInOutSine((d - PARK_OUT) / (1 - PARK_OUT));
  return 0;
}

/** Progress value at which pane i sits centered on the stage. */
export function segmentCenter(i: number): number {
  return i / (N - 1);
}

const EPS = 1e-4;

/** Clamp to [0,1] and enforce strictly increasing values for interpolation. */
function monotonic(values: number[]): number[] {
  const out = values.map((v) => Math.min(1, Math.max(0, v)));
  for (let i = 1; i < out.length; i++) {
    out[i] = Math.max(out[i], out[i - 1] + EPS);
  }
  out[out.length - 1] = Math.min(out[out.length - 1], 1);
  for (let i = out.length - 2; i >= 0; i--) {
    out[i] = Math.min(out[i], out[i + 1] - EPS);
  }
  return out;
}

/**
 * Overlay/glow keyframes aligned to the dwell plateau: text slides in from
 * the left leading the pane's park, holds through the dwell, exits left.
 * The first pane is already visible at p = 0 and the last stays visible at
 * p = 1, so their outer keyframe outputs hold the "visible" value.
 */
export function fadeInputs(i: number): number[] {
  const c = segmentCenter(i);
  return monotonic([
    c - (PARK_IN + 0.35) * SEG,
    c - (PARK_IN + 0.05) * SEG,
    c + PARK_OUT * SEG,
    c + (PARK_OUT + 0.3) * SEG,
  ]);
}

export function fadeOutputs(i: number): number[] {
  return [i === 0 ? 1 : 0, 1, 1, i === N - 1 ? 1 : 0];
}

export function slideInputs(i: number): number[] {
  return fadeInputs(i);
}

const TEXT_SLIDE_PX = 28;

export function slideOutputs(i: number): number[] {
  return [i === 0 ? 0 : -TEXT_SLIDE_PX, 0, 0, i === N - 1 ? 0 : -TEXT_SLIDE_PX];
}

/**
 * Clamped piecewise-linear interpolation. Used to drive overlay styles
 * imperatively; motion's WAAPI scroll-timeline fast path mishandles our
 * boundary keyframes, so scroll-driven styles are written directly.
 */
export function interp(p: number, inputs: number[], outputs: number[]): number {
  if (p <= inputs[0]) return outputs[0];
  const last = inputs.length - 1;
  if (p >= inputs[last]) return outputs[last];
  let i = 1;
  while (inputs[i] < p) i++;
  const t = (p - inputs[i - 1]) / (inputs[i] - inputs[i - 1]);
  return outputs[i - 1] + t * (outputs[i] - outputs[i - 1]);
}
