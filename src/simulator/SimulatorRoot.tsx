import { lazy, Suspense, useEffect, useState } from "react";
import { CanvasErrorBoundary } from "../components/CanvasErrorBoundary";
import { projects } from "../content/projects";
import { useIdleMount } from "../lib/useIdleMount";
import { RAIL_SCREENS, useInputs } from "./controls/useInputs.ts";
import { StaticPortfolio } from "./fallback/StaticPortfolio.tsx";
import { useSimulatorCapability } from "./fallback/useSimulatorCapability.ts";
import { HUD } from "./overlay/HUD.tsx";
import { ProjectDock } from "./overlay/ProjectDock.tsx";
import { sim } from "./simStore.ts";

const WorldCanvas = lazy(() => import("./WorldCanvas.tsx"));

/** Screen readers get the catalog as plain text; the world is decoration. */
function HiddenProjectList() {
  return (
    <ul className="sr-only">
      {projects.map((p) => (
        <li key={p.name}>
          {p.name}: {p.tagline}
          {p.repo ? (
            <>
              {" "}
              <a href={p.repo}>{p.repo}</a>
            </>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function SimulatorShell({ reducedMotion }: { reducedMotion: boolean }) {
  useInputs();
  const idle = useIdleMount();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    sim.set({ reducedMotion });
  }, [reducedMotion]);

  if (failed) return <StaticPortfolio />;

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        {idle ? (
          <CanvasErrorBoundary fallback={null} onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <WorldCanvas />
            </Suspense>
          </CanvasErrorBoundary>
        ) : null}
      </div>
      <div
        style={{ height: `${RAIL_SCREENS * 100}vh` }}
        aria-hidden="true"
        data-rail-spacer
      />
      <HUD />
      <ProjectDock />
      <HiddenProjectList />
    </>
  );
}

/** Offered only for reduced motion: the world then cuts instead of gliding. */
function EnterAnyway({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed right-4 bottom-4 z-40">
      <button
        type="button"
        onClick={onEnter}
        className="rounded-lg border border-border bg-surface/90 px-3 py-2 font-mono text-xs text-muted shadow-sm backdrop-blur transition-colors hover:border-accent hover:text-accent"
      >
        enter the simulator anyway (no camera glides)
      </button>
    </div>
  );
}

/** Entry point: the world for those who can run it, the page for the rest. */
export function SimulatorRoot() {
  const capability = useSimulatorCapability();
  const [enterAnyway, setEnterAnyway] = useState(false);

  if (capability === "simulator")
    return <SimulatorShell reducedMotion={false} />;
  if (capability === "reduced-motion" && enterAnyway) {
    return <SimulatorShell reducedMotion />;
  }
  return (
    <>
      <StaticPortfolio />
      {capability === "reduced-motion" ? (
        <EnterAnyway onEnter={() => setEnterAnyway(true)} />
      ) : null}
    </>
  );
}
