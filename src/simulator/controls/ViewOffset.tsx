import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PANEL_ATTR, panel } from "../overlay/panelState.ts";
import { sim } from "../simStore.ts";
import type { ControlMode } from "./controlMachine.ts";

/** Tailwind's `md`, where the panel stops being a bottom sheet. */
const WIDE_QUERY = "(min-width: 48rem)";

/** Offset follow rate, 1/s: about 95% of the way in 250 ms. */
const RATE = 12;

/** Below this many pixels the projection is plain again. */
const EPSILON = 0.25;

export interface ShiftInput {
  mode: ControlMode;
  /** The viewport is at least `md` wide. */
  wide: boolean;
  /** The panel is shown at all (there is a zone). */
  present: boolean;
  collapsed: boolean;
  /** Right edge of the open panel's layout box, CSS px from the left. */
  panelRight: number;
}

/**
 * How far right to slide the image, CSS px, so the point the camera aims
 * at sits in the middle of the world the panel leaves free rather than
 * behind the panel. Half the panel's right edge puts the aim halfway
 * between that edge and the right of the screen. Only on the rails (and
 * the glide back to them), and only where the panel sits beside the world
 * rather than under it.
 */
export function shiftGoal(input: ShiftInput): number {
  const onRails = input.mode === "rails" || input.mode === "returning";
  if (!onRails || !input.wide || !input.present || input.collapsed) return 0;
  return Math.max(0, input.panelRight) / 2;
}

/** One frame of the follow; reduced motion lands at once. */
export function followShift(
  current: number,
  goal: number,
  dt: number,
  reducedMotion: boolean,
): number {
  if (reducedMotion) return goal;
  const next = current + (goal - current) * (1 - Math.exp(-RATE * dt));
  return Math.abs(goal - next) < EPSILON ? goal : next;
}

/**
 * Off-centre projection beside the project panel. The camera keeps its
 * aim; the view window slides so that aim lands in the free part of the
 * screen, the same centre the hop bar uses. It eases with the panel and
 * eases away when the visitor takes a vehicle.
 */
export function ViewOffset() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const panelRight = useRef(0);
  const wide = useRef(false);
  const shift = useRef(0);

  // The panel's layout box, transforms aside: the collapse slide moves it
  // with a transform, and the goal is what it settles to, not where it is.
  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    let el: HTMLElement | null = null;
    const measure = () => {
      wide.current = mql.matches;
      el ??= document.querySelector<HTMLElement>(`[${PANEL_ATTR}]`);
      panelRight.current = el ? el.offsetLeft + el.offsetWidth : 0;
    };
    const ro = new ResizeObserver(measure);
    const attach = () => {
      el = document.querySelector<HTMLElement>(`[${PANEL_ATTR}]`);
      if (el) ro.observe(el);
      measure();
    };
    attach();
    // The shell renders the panel before the world loads, so it is almost
    // always there already; if not, one more look a frame later.
    const id = requestAnimationFrame(() => {
      if (!el) attach();
    });
    mql.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      mql.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.clearViewOffset();
      }
    };
  }, [camera]);

  useFrame((_, rawDt) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const snap = sim.get();
    const { collapsed } = panel.get();
    const goal = shiftGoal({
      mode: snap.mode,
      wide: wide.current,
      present: snap.zone !== null,
      collapsed,
      panelRight: panelRight.current,
    });
    const before = shift.current;
    shift.current = followShift(
      before,
      goal,
      Math.min(rawDt, 0.1),
      snap.reducedMotion,
    );
    const x = shift.current;
    const view = camera.view;
    const { width: w, height: h } = size;
    if (x === 0) {
      if (view?.enabled) {
        camera.clearViewOffset();
      }
      return;
    }
    // A window starting left of the full frame slides the picture right.
    if (
      view?.enabled &&
      view.offsetX === -x &&
      view.fullWidth === w &&
      view.fullHeight === h
    ) {
      return;
    }
    camera.setViewOffset(w, h, -x, 0, w, h);
  });

  return null;
}
