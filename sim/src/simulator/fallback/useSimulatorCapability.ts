import { useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Below this width the world cannot show enough to be worth the download. */
export const MIN_WIDTH = 380;

/**
 * Why a visitor gets the static page. `reduced-motion` is the only reason
 * they may override: the simulator then cuts between rail points instead
 * of gliding.
 */
export type Capability = "simulator" | "reduced-motion" | "narrow" | "no-webgl";

let webgl: boolean | null = null;

function hasWebGL(): boolean {
  if (webgl === null) {
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

export function decideCapability(input: {
  reducedMotion: boolean;
  width: number;
  webgl: boolean;
}): Capability {
  if (!input.webgl) return "no-webgl";
  if (input.width < MIN_WIDTH) return "narrow";
  if (input.reducedMotion) return "reduced-motion";
  return "simulator";
}

function snapshot(): Capability {
  return decideCapability({
    reducedMotion: window.matchMedia(REDUCED).matches,
    width: window.innerWidth,
    webgl: hasWebGL(),
  });
}

function subscribe(listener: () => void) {
  const mql = window.matchMedia(REDUCED);
  mql.addEventListener("change", listener);
  window.addEventListener("resize", listener);
  return () => {
    mql.removeEventListener("change", listener);
    window.removeEventListener("resize", listener);
  };
}

export function useSimulatorCapability(): Capability {
  return useSyncExternalStore(subscribe, snapshot);
}
