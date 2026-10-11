import { useSyncExternalStore } from "react";

/**
 * Whether the first-visit note about the vehicles has been seen. It is
 * shown once per browser: dismissing it, or taking either vehicle out by
 * any path, puts it away for good.
 */
export interface HintState {
  seen: boolean;
}

export type HintEvent = { type: "dismiss" };

export const STORAGE_KEY = "sim.hint";

export function nextHint(state: HintState, event: HintEvent): HintState {
  switch (event.type) {
    case "dismiss":
      return state.seen ? state : { seen: true };
  }
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readSeen(storage: StorageLike | null): boolean {
  try {
    return storage?.getItem(STORAGE_KEY) === "seen";
  } catch {
    return false;
  }
}

export function writeSeen(storage: StorageLike | null): void {
  try {
    storage?.setItem(STORAGE_KEY, "seen");
  } catch {
    /* private mode or quota: the note shows again next visit */
  }
}

function browserStorage(): StorageLike | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

let state: HintState = { seen: readSeen(browserStorage()) };
const listeners = new Set<() => void>();

export const hint = {
  get(): HintState {
    return state;
  },
  dispatch(event: HintEvent): void {
    const next = nextHint(state, event);
    if (next === state) return;
    if (next.seen) writeSeen(browserStorage());
    state = next;
    for (const l of listeners) l();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Test hook. */
  reset(): void {
    state = { seen: false };
    for (const l of listeners) l();
  },
};

export function useHintState(): HintState {
  return useSyncExternalStore(hint.subscribe, hint.get, hint.get);
}
