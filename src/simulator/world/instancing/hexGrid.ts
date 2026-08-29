/**
 * Pointy-top hex tiling and a deterministic risk field for the Cypher map.
 * Pure so it can be tested and so the layout is identical for every visitor.
 */

export interface HexCell {
  x: number;
  z: number;
  /** Risk in [0, 1]: 0 quiet, 1 active. */
  risk: number;
  /** Confidence in [0, 1]: low-confidence cells render faded. */
  confidence: number;
}

/** Cells covering a `size` x `size` square centered at the origin. */
export function hexLayout(size: number, radius: number): HexCell[] {
  const w = Math.sqrt(3) * radius;
  const h = radius * 1.5;
  const cols = Math.ceil(size / w) + 1;
  const rows = Math.ceil(size / h) + 1;
  const cells: HexCell[] = [];
  const half = size / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -half + c * w + (r % 2 ? w / 2 : 0);
      const z = -half + r * h;
      if (Math.abs(x) > half - radius || Math.abs(z) > half - radius) continue;
      const risk = riskField(x, z, size);
      cells.push({ x, z, risk, confidence: confidenceField(x, z, size) });
    }
  }
  return cells;
}

function hash(x: number, y: number): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Value noise in [0, 1] at one frequency. */
function valueNoise(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const a = hash(x0, y0);
  const b = hash(x0 + 1, y0);
  const c = hash(x0, y0 + 1);
  const d = hash(x0 + 1, y0 + 1);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

/**
 * Mostly quiet with a few hot spots: two octaves of value noise pushed
 * through a curve so most of the map stays green.
 */
export function riskField(x: number, z: number, size: number): number {
  const u = (x / size) * 6 + 40;
  const v = (z / size) * 6 + 40;
  const n =
    valueNoise(u, v) * 0.65 + valueNoise(u * 2.3 + 7, v * 2.3 + 3) * 0.35;
  return Math.min(1, Math.max(0, (n - 0.35) / 0.55)) ** 1.8;
}

/** Corroboration: cells near a hot spot are well-sourced; the fringe is rumour. */
export function confidenceField(x: number, z: number, size: number): number {
  const u = (x / size) * 4 + 90;
  const v = (z / size) * 4 + 90;
  return 0.35 + 0.65 * valueNoise(u, v);
}
