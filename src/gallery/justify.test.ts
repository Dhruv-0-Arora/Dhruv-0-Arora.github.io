import { describe, expect, it } from "vitest";
import { justifyRows } from "./justify.ts";

const L = 1.5;
const P = 2 / 3;

describe("justifyRows", () => {
  it("keeps every photo once, in order", () => {
    const aspects = [L, L, P, L, P, P, L, L, L, P, L, L, L];
    const rows = justifyRows(aspects, 3.6);
    expect(rows.flat()).toEqual(aspects.map((_, i) => i));
  });

  it("puts one landscape per row when the target is one landscape", () => {
    expect(justifyRows([L, L, L], L)).toEqual([[0], [1], [2]]);
  });

  it("pairs portraits on a narrow screen rather than leaving one alone", () => {
    expect(justifyRows([P, P, L], 1.5)).toEqual([[0, 1], [2]]);
  });

  it("does not leave a stub last row when the rest can absorb it", () => {
    const rows = justifyRows([L, L, L, L, L], 3);
    for (const row of rows) expect(row.length).toBeGreaterThanOrEqual(2);
  });

  it("respects the row cap", () => {
    const rows = justifyRows(new Array(12).fill(0.2), 10, 4);
    for (const row of rows) expect(row.length).toBeLessThanOrEqual(4);
  });

  it("handles no photos", () => {
    expect(justifyRows([], 3)).toEqual([]);
  });
});
