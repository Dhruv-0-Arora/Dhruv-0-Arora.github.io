import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/** Local hours (inclusive) that get the day sim; the rest of the day is night. */
const DAY_START = 7;
const DAY_END = 18;

/**
 * The theme for a local hour: light from 07:00 through 18:59, dark otherwise.
 * The inline script in index.html mirrors this rule for first paint; keep the
 * two in sync.
 */
export function themeForHour(hour: number): Theme {
  return hour >= DAY_START && hour <= DAY_END ? "light" : "dark";
}

/**
 * The theme for a moment and a URL query string. `?theme=light|dark` wins
 * (handy for checking both looks and capturing the posters); anything else
 * falls back to the visitor's local clock.
 */
export function resolveTheme(now: Date, search: string): Theme {
  const override = new URLSearchParams(search).get("theme");
  if (override === "light" || override === "dark") return override;
  return themeForHour(now.getHours());
}

const listeners = new Set<() => void>();

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Sets the `dark` class on <html> and tells useTheme subscribers if it changed. */
export function applyTheme(theme: Theme): void {
  if (currentTheme() === theme) return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  for (const l of listeners) l();
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * Applies the clock's theme now and again at every local hour boundary.
 * Also re-checks when the tab becomes visible, since a sleeping laptop
 * misses its timers. Returns a function that stops the clock.
 */
export function startThemeClock(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const sync = () => applyTheme(resolveTheme(new Date(), location.search));

  const schedule = () => {
    clearTimeout(timer);
    const now = new Date();
    const next = new Date(now);
    next.setHours(now.getHours() + 1, 0, 0, 0);
    // A small margin so the timer never fires a hair before the boundary.
    const wait = Math.min(next.getTime() - now.getTime() + 50, HOUR_MS + 50);
    timer = setTimeout(() => {
      sync();
      schedule();
    }, wait);
  };

  const onVisibility = () => {
    if (document.visibilityState !== "visible") return;
    sync();
    schedule();
  };

  sync();
  schedule();
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

/** The current theme, read-only. It changes only when the clock moves it. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => "dark");
}
