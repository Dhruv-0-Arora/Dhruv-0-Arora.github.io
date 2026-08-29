import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useSim } from "../../simStore.ts";
import {
  agePosition,
  dirntStops,
  gradientOklab,
  oklabToSrgb,
} from "../../theme/oklab.ts";
import type { ZoneMeta } from "../meta.ts";

export const BAMBOO_COUNT = 300;
const SEGMENTS = 5;
const SEGMENT_H = 1.0;
const STALK_R = 0.11;
const NODE_R = 0.14;
const NODE_H = 0.09;
const SIDES = 6;
/** Keep the stepping-stone spiral clear. */
const INNER_CLEAR = 2.8;
const MAX_AGE_DAYS = 400;

/** One stalk: stacked segments with a node ring at every joint, base at y=0. */
function stalkGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const seg = new THREE.CylinderGeometry(
      STALK_R,
      STALK_R * 1.04,
      SEGMENT_H,
      SIDES,
      1,
      true,
    );
    seg.translate(0, SEGMENT_H * (i + 0.5), 0);
    parts.push(seg);
    const node = new THREE.CylinderGeometry(
      NODE_R,
      NODE_R,
      NODE_H,
      SIDES,
      1,
      false,
    );
    node.translate(0, SEGMENT_H * (i + 1), 0);
    parts.push(node);
  }
  const tip = new THREE.ConeGeometry(STALK_R, 0.35, SIDES, 1, false);
  tip.translate(0, SEGMENTS * SEGMENT_H + 0.17, 0);
  parts.push(tip);
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!merged) throw new Error("bamboo geometry failed to merge");
  return merged;
}

/** Deterministic per-instance layout so every visitor sees the same grove. */
function layout(zone: ZoneMeta) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const radius = Math.min(zone.radius, 13.2);
  const items: {
    matrix: THREE.Matrix4;
    age: number;
  }[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  let guard = 0;
  while (items.length < BAMBOO_COUNT && guard++ < BAMBOO_COUNT * 20) {
    const r = Math.sqrt(rand()) * radius;
    if (r < INNER_CLEAR) continue;
    const a = rand() * Math.PI * 2;
    pos.set(
      zone.position[0] + Math.cos(a) * r,
      zone.position[1],
      zone.position[2] + Math.sin(a) * r,
    );
    const height = 0.9 + rand() * 1.1;
    scl.set(1 + rand() * 0.4, height, 1 + rand() * 0.4);
    e.set((rand() - 0.5) * 0.12, rand() * Math.PI * 2, (rand() - 0.5) * 0.12);
    q.setFromEuler(e);
    m.compose(pos, q, scl);
    // Age grows toward the rim (fresh work at the center). r^2 is uniform
    // for disc sampling, so inverting dirnt's log curve spreads the stalks
    // evenly along the gradient instead of piling them at the pale end.
    const p = Math.min(1, (r / radius) ** 2 + (rand() - 0.5) * 0.1);
    const age = Math.expm1(Math.max(0, p) * Math.log1p(MAX_AGE_DAYS));
    items.push({ matrix: m.clone(), age });
  }
  return items;
}

interface BambooGroveProps {
  zone: ZoneMeta;
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * dirnt's grove: 300 instanced stalks in one draw call, each tinted on the
 * Oklab age gradient. Colors are re-derived from the palette on theme
 * change, so the grove stays in the page's tokens.
 */
export function BambooGrove({ zone, onMount }: BambooGroveProps) {
  const palette = useSim((s) => s.palette);
  const geometry = useMemo(stalkGeometry, []);
  const items = useMemo(() => layout(zone), [zone]);
  const mesh = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0,
    });
    const instanced = new THREE.InstancedMesh(geometry, material, items.length);
    items.forEach((item, i) => {
      instanced.setMatrixAt(i, item.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
    instanced.frustumCulled = true;
    instanced.name = "terminal.bamboo.grove";
    return instanced;
  }, [geometry, items]);

  useEffect(() => {
    if (!palette) return;
    const stops = dirntStops(palette);
    const color = new THREE.Color();
    items.forEach((item, i) => {
      const rgb = oklabToSrgb(
        gradientOklab(stops, agePosition(item.age, MAX_AGE_DAYS)),
      );
      color.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [palette, items, mesh]);

  useEffect(() => {
    return () => {
      mesh.dispose();
      geometry.dispose();
    };
  }, [mesh, geometry]);

  return (
    <group
      ref={(group) => {
        if (group && onMount) {
          onMount(group, new THREE.Vector3(...zone.position));
        }
      }}
    >
      <primitive object={mesh} />
    </group>
  );
}
