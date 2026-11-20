import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useSim } from "../../simStore.ts";
import type { RouteMeta } from "../meta.ts";
import {
  climbCycle,
  cumulativeLengths,
  isMoving,
  sampleRoute,
} from "./climbPath.ts";

/** Rope teams per route and figures per team. */
const TEAMS = 2;
const TEAM_SIZE = 3;
/** Arc-length gap between teammates, in meters. */
const SPACING = 6;
/** Miniature but readable from the rail: about 3 m tall. */
const BODY_RADIUS = 0.5;
const BODY_LENGTH = 1.5;
const HEAD_RADIUS = 0.42;
const LAMP_RADIUS = 0.22;
const HEAD_Y = BODY_LENGTH + BODY_RADIUS * 2 + HEAD_RADIUS * 0.6;
const BOB = 0.18;

interface Figure {
  route: number;
  /** Seconds a full up-rest-down cycle takes on this route. */
  period: number;
  /** Time offset so teams and teammates are spread along the route. */
  offset: number;
  /** Arc-length lag behind the team leader, in meters. */
  lag: number;
  jacket: number;
}

function layout(routes: RouteMeta[]) {
  const cums = routes.map((r) => cumulativeLengths(r.points));
  const figures: Figure[] = [];
  routes.forEach((_, route) => {
    const length = cums[route][cums[route].length - 1];
    const period = 40 + length * 0.55;
    for (let team = 0; team < TEAMS; team++) {
      for (let k = 0; k < TEAM_SIZE; k++) {
        figures.push({
          route,
          period,
          offset: (team / TEAMS) * period + route * 17,
          lag: k * SPACING,
          jacket: (route + team + k) % 3,
        });
      }
    }
  });
  return { cums, figures };
}

function figureGeometry(): THREE.BufferGeometry {
  const body = new THREE.CapsuleGeometry(BODY_RADIUS, BODY_LENGTH, 3, 8);
  body.translate(0, BODY_RADIUS + BODY_LENGTH / 2, 0);
  const head = new THREE.SphereGeometry(HEAD_RADIUS, 8, 6);
  head.translate(0, HEAD_Y, 0);
  const merged = mergeGeometries([body, head], false);
  body.dispose();
  head.dispose();
  return merged;
}

