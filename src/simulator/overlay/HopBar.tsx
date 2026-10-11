import type { PointerEvent } from "react";
import { useSim } from "../simStore.ts";
import { usePanelState } from "./panelState.ts";
import { hop, isHub, neighbours, useStationIndex } from "./useStationIndex.ts";

/**
 * A pointerdown anywhere on the page cancels the scroller's tween; the
 * bar's own presses must not, so two quick clicks chain into two hops.
 */
function keepPress(e: PointerEvent) {
  e.stopPropagation();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Prev and next for the lap, in bare type along the top of the world:
 * the neighbouring sites by name, the counter between them. The loop
 * wraps at the hub, so both arrows always go somewhere. While a hop runs
 * the site being travelled to lights up in the terminal's green.
 */
export function HopBar() {
  const mode = useSim((s) => s.mode);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const hasZone = useSim((s) => s.zone !== null);
  const { collapsed } = usePanelState();
  // The panel is only beside the world when there is a zone to show.
  const panelOpen = hasZone && !collapsed;
  const { layout, order, station, heading } = useStationIndex();

  const shown = mode === "rails" && layout !== null;
  const atHub = layout ? isHub(station, layout.stations.length) : true;
  const { prev, next } = neighbours(station, order);

  const motion = reducedMotion ? "" : " hop-motion";
  return (
    <nav
      aria-label="Sites"
      aria-hidden={!shown}
      inert={!shown}
      className={`hop${motion}${panelOpen ? " hop-beside" : ""}${
        shown ? "" : " hop-hidden"
      }`}
    >
      <button
        type="button"
        onPointerDown={keepPress}
        onClick={() => hop(-1)}
        aria-label={`previous site: ${prev}`}
        className={`hop-btn hop-prev${heading < 0 ? " hop-active" : ""}`}
      >
        <span className="hop-glyph" aria-hidden="true">
          ‹
        </span>
        <span className="hop-name">{prev}</span>
      </button>
      <span className="hop-count" aria-live="polite">
        {atHub ? (
          "hub"
        ) : (
          <>
            {pad(station)}
            <span className="hop-of"> / </span>
            {pad(order.length)}
          </>
        )}
      </span>
      <button
        type="button"
        onPointerDown={keepPress}
        onClick={() => hop(1)}
        aria-label={`next site: ${next}`}
        className={`hop-btn hop-next${heading > 0 ? " hop-active" : ""}`}
      >
        <span className="hop-name">{next}</span>
        <span className="hop-glyph" aria-hidden="true">
          ›
        </span>
      </button>
    </nav>
  );
}
