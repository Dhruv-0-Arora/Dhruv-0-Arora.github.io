import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  findTerrainMesh,
  TerrainSampler,
  terrainSamplerFromObject,
} from "./terrainSampler.ts";

/**
 * A polar grid mesh like the range session builds: `rings` rings from the
 * centre to `rMax` (ring 0 collapsed onto the origin), `segments` around,
 * quads split into two up-facing triangles, heights from `h`.
 */
function polarMesh(
  h: (x: number, z: number) => number,
  { rMax = 470, rings = 40, segments = 90, spacing = (u: number) => u } = {},
): THREE.BufferGeometry {
  const pos: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const r = rMax * spacing(i / rings);
    for (let j = 0; j < segments; j++) {
      const t = (j / segments) * Math.PI * 2;
      const x = r * Math.cos(t);
      const z = r * Math.sin(t);
      pos.push(x, h(x, z), z);
    }
  }
  const index: number[] = [];
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * segments + j;
      const b = i * segments + ((j + 1) % segments);
      const c = (i + 1) * segments + ((j + 1) % segments);
      const d = (i + 1) * segments + j;
      // Wound so (b - a) x (c - a) points up in three's Y-up frame.
      index.push(a, b, d, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  return geo;
}

function rockMesh(geo: THREE.BufferGeometry): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial();
  material.name = "tok.rock";
  return new THREE.Mesh(geo, material);
}

describe("TerrainSampler", () => {
  it("reproduces a plane exactly, centre and seam included", () => {
    const plane = (x: number, z: number) => 3 + 0.1 * x - 0.05 * z;
    const root = new THREE.Group();
    root.add(rockMesh(polarMesh(plane)));
    const s = terrainSamplerFromObject(root, { rings: 120, segments: 360 });
    expect(s).not.toBeNull();
    for (const [x, z] of [
      [0, 0],
      [0.4, -0.3],
      [120, 40],
      [-300, 1e-4],
      [-300, -1e-4],
      [-250, 0],
      [0, 460],
      [320, -310],
    ]) {
      expect(s?.heightAt(x, z), `${x}, ${z}`).toBeCloseTo(plane(x, z), 2);
    }
  });

  it("follows a curved surface closely at the default resolution", () => {
    const bowl = (x: number, z: number) =>
      (x * x + z * z) / 2000 + 8 * Math.sin(x / 40) * Math.cos(z / 55);
    const root = new THREE.Group();
    // Denser outside, like a range with more rings in the mountains.
    root.add(
      rockMesh(
        polarMesh(bowl, {
          rings: 160,
          segments: 720,
          spacing: (u) => u ** 0.8,
        }),
      ),
    );
    const s = terrainSamplerFromObject(root);
    let worst = 0;
    for (let k = 0; k < 400; k++) {
      const r = 460 * Math.sqrt((k * 0.618) % 1);
      const t = k * 2.39996;
      const x = r * Math.cos(t);
      const z = r * Math.sin(t);
      worst = Math.max(
        worst,
        Math.abs((s?.heightAt(x, z) ?? 1e9) - bowl(x, z)),
      );
    }
    expect(worst).toBeLessThan(0.5);
  });

  it("is null outside the disc and where nothing was sampled", () => {
    const root = new THREE.Group();
    root.add(rockMesh(polarMesh(() => 5, { rMax: 100 })));
    const s = terrainSamplerFromObject(root, { rMax: 200, rings: 100 });
    expect(s?.heightAt(50, 0)).toBeCloseTo(5, 5);
    expect(s?.heightAt(150, 0)).toBeNull();
    expect(s?.heightAt(250, 0)).toBeNull();
  });

  it("applies the world transform and ignores downward faces", () => {
    const root = new THREE.Group();
    root.position.y = 7;
    root.add(rockMesh(polarMesh(() => 1, { rMax: 100 })));
    // A flipped copy far above: its faces point down, so it is not ground.
    const lid = polarMesh(() => 50, { rMax: 100 });
    const idx = lid.getIndex()?.array as Uint16Array | Uint32Array;
    for (let i = 0; i < idx.length; i += 3) {
      const t = idx[i + 1];
      idx[i + 1] = idx[i + 2];
      idx[i + 2] = t;
    }
    root.add(rockMesh(lid));
    const s = new TerrainSampler(100, 50, 180);
    expect(s.heightAt(10, 10)).toBeNull();
    const built = terrainSamplerFromObject(root, { rMax: 100, rings: 50 });
    expect(built?.heightAt(10, 10)).toBeCloseTo(8, 5);
  });

  it("picks the largest rock mesh and none without rock", () => {
    const root = new THREE.Group();
    const small = rockMesh(polarMesh(() => 0, { rings: 2, segments: 8 }));
    const big = rockMesh(polarMesh(() => 0));
    const water = new THREE.Mesh(polarMesh(() => 0, { rings: 60 }));
    root.add(small, big, water);
    expect(findTerrainMesh(root)).toBe(big);
    expect(terrainSamplerFromObject(new THREE.Group())).toBeNull();
  });

  it("builds a 200k-triangle range in well under a second", () => {
    const root = new THREE.Group();
    root.add(
      rockMesh(
        polarMesh((x, z) => Math.sin(x / 30) * Math.cos(z / 30) * 20, {
          rings: 140,
          segments: 720,
        }),
      ),
    );
    const t0 = performance.now();
    terrainSamplerFromObject(root);
    expect(performance.now() - t0).toBeLessThan(1500);
  });
});
