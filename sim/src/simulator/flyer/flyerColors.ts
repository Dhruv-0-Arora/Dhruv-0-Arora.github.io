import * as THREE from "three";
import type { Palette, Rgba } from "../theme/palette.ts";

export function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

export interface FlyerColors {
  /** Dark theme: the fabric glows faintly so it reads against the night. */
  night: boolean;
  fabric: THREE.Color;
  wood: THREE.Color;
  metal: THREE.Color;
  cloth: THREE.Color;
}

/**
 * The Flyer's materials from the palette, shared by the airframe and the
 * debris it leaves when it crashes.
 */
export function flyerColors(palette: Palette): FlyerColors {
  const night = palette.bg.r < 0.5;
  return {
    night,
    // Unbleached muslin: the snow tone warmed a touch toward amber.
    fabric: toColor(palette.snow).lerp(
      toColor(palette["hue-amber"]),
      night ? 0.04 : 0.07,
    ),
    // Varnished spruce: amber pulled toward the warm surface tone by day
    // (a pale tan), toward the text tone at night.
    wood: toColor(
      night ? palette["hue-amber"] : palette["hue-amber-vivid"],
    ).lerp(
      toColor(night ? palette.text : palette["surface-2"]),
      night ? 0.25 : 0.45,
    ),
    // Cast iron and aluminium: a dark grey rather than the text black.
    metal: toColor(palette.text).lerp(toColor(palette.muted), 0.5),
    cloth: toColor(palette.text).lerp(toColor(palette.muted), 0.15),
  };
}
