import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../../simStore.ts";
import type { ZoneMeta } from "../meta.ts";
import {
  type CandleBox,
  type ChartLayout,
  candleBoxes,
  ohlcSeries,
  type SeriesShape,
} from "./ohlc.ts";

/** Plinth footprint the series fits inside, meters. */
const LAYOUT: ChartLayout = {
  width: 18,
  height: 11,
  bodyWidth: 0.34,
  wickWidth: 0.07,
  minBody: 0.06,
};
/** Night glow, as a fraction of each direction's own hue. */
const NIGHT_GLOW = 0.35;

interface CandlesticksProps {
  zone: ZoneMeta;
  shape: SeriesShape;
  name: string;
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

function instanced(
  unit: THREE.BufferGeometry,
  boxes: readonly CandleBox[],
  zone: ZoneMeta,
  name: string,
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(
    unit,
    new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 }),
    boxes.length,
  );
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const baseY = zone.position[1] + 1.0;
  boxes.forEach((b, i) => {
    p.set(zone.position[0] + b.x, baseY + b.y, zone.position[2]);
    s.set(b.width, b.height, b.width);
    m.compose(p, q, s);
    mesh.setMatrixAt(i, m);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.name = name;
  return mesh;
}

/**
 * A candlestick chart standing on its plinth, green up and red down, scaled
 * so the series fills the plinth and the zero line sits at the base.
 * One instanced mesh per direction, bodies and wicks together, so each
 * material can glow in its own hue at night: a single mesh with instance
 * colors would glow one shared color and wash both hues out to gray.
 */
export function Candlesticks({
  zone,
  shape,
  name,
  onMount,
}: CandlesticksProps) {
  const palette = useSim((s) => s.palette);

  const meshes = useMemo(() => {
    const { up, down } = candleBoxes(ohlcSeries(shape), LAYOUT);
    const unit = new THREE.BoxGeometry(1, 1, 1);
    unit.translate(0, 0.5, 0);
    return {
      up: instanced(unit, up, zone, `${name}.up`),
      down: instanced(unit.clone(), down, zone, `${name}.down`),
    };
  }, [shape, zone, name]);

  useEffect(() => {
    if (!palette) return;
    const glow = palette.bg.r < 0.5 ? NIGHT_GLOW : 0;
    const paint = (
      mesh: THREE.InstancedMesh,
      rgb: { r: number; g: number; b: number },
    ) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
      mat.emissive.copy(mat.color);
      mat.emissiveIntensity = glow;
    };
    paint(meshes.up, palette["hue-green"]);
    paint(meshes.down, palette["hue-rose"]);
  }, [palette, meshes]);

  useEffect(() => {
    return () => {
      for (const mesh of [meshes.up, meshes.down]) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        mesh.dispose();
      }
    };
  }, [meshes]);

  return (
    <group
      ref={(group) => {
        if (group && onMount)
          onMount(group, new THREE.Vector3(...zone.position));
      }}
    >
      <primitive object={meshes.up} />
      <primitive object={meshes.down} />
    </group>
  );
}
