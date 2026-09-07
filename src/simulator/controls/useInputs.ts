import { useEffect } from "react";
import { frame, sim } from "../simStore.ts";
import type { FlightInput } from "./flightController.ts";

/** Screens of scroll that map onto the full rail loop. */
export const RAIL_SCREENS = 14;

const KEYBOARD_QUERY = "(hover: hover) and (pointer: fine)";

const THROTTLE_KEYS: Record<string, number> = {
  KeyW: 1,
  ArrowUp: 1,
  KeyS: -1,
  ArrowDown: -1,
};
const STEER_KEYS: Record<string, number> = {
  KeyA: -1,
  ArrowLeft: -1,
  KeyD: 1,
  ArrowRight: 1,
};

const FLIGHT_THROTTLE_KEYS: Record<string, number> = { KeyW: 1, KeyS: -1 };
const FLIGHT_STEER_KEYS: Record<string, number> = {
  KeyA: -1,
  ArrowLeft: -1,
  KeyD: 1,
  ArrowRight: 1,
};
const FLIGHT_PITCH_KEYS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };
const FLIGHT_KEYS = new Set([
  ...Object.keys(FLIGHT_THROTTLE_KEYS),
  ...Object.keys(FLIGHT_STEER_KEYS),
  ...Object.keys(FLIGHT_PITCH_KEYS),
]);

/** Held keys to a flight input: W/S throttle, A/D bank, arrows climb and dive. */
export function flightFromKeys(pressed: ReadonlySet<string>): FlightInput {
  let throttle = 0;
  let steer = 0;
  let pitch = 0;
  for (const code of pressed) {
    throttle += FLIGHT_THROTTLE_KEYS[code] ?? 0;
    steer += FLIGHT_STEER_KEYS[code] ?? 0;
    pitch += FLIGHT_PITCH_KEYS[code] ?? 0;
  }
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  return {
    throttle: clamp(throttle),
    steer: clamp(steer),
    pitch: clamp(pitch),
  };
}

/** Translates held keys into a drive input; opposite keys cancel. */
export function inputFromKeys(pressed: ReadonlySet<string>) {
  let throttle = 0;
  let steer = 0;
  for (const code of pressed) {
    throttle += THROTTLE_KEYS[code] ?? 0;
    steer += STEER_KEYS[code] ?? 0;
  }
  return {
    throttle: Math.max(-1, Math.min(1, throttle)),
    steer: Math.max(-1, Math.min(1, steer)),
  };
}

export function scrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/**
 * DOM side of the controls: scroll and a click-and-drag look feed the
 * rails camera, keys feed the drive and flight models, F, T and Escape
 * switch modes. Losing focus or the tab clears every held key so neither
 * vehicle ever drives itself.
 */
export function useInputs(): void {
  useEffect(() => {
    const pressed = new Set<string>();
    const mql = window.matchMedia(KEYBOARD_QUERY);
    const updateKeyboard = () => sim.set({ hasKeyboard: mql.matches });
    updateKeyboard();
    mql.addEventListener("change", updateKeyboard);

    const onScroll = () => {
      frame.scrollT = scrollProgress();
    };
    // Click and drag on the world to look around. Only the canvas starts a
    // drag, so the overlays keep their clicks; a finger dragging the page
    // is scrolling, not looking.
    let dragPointer: number | null = null;
    let dragX = 0;
    let dragY = 0;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType === "touch") return;
      if (!(e.target instanceof HTMLCanvasElement)) return;
      if (sim.get().mode !== "rails") return;
      dragPointer = e.pointerId;
      dragX = e.clientX;
      dragY = e.clientY;
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic or already-released pointer: window listeners still track it */
      }
      e.target.style.cursor = "grabbing";
      frame.look.begin();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== dragPointer) return;
      const h = window.innerHeight || 1;
      frame.look.move((e.clientX - dragX) / h, (e.clientY - dragY) / h);
      dragX = e.clientX;
      dragY = e.clientY;
    };
    const endDrag = (e?: PointerEvent) => {
      if (dragPointer === null || (e && e.pointerId !== dragPointer)) return;
      if (e?.target instanceof HTMLCanvasElement) e.target.style.cursor = "";
      dragPointer = null;
      frame.look.end();
    };
    const release = () => {
      pressed.clear();
      frame.input = { throttle: 0, steer: 0 };
      frame.flight = flightFromKeys(pressed);
      endDrag();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.target instanceof Element &&
        e.target.closest("input, textarea, [contenteditable]")
      ) {
        return;
      }
      const mode = sim.get().mode;
      if (e.code === "KeyF") {
        e.preventDefault();
        if (mode !== "flying") {
          sim.dispatch({ type: mode === "driving" ? "RELEASE" : "TAKE_WHEEL" });
        }
        return;
      }
      if (e.code === "KeyT") {
        e.preventDefault();
        if (mode !== "driving") {
          sim.dispatch({ type: mode === "flying" ? "LAND" : "TAKE_OFF" });
        }
        return;
      }
      if (e.code === "Escape") {
        if (mode === "driving") sim.dispatch({ type: "RELEASE" });
        if (mode === "flying") sim.dispatch({ type: "LAND" });
        return;
      }
      if (mode === "driving") {
        if (e.code in THROTTLE_KEYS || e.code in STEER_KEYS) {
          e.preventDefault();
          pressed.add(e.code);
          frame.input = inputFromKeys(pressed);
        }
      } else if (mode === "flying") {
        if (FLIGHT_KEYS.has(e.code)) {
          e.preventDefault();
          pressed.add(e.code);
          frame.flight = flightFromKeys(pressed);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (pressed.delete(e.code)) {
        frame.input = inputFromKeys(pressed);
        frame.flight = flightFromKeys(pressed);
      }
    };
    const onVisibility = () => {
      if (document.hidden) release();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mql.removeEventListener("change", updateKeyboard);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Lock page scroll while piloting so the keys never move the page.
  useEffect(() => {
    return sim.subscribe(() => {
      const mode = sim.get().mode;
      const piloting = mode === "driving" || mode === "flying";
      document.documentElement.style.overflow = piloting ? "hidden" : "";
    });
  }, []);
}
