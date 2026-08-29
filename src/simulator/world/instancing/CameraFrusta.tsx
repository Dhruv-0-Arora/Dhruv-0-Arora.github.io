import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../../simStore.ts";
import type { ZoneMeta } from "../meta.ts";

export const FRUSTA_COUNT = 40;
const POLE_H = 7.5;
const POLE_R = 0.16;
const CONE_LEN = 5.5;
const CONE_W = 2.4;
const CONE_H = 1.3;

interface Pole {
  x: number;
  z: number;
  height: number;
  bearing: number;
  rate: number;
  sweep: number;
}

/** Deterministic positions and sweep parameters. */
function layout(zone: ZoneMeta): Pole[] {
  let s = 19;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const poles: Pole[] = [];
  const rx = 18;
  const rz = 12;
  for (let i = 0; i < FRUSTA_COUNT; i++) {
    // Grid with jitter, like cameras on a street plan.
    const col = i % 8;
    const row = Math.floor(i / 8);
    poles.push({
      x: zone.position[0] - rx + (col / 7) * 2 * rx + (rand() - 0.5) * 2.5,
      z: zone.position[2] - rz + (row / 4) * 2 * rz + (rand() - 0.5) * 2.5,
      height: POLE_H * (0.8 + rand() * 0.4),
      bearing: rand() * Math.PI * 2,
      rate: (0.15 + rand() * 0.25) * (rand() > 0.5 ? 1 : -1),
      sweep: 0.5 + rand() * 0.9,
    });
  }
  return poles;
}

/** A wedge pointing down +X from its apex at the origin: a camera's view cone. */
function coneGeometry(): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const apex = [0, 0, 0];
  const a = [CONE_LEN, CONE_H / 2, -CONE_W / 2];
  const b = [CONE_LEN, CONE_H / 2, CONE_W / 2];
  const c = [CONE_LEN, -CONE_H / 2, CONE_W / 2];
  const d = [CONE_LEN, -CONE_H / 2, -CONE_W / 2];
  const tris = [
    apex,
    a,
    b,
    apex,
    b,
    c,
    apex,
    c,
    d,
    apex,
    d,
    a,
    a,
    d,
    c,
    a,
    c,
    b,
  ];
  g.setAttribute("position", new THREE.Float32BufferAttribute(tris.flat(), 3));
  g.computeVertexNormals();
  return g;
}

interface CameraFrustaProps {
  zone: ZoneMeta;
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * AltiGoz: 40 camera poles whose view cones sweep their bearings, two draw
 * calls (poles static, cones animated). A camera is a point with a bearing;
 * the index built from that geometry is the project.
 */
export function CameraFrusta({ zone, onMount }: CameraFrustaProps) {
  const palette = useSim((s) => s.palette);
  const poles = useMemo(() => layout(zone), [zone]);

  const meshes = useMemo(() => {
    const poleGeo = new THREE.CylinderGeometry(
      POLE_R,
      POLE_R * 1.3,
      1,
      8,
      1,
      false,
    );
    poleGeo.translate(0, 0.5, 0);
    const poleMat = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0,
    });
    const polesMesh = new THREE.InstancedMesh(poleGeo, poleMat, poles.length);
    const coneMat = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0,
      transparent: true,
      opacity: 0.82,
    });
    const conesMesh = new THREE.InstancedMesh(
      coneGeometry(),
      coneMat,
      poles.length,
    );
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    poles.forEach((p, i) => {
      pos.set(p.x, zone.position[1], p.z);
      scl.set(1, p.height, 1);
      m.compose(pos, q, scl);
      polesMesh.setMatrixAt(i, m);
    });
    polesMesh.instanceMatrix.needsUpdate = true;
    polesMesh.name = "evidence.altigoz.poles";
    conesMesh.name = "evidence.altigoz.cones";
    return { polesMesh, conesMesh };
  }, [poles, zone]);

  useEffect(() => {
    if (!palette) return;
    const set = (
      mesh: THREE.InstancedMesh,
      rgb: { r: number; g: number; b: number },
    ) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
    };
    set(meshes.polesMesh, palette.border);
    set(meshes.conesMesh, palette["hue-sky"]);
    const cone = meshes.conesMesh.material as THREE.MeshStandardMaterial;
    cone.emissive.copy(cone.color);
    cone.emissiveIntensity = palette.bg.r < 0.5 ? 0.5 : 0;
  }, [palette, meshes]);

  useEffect(() => {
    return () => {
      for (const mesh of [meshes.polesMesh, meshes.conesMesh]) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        mesh.dispose();
      }
    };
  }, [meshes]);

  const scratch = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      p: new THREE.Vector3(),
      s: new THREE.Vector3(1, 1, 1),
    }),
    [],
  );
  useFrame((state) => {
    if (!meshes.conesMesh.parent?.visible) return;
    const t = state.clock.elapsedTime;
    const { m, q, e, p, s } = scratch;
    poles.forEach((pole, i) => {
      const yaw = pole.bearing + Math.sin(t * pole.rate) * pole.sweep;
      e.set(0, yaw, -0.18);
      q.setFromEuler(e);
      p.set(pole.x, zone.position[1] + pole.height, pole.z);
      m.compose(p, q, s);
      meshes.conesMesh.setMatrixAt(i, m);
    });
    meshes.conesMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group
      ref={(group) => {
        if (group && onMount)
          onMount(group, new THREE.Vector3(...zone.position));
      }}
    >
      <primitive object={meshes.polesMesh} />
      <primitive object={meshes.conesMesh} />
    </group>
  );
}
