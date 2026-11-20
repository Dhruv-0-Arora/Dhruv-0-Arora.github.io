import { type MotionValue, useMotionValueEvent } from "motion/react";
import { type RefObject, useEffect, useRef } from "react";
import { N, PARK_IN, PARK_OUT, SNAP_IDLE_MS, SNAP_MS } from "./showcaseConfig";

const easeOutCubic = (u: number) => 1 - (1 - u) ** 3;

/**
 * When the user stops scrolling mid-transition inside the pinned showcase,
 * gently auto-scrolls the page to the nearest project's segment center.
 * Cancels instantly on any user input; never fires inside a parked plateau.
 */
export function useSnapAssist(
  wrapperRef: RefObject<HTMLDivElement | null>,
  progress: MotionValue<number>,
  enabled: boolean,
) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const rafId = useRef(0);
  const snapping = useRef(false);

  useMotionValueEvent(progress, "change", (p) => {
    if (!enabled || snapping.current) return;
    clearTimeout(idleTimer.current);
    if (p <= 0 || p >= 1) return;
    idleTimer.current = setTimeout(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      const el = wrapperRef.current;
      if (!el) return;

      const raw = progress.get() * (N - 1);
      const nearest = Math.min(N - 1, Math.max(0, Math.round(raw)));
      const frac = raw - nearest;
      // round() is a valid plateau test because PARK_IN/PARK_OUT < 0.5.
      if (frac >= -PARK_IN && frac <= PARK_OUT) return;

      const wrapperTop = el.getBoundingClientRect().top + window.scrollY;
      const to =
        wrapperTop +
        (nearest / (N - 1)) * (el.offsetHeight - window.innerHeight);
      const from = window.scrollY;
      if (Math.abs(to - from) < 1) return;

      snapping.current = true;
      const t0 = performance.now();
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / SNAP_MS);
        window.scrollTo(0, from + (to - from) * easeOutCubic(u));
        if (u < 1) {
          rafId.current = requestAnimationFrame(step);
        } else {
          snapping.current = false;
        }
      };
      rafId.current = requestAnimationFrame(step);
    }, SNAP_IDLE_MS);
  });

  useEffect(() => {
    if (!enabled) return;
    // Cancellation keys off user input only (never scroll), so the snap
    // tween cannot cancel itself.
    const cancel = () => {
      cancelAnimationFrame(rafId.current);
      clearTimeout(idleTimer.current);
      snapping.current = false;
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    for (const event of events) {
      window.addEventListener(event, cancel, { passive: true });
    }
    return () => {
      cancel();
      for (const event of events) {
        window.removeEventListener(event, cancel);
      }
    };
  }, [enabled]);
}
