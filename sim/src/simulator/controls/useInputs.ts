import { useEffect } from "react";
import { frame, sim } from "../simStore.ts";
import type { FlightInput } from "./flightController.ts";
import {
  attachScroller,
  keyHop,
  scroller,
  scrollMax,
  scrollProgress,
} from "./scroller.ts";
import { railFromScroll } from "./stations.ts";
import { WheelIntent } from "./wheelIntent.ts";

/**
 * Screens of scroll for the full lap round the range. The stations layout
 * (`stations.ts`) decides how those screens are shared between dwelling at
 * a project and travelling to the next; this is the only overall length.
 */
export const RAIL_SCREENS = 16;

const KEYBOARD_QUERY = "(hover: hover) and (pointer: fine)";

/** Vertical finger travel that makes a swipe a hop, px. */
export const SWIPE_PX = 40;

/**
 * Whether an event target sits inside something that scrolls on its own
 * (the project panel), and can still scroll in the direction asked
 * (`dy` > 0 is down). Those keep their native wheel, touch and keys.
 */
export function insideScrollable(
  target: EventTarget | null,
  dy: number,
): {
  inside: boolean;
  canScroll: boolean;
} {
  let el = target instanceof Element ? target : null;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.scrollHeight > el.clientHeight + 1) {
      const overflow = getComputedStyle(el).overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        const canScroll =
          dy > 0
            ? el.scrollTop + el.clientHeight < el.scrollHeight - 1
            : el.scrollTop > 0;
        return { inside: true, canScroll };
      }
    }
    el = el.parentElement;
  }
  return { inside: false, canScroll: false };
}

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

/**
 * Rail t the page scroll asks for: through the stations layout once the
 * world meta is in, linear before that.
 */
export function scrollTargetT(): number {
  const s = scrollProgress();
  return frame.layout ? railFromScroll(s, frame.layout) : s;
}

/**
 * DOM side of the controls: scroll and a click-and-drag look feed the
 * rails camera, keys feed the drive and flight models, F, T and Escape
 * switch modes. On rails the wheel, a swipe and the page keys never
 * scroll the page freely: each gesture is one hop to the next or previous
 * station, so a trackpad flick and its momentum land on exactly one site.
 * The page scroll stays the state the hop writes to, so a reload, the
 * glide back from a vehicle and the scrollbar keep working.
 * Losing focus or the tab clears every held key so neither vehicle ever
 * drives itself.
 */
export function useInputs(): void {
  useEffect(() => {
    const pressed = new Set<string>();
    const mql = window.matchMedia(KEYBOARD_QUERY);
    const updateKeyboard = () => sim.set({ hasKeyboard: mql.matches });
    updateKeyboard();
    mql.addEventListener("change", updateKeyboard);

    // The page is RAIL_SCREENS viewports tall, so a resize changes what a
    // pixel of scroll means; the scroll is put back to the same fraction,
    // or a resized window (or a phone's URL bar) would move the train.
    let progress = scrollProgress();
    const onScroll = () => {
      progress = scrollProgress();
      frame.scrollT = scrollTargetT();
    };
    const onResize = () => {
      // A hop in flight is aimed in old pixels: restart it in the new ones.
      const heading = scroller.heading;
      scroller.cancel();
      const top = progress * scrollMax();
      if (Math.abs(window.scrollY - top) >= 1) {
        window.scrollTo({ top, behavior: "instant" });
      }
      frame.scrollT = scrollTargetT();
      if (heading !== null) scroller.jumpTo(heading);
    };

    // Wheel: one hop per gesture. Pinch-zoom (ctrl+wheel) and the panel's
    // own scrolling are left to the browser.
    const wheel = new WheelIntent();
    const onWheel = (e: WheelEvent) => {
      if (sim.get().mode !== "rails" || e.ctrlKey) return;
      const nested = insideScrollable(e.target, e.deltaY);
      if (nested.inside) {
        // Scroll the panel; at its edge, swallow rather than chain to the page.
        if (!nested.canScroll) e.preventDefault();
        wheel.reset();
        return;
      }
      e.preventDefault();
      const hop = wheel.push(
        e.deltaY,
        e.deltaMode,
        e.timeStamp,
        window.innerHeight,
      );
      if (hop !== 0) scroller.jumpToStation(hop);
    };

    // Touch: a vertical swipe is one hop, however far it goes.
    let touchId: number | null = null;
    let touchX = 0;
    let touchY = 0;
    let swiped = false;
    let touchNested = false;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touchId = null;
        return;
      }
      const t = e.touches[0];
      touchId = t.identifier;
      touchX = t.clientX;
      touchY = t.clientY;
      swiped = false;
      touchNested = insideScrollable(e.target, 1).inside;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (sim.get().mode !== "rails" || touchId === null || touchNested) return;
      const t = [...e.changedTouches].find((c) => c.identifier === touchId);
      if (!t) return;
      if (e.cancelable) e.preventDefault();
      if (swiped) return;
      const dx = t.clientX - touchX;
      const dy = t.clientY - touchY;
      if (Math.abs(dy) >= SWIPE_PX && Math.abs(dy) > Math.abs(dx)) {
        swiped = true;
        // A finger moving up pulls the page down: the next site.
        scroller.jumpToStation(dy < 0 ? 1 : -1);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if ([...e.changedTouches].some((c) => c.identifier === touchId)) {
        touchId = null;
      }
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
      if (mode === "rails") {
        // Station hops. The arrows steer and bank in the vehicles, so this
        // only runs on rails. A held key hops once, not once per repeat.
        const hop = keyHop(e.code, e.shiftKey);
        if (hop === null) return;
        // Space presses a focused button; the panel's own scroll keeps
        // its arrows and page keys while it can still move.
        if (
          e.code === "Space" &&
          e.target instanceof Element &&
          e.target.closest("button, a, summary, [role=button]")
        ) {
          return;
        }
        const nested = insideScrollable(e.target, hop === -1 ? -1 : 1);
        if (nested.inside && nested.canScroll) return;
        e.preventDefault();
        if (e.repeat) return;
        const last = (frame.layout?.stations.length ?? 1) - 1;
        if (hop === "first") scroller.jumpTo(0);
        else if (hop === "last") scroller.jumpTo(last);
        else scroller.jumpToStation(hop);
      } else if (mode === "driving") {
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
    const detachScroller = attachScroller();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
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
      detachScroller();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
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
