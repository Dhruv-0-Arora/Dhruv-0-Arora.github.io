import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { projects } from "../../../content/projects";
import type { Hue } from "../../../lib/hues";
import { useSim } from "../../simStore.ts";
import type { Palette } from "../../theme/palette.ts";
import { type District, ZONE_SLUGS, type ZoneSlug } from "../contract.ts";
import { DISTRICT_HINTS } from "../loadWorld.ts";
import type { ZoneMeta } from "../meta.ts";

const CENTER = new THREE.Vector3(0, 12, 0);
const CORE_R = 1.4;
const ORB_R = 0.5;
const STUDS = 24;
const STUD = 0.35;

/** One ring per district, inside out. */
const RINGS: {
  district: District;
  radius: number;
  tilt: number;
  azimuth: number;
  rate: number;
  hue: keyof Palette;
}[] = [
  {
    district: "terminal",
    radius: 3.2,
    tilt: 0.32,
    azimuth: 0.0,
    rate: 0.35,
    hue: "hue-green",
  },
  {
    district: "evidence",
    radius: 4.2,
    tilt: 0.6,
    azimuth: 1.1,
    rate: -0.22,
    hue: "hue-sky-vivid",
  },
  {
    district: "fabrication",
    radius: 5.2,
    tilt: 0.87,
    azimuth: 2.3,
    rate: 0.15,
    hue: "hue-violet-vivid",
  },
  {
    district: "redacted",
    radius: 6.2,
    tilt: 1.05,
    azimuth: 3.6,
    rate: -0.1,
    hue: "hue-rose-vivid",
  },
];

interface Orb {
  ring: number;
  phase: number;
  hue: Hue | undefined;
}

/** Each project zone becomes an orb on its district's ring. */
export function orbLayout(zones: ZoneMeta[]): Orb[] {
  const districts = RINGS.map((r) => r.district);
  const perRing = new Map<number, ZoneSlug[]>();
  for (const slug of ZONE_SLUGS) {
    if (slug === "hub") continue;
    const zone = zones.find((z) => z.slug === slug);
    if (!zone) continue;
    const p = new THREE.Vector3(...zone.position);
    let best = 0;
    let bestD = Number.POSITIVE_INFINITY;
    districts.forEach((d, i) => {
      const dist = DISTRICT_HINTS[d].distanceToSquared(p);
      if (dist < bestD) {
        bestD = dist;
        best = i;
      }
    });
    perRing.set(best, [...(perRing.get(best) ?? []), slug]);
  }
  const orbs: Orb[] = [];
  for (const [ring, slugs] of perRing) {
    slugs.forEach((slug, i) => {
      orbs.push({
        ring,
        phase: (i / slugs.length) * Math.PI * 2,
        hue: projects.find((p) => p.slug === slug)?.accent,
      });
    });
  }
  return orbs;
}

