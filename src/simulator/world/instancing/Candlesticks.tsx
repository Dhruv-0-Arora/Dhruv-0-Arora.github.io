import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../../simStore.ts";
import type { ZoneMeta } from "../meta.ts";
import { type Candle, ohlcSeries, type SeriesShape } from "./ohlc.ts";

/** Plinth footprint the series fits inside, meters. */
const WIDTH = 18;
const HEIGHT = 11;
const BODY_W = 0.34;
const WICK_W = 0.07;

interface CandlesticksProps {
  zone: ZoneMeta;
  shape: SeriesShape;
  name: string;
  onMount?: (group: THREE.Group, center: THREE.Vector3) => void;
}

/**
 * A candlestick chart standing on its plinth: bodies and wicks as two
 * instanced meshes, green up and red down, scaled so the series fills the
 * plinth and the zero line sits at the base.
 */
export function Candlesticks({
  zone,
  shape,
  name,
  onMount,
}: CandlesticksProps) {
  const palette = useSim((s) => s.palette);
  const candles = useMemo(() => ohlcSeries(shape), [shape]);

  const meshes = useMemo(() => {
    const unit = new THREE.BoxGeometry(1, 1, 1);
    unit.translate(0, 0.5, 0);
    const bodyMat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0,
    });
    const wickMat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0,
    });
    const bodies = new THREE.InstancedMesh(unit, bodyMat, candles.length);
    const wicks = new THREE.InstancedMesh(
      unit.clone(),
      wickMat,
      candles.length,
    );
    const lo = Math.min(...candles.map((c: Candle) => c.low));
    const hi = Math.max(...candles.map((c: Candle) => c.high));
    const scale = HEIGHT / (hi - lo || 1);
    const pitch = WIDTH / candles.length;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const baseY = zone.position[1] + 1.0;
    candles.forEach((c, i) => {
      const x = zone.position[0] - WIDTH / 2 + pitch * (i + 0.5);
      const z = zone.position[2];
      const bodyLo = (Math.min(c.open, c.close) - lo) * scale;
      const bodyH = Math.max(0.06, Math.abs(c.close - c.open) * scale);
      p.set(x, baseY + bodyLo, z);
      s.set(BODY_W, bodyH, BODY_W);
      m.compose(p, q, s);
      bodies.setMatrixAt(i, m);
      p.set(x, baseY + (c.low - lo) * scale, z);
      s.set(WICK_W, (c.high - c.low) * scale, WICK_W);
      m.compose(p, q, s);
      wicks.setMatrixAt(i, m);
    });
    bodies.instanceMatrix.needsUpdate = true;
    wicks.instanceMatrix.needsUpdate = true;
    bodies.name = `${name}.bodies`;
    wicks.name = `${name}.wicks`;
    return { bodies, wicks };
  }, [candles, zone, name]);

  useEffect(() => {
    if (!palette) return;
    const up = new THREE.Color().setRGB(
      palette["hue-green"].r,
      palette["hue-green"].g,
      palette["hue-green"].b,
      THREE.SRGBColorSpace,
    );
    const down = new THREE.Color().setRGB(
      palette["hue-rose"].r,
      palette["hue-rose"].g,
      palette["hue-rose"].b,
      THREE.SRGBColorSpace,
    );
    candles.forEach((c, i) => {
      const color = c.close >= c.open ? up : down;
      meshes.bodies.setColorAt(i, color);
      meshes.wicks.setColorAt(i, color);
    });
    for (const mesh of [meshes.bodies, meshes.wicks]) {
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = palette.bg.r < 0.5 ? 0.35 : 0;
      mat.emissive.setRGB(1, 1, 1);
    }
  }, [palette, candles, meshes]);

  useEffect(() => {
    return () => {
      for (const mesh of [meshes.bodies, meshes.wicks]) {
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
      <primitive object={meshes.bodies} />
      <primitive object={meshes.wicks} />
    </group>
  );
}
