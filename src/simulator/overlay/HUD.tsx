import { ThemeToggle } from "../../components/ThemeToggle";
import { profile } from "../../content/profile";
import { sim, useSim } from "../simStore.ts";

const mono = "font-mono text-[12px] leading-5 text-muted";

/**
 * Everything that is not the world: identity, mode hints, sector loading,
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
  const canDrive = hasKeyboard && worldReady && dozerReady;

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <header className="absolute top-0 left-0 flex w-full items-start justify-between p-5">
        <div className="pointer-events-auto">
          <p className="font-display text-base font-semibold tracking-tight">
            {profile.name}
          </p>
          <p className={mono}>{profile.kicker}</p>
        </div>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="absolute right-5 bottom-5 flex flex-col items-end gap-2 text-right">
        {import.meta.env.DEV && worldReady ? (
          <p className={`${mono} text-faint`}>
            {stats.fps} fps / {stats.calls} calls / {stats.triangles} tris
          </p>
        ) : null}
        {mode === "driving" ? (
          <p className={mono}>
            wasd / arrows to drive
            <span className="text-faint"> · </span>
            esc to return to the rails
          </p>
        ) : (
          <p className={mono}>
            scroll to travel
            {canDrive ? (
              <>
                <span className="text-faint"> · </span>
                <button
                  type="button"
                  onClick={() => sim.dispatch({ type: "TAKE_WHEEL" })}
                  className="pointer-events-auto text-text underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  F to take the wheel
                </button>
              </>
            ) : null}
          </p>
        )}
      </div>

      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2"
        aria-live="polite"
      >
        {signalLost ? (
          <p className={`${mono} tracking-widest uppercase text-accent`}>
            {"signal lost // respawning"}
          </p>
        ) : !worldReady ? (
          <p className={`${mono} tracking-widest uppercase`}>loading world</p>
        ) : loading ? (
          <p className={`${mono} tracking-widest uppercase`}>
            loading sector · {loading}
          </p>
        ) : null}
      </div>
    </div>
  );
}
