/**
 * Turns a stream of wheel events into discrete hops between stations.
 *
 * A trackpad flick arrives as a burst of large deltas followed by a long
 * momentum tail that decays over a second or more; a mouse wheel arrives
 * as one large delta per notch. Either way the visitor meant "next", once.
 * So the first delta past the threshold fires a hop, and the gesture is
 * then latched: nothing more fires until the wheel goes quiet, or until a
 * clear new flick shows up inside the tail (the deltas had decayed and
 * jump back up), which is a deliberate second gesture.
 */

export const WHEEL = {
  /** Accumulated travel that fires a hop, px. */
  threshold: 60,
  /** Wheel silence that ends a gesture, ms. */
  gestureEndMs: 220,
  /** One line of a line-mode wheel (Firefox, some mice), px. */
  lineHeight: 16,
  /** A tail counts as decayed once its trough is this fraction of its peak. */
  decayedBelow: 0.5,
  /** A new flick inside a tail jumps at least this many times the trough. */
  rearmRatio: 2,
  /** ...and is at least this large on its own, px, so noise never rearms. */
  rearmMin: 20,
} as const;

export const DOM_DELTA_LINE = 1;
export const DOM_DELTA_PAGE = 2;

/** A wheel delta in pixels, whatever unit the device reported it in. */
export function normaliseDelta(
  delta: number,
  deltaMode: number,
  pageHeight: number,
): number {
  if (deltaMode === DOM_DELTA_LINE) return delta * WHEEL.lineHeight;
  if (deltaMode === DOM_DELTA_PAGE) return delta * pageHeight;
  return delta;
}

export class WheelIntent {
  /** Signed travel accumulated toward the threshold in this gesture. */
  private acc = 0;
  /** Time of the previous event; -Infinity before the first. */
  private last = Number.NEGATIVE_INFINITY;
  /** A hop has fired and the rest of the gesture is being swallowed. */
  private latched = false;
  /** Direction of the hop that latched. */
  private latchedSign = 0;
  /** Largest |delta| since the latch, and the smallest since that peak. */
  private peak = 0;
  private trough = 0;

  /**
   * Feeds one wheel event. Returns the hop it asks for: +1 for next
   * (wheel down), -1 for previous, 0 for none.
   */
  push(
    deltaY: number,
    deltaMode: number,
    time: number,
    pageHeight = 800,
  ): 1 | -1 | 0 {
    const d = normaliseDelta(deltaY, deltaMode, pageHeight);
    if (time - this.last > WHEEL.gestureEndMs) this.reset();
    this.last = time;
    if (d === 0) return 0;
    const mag = Math.abs(d);
    const sign = Math.sign(d);

    if (this.latched) {
      const reversed = sign !== this.latchedSign && mag >= WHEEL.rearmMin;
      const decayed = this.trough <= this.peak * WHEEL.decayedBelow;
      const rising =
        decayed &&
        mag >= this.trough * WHEEL.rearmRatio &&
        mag >= WHEEL.rearmMin;
      if (!reversed && !rising) {
        if (mag > this.peak) {
          this.peak = mag;
          this.trough = mag;
        } else if (mag < this.trough) {
          this.trough = mag;
        }
        return 0;
      }
      // A deliberate new flick: start a fresh gesture from this delta.
      this.latched = false;
      this.acc = 0;
    }

    // A change of direction before anything fired starts the count over.
    if (this.acc !== 0 && Math.sign(this.acc) !== sign) this.acc = 0;
    this.acc += d;
    if (Math.abs(this.acc) < WHEEL.threshold) return 0;

    this.latched = true;
    this.latchedSign = sign;
    this.peak = mag;
    this.trough = mag;
    this.acc = 0;
    return sign > 0 ? 1 : -1;
  }

  /** Forget the gesture in progress. */
  reset(): void {
    this.acc = 0;
    this.latched = false;
    this.latchedSign = 0;
    this.peak = 0;
    this.trough = 0;
  }
}
