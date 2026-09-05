import { useSyncExternalStore } from "react";
import type { ZoneSlug } from "../world/contract.ts";

/**
 * Open or collapsed state of the project panel, remembered across visits.
 * A zone change while collapsed bumps `pulse`, which the edge tab animates
 * so the visitor knows there is something new to read.
 */
export interface PanelState {
  collapsed: boolean;
  pulse: number;
}

export type PanelEvent =
  | { type: "toggle" }
  | { type: "zone"; zone: ZoneSlug | null };

export const STORAGE_KEY = "sim.panel";

export function nextPanel(state: PanelState, event: PanelEvent): PanelState {
  switch (event.type) {
    case "toggle":
      return { collapsed: !state.collapsed, pulse: 0 };
    case "zone":
      return state.collapsed && event.zone !== null
        ? { ...state, pulse: state.pulse + 1 }
        : state;
  }
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readCollapsed(storage: StorageLike | null): boolean {
  try {
    return storage?.getItem(STORAGE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

export function writeCollapsed(
  storage: StorageLike | null,
  collapsed: boolean,
): void {
  try {
    storage?.setItem(STORAGE_KEY, collapsed ? "collapsed" : "open");
  } catch {
    /* private mode or quota: the panel simply forgets */
  }
}

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

let state: PanelState = {
  collapsed: readCollapsed(browserStorage()),
  pulse: 0,
};
const listeners = new Set<() => void>();

export const panel = {
  get(): PanelState {
    return state;
  },
  dispatch(event: PanelEvent): void {
    const next = nextPanel(state, event);
    if (next === state) return;
    if (next.collapsed !== state.collapsed) {
      writeCollapsed(browserStorage(), next.collapsed);
    }
    state = next;
    for (const l of listeners) l();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Test hook. */
  reset(): void {
    state = { collapsed: false, pulse: 0 };
    for (const l of listeners) l();
  },
};

export function usePanelState(): PanelState {
  return useSyncExternalStore(panel.subscribe, panel.get);
}
