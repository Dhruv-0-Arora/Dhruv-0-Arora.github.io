import { describe, expect, it } from "vitest";
import { contract, DISTRICTS } from "../src/simulator/world/contract.ts";
import type { GlbStats } from "./optimize-glb.ts";
import { checkBudgets, type WorldStats } from "./world-budgets.ts";

function uniform(bytes: number, triangles: number): WorldStats {
  const stats = {} as WorldStats;
  for (const d of DISTRICTS) {
    stats[d] = { bytes, triangles, meshes: 1, materials: ["tok.text"] };
  }
  return stats;
}

function withDistrict(
  base: WorldStats,
  district: keyof WorldStats,
  patch: Partial<GlbStats>,
): WorldStats {
  return { ...base, [district]: { ...base[district], ...patch } };
}

describe("checkBudgets", () => {
  it("passes a lean world", () => {
    const report = checkBudgets(uniform(50_000, 1_000));
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.totalBytes).toBe(250_000);
    expect(report.totalTriangles).toBe(5_000);
  });

  it("fails a district over its wire budget", () => {
    const cap = contract.budgets.bytes.districts.redacted;
    const report = checkBudgets(
      withDistrict(uniform(1, 10), "redacted", { bytes: cap + 1 }),
    );
    expect(report.errors).toEqual([
      `redacted.glb is ${((cap + 1) / 1000).toFixed(0)}KB, budget ${(cap / 1000).toFixed(0)}KB`,
    ]);
  });

  it("fails a district over its triangle budget and an empty district", () => {
    const cap = contract.budgets.tris.districts.terminal;
    let stats = withDistrict(uniform(1, 10), "terminal", {
      triangles: cap + 1,
    });
    stats = withDistrict(stats, "shared", { triangles: 0 });
    const report = checkBudgets(stats);
    expect(report.errors).toContain(
      `terminal.glb has ${cap + 1} tris, budget ${cap}`,
    );
    expect(report.errors).toContain("shared.glb has no triangles");
  });

  it("warns between the soft and hard totals, fails above the hard total", () => {
    const budgets = {
      tris: contract.budgets.tris,
      bytes: {
        districts: {
          shared: 1_000,
          terminal: 1_000,
          evidence: 1_000,
          fabrication: 1_000,
          redacted: 1_000,
        },
        totalSoft: 3_000,
        totalHard: 4_000,
      },
    };
    const soft = checkBudgets(uniform(700, 10), budgets);
    expect(soft.errors).toEqual([]);
    expect(soft.warnings).toEqual(["world is 4KB, over the soft budget 3KB"]);

    const hard = checkBudgets(uniform(900, 10), budgets);
    expect(hard.warnings).toEqual([]);
    expect(hard.errors).toEqual(["world is 5KB, hard ceiling 4KB"]);
  });

  it("fails when authored triangles exceed the total budget", () => {
    const budgets = {
      ...contract.budgets,
      tris: { ...contract.budgets.tris, authoredTotal: 4_000 },
    };
    const report = checkBudgets(uniform(1, 1_000), budgets);
    expect(report.errors).toEqual([
      "world has 5000 authored tris, budget 4000",
    ]);
  });
});
