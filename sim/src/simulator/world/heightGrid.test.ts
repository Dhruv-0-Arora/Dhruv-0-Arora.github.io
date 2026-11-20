import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { HeightGrid, heightGridFromObject } from "./heightGrid.ts";

describe("HeightGrid", () => {
  it("keeps the highest sample per cell and reads neighbours", () => {
    const g = new HeightGrid(36, 10, 100, 200);
    g.add(150, 20, 0);
    g.add(150, 35, 1);
    g.add(150, 5, -1);
    expect(g.heightAt(150, 0)).toBe(35);
    // The neighbouring cell reads the same peak; two rings away does not.
    expect(g.heightAt(160, 0)).toBe(35);
    expect(g.heightAt(190, 0)).toBe(0);
  });

  it("reports the inner height inside the plate and outside the ring", () => {
    const g = new HeightGrid(36, 10, 100, 200, 3);
    g.add(150, 50, 0);
    expect(g.heightAt(0, 0)).toBe(3);
    expect(g.heightAt(50, 50)).toBe(3);
    expect(g.heightAt(300, 0)).toBe(3);
  });

  it("samples a mesh in world space", () => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [150, 10, 0, -150, 40, 0, 0, 90, 150],
        3,
      ),
    );
    const mesh = new THREE.Mesh(geo);
    const root = new THREE.Group();
    root.position.y = 5;
    root.add(mesh);
    const g = heightGridFromObject(root, 100, 200, 36, 10);
    expect(g.heightAt(150, 0)).toBe(15);
    expect(g.heightAt(-150, 0)).toBe(45);
    expect(g.heightAt(0, 150)).toBe(95);
  });
});
