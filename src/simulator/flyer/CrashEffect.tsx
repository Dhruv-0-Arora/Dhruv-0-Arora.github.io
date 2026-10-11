import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { frame, useSim } from "../simStore.ts";
import { CRASH, createParticle, puffAt, shardAt } from "./crash.ts";
import { flyerColors, toColor } from "./flyerColors.ts";

interface CrashEffectProps {
  /** Surface height, for debris and dust that run onto other ground. */
  groundAt: (x: number, z: number) => number;
}

/**
 * The burst when the Flyer goes down: splinters of muslin and spruce (and
 * a few in the accent) thrown out of the impact, low-poly smoke that
 * starts hot and swells as it lifts, and a ring of dust running out along
 * the ground. Two instanced meshes allocated once, flat shaded like the
 * rest of the range, posed from the closed-form timeline in `crash.ts`,
 * and hidden (no draw calls) whenever no crash is playing.
 */
/**
 * Flat-shaded, partly self-lit puffs whose opacity is per instance (the
 * `aAlpha` attribute), so each billow thins out on its own clock and the
 * facets read as smoke rather than solid boulders.
 */
function puffMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    flatShading: true,
    transparent: true,
    depthWrite: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aAlpha;\nvarying float vAlpha;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvAlpha = aAlpha;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vAlpha;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.a *= vAlpha;",
      );
  };
  material.customProgramCacheKey = () => "flyer.crash.puff";
  return material;
}

export function CrashEffect({ groundAt }: CrashEffectProps) {
  const palette = useSim((s) => s.palette);

  const built = useMemo(() => {
    const group = new THREE.Group();
    group.name = "flyer.crash";
    group.visible = false;
    const shards = new THREE.InstancedMesh(
      new THREE.TetrahedronGeometry(1),
      new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0,
        flatShading: true,
      }),
      CRASH.shards,
    );
    shards.castShadow = true;
    shards.frustumCulled = false;
    const puffs = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0),
      puffMaterial(),
      CRASH.smoke + CRASH.dust,
    );
    puffs.frustumCulled = false;
    const alpha = new THREE.InstancedBufferAttribute(
      new Float32Array(puffs.count),
      1,
    );
    alpha.setUsage(THREE.DynamicDrawUsage);
    puffs.geometry.setAttribute("aAlpha", alpha);
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const white = new THREE.Color(1, 1, 1);
    for (let i = 0; i < shards.count; i++) {
      shards.setMatrixAt(i, zero);
      shards.setColorAt(i, white);
    }
    for (let i = 0; i < puffs.count; i++) {
      puffs.setMatrixAt(i, zero);
      puffs.setColorAt(i, white);
    }
    group.add(shards, puffs);
    return {
      group,
      shards,
      puffs,
      smoke: new THREE.Color(),
      heat: new THREE.Color(),
      tint: new THREE.Color(),
      alpha,
      dummy: new THREE.Object3D(),
      p: createParticle(),
    };
  }, []);

  // Debris is the airframe's own materials with a few accent chips; smoke
  // is the rock tone lifted toward the snow by day and the muted text by
  // night, so it reads against either sky; dust is earthier, a warm rock.
  useEffect(() => {
    if (!palette) return;
    const c = flyerColors(palette);
    const accent = toColor(palette.accent);
    const cycle = [c.fabric, c.wood, c.fabric, accent, c.wood, c.metal];
    for (let i = 0; i < built.shards.count; i++) {
      built.shards.setColorAt(i, cycle[i % cycle.length]);
    }
    if (built.shards.instanceColor) {
      built.shards.instanceColor.needsUpdate = true;
    }
    // By day a warm grey between the rock and the snow; by night the
    // muted text tone eased toward the sky, pale and low in contrast.
    if (c.night) {
      toColor(palette.muted, built.smoke).lerp(toColor(palette.bg), 0.25);
    } else {
      toColor(palette.rock, built.smoke).lerp(toColor(palette.snow), 0.5);
    }
    toColor(palette["hue-amber-vivid"], built.heat);
    const puffMat = built.puffs.material as THREE.MeshStandardMaterial;
    puffMat.emissive.copy(built.smoke);
    puffMat.emissiveIntensity = c.night ? 0.5 : 0.3;
    const dust = toColor(c.night ? palette.muted : palette["surface-2"])
      .lerp(toColor(palette.rock), c.night ? 0.35 : 0.5)
      .lerp(toColor(palette["hue-amber"]), 0.12);
    for (let i = CRASH.smoke; i < built.puffs.count; i++) {
      built.puffs.setColorAt(i, dust);
    }
    for (let i = 0; i < CRASH.smoke; i++) {
      built.puffs.setColorAt(i, built.smoke);
    }
    if (built.puffs.instanceColor) built.puffs.instanceColor.needsUpdate = true;
  }, [palette, built]);

  useEffect(() => {
    return () => {
      for (const mesh of [built.shards, built.puffs]) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        mesh.dispose();
      }
    };
  }, [built]);

  useFrame(() => {
    const crash = frame.crash;
    const { group, shards, puffs, dummy, p } = built;
    if (!crash.active) {
      if (group.visible) group.visible = false;
      return;
    }
    group.visible = true;
    const t = crash.t;

    for (let i = 0; i < shards.count; i++) {
      shardAt(crash, i, t, p);
      // Landed on the impact's ground: settle onto whatever ground it
      // actually reached. In flight: never through a rise in the terrain.
      const under = groundAt(p.x, p.z);
      dummy.position.set(
        p.x,
        p.y <= crash.ground ? under + p.sy * 0.5 : Math.max(p.y, under),
        p.z,
      );
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.set(p.sx, p.sy, p.sz);
      dummy.updateMatrix();
      shards.setMatrixAt(i, dummy.matrix);
    }
    shards.instanceMatrix.needsUpdate = true;

    let recolor = false;
    for (let i = 0; i < puffs.count; i++) {
      puffAt(crash, i, t, p);
      let y = p.y;
      if (i >= CRASH.smoke) y = groundAt(p.x, p.z) + (p.y - crash.ground);
      dummy.position.set(p.x, y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.set(p.sx, p.sy, p.sz);
      dummy.updateMatrix();
      puffs.setMatrixAt(i, dummy.matrix);
      built.alpha.setX(i, p.alpha);
      if (i < 4) {
        built.tint.copy(built.smoke).lerp(built.heat, p.heat);
        puffs.setColorAt(i, built.tint);
        recolor = true;
      }
    }
    puffs.instanceMatrix.needsUpdate = true;
    built.alpha.needsUpdate = true;
    if (recolor && puffs.instanceColor) puffs.instanceColor.needsUpdate = true;
  });

  return <primitive object={built.group} />;
}
