import { useSyncExternalStore } from "react";
import {
  type ControlEvent,
  type ControlMode,
  transition,
} from "./controls/controlMachine.ts";
import type { DriveInput } from "./controls/driveController.ts";
import type { Palette } from "./theme/palette.ts";
import type { District, ZoneSlug } from "./world/contract.ts";

/** React-visible state: changes here re-render the HUD and dock. */
export interface SimSnapshot {
  mode: ControlMode;
  zone: ZoneSlug | null;
  /** Shared world (meta + shared.glb) is in the scene. */
  worldReady: boolean;
  /** The Dozer is parsed and in the scene. */
  dozerReady: boolean;
  /** District currently streaming in, for the "LOADING SECTOR" line. */
  loading: District | null;
  loaded: readonly District[];
  /** Keyboard-and-pointer device; touch-only visitors stay on rails. */
  hasKeyboard: boolean;
  /** Visitor prefers reduced motion but entered anyway: cut, never glide. */
  reducedMotion: boolean;
  /** Current token colors, read from CSS; instancers derive colors from it. */
  palette: Palette | null;
  /** The Dozer left the world and is being put back on the nearest rail point. */
  signalLost: boolean;
  stats: { fps: number; calls: number; triangles: number };
}

/** Per-frame values written by DOM listeners and read in useFrame. No React. */
export interface FrameState {
  /** Scroll progress 0..1 along the rail. */
  scrollT: number;
  /** Pointer in [-1, 1], +x right, +y up. */
  pointerX: number;
  pointerY: number;
  input: DriveInput;
  /** Rail t the camera is gliding back to; null until computed. */
  returnT: number | null;
  /** Where attention is: the camera aim on rails, the Dozer when driving. */
  probe: [number, number, number];
}

const initial: SimSnapshot = {
  mode: "rails",
  zone: null,
  worldReady: false,
  dozerReady: false,
  loading: null,
  loaded: [],
  hasKeyboard: false,
  reducedMotion: false,
  palette: null,
  signalLost: false,
  stats: { fps: 0, calls: 0, triangles: 0 },
};

let snapshot: SimSnapshot = initial;
const listeners = new Set<() => void>();

export const frame: FrameState = {
  scrollT: 0,
  pointerX: 0,
  pointerY: 0,
  input: { throttle: 0, steer: 0 },
  returnT: null,
  probe: [0, 0, 0],
};

function emit() {
  for (const l of listeners) l();
}

export const sim = {
  get(): SimSnapshot {
    return snapshot;
  },
  set(patch: Partial<SimSnapshot>): void {
    snapshot = { ...snapshot, ...patch };
    emit();
  },
  canDrive(): boolean {
    return snapshot.hasKeyboard && snapshot.worldReady && snapshot.dozerReady;
  },
  dispatch(event: ControlEvent): ControlMode {
    const next = transition(snapshot.mode, event, { canDrive: sim.canDrive() });
    if (next !== snapshot.mode) {
      if (next === "returning") frame.returnT = null;
      if (next !== "driving") frame.input = { throttle: 0, steer: 0 };
      sim.set({ mode: next });
    }
    return next;
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Test hook. */
  reset(): void {
    snapshot = initial;
    frame.scrollT = 0;
    frame.pointerX = 0;
    frame.pointerY = 0;
    frame.input = { throttle: 0, steer: 0 };
    frame.returnT = null;
    frame.probe = [0, 0, 0];
    emit();
  },
};

export function useSim<T>(selector: (s: SimSnapshot) => T): T {
  return useSyncExternalStore(sim.subscribe, () => selector(snapshot));
}
