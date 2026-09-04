/**
 * Builds the shipped world from `assets/blender/world.blend`.
 *
 *   bun run world:build              # Blender -> optimize -> public/world/
 *   bun run world:build -- --from DIR   # skip Blender, optimize an existing export
 *
 * Runs under Node (not bun): gltf-transform's image helpers resolve to a CJS
 * entry under bun that eagerly requires the native `sharp` module, which
 * this pipeline never needs. Blender is resolved from $BLENDER, then PATH.
 * Vercel never runs this; the outputs in `public/world/` are committed.
 * Exits non-zero on lint failure, invalid meta, or any budget breach.
 */
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { DISTRICTS } from "../src/simulator/world/contract.ts";
import { parseWorldMeta } from "../src/simulator/world/meta.ts";
import { type GlbStats, optimizeGlb } from "./optimize-glb.ts";
import { checkBudgets, type WorldStats } from "./world-budgets.ts";

const ROOT = resolve(import.meta.dirname, "..");
const BLEND = join(ROOT, "assets/blender/world.blend");
const EXPORTER = join(ROOT, "assets/blender/scripts/export_world.py");
const OUT = join(ROOT, "public/world");

function runBlender(outDir: string): void {
  const blender = process.env.BLENDER ?? "blender";
  const result = spawnSync(
    blender,
    [
      "--background",
      "--python-exit-code",
      "1",
      BLEND,
      "--python",
      EXPORTER,
      "--",
      "--out",
      outDir,
    ],
    { stdio: "inherit" },
  );
  if (result.error) {
    throw new Error(`could not run '${blender}': ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Blender export failed with status ${result.status}`);
  }
}

function row(name: string, s: GlbStats): string {
  return `  ${name.padEnd(12)} ${(s.bytes / 1000).toFixed(0).padStart(6)}KB ${String(s.triangles).padStart(8)} tris ${String(s.meshes).padStart(4)} meshes`;
}

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: { from: { type: "string" } },
    allowPositionals: false,
  });

  const exportDir = values.from
    ? resolve(values.from)
    : await mkdtemp(join(tmpdir(), "world-export-"));
  try {
    if (!values.from) runBlender(exportDir);

    const meta = parseWorldMeta(
      JSON.parse(await readFile(join(exportDir, "meta.json"), "utf8")),
    );

    await mkdir(OUT, { recursive: true });
    const stats = {} as WorldStats;
    for (const district of DISTRICTS) {
      stats[district] = await optimizeGlb(
        join(exportDir, `${district}.glb`),
        join(OUT, `${district}.glb`),
      );
    }
    await copyFile(join(exportDir, "meta.json"), join(OUT, "meta.json"));

    const report = checkBudgets(stats);
    console.log("world:");
    for (const district of DISTRICTS) {
      console.log(row(district, stats[district]));
    }
    console.log(
      `  total        ${(report.totalBytes / 1000).toFixed(0).padStart(6)}KB ${String(report.totalTriangles).padStart(8)} tris`,
    );
    console.log(
      `  meta         ${meta.rail.points.length} rail points, ${meta.looks.length} looks, ${meta.zones.length} zones, ${meta.routes.length} routes, ${meta.colliders.length} colliders`,
    );
    for (const w of report.warnings) console.warn(`  WARN ${w}`);
    for (const e of report.errors) console.error(`  ERROR ${e}`);
    return report.errors.length === 0 ? 0 : 1;
  } finally {
    if (!values.from) await rm(exportDir, { recursive: true, force: true });
  }
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
