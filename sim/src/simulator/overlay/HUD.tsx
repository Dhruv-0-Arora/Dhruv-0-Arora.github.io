import type { ReactNode } from "react";
import { sim, useSim } from "../simStore.ts";
import { VehiclesNote } from "./VehiclesNote.tsx";

const type = "font-mono text-[12px] leading-5";
const mono = `${type} text-muted`;

/**
 * Everything that is not the world: mode hints, sector loading,
 * and the take-the-wheel control. All DOM, all tokens.
 */
export function HUD() {
  const mode = useSim((s) => s.mode);
  const loading = useSim((s) => s.loading);
  const worldReady = useSim((s) => s.worldReady);
  const dozerReady = useSim((s) => s.dozerReady);
  const hasKeyboard = useSim((s) => s.hasKeyboard);
  const stats = useSim((s) => s.stats);
  const signalLost = useSim((s) => s.signalLost);
  const crashed = useSim((s) => s.crashed);
  const canDrive = hasKeyboard && worldReady && dozerReady;
  const status = crashed || signalLost;

  const statusLine = crashed ? (
    <p className={`${type} tracking-widest uppercase text-accent`}>
      {"airframe lost // relaunching"}
    </p>
  ) : signalLost ? (
    <p className={`${type} tracking-widest uppercase text-accent`}>
      {"signal lost // respawning"}
    </p>
  ) : !worldReady ? (
    <p className={`${mono} tracking-widest uppercase`}>loading world</p>
  ) : loading ? (
    <p className={`${mono} tracking-widest uppercase`}>
      loading sector · {loading}
    </p>
  ) : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {/*
        One right-aligned column at every width, so nothing in it can
        collide: the first-visit note, the dev stats, the status line, then
        the key hints. A crash or a respawn takes the bottom line to itself.
        The live region stays mounted (so it is announced) and an empty one
        cancels its own gap.
        On phones it sits clear of the dock's collapsed tab (bottom left).
      */}
      <div className="sim-halo absolute right-5 bottom-16 left-5 flex flex-col items-end gap-2 text-right md:bottom-5 md:left-auto md:max-w-[calc(100vw-min(44vw,41rem)-4rem)]">
        <VehiclesNote />
        {import.meta.env.DEV && worldReady ? (
          <p className={mono}>
            {stats.fps} fps / {stats.calls} calls / {stats.triangles} tris
          </p>
        ) : null}
        <div aria-live="polite" className="empty:-mb-2">
          {statusLine}
        </div>
        {status ? null : mode === "driving" ? (
          <Hints>
            <Hint>wasd / arrows to drive</Hint>
            <Hint sep={false}>esc to return to the rails</Hint>
          </Hints>
        ) : mode === "flying" ? (
          <Hints>
            <Hint>w s throttle</Hint>
            <Hint>a d bank</Hint>
            <Hint>up down climb and dive</Hint>
            <Hint sep={false}>esc to land</Hint>
          </Hints>
        ) : (
          <Hints>
            <Hint sep={canDrive ? "" : "hidden xl:inline"}>
              scroll or <span aria-hidden="true">← →</span>
              <span className="sr-only">the arrow keys</span> to hop sites
            </Hint>
            {/* The lowest priority: only where the line has room for it. */}
            <Hint className="hidden xl:inline" sep={canDrive ? "" : false}>
              drag to look
            </Hint>
            {canDrive ? (
              <>
                <Hint>
                  <button
                    type="button"
                    onClick={() => sim.dispatch({ type: "TAKE_WHEEL" })}
                    className={action}
                  >
                    F to take the wheel
                  </button>
                </Hint>
                <Hint sep={false}>
                  <button
                    type="button"
                    onClick={() => sim.dispatch({ type: "TAKE_OFF" })}
                    className={action}
                  >
                    T to take off
                  </button>
                </Hint>
              </>
            ) : null}
          </Hints>
        )}
      </div>
    </div>
  );
}

const action =
  "pointer-events-auto text-text underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

/** A line of key hints that, when it must wrap, wraps between hints. */
function Hints({ children }: { children: ReactNode }) {
  return <p className={mono}>{children}</p>;
}

/**
 * One hint, never broken inside. The separator rides at the end of the
 * hint before it (joined by a no-break space), so a wrapped line always
 * starts with a hint, never a dot. `sep` is false on the last hint, or a
 * class for a separator that only shows where the next hint does.
 */
function Hint({
  children,
  sep = "",
  className = "",
}: {
  children: ReactNode;
  sep?: string | false;
  className?: string;
}) {
  return (
    <span className={className || "inline"}>
      <span className="whitespace-nowrap">
        {children}
        {sep === false ? null : (
          <span className={`text-faint ${sep}`}>{"\u00a0·"}</span>
        )}
      </span>
      {sep === false ? null : " "}
    </span>
  );
}