interface ClimbersProps {
  routes: RouteMeta[];
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * Rope teams on the backdrop's climbing routes: faceless figures in bright
 * jackets, roped together, walking up, resting on the summit, and coming
 * back down. Headlamps glow in the dark theme. Three draw calls total.
 */
export function Climbers({ routes, onMount }: ClimbersProps) {
  const palette = useSim((s) => s.palette);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const { cums, figures } = useMemo(() => layout(routes), [routes]);

  const meshes = useMemo(() => {
    const bodies = new THREE.InstancedMesh(
      figureGeometry(),
      new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0 }),
      figures.length,
    );
    bodies.name = "backdrop.climbers.bodies";
    const lamps = new THREE.InstancedMesh(
      new THREE.SphereGeometry(LAMP_RADIUS, 6, 4),
      new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 }),
      figures.length,
    );
    lamps.name = "backdrop.climbers.lamps";
    const ropeCount = figures.length - routes.length * TEAMS;
    const ropeGeo = new THREE.BufferGeometry();
    ropeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Float32Array(ropeCount * 6), 3),
    );
    const rope = new THREE.LineSegments(
      ropeGeo,
      new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 }),
    );
    rope.name = "backdrop.climbers.rope";
    rope.frustumCulled = false;
    return { bodies, lamps, rope };
  }, [figures.length, routes.length]);

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    const jackets = [
      palette.accent,
      palette["hue-rose-vivid"],
      palette["hue-sky-vivid"],
    ];
    const c = new THREE.Color();
    figures.forEach((f, i) => {
      const j = jackets[f.jacket];
      c.setRGB(j.r, j.g, j.b, THREE.SRGBColorSpace);
      meshes.bodies.setColorAt(i, c);
      c.setRGB(1, 1, 1);
      meshes.lamps.setColorAt(i, c);
    });
    if (meshes.bodies.instanceColor) {
      meshes.bodies.instanceColor.needsUpdate = true;
    }
    if (meshes.lamps.instanceColor)
      meshes.lamps.instanceColor.needsUpdate = true;
    const body = meshes.bodies.material as THREE.MeshStandardMaterial;
    body.color.setRGB(1, 1, 1);
    body.emissive.setRGB(0, 0, 0);
    const lamp = meshes.lamps.material as THREE.MeshStandardMaterial;
    const amber = palette["hue-amber"];
    lamp.color.setRGB(amber.r, amber.g, amber.b, THREE.SRGBColorSpace);
    lamp.emissive.copy(lamp.color);
    lamp.emissiveIntensity = night ? 2.0 : 0.2;
    const ropeMat = meshes.rope.material as THREE.LineBasicMaterial;
    const text = palette.text;
    ropeMat.color.setRGB(text.r, text.g, text.b, THREE.SRGBColorSpace);
  }, [palette, meshes, figures]);

  useEffect(() => {
    return () => {
      for (const obj of [meshes.bodies, meshes.lamps]) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
        obj.dispose();
      }
      meshes.rope.geometry.dispose();
      (meshes.rope.material as THREE.Material).dispose();
    };
  }, [meshes]);

  const scratch = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      p: new THREE.Vector3(),
      s: new THREE.Vector3(1, 1, 1),
      heads: new Float32Array(figures.length * 3),
      posed: false,
    }),
    [figures.length],
  );

  useFrame((state) => {
    if (!meshes.bodies.parent?.visible) return;
    if (reducedMotion && scratch.posed) return;
    scratch.posed = true;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const { m, q, e, p, s, heads } = scratch;
    const rope = meshes.rope.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    let ropeIndex = 0;
    figures.forEach((f, i) => {
      const route = routes[f.route];
      const cum = cums[f.route];
      const total = cum[cum.length - 1];
      const local = t + f.offset;
      const lead = climbCycle(local, f.period) * total;
      const along = Math.max(0, lead - f.lag);
      const sample = sampleRoute(route.points, cum, along / total);
      const yaw = Math.atan2(sample.tangent[0], sample.tangent[2]);
      const moving = isMoving(local, f.period) && along > 0;
      const bob = moving ? BOB * Math.abs(Math.sin(t * 5 + i * 1.7)) : 0;
      p.set(sample.position[0], sample.position[1] + bob, sample.position[2]);
      e.set(0, yaw, 0);
      q.setFromEuler(e);
      m.compose(p, q, s);
      meshes.bodies.setMatrixAt(i, m);
      // Headlamp: just ahead of the face, so it reads as a point of light.
      p.set(
        sample.position[0] + Math.sin(yaw) * (HEAD_RADIUS + 0.1),
        sample.position[1] + bob + HEAD_Y + 0.1,
        sample.position[2] + Math.cos(yaw) * (HEAD_RADIUS + 0.1),
      );
      m.compose(p, q, s);
      meshes.lamps.setMatrixAt(i, m);
      heads[i * 3] = sample.position[0];
      heads[i * 3 + 1] = sample.position[1] + bob + BODY_LENGTH;
      heads[i * 3 + 2] = sample.position[2];
      if (f.lag > 0) {
        // Rope from this figure to the teammate ahead (the previous index).
        rope.setXYZ(
          ropeIndex * 2,
          heads[(i - 1) * 3],
          heads[(i - 1) * 3 + 1],
          heads[(i - 1) * 3 + 2],
        );
        rope.setXYZ(
          ropeIndex * 2 + 1,
          heads[i * 3],
          heads[i * 3 + 1],
          heads[i * 3 + 2],
        );
        ropeIndex++;
      }
    });
    meshes.bodies.instanceMatrix.needsUpdate = true;
    meshes.lamps.instanceMatrix.needsUpdate = true;
    rope.needsUpdate = true;
  });

  return (
    <group
      ref={(group) => {
        if (group && onMount) onMount(group, new THREE.Vector3(0, 0, 0));
      }}
    >
      <primitive object={meshes.bodies} />
      <primitive object={meshes.lamps} />
      <primitive object={meshes.rope} />
    </group>
  );
}
