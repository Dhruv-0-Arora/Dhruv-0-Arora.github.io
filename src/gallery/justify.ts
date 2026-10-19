/**
 * Breaks a sequence of photos into justified rows: every row spans the
 * full width at one shared height, so the grid is a clean rectangle with
 * no crops and keeps reading order.
 *
 * A row of photos with aspect ratios a1..ak at width W is W / sum(a) tall
 * (gaps aside), so a row's height is set by its aspect sum alone. `target`
 * is the aspect sum of an ideal row; the breaks minimise the squared log
 * distance of every row's sum from it, the last row included, by dynamic
 * programming over break points.
 *
 * Returns the rows as arrays of indices into `aspects`.
 */
export function justifyRows(
  aspects: readonly number[],
  target: number,
  maxPerRow = 5,
): number[][] {
  const n = aspects.length;
  if (n === 0) return [];
  // best[i]: least cost to lay out the first i photos; from[i]: where the
  // last row of that layout starts.
  const best = new Array<number>(n + 1).fill(Number.POSITIVE_INFINITY);
  const from = new Array<number>(n + 1).fill(0);
  best[0] = 0;
  for (let end = 1; end <= n; end++) {
    let sum = 0;
    for (let start = end - 1; start >= 0 && end - start <= maxPerRow; start--) {
      sum += aspects[start];
      const cost = best[start] + Math.log(sum / target) ** 2;
      if (cost < best[end]) {
        best[end] = cost;
        from[end] = start;
      }
    }
  }
  const rows: number[][] = [];
  for (let end = n; end > 0; end = from[end]) {
    const row: number[] = [];
    for (let i = from[end]; i < end; i++) row.push(i);
    rows.unshift(row);
  }
  return rows;
}
