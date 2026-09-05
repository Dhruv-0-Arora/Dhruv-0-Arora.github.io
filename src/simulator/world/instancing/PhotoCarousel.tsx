import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gallery } from "../../../content/gallery";
import { useSim } from "../../simStore.ts";
import { MediaSurface } from "./mediaSurface.ts";
import { accentStrip, frameBars } from "./ZoneScreen.tsx";

const FRAMES = 6;
const RADIUS = 14.5;
/** High enough that the rail camera at spawn sees the pad under the frames. */
const HEIGHT = 8.5;
const PHOTO_W = 4.5;
const PHOTO_H = 3.0;
/** Radians per second; one lap in about two and a half minutes. */
const SPIN = 0.04;

function frameMatrix(i: number): THREE.Matrix4 {
  const a = (i / FRAMES) * Math.PI * 2;
  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3(
    RADIUS * Math.cos(a),
    HEIGHT,
    RADIUS * Math.sin(a),
  );
  // A plane faces +Z; yaw it so its normal points away from the hub.
  const q = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(0, Math.atan2(Math.cos(a), Math.sin(a)), 0),
  );
  return m.compose(pos, q, new THREE.Vector3(1, 1, 1));
}

interface PhotoCarouselProps {
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * Six photo frames orbiting the plaza above the guides, facing outward so
 * every picture passes the spawn camera. Frames without a photo show the
 * placeholder. Nine draw calls: six photos, one back plate mesh, one bar
 * mesh, one accent strip mesh.
 */
export function PhotoCarousel({ onMount }: PhotoCarouselProps) {
  const palette = useSim((s) => s.palette);
  const reducedMotion = useSim((s) => s.reducedMotion);

  const parts = useMemo(() => {
    const group = new THREE.Group();
    group.name = "shared.carousel";
    const surfaces: MediaSurface[] = [];
    const panels: THREE.Mesh[] = [];
    const backGeos: THREE.BufferGeometry[] = [];
    const barGeos: THREE.BufferGeometry[] = [];
    const stripGeos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < FRAMES; i++) {
      const m = frameMatrix(i);
      const surface = new MediaSurface(PHOTO_W / PHOTO_H);
      surfaces.push(surface);
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(PHOTO_W, PHOTO_H),
        surface.material,
      );
      panel.applyMatrix4(m);
      panels.push(panel);
      const back = new THREE.PlaneGeometry(PHOTO_W, PHOTO_H);
      back.rotateY(Math.PI);
      back.translate(0, 0, -0.02);
      back.applyMatrix4(m);
      backGeos.push(back);
      barGeos.push(frameBars(PHOTO_W, PHOTO_H).applyMatrix4(m));
      stripGeos.push(accentStrip(PHOTO_W, PHOTO_H).applyMatrix4(m));
    }
    const std = () =>
      new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
    const backs = new THREE.Mesh(mergeGeometries(backGeos, false), std());
    const bars = new THREE.Mesh(mergeGeometries(barGeos, false), std());
    const strips = new THREE.Mesh(mergeGeometries(stripGeos, false), std());
    for (const g of [...backGeos, ...barGeos, ...stripGeos]) g.dispose();
    group.add(...panels, backs, bars, strips);
    for (const mesh of [...panels, backs, bars, strips]) mesh.castShadow = true;
    return { group, surfaces, panels, backs, bars, strips };
  }, []);

  useEffect(() => {
    parts.surfaces.forEach((s, i) => {
      s.setSource(gallery[i]?.src);
    });
  }, [parts]);

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    for (const s of parts.surfaces) s.setPalette(palette);
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
    paint(parts.backs, palette["surface-2"], 0);
    paint(parts.bars, palette.border, 0);
    paint(parts.strips, palette.accent, 0.7);
  }, [palette, parts]);

  useEffect(() => {
    return () => {
      for (const s of parts.surfaces) s.dispose();
      for (const p of parts.panels) p.geometry.dispose();
      for (const mesh of [parts.backs, parts.bars, parts.strips]) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
    };
  }, [parts]);

  useFrame((_, dt) => {
    const visible = parts.group.parent?.visible ?? false;
    for (const s of parts.surfaces) s.tick(dt, visible);
    if (!visible || reducedMotion) return;
    parts.group.rotation.y += SPIN * dt;
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
