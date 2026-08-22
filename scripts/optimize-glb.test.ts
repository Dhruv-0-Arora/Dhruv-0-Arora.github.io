import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { countTriangles, optimizeGlb } from "./optimize-glb.ts";

/** A grid of quads: enough duplicated vertices for welding to matter. */
function gridMesh(doc: Document, name: string, n: number, material: string) {
  const buffer = doc.getRoot().listBuffers()[0] ?? doc.createBuffer();
  const positions: number[] = [];
  const normals: number[] = [];
  for (let x = 0; x < n; x++) {
    for (let z = 0; z < n; z++) {
      const quad = [
        [x, 0, z],
        [x + 1, 0, z],
        [x + 1, 0, z + 1],
        [x, 0, z],
        [x + 1, 0, z + 1],
        [x, 0, z + 1],
      ];
      for (const p of quad) {
        positions.push(...p);
        normals.push(0, 1, 0);
      }
    }
  }
  const mat =
    doc
      .getRoot()
      .listMaterials()
      .find((m) => m.getName() === material) ?? doc.createMaterial(material);
  const prim = doc
    .createPrimitive()
    .setMaterial(mat)
    .setAttribute(
      "POSITION",
      doc
        .createAccessor()
        .setArray(new Float32Array(positions))
        .setType("VEC3")
        .setBuffer(buffer),
    )
    .setAttribute(
      "NORMAL",
      doc
        .createAccessor()
        .setArray(new Float32Array(normals))
        .setType("VEC3")
        .setBuffer(buffer),
    );
  return doc.createMesh(name).addPrimitive(prim);
}

/** Mimics a Blender export: several named parts, two materials, a collider. */
function worldDocument(n: number): Document {
  const doc = new Document();
  const scene = doc.createScene("Scene");
  const parts = [
    ["shared.plinth.base", "tok.surface"],
    ["shared.plinth.cap", "tok.surface"],
    ["shared.plinth.trim", "tok.accent"],
    ["col.ground", "tok.bg"],
  ] as const;
  parts.forEach(([name, material], i) => {
    const node = doc
      .createNode(name)
      .setMesh(gridMesh(doc, name, n, material))
      .setTranslation([0, i, 0]);
    scene.addChild(node);
  });
  return doc;
}

async function readOptimized(path: string): Promise<Document> {
  await MeshoptDecoder.ready;
  const reader = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
  return reader.read(path);
}

describe("countTriangles", () => {
  it("counts every rendered instance, not unique meshes", () => {
    const doc = new Document();
    const scene = doc.createScene("Scene");
    const mesh = gridMesh(doc, "m", 2, "tok.text");
    scene.addChild(doc.createNode("a").setMesh(mesh));
    scene.addChild(doc.createNode("b").setMesh(mesh));
    expect(countTriangles(doc)).toBe(2 * 2 * 2 * 2);
  });
});

describe("optimizeGlb", () => {
  let dir = "";
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "world-opt-"));
  });
  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("shrinks a raw glb without changing its triangle count", async () => {
    const input = join(dir, "raw.glb");
    const output = join(dir, "opt.glb");
    const raw = worldDocument(16);
    await new NodeIO().write(input, raw);
    const rawBytes = (await stat(input)).size;
    const expectedTris = countTriangles(raw);
    expect(expectedTris).toBe(4 * 16 * 16 * 2);

    const stats = await optimizeGlb(input, output);
    expect(stats.triangles).toBe(expectedTris);
    expect(stats.bytes).toBeLessThan(rawBytes / 3);
    expect(stats.materials).toEqual(["tok.accent", "tok.bg", "tok.surface"]);
  });

  it("joins parts per material but keeps colliders addressable by name", async () => {
    const input = join(dir, "raw2.glb");
    const output = join(dir, "opt2.glb");
    await new NodeIO().write(input, worldDocument(4));
    const stats = await optimizeGlb(input, output);

    const doc = await readOptimized(output);
    const names = doc
      .getRoot()
      .listNodes()
      .map((n) => n.getName());
    expect(names).toContain("col.ground");
    expect(names).not.toContain("shared.plinth.base");
    // tok.surface parts merged into one mesh, tok.accent one, col.ground one.
    expect(stats.meshes).toBe(3);
    expect(countTriangles(doc)).toBe(4 * 4 * 4 * 2);
  });
});
