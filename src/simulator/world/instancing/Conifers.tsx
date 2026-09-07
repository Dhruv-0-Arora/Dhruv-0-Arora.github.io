import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useSim } from "../../simStore.ts";
import { forestWeight } from "../terrain/terrainField.ts";

const MAX_TREES = 9000;
/** Square meters of fully forested slope per tree. */
const AREA_PER_TREE = 34;
const TREE_H = 5.2;
const TREE_R = 1.15;

interface Tree {
  x: number;
  y: number;
  z: number;
  scale: number;
  shade: number;
}

/**
 * Scatters trees over the loaded range: every triangle gets trees in
 * proportion to its area and the terrain field's forest weight at its
 * center, at random barycentric points, so the trees stand exactly where
 * the shader paints forest floor. Seeded, so the forest is the same on
 * every visit. `exclude` vetoes a spot (a trail, a lake) after the random
 * draw, so the rest of the forest does not shift when it changes.
 */
export function scatterTrees(
  backdrop: THREE.Object3D,
  exclude?: (x: number, z: number) => boolean,
): Tree[] {
  let s = 61;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const trees: Tree[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  const n = new THREE.Vector3();
  backdrop.updateMatrixWorld(true);
  backdrop.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const geo = obj.geometry as THREE.BufferGeometry;
    const pos = geo.getAttribute("position");
    const index = geo.getIndex();
    const count = index ? index.count : pos.count;
    const at = (i: number) => (index ? index.getX(i) : i);
    for (let i = 0; i + 2 < count && trees.length < MAX_TREES; i += 3) {
      a.fromBufferAttribute(pos, at(i)).applyMatrix4(obj.matrixWorld);
      b.fromBufferAttribute(pos, at(i + 1)).applyMatrix4(obj.matrixWorld);
      c.fromBufferAttribute(pos, at(i + 2)).applyMatrix4(obj.matrixWorld);
      const cx = (a.x + b.x + c.x) / 3;
      const cy = (a.y + b.y + c.y) / 3;
      const cz = (a.z + b.z + c.z) / 3;
      ab.subVectors(b, a);
      ac.subVectors(c, a);
      n.crossVectors(ab, ac);
      const area = n.length() / 2;
      n.normalize();
      const forest = forestWeight(cx, cy, cz, n.y);
      if (forest < 0.08) continue;
      const want = Math.min(
        6,
        Math.floor((area * forest) / AREA_PER_TREE + rand()),
      );
      for (let k = 0; k < want; k++) {
        let u = rand();
        let v = rand();
        if (u + v > 1) {
          u = 1 - u;
          v = 1 - v;
        }
        const tree = {
          x: a.x + ab.x * u + ac.x * v,
          y: a.y + ab.y * u + ac.y * v,
          z: a.z + ab.z * u + ac.z * v,
          scale: 0.7 + rand() * 0.6,
          shade: rand(),
        };
        if (exclude?.(tree.x, tree.z)) continue;
        trees.push(tree);
      }
    }
  });
  return trees;
}

/** A fir: two stacked crowns over a short trunk, open at the base. */
function treeGeometry(): THREE.BufferGeometry {
  const lower = new THREE.ConeGeometry(TREE_R, TREE_H * 0.62, 6, 1, true);
  lower.translate(0, TREE_H * 0.31 + 0.5, 0);
  const upper = new THREE.ConeGeometry(TREE_R * 0.7, TREE_H * 0.58, 6, 1, true);
  upper.translate(0, TREE_H * 0.71 + 0.5, 0);
  const trunk = new THREE.CylinderGeometry(0.16, 0.22, 0.7, 5, 1, true);
  trunk.translate(0, 0.35, 0);
  const merged = mergeGeometries([lower, upper, trunk], false);
  lower.dispose();
  upper.dispose();
  trunk.dispose();
  return merged;
}

interface ConifersProps {
  backdrop: THREE.Object3D;
  /** Where no tree may stand, such as on a trail or in a lake. */
  exclude?: (x: number, z: number) => boolean;
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/** The forest on the lower slopes: one instanced draw call of low cones. */
export function Conifers({ backdrop, exclude, onMount }: ConifersProps) {
  const palette = useSim((s) => s.palette);
  const trees = useMemo(
    () => scatterTrees(backdrop, exclude),
    [backdrop, exclude],
  );

  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(
      treeGeometry(),
      new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 }),
      Math.max(1, trees.length),
    );
    m.name = "backdrop.forest";
    m.castShadow = true;
    m.receiveShadow = true;
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const e = new THREE.Euler();
    trees.forEach((t, i) => {
      p.set(t.x, t.y, t.z);
      s.set(t.scale, t.scale * (0.9 + t.shade * 0.35), t.scale);
      e.set(0, t.shade * Math.PI * 2, 0);
      q.setFromEuler(e);
      mat.compose(p, q, s);
      m.setMatrixAt(i, mat);
    });
    m.instanceMatrix.needsUpdate = true;
    m.count = trees.length;
    return m;
  }, [trees]);

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    const forest = new THREE.Color().setRGB(
      palette.forest.r,
      palette.forest.g,
      palette.forest.b,
      THREE.SRGBColorSpace,
    );
    const green = new THREE.Color().setRGB(
      palette["hue-green"].r,
      palette["hue-green"].g,
      palette["hue-green"].b,
      THREE.SRGBColorSpace,
    );
    const c = new THREE.Color();
    trees.forEach((t, i) => {
      c.copy(forest).lerp(
        green,
        night ? 0.1 + t.shade * 0.2 : 0.15 + t.shade * 0.45,
      );
      mesh.setColorAt(i, c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color.setRGB(1, 1, 1);
  }, [palette, mesh, trees]);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.dispose();
    };
  }, [mesh]);

  return (
    <group
      ref={(group) => {
        if (group && onMount) onMount(group, new THREE.Vector3(0, 0, 0));
      }}
    >
      <primitive object={mesh} />
    </group>
  );
}
