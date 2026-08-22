import { stat } from "node:fs/promises";
import { type Document, Logger, type Mesh, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  flatten,
  join,
  meshopt,
  prune,
  weld,
} from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

export interface GlbStats {
  bytes: number;
  triangles: number;
  meshes: number;
  materials: string[];
}

/** Node names the runtime addresses directly; never merged or renamed. */
const KEEP_NAMED = /^col\./;

const MODE_TRIANGLES = 4;
const MODE_TRIANGLE_STRIP = 5;
const MODE_TRIANGLE_FAN = 6;

let io: NodeIO | null = null;

async function getIO(): Promise<NodeIO> {
  if (io) return io;
  await MeshoptEncoder.ready;
  io = new NodeIO()
    .setLogger(new Logger(Logger.Verbosity.WARN))
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
  return io;
}

function meshTriangles(mesh: Mesh): number {
  let total = 0;
  for (const prim of mesh.listPrimitives()) {
    const indices = prim.getIndices();
    const count = indices
      ? indices.getCount()
      : (prim.getAttribute("POSITION")?.getCount() ?? 0);
    const mode = prim.getMode();
    if (mode === MODE_TRIANGLES) total += Math.floor(count / 3);
    else if (mode === MODE_TRIANGLE_STRIP || mode === MODE_TRIANGLE_FAN) {
      total += Math.max(0, count - 2);
    }
  }
  return total;
}

/** Rendered triangles: every node instance in every scene, not unique meshes. */
export function countTriangles(document: Document): number {
  let total = 0;
  for (const scene of document.getRoot().listScenes()) {
    scene.traverse((node) => {
      const mesh = node.getMesh();
      if (mesh) total += meshTriangles(mesh);
    });
  }
  return total;
}

/**
 * Raw Blender glb -> shipped glb. Material names are the theming contract, so
 * dedup must never merge same-looking materials. Flat-color low-poly geometry compresses
 * well with meshopt alone; textures are forbidden by the contract so no
 * image work happens here.
 *
 * Every node except `col.*` is stripped of its name and joined per material
 * to cut draw calls: the runtime addresses the world through `meta.json`
 * and material names, never through part names. Colliders stay separate so
 * the runtime can raycast against them by name.
 */
export async function optimizeGlb(
  input: string,
  output: string,
): Promise<GlbStats> {
  const reader = await getIO();
  const document = await reader.read(input);
  const before = countTriangles(document);

  for (const node of document.getRoot().listNodes()) {
    if (!KEEP_NAMED.test(node.getName())) {
      node.setName("");
      node.getMesh()?.setName("");
    }
  }

  await document.transform(
    dedup({ keepUniqueNames: true }),
    flatten(),
    join({ keepNamed: true }),
    weld(),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );

  const triangles = countTriangles(document);
  if (triangles !== before) {
    throw new Error(
      `${input}: optimization changed triangle count ${before} -> ${triangles}`,
    );
  }

  await reader.write(output, document);
  const { size } = await stat(output);
  return {
    bytes: size,
    triangles,
    meshes: document.getRoot().listMeshes().length,
    materials: document
      .getRoot()
      .listMaterials()
      .map((m) => m.getName())
      .sort(),
  };
}
