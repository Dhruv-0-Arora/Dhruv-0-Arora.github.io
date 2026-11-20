import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { RailPath } from "../controls/railPath.ts";
import { useSim } from "../simStore.ts";
import type { Rgba } from "../theme/palette.ts";
import type { Vec3 } from "../world/meta.ts";
import { RAIL } from "./railStyle.ts";
import {
  quaternionAlong,
  railPoint,
  rightOf,
  trackStations,
} from "./railTrack.ts";

/**
 * The rail made visible: two steel rails on floating ties over a slim
 * beam, generated from the exported rail curve so the track is always
 * exactly where the camera travels. Four draw calls for the whole loop.
 */

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

interface Built {
  group: THREE.Group;
  rail: THREE.MeshStandardMaterial;
  tie: THREE.MeshStandardMaterial;
  beam: THREE.MeshStandardMaterial;
  geometries: THREE.BufferGeometry[];
}

function railTube(points: THREE.Vector3[], closed: boolean) {
  const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  return new THREE.TubeGeometry(curve, points.length, RAIL.radius, 6, closed);
}

function build(path: RailPath): Built {
  const group = new THREE.Group();
  group.name = "rail";
  const rail = new THREE.MeshStandardMaterial({
    roughness: 0.35,
    metalness: 0.8,
  });
  const tie = new THREE.MeshStandardMaterial({ roughness: 0.85 });
  const beam = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  const geometries: THREE.BufferGeometry[] = [];

  // Rails: offset the centreline left and right, level with the ground.
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  const tangent: Vec3 = [0, 0, 0];
  const scratch: Vec3 = [0, 0, 0];
  const side = new THREE.Vector3();
  for (const t of trackStations(path, RAIL.sample)) {
    const p = railPoint(path, t, RAIL.drop, undefined, scratch);
    rightOf(path.tangentAt(t, tangent), side).multiplyScalar(RAIL.gauge / 2);
    left.push(p.clone().sub(side));
    right.push(p.clone().add(side));
  }
  for (const pts of [left, right]) {
    const geo = railTube(pts, path.closed);
    geometries.push(geo);
    const mesh = new THREE.Mesh(geo, rail);
    mesh.castShadow = true;
    group.add(mesh);
  }

  // Ties and beam segments, one instance per station.
  const stations = trackStations(path, RAIL.tiePitch);
  const tieGeo = new THREE.BoxGeometry(
    RAIL.tie.width,
    RAIL.tie.height,
    RAIL.tie.depth,
  );
  const beamGeo = new THREE.BoxGeometry(
    RAIL.beam.width,
    RAIL.beam.height,
    RAIL.tiePitch + 0.04,
  );
  geometries.push(tieGeo, beamGeo);
  const ties = new THREE.InstancedMesh(tieGeo, tie, stations.length);
  const beams = new THREE.InstancedMesh(beamGeo, beam, stations.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const tieY = -RAIL.radius - RAIL.tie.height / 2;
  const beamY = tieY - RAIL.tie.height / 2 - RAIL.beam.height / 2;
  stations.forEach((t, i) => {
    railPoint(path, t, RAIL.drop, pos, scratch);
    quaternionAlong(path.tangentAt(t, tangent), q);
    pos.y += tieY;
    ties.setMatrixAt(i, m.compose(pos, q, one));
    pos.y += beamY - tieY;
    beams.setMatrixAt(i, m.compose(pos, q, one));
  });
  for (const inst of [ties, beams]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = true;
    inst.receiveShadow = true;
    inst.frustumCulled = false;
    group.add(inst);
  }
  return { group, rail, tie, beam, geometries };
}

export function RailTrack({ rail }: { rail: RailPath }) {
  const palette = useSim((s) => s.palette);
  const built = useMemo(() => build(rail), [rail]);

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    // Steel, dark wood, and a beam in the surface tone; at night the rails
    // carry a trace of the accent so the loop reads from the air.
    toColor(palette.text, built.rail.color).lerp(toColor(palette.muted), 0.5);
    toColor(palette.accent, built.rail.emissive);
    built.rail.emissiveIntensity = night ? 0.35 : 0;
    toColor(palette["hue-amber"], built.tie.color).lerp(
      toColor(palette.text),
      night ? 0.7 : 0.55,
    );
    toColor(palette["surface-2"], built.beam.color).lerp(
      toColor(palette.muted),
      0.35,
    );
  }, [palette, built]);

  useEffect(() => {
    return () => {
      for (const g of built.geometries) g.dispose();
      built.rail.dispose();
      built.tie.dispose();
      built.beam.dispose();
    };
  }, [built]);

  return <primitive object={built.group} />;
}
