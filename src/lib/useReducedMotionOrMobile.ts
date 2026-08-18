import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(listener: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", listener);
  window.addEventListener("resize", listener);
  return () => {
    mql.removeEventListener("change", listener);
    window.removeEventListener("resize", listener);
  };
}

function shouldUseStatic(): boolean {
  if (window.matchMedia(QUERY).matches) return true;
  const weakDevice = (navigator.hardwareConcurrency ?? 8) <= 4;
  return window.innerWidth < 640 && weakDevice;
}

/** True when the hero should render a static poster instead of the 3D canvas. */
export function useReducedMotionOrMobile(): boolean {
  return useSyncExternalStore(subscribe, shouldUseStatic);
}
