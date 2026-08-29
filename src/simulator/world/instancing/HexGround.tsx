import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { frame, sim, useSim } from "../../simStore.ts";
import {
  gradientOklab,
  mixOklab,
  oklabToSrgb,
  srgbToOklab,
} from "../../theme/oklab.ts";
import type { ZoneMeta } from "../meta.ts";
import { type HexCell, hexLayout } from "./hexGrid.ts";

export const FIELD_SIZE = 150;
export const HEX_RADIUS = 1.55;
const HEX_HEIGHT = 0.22;
const GAP = 0.9;
/** Hexes within this distance of the probe light up. */
const GLOW_RADIUS = 9;

interface HexGroundProps {
  zone: ZoneMeta;
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * Cypher's map as the Evidence district floor: ~3,400 instanced hex prisms
 * colored green to red by risk, faded by confidence, in one draw call.
 * The cells under the camera aim (on rails) or the Dozer brighten, like
 * the map reacting to where you look.
 */
export function HexGround({ zone, onMount }: HexGroundProps) {
  const palette = useSim((s) => s.palette);
  const cells = useMemo(() => hexLayout(FIELD_SIZE, HEX_RADIUS), []);
  const base = useRef<Float32Array>(new Float32Array(0));
  const lit = useRef(new Set<number>());

  const mesh = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(
      HEX_RADIUS * GAP,
      HEX_RADIUS * GAP,
      HEX_HEIGHT,
      6,
      1,
      false,
    );
    geometry.translate(0, HEX_HEIGHT / 2, 0);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0,
    });
    const instanced = new THREE.InstancedMesh(geometry, material, cells.length);
    const m = new THREE.Matrix4();
    cells.forEach((cell, i) => {
      m.makeTranslation(
        zone.position[0] + cell.x,
        zone.position[1] + 0.2,
        zone.position[2] + cell.z,
      );
      instanced.setMatrixAt(i, m);
    });
    instanced.instanceMatrix.needsUpdate = true;
    instanced.name = "evidence.cypher.hexes";
    return instanced;
  }, [cells, zone]);

  useEffect(() => {
    if (!palette) return;
    const stops = [
      srgbToOklab(palette["hue-green"]),
      srgbToOklab(palette["hue-amber"]),
      srgbToOklab(palette["hue-rose"]),
    ];
    const faded = srgbToOklab(palette["surface-2"]);
    const colors = new Float32Array(cells.length * 3);
    const color = new THREE.Color();
    cells.forEach((cell: HexCell, i) => {
      const risk = gradientOklab(stops, cell.risk);
      const rgb = oklabToSrgb(
        mixOklab(faded, risk, 0.25 + 0.75 * cell.confidence),
      );
      color.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      mesh.setColorAt(i, color);
    });
    base.current = colors;
    lit.current.clear();
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [palette, cells, mesh]);

  useEffect(() => {
    return () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.dispose();
    };
  }, [mesh]);

  const glow = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const colors = base.current;
    if (colors.length === 0 || !mesh.instanceColor) return;
    const probe = frame.probe;
    const px = probe[0] - zone.position[0];
    const pz = probe[2] - zone.position[2];
    if (
      Math.abs(px) > FIELD_SIZE / 2 + GLOW_RADIUS ||
      Math.abs(pz) > FIELD_SIZE / 2 + GLOW_RADIUS
    ) {
      if (lit.current.size === 0) return;
    }
    const pal = sim.get().palette;
    // Brighten toward whichever of surface or text is lighter this theme.
    const target = pal
      ? luma(pal.surface) > luma(pal.text)
        ? pal.surface
        : pal.text
      : null;
    let changed = false;
    // Restore the previously lit cells, then light the current ones.
    for (const i of lit.current) {
      mesh.setColorAt(
        i,
        glow.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]),
      );
      changed = true;
    }
    lit.current.clear();
    if (target) {
      for (let i = 0; i < cells.length; i++) {
        const dx = cells[i].x - px;
        const dz = cells[i].z - pz;
        const d2 = dx * dx + dz * dz;
        if (d2 > GLOW_RADIUS * GLOW_RADIUS) continue;
        const k = 0.55 * (1 - Math.sqrt(d2) / GLOW_RADIUS);
        glow.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]);
        glow.lerp(toColor(target), k);
        mesh.setColorAt(i, glow);
        lit.current.add(i);
        changed = true;
      }
    }
    if (changed) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group
      ref={(group) => {
        if (group && onMount)
          onMount(group, new THREE.Vector3(...zone.position));
      }}
    >
      <primitive object={mesh} />
    </group>
  );
}

const scratch = new THREE.Color();

function toColor(rgb: { r: number; g: number; b: number }): THREE.Color {
  return scratch.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

function luma(rgb: { r: number; g: number; b: number }): number {
  return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}
