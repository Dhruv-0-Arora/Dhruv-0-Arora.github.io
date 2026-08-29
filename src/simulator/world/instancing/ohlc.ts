/**
 * Deterministic OHLC series for the candlestick towers. Not market data:
 * a seeded walk shaped by a few known moments, so kerms reads as many small
 * wins and IMC Prosperity 4 shows its big round and its losses.
 */

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface SeriesShape {
  seed: number;
  count: number;
  /** Average per-candle move relative to the start level. */
  volatility: number;
  /** Probability a candle closes up. */
  upBias: number;
  /** Index -> forced relative move, for the moments worth showing. */
  events?: Record<number, number>;
}

export function ohlcSeries(shape: SeriesShape): Candle[] {
  const rand = rng(shape.seed);
  const candles: Candle[] = [];
  let level = 1;
  for (let i = 0; i < shape.count; i++) {
    const forced = shape.events?.[i];
    const up = forced !== undefined ? forced > 0 : rand() < shape.upBias;
    const magnitude =
      forced !== undefined
        ? Math.abs(forced)
        : shape.volatility * (0.3 + rand() * 1.4);
    const open = level;
    const close = Math.max(0.05, open + (up ? magnitude : -magnitude));
    const wick = shape.volatility * rand() * 0.6;
    candles.push({
      open,
      close,
      high: Math.max(open, close) + wick,
      low: Math.max(0.02, Math.min(open, close) - wick),
    });
    level = close;
  }
  return candles;
}

/** Many small wins, occasional small losses: quarter-Kelly on sharp books. */
export const KERMS_SHAPE: SeriesShape = {
  seed: 31,
  count: 40,
  volatility: 0.03,
  upBias: 0.72,
};

/** Rounds 1 to 4 of Prosperity: a modest start, a dip, the big round, the loss. */
export const IMC_SHAPE: SeriesShape = {
  seed: 4,
  count: 40,
  volatility: 0.06,
  upBias: 0.5,
  events: { 8: 0.12, 16: -0.09, 26: 0.9, 27: 0.35, 34: -0.5, 35: -0.25 },
};
