import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useSim } from "../../simStore.ts";
import type { ZoneMeta } from "../meta.ts";
import type { ZoneScreenSpec } from "../zoneScreens.ts";
import { MediaSurface } from "./mediaSurface.ts";

const BAR = 0.35;
const DEPTH = 0.3;
const STRIP = 0.16;
const BOB = 0.25;
const BOB_RATE = 0.6;

/** Four bars around a w x h opening, in the panel's local frame. */
export function frameBars(w: number, h: number): THREE.BufferGeometry {
  const top = new THREE.BoxGeometry(w + BAR * 2, BAR, DEPTH);
  top.translate(0, h / 2 + BAR / 2, 0);
  const bottom = new THREE.BoxGeometry(w + BAR * 2, BAR, DEPTH);
  bottom.translate(0, -h / 2 - BAR / 2, 0);
  const left = new THREE.BoxGeometry(BAR, h, DEPTH);
  left.translate(-w / 2 - BAR / 2, 0, 0);
  const right = new THREE.BoxGeometry(BAR, h, DEPTH);
  right.translate(w / 2 + BAR / 2, 0, 0);
  const merged = mergeGeometries([top, bottom, left, right], false);
  for (const g of [top, bottom, left, right]) g.dispose();
  return merged;
}

/** A thin accent strip along the bottom bar, proud of its face. */
export function accentStrip(w: number, h: number): THREE.BufferGeometry {
  const strip = new THREE.BoxGeometry(w + BAR * 2, STRIP, DEPTH * 0.4);
  strip.translate(0, -h / 2 - BAR - STRIP / 2, 0);
  return strip;
}

interface ZoneScreenProps {
  zone: ZoneMeta;
  spec: ZoneScreenSpec;
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * A floating screen beside an installation: a framed 16:9 panel that bobs
 * gently, faces the rail, and plays the project's clip when one is set.
 */
export function ZoneScreen({ zone, spec, onMount }: ZoneScreenProps) {
  const palette = useSim((s) => s.palette);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const [w, h] = spec.size;

  const parts = useMemo(() => {
    const surface = new MediaSurface(w / h);
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      surface.material,
    );
    panel.name = `${spec.zone}.screen.panel`;
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 }),
    );
    back.rotation.y = Math.PI;
    back.position.z = -0.02;
    const bars = new THREE.Mesh(
      frameBars(w, h),
      new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0 }),
    );
    const strip = new THREE.Mesh(
      accentStrip(w, h),
      new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0 }),
    );
    const group = new THREE.Group();
    group.add(panel, back, bars, strip);
    for (const mesh of [panel, back, bars, strip]) mesh.castShadow = true;
    const base = new THREE.Vector3(
      zone.position[0] + spec.offset[0],
      zone.position[1] + spec.offset[1],
      zone.position[2] + spec.offset[2],
    );
    group.position.copy(base);
    group.rotation.y = Math.atan2(
      spec.faceToward[0] - base.x,
      spec.faceToward[2] - base.z,
    );
    return { surface, panel, back, bars, strip, group, base };
  }, [w, h, spec, zone]);

  useEffect(() => {
    parts.surface.setSource(spec.src);
  }, [parts, spec.src]);

  useEffect(() => {
    if (!palette) return;
    parts.surface.setPalette(palette);
    const night = palette.bg.r < 0.5;
    const paint = (
      mesh: THREE.Mesh,
      rgb: { r: number; g: number; b: number },
      glow: number,
    ) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
      mat.emissive.copy(mat.color);
      mat.emissiveIntensity = night ? glow : 0;
    };
    paint(parts.back, palette["surface-2"], 0);
    paint(parts.bars, palette.border, 0);
    paint(parts.strip, palette.accent, 0.7);
  }, [palette, parts]);

  useEffect(() => {
    return () => {
      parts.surface.dispose();
      for (const mesh of [parts.panel, parts.back, parts.bars, parts.strip]) {
        mesh.geometry.dispose();
        if (mesh !== parts.panel) (mesh.material as THREE.Material).dispose();
      }
    };
  }, [parts]);

  useFrame((state, dt) => {
    const visible = parts.group.parent?.visible ?? false;
    parts.surface.tick(dt, visible);
    if (!visible || reducedMotion) return;
    const t = state.clock.elapsedTime;
    parts.group.position.y =
      parts.base.y + BOB * Math.sin(t * BOB_RATE + parts.base.x);
  });

  return (
    <group
      ref={(group) => {
        if (group && onMount)
          onMount(group, new THREE.Vector3(...zone.position));
      }}
    >
      <primitive object={parts.group} />
    </group>
  );
}
