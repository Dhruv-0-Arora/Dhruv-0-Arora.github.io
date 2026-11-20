import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { scatterTrees } from "./Conifers.tsx";

/** A gently rolling square of forest floor, `n` x `n` quads, 2 tris each. */
function floor(n: number, size: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(size, size, n, n);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, 2 * Math.sin(pos.getX(i) / 50) * Math.cos(pos.getZ(i) / 60));
  }
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
}

describe("scatterTrees", () => {
  it("honours the veto and is deterministic", () => {
    const root = new THREE.Group();
    root.add(floor(60, 400));
    const veto = (x: number) => x < 0;
    const a = scatterTrees(root, veto);
    const b = scatterTrees(root, veto);
    expect(a.length).toBeGreaterThan(100);
    expect(a).toEqual(b);
    expect(a.every((t) => t.x >= 0)).toBe(true);
  });

  it("thins evenly past the cap instead of cutting off", () => {
    const root = new THREE.Group();
    root.add(floor(60, 400));
    const all = scatterTrees(root, undefined, Number.POSITIVE_INFINITY);
    const capped = scatterTrees(root, undefined, Math.floor(all.length / 4));
    expect(capped.length).toBe(Math.floor(all.length / 4));
    // Both halves of the square keep trees, in about the same share.
    const share = (trees: typeof all) =>
      trees.filter((t) => t.z > 0).length / trees.length;
    expect(Math.abs(share(capped) - share(all))).toBeLessThan(0.05);
  });

  it("scatters a 200k-triangle range in about 300 ms", () => {
    const root = new THREE.Group();
    root.add(floor(316, 900));
    const t0 = performance.now();
    scatterTrees(root, (x, z) => x * x + z * z < 70 * 70);
    expect(performance.now() - t0).toBeLessThan(600);
  });
});
