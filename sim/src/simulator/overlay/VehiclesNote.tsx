import { useEffect, useState } from "react";
import { vehiclesNote } from "../../content/guide";
import type { ControlEvent } from "../controls/controlMachine.ts";
import { sim, useSim } from "../simStore.ts";
import { hint, useHintState } from "./hintState.ts";

/** How long the world has to have settled before the note appears, ms. */
const DELAY_MS = 1500;

/** The keys that take a vehicle out, and what pressing them dispatches. */
const ACTIONS: Record<string, ControlEvent> = {
  T: { type: "TAKE_OFF" },
  F: { type: "TAKE_WHEEL" },
};

/**
 * A first-visit note above the hint line: the two vehicles on the pad and
 * their keys, as the output of a command. It waits for the world and the
 * Dozer, is offered only to keyboard visitors, and goes away for good on
 * the close button or the first time either vehicle is taken out.
 */
export function VehiclesNote() {
  const mode = useSim((s) => s.mode);
  const worldReady = useSim((s) => s.worldReady);
  const dozerReady = useSim((s) => s.dozerReady);
  const hasKeyboard = useSim((s) => s.hasKeyboard);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const { seen } = useHintState();
  const ready = worldReady && dozerReady && hasKeyboard && !seen;
  const [due, setDue] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => setDue(true), DELAY_MS);
    return () => window.clearTimeout(id);
  }, [ready]);

  // Any path into a vehicle counts as having read it: the keys, the HUD
  // links, or the note's own lines.
  useEffect(() => {
    if (mode === "driving" || mode === "flying") {
      hint.dispatch({ type: "dismiss" });
    }
  }, [mode]);

  const shown = ready && due && mode === "rails";

  // One frame at the start position, then the transition to rest.
  useEffect(() => {
    if (!shown) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [shown]);

  if (!shown) return null;

  return (
    <section
      aria-label="Vehicles"
      className={`term-note pointer-events-auto${
        reducedMotion ? "" : " term-note-motion"
      }${entered || reducedMotion ? "" : " term-note-enter"}`}
    >
      <p className="term-note-cmd">
        <span>
          <span className="term-prompt" aria-hidden="true">
            ❯
          </span>
          {vehiclesNote.command}
        </span>
        <button
          type="button"
          onClick={() => hint.dispatch({ type: "dismiss" })}
          aria-label={vehiclesNote.dismiss}
          className="term-btn"
        >
          <span aria-hidden="true">×</span>
        </button>
      </p>
      <ul className="term-note-lines">
        {vehiclesNote.lines.map((line) => {
          const action = ACTIONS[line.key];
          const body = (
            <>
              <span className="term-key">{line.key}</span>
              <span>{line.text}</span>
            </>
          );
          return (
            <li key={line.key}>
              {action ? (
                <button
                  type="button"
                  onClick={() => sim.dispatch(action)}
                  className="term-note-row term-note-action"
                >
                  {body}
                </button>
              ) : (
                <span className="term-note-row">{body}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
