import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../../lib/theme";
import { sim } from "../simStore.ts";
import { readPalette } from "./palette.ts";
import { type MaterialRegistry, RETINT_MS } from "./retint.ts";

// Wide enough that the mountain ring (250 to 470 m out) fades into the sky
// rather than vanishing; districts are culled well inside this range.
const FOG_NEAR = 200;
const FOG_FAR = 760;

function readCssPalette() {
  const style = getComputedStyle(document.documentElement);
  return readPalette((prop) => style.getPropertyValue(prop));
}

/**
 * Keeps the world painted in the page's tokens. Reads `--c-*` from the DOM
 * on every theme change, hands the palette to the registry, and lerps the
 * scene background and fog alongside so the horizon never flashes.
 */
export function useRetint(registry: MaterialRegistry): void {
  const [theme] = useTheme();
  const scene = useThree((s) => s.scene);
  const first = useRef(true);
  const bgFrom = useRef(new THREE.Color());
  const bgTo = useRef(new THREE.Color());
  const elapsed = useRef(RETINT_MS);

  useEffect(() => {
    const palette = readCssPalette();
    const immediate = first.current;
    first.current = false;
    registry.apply(palette, theme, immediate);
    sim.set({ palette });

    const bg = palette.bg;
    bgTo.current.setRGB(bg.r, bg.g, bg.b, THREE.SRGBColorSpace);
    if (!(scene.background instanceof THREE.Color)) {
      scene.background = bgTo.current.clone();
    }
    if (!(scene.fog instanceof THREE.Fog)) {
      scene.fog = new THREE.Fog(bgTo.current.clone(), FOG_NEAR, FOG_FAR);
    }
    bgFrom.current.copy(scene.background);
    elapsed.current = immediate ? RETINT_MS : 0;
  }, [theme, registry, scene]);

  useFrame((_, dt) => {
    registry.tick(dt * 1000);
    if (elapsed.current >= RETINT_MS) return;
    elapsed.current = Math.min(RETINT_MS, elapsed.current + dt * 1000);
    const f = elapsed.current / RETINT_MS;
    const eased = f * (2 - f);
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(bgFrom.current).lerp(bgTo.current, eased);
    }
    if (
      scene.fog instanceof THREE.Fog &&
      scene.background instanceof THREE.Color
    ) {
      scene.fog.color.copy(scene.background);
    }
  });
}
