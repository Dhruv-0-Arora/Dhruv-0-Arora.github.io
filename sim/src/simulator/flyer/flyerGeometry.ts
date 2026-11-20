import * as THREE from "three";

/**
 * Pure geometry for the 1903 Flyer: cambered fabric surfaces, twisted
 * propeller blades and the muslin rib texture. Everything is in metres in
 * the model frame (nose +z, span along x, up y) and unit tested.
 */

/** Chordwise camber profile: zero at both edges, `camber` high at `peakAt`. */
export function camberAt(t: number, camber: number, peakAt: number): number {
  const u = t < peakAt ? (peakAt - t) / peakAt : (t - peakAt) / (1 - peakAt);
  return camber * (1 - u * u);
}

export interface SurfaceSpec {
  span: number;
  chord: number;
  camber: number;
  /** Chord fraction where the camber peaks (the Flyer's was near 1/3). */
  peakAt: number;
  /** Tip droop in metres (anhedral); the tips sit this much lower. */
  droop: number;
  /** Trailing-edge rounding at the tips, in metres of span. */
  tipRound: number;
  /** Rib spacing in metres; drives the texture's u coordinate. */
  ribPitch: number;
  segmentsSpan?: number;
  segmentsChord?: number;
}

/**
 * A fabric surface: a grid across the span with the camber along the chord,
 * the tips drooping and the trailing corners rounded. Leading edge at
 * +chord/2, trailing edge at -chord/2. The u texture coordinate is metres
 * along the span divided by 12 ribs of pitch, so ribs land on true spacing
 * whatever the surface size; v runs leading to trailing edge.
 */
export function surfaceGeometry(spec: SurfaceSpec): THREE.BufferGeometry {
  const nx = spec.segmentsSpan ?? Math.max(8, Math.round(spec.span * 4));
  const nz = spec.segmentsChord ?? 10;
  const half = spec.span / 2;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= nx; i++) {
    const x = -half + (spec.span * i) / nx;
    const ax = Math.abs(x);
    const le = spec.chord / 2;
    let te = -spec.chord / 2;
    if (spec.tipRound > 0 && ax > half - spec.tipRound) {
      const u = Math.min(1, (ax - (half - spec.tipRound)) / spec.tipRound);
      te += spec.chord * 0.4 * (1 - Math.sqrt(Math.max(0, 1 - u * u)));
    }
    const droop = -spec.droop * (ax / half) ** 2;
    for (let j = 0; j <= nz; j++) {
      const t = j / nz;
      positions.push(
        x,
        camberAt(t, spec.camber, spec.peakAt) + droop,
        le + (te - le) * t,
      );
      uvs.push(x / (spec.ribPitch * 12) + 0.5, t);
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const a = i * (nz + 1) + j;
      const b = a + nz + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export interface BladeSpec {
  /** Blade radius from the hub axis, metres. */
  radius: number;
  rootRadius: number;
  /** Geometric pitch in metres per revolution; sets the twist. */
  pitch: number;
  /** Widest chord, metres. */
  chord: number;
  segments?: number;
}

/** Blade chord along the radius: narrow at the root, widest past the middle. */
export function bladeChord(u: number, chord: number): number {
  const s = Math.sin(Math.PI * u ** 0.75);
  return chord * (0.35 + 0.65 * s);
}

/** Blade pitch angle at radius r for a screw of the given pitch. */
export function bladeTwist(r: number, pitch: number): number {
  return Math.atan(pitch / (2 * Math.PI * r));
}

/**
 * One twisted propeller blade along +y from the hub, spinning about z. A
 * thin plate whose chord line rotates with the local pitch angle, which is
 * what a laminated spruce blade looks like from a few metres away.
 */
export function bladeGeometry(spec: BladeSpec): THREE.BufferGeometry {
  const n = spec.segments ?? 14;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let k = 0; k <= n; k++) {
    const u = k / n;
    const r = spec.rootRadius + (spec.radius - spec.rootRadius) * u;
    const c = bladeChord(u, spec.chord);
    const a = bladeTwist(r, spec.pitch);
    // Chord line in the x-z plane rotated by the pitch angle about the
    // radial (y) axis; z is the thrust axis.
    const dx = (Math.cos(a) * c) / 2;
    const dz = (Math.sin(a) * c) / 2;
    positions.push(-dx, r, -dz, dx, r, dz);
  }
  for (let k = 0; k < n; k++) {
    const a = k * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Paints the muslin: a faint weave and a darker shadow line at every rib
 * with a lighter ridge beside it, on white so the material colour tints it.
 * Width covers 12 rib pitches to match `surfaceGeometry`'s u mapping.
 */
export function paintFabric(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed = 7,
): void {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  // Weave: a deterministic speckle so the surface is not a flat colour.
  const img = ctx.getImageData(0, 0, width, height);
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 255 - Math.floor(rand() * 9);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  // Ribs: the fabric pockets shade on one side of each rib.
  const ribs = 12;
  const pitch = width / ribs;
  for (let k = 0; k <= ribs; k++) {
    const x = Math.round(k * pitch);
    const grad = ctx.createLinearGradient(x - pitch * 0.35, 0, x, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.13)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - pitch * 0.35, 0, pitch * 0.35, height);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x - 1, 0, 2, height);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(x + 1, 0, 2, height);
  }
  // Leading-edge pocket: slightly darker band where the spar is sewn in.
  const edge = ctx.createLinearGradient(0, 0, 0, height * 0.08);
  edge.addColorStop(0, "rgba(0,0,0,0.16)");
  edge.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height * 0.08);
}
