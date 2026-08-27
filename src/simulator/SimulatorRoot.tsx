import { lazy, Suspense, useState } from "react";
import { CanvasErrorBoundary } from "../components/CanvasErrorBoundary";
import { projects } from "../content/projects";
import { useIdleMount } from "../lib/useIdleMount";
import { RAIL_SCREENS, useInputs } from "./controls/useInputs.ts";
import { StaticPortfolio } from "./fallback/StaticPortfolio.tsx";
import { useSimulatorCapability } from "./fallback/useSimulatorCapability.ts";
import { HUD } from "./overlay/HUD.tsx";
import { ProjectDock } from "./overlay/ProjectDock.tsx";

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

function SimulatorShell() {
  useInputs();
  const idle = useIdleMount();
  const [failed, setFailed] = useState(false);
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

/** Entry point: the world for those who can run it, the page for the rest. */
export function SimulatorRoot() {
  const capability = useSimulatorCapability();
  return capability === "simulator" ? <SimulatorShell /> : <StaticPortfolio />;
}
