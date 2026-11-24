import { lazy, Suspense, useEffect, useState } from "react";
import { projects } from "../content/projects";
import { useIdleMount } from "../lib/useIdleMount";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary.tsx";
import { RAIL_SCREENS, useInputs } from "./controls/useInputs.ts";
import { SimulatorNotice } from "./fallback/SimulatorNotice.tsx";
import { useSimulatorCapability } from "./fallback/useSimulatorCapability.ts";
import { HopBar } from "./overlay/HopBar.tsx";
import { HUD } from "./overlay/HUD.tsx";
import { ProjectPanel } from "./overlay/ProjectDock.tsx";
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

  if (failed) return <SimulatorNotice />;

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
      <div className="sim-foot" aria-hidden="true" />
      <HUD />
      <HopBar />
      <ProjectPanel />
      <HiddenProjectList />
    </>
  );
}

/** Entry point: the world for those who can run it, a notice for the rest. */
export function SimulatorRoot() {
  const capability = useSimulatorCapability();
  const [enterAnyway, setEnterAnyway] = useState(false);

  if (capability === "simulator")
    return <SimulatorShell reducedMotion={false} />;
  if (capability === "reduced-motion" && enterAnyway) {
    return <SimulatorShell reducedMotion />;
  }
  return (
    <SimulatorNotice
      onEnter={
        capability === "reduced-motion" ? () => setEnterAnyway(true) : undefined
      }
    />
  );
}