interface HubOrreryProps {
  zones: ZoneMeta[];
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * The orrery above the spawn pad: a breathing core, one tilted spinning
 * ring per district carrying an orb per project in that project's hue, and
 * chase lights running around the outer ring. Seven draw calls.
 */
export function HubOrrery({ zones, onMount }: HubOrreryProps) {
  const palette = useSim((s) => s.palette);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const orbs = useMemo(() => orbLayout(zones), [zones]);

  const parts = useMemo(() => {
    const group = new THREE.Group();
    group.name = "shared.orrery";
    group.position.copy(CENTER);
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(CORE_R, 1),
      new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 }),
    );
    group.add(core);
    const rings = RINGS.map((spec) => {
      const pivot = new THREE.Group();
      pivot.rotation.set(spec.tilt, spec.azimuth, 0, "YXZ");
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(spec.radius, 0.12, 8, 96),
        new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0 }),
      );
      torus.rotation.x = Math.PI / 2;
      pivot.add(torus);
      group.add(pivot);
      return { pivot, torus, spec };
    });
    const orbMesh = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(ORB_R, 1),
      new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 }),
      Math.max(1, orbs.length),
    );
    group.add(orbMesh);
    const studMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(STUD, STUD, STUD),
      new THREE.MeshBasicMaterial({ toneMapped: false }),
      STUDS,
    );
    group.add(studMesh);
    core.castShadow = true;
    orbMesh.castShadow = true;
    for (const r of rings) r.torus.castShadow = true;
    return { group, core, rings, orbMesh, studMesh };
  }, [orbs.length]);

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    const setStd = (
      mesh: THREE.Mesh,
      rgb: { r: number; g: number; b: number },
      glow: number,
    ) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
      mat.emissive.copy(mat.color);
      mat.emissiveIntensity = night ? glow : 0;
    };
    setStd(parts.core, palette.accent, 0.9);
    for (const r of parts.rings) setStd(r.torus, palette[r.spec.hue], 0.6);
    const c = new THREE.Color();
    orbs.forEach((o, i) => {
      const rgb = o.hue ? palette[`hue-${o.hue}`] : palette.accent;
      c.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
      parts.orbMesh.setColorAt(i, c);
    });
    if (parts.orbMesh.instanceColor)
      parts.orbMesh.instanceColor.needsUpdate = true;
    const orbMat = parts.orbMesh.material as THREE.MeshStandardMaterial;
    orbMat.color.setRGB(1, 1, 1);
    orbMat.emissive.setRGB(1, 1, 1);
    orbMat.emissiveIntensity = night ? 0.12 : 0;
    const amber = palette["hue-amber"];
    (parts.studMesh.material as THREE.MeshBasicMaterial).color.setRGB(
      amber.r,
      amber.g,
      amber.b,
      THREE.SRGBColorSpace,
    );
  }, [palette, parts, orbs]);

  useEffect(() => {
    return () => {
      parts.core.geometry.dispose();
      (parts.core.material as THREE.Material).dispose();
      for (const r of parts.rings) {
        r.torus.geometry.dispose();
        (r.torus.material as THREE.Material).dispose();
      }
      for (const mesh of [parts.orbMesh, parts.studMesh]) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        mesh.dispose();
      }
    };
  }, [parts]);

  const scratch = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      local: new THREE.Matrix4(),
      p: new THREE.Vector3(),
      c: new THREE.Color(),
      posed: false,
    }),
    [],
  );

  useFrame((state) => {
    if (!parts.group.parent?.visible) return;
    if (reducedMotion && scratch.posed) return;
    scratch.posed = true;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const { m, local, p, c } = scratch;
    const breath = 1 + 0.04 * Math.sin(t * 0.9);
    parts.core.scale.setScalar(breath);
    parts.core.rotation.y = t * 0.2;
    parts.rings.forEach((r) => {
      r.pivot.rotation.set(
        r.spec.tilt,
        r.spec.azimuth + t * r.spec.rate,
        0,
        "YXZ",
      );
      r.pivot.updateMatrix();
    });
    orbs.forEach((o, i) => {
      const r = parts.rings[o.ring];
      p.set(
        r.spec.radius * Math.cos(o.phase),
        0,
        r.spec.radius * Math.sin(o.phase),
      );
      local.makeTranslation(p.x, p.y, p.z);
      m.copy(r.pivot.matrix).multiply(local);
      parts.orbMesh.setMatrixAt(i, m);
    });
    parts.orbMesh.instanceMatrix.needsUpdate = true;
    const outer = parts.rings[parts.rings.length - 1];
    for (let i = 0; i < STUDS; i++) {
      const a = (i / STUDS) * Math.PI * 2;
      p.set(
        outer.spec.radius * Math.cos(a),
        0,
        outer.spec.radius * Math.sin(a),
      );
      local.makeTranslation(p.x, p.y, p.z);
      m.copy(outer.pivot.matrix).multiply(local);
      parts.studMesh.setMatrixAt(i, m);
      const k = Math.max(0, Math.cos(a - t * 2.2)) ** 8;
      const b = 0.25 + 0.75 * k;
      c.setRGB(b, b, b);
      parts.studMesh.setColorAt(i, c);
    }
    parts.studMesh.instanceMatrix.needsUpdate = true;
    if (parts.studMesh.instanceColor)
      parts.studMesh.instanceColor.needsUpdate = true;
  });

  return (
    <group
      ref={(group) => {
        if (group && onMount) onMount(group, new THREE.Vector3(0, 0, 0));
      }}
    >
      <primitive object={parts.group} />
    </group>
  );
}
