import {
  contract,
  DISTRICTS,
  type District,
} from "../src/simulator/world/contract.ts";
import type { GlbStats } from "./optimize-glb.ts";

export type WorldStats = Record<District, GlbStats>;

export interface BudgetReport {
  errors: string[];
  warnings: string[];
  totalBytes: number;
  totalTriangles: number;
}

const kb = (n: number) => `${(n / 1000).toFixed(0)}KB`;

/**
 * Enforces the wire and triangle budgets against the optimized glbs.
 * Per-district caps and the hard total are errors; the soft total is a
 * warning. Budgets default to the contract and are injectable for tests.
 */
export function checkBudgets(
  stats: WorldStats,
  budgets = contract.budgets,
): BudgetReport {
  const { bytes, tris } = budgets;
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalBytes = 0;
  let totalTriangles = 0;

  for (const district of DISTRICTS) {
    const s = stats[district];
    totalBytes += s.bytes;
    totalTriangles += s.triangles;
    const byteCap = bytes.districts[district];
    if (s.bytes > byteCap) {
      errors.push(`${district}.glb is ${kb(s.bytes)}, budget ${kb(byteCap)}`);
    }
    const triCap = tris.districts[district];
    if (s.triangles > triCap) {
      errors.push(`${district}.glb has ${s.triangles} tris, budget ${triCap}`);
    }
    if (s.triangles === 0) {
      errors.push(`${district}.glb has no triangles`);
    }
  }

  if (totalBytes > bytes.totalHard) {
    errors.push(
      `world is ${kb(totalBytes)}, hard ceiling ${kb(bytes.totalHard)}`,
    );
  } else if (totalBytes > bytes.totalSoft) {
    warnings.push(
      `world is ${kb(totalBytes)}, over the soft budget ${kb(bytes.totalSoft)}`,
    );
  }
  if (totalTriangles > tris.authoredTotal) {
    errors.push(
      `world has ${totalTriangles} authored tris, budget ${tris.authoredTotal}`,
    );
  }

  return { errors, warnings, totalBytes, totalTriangles };
}
