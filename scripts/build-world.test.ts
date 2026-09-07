/**
 * End-to-end pipeline test: Blender fixture -> export_world.py -> optimize
 * -> meta validation -> budgets. Skipped when Blender is not on PATH (or
 * $BLENDER), so `bun run test` stays green on machines without it.
 */
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DISTRICTS } from "../src/simulator/world/contract.ts";
import { parseWorldMeta } from "../src/simulator/world/meta.ts";
import { optimizeGlb } from "./optimize-glb.ts";
import { checkBudgets, type WorldStats } from "./world-budgets.ts";

const ROOT = resolve(import.meta.dirname, "..");
const SCRIPTS = join(ROOT, "assets/blender/scripts");
const BLENDER = process.env.BLENDER ?? "blender";

function blender(args: string[]) {
  return spawnSync(
    BLENDER,
    ["--background", "--python-exit-code", "1", ...args],
    {
      encoding: "utf8",
      timeout: 120_000,
    },
  );
}

const hasBlender = (() => {
  const probe = spawnSync(BLENDER, ["--version"], { encoding: "utf8" });
  return !probe.error && probe.status === 0;
})();

describe.skipIf(!hasBlender)("world pipeline (Blender)", () => {
  let dir = "";
  let fixture = "";

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "world-e2e-"));
    fixture = join(dir, "fixture.blend");
    const made = blender([
      "--python",
      join(SCRIPTS, "make_fixture.py"),
      "--",
      "--out",
      fixture,
    ]);
    expect(made.status, made.stderr).toBe(0);
  }, 180_000);

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("exports, optimizes and validates a contract-valid scene", async () => {
    const out = join(dir, "export");
    const exported = blender([
      fixture,
      "--python",
      join(SCRIPTS, "export_world.py"),
      "--",
      "--out",
      out,
    ]);
    expect(exported.status, exported.stdout + exported.stderr).toBe(0);
    expect(exported.stdout).toContain("lint: OK");

    const meta = parseWorldMeta(
      JSON.parse(await readFile(join(out, "meta.json"), "utf8")),
    );
    expect(meta.rail.points.length).toBeGreaterThan(10);
    expect(meta.looks.map((l) => l.t)).toEqual([0, 1]);
    expect(meta.colliders.map((c) => c.name)).toEqual(["col.box.plinth"]);
    expect(meta.routes).toEqual([]);
    expect(meta.lakes.map((l) => l.slug)).toEqual(["tarn"]);
    expect(meta.lakes[0].radius).toBeCloseTo(8, 0);
    expect(meta.lakes[0].center.map(Math.round)).toEqual([180, 3, -40]);
    expect(meta.trails.map((t) => [t.slug, t.points.length])).toEqual([
      ["tarn", 3],
    ]);
    // Bounds are the drivable ground, not the tallest mesh: the fixture's
    // col.ground is a 400 m plane at z = 0, which in Y-up is y = 0.
    expect(meta.bounds.min.map(Math.round)).toEqual([-200, 0, -200]);
    expect(meta.bounds.max.map(Math.round)).toEqual([200, 0, 200]);

    const stats = {} as WorldStats;
    for (const district of DISTRICTS) {
      stats[district] = await optimizeGlb(
        join(out, `${district}.glb`),
        join(out, `${district}.opt.glb`),
      );
      expect(stats[district].triangles).toBeGreaterThan(0);
    }
    expect(stats.shared.materials).toContain("tok.bg");
    expect(stats.terminal.materials).toContain("ramp.importance.3");

    const report = checkBudgets(stats);
    expect(report.errors).toEqual([]);
  }, 180_000);

  it("refuses to export a scene that fails lint", async () => {
    const out = join(dir, "export-bad");
    const bad = blender([
      fixture,
      "--python-expr",
      "import bpy; bpy.data.materials['tok.accent'].name = 'Material'",
      "--python",
      join(SCRIPTS, "export_world.py"),
      "--",
      "--out",
      out,
    ]);
    expect(bad.status).not.toBe(0);
    expect(bad.stdout).toContain("non-contract material 'Material'");
    const lint = JSON.parse(await readFile(join(out, "lint.json"), "utf8"));
    expect(lint.ok).toBe(false);
  }, 180_000);
});
