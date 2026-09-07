import { useEffect, useId } from "react";
import { guide } from "../../content/guide";
import { projects } from "../../content/projects";
import type { Project } from "../../content/types";
import type { Hue } from "../../lib/hues";
import { useSim } from "../simStore.ts";
import { ZONE_SLUGS, type ZoneSlug } from "../world/contract.ts";
import { panel, usePanelState } from "./panelState.ts";
import { WINDOWS, windowName, ZONE_DISTRICT } from "./zoneDistrict.ts";

/** Zone slug to catalog entry; the hub has none and shows the guide. */
export function projectForZone(slug: ZoneSlug): Project | undefined {
  return (
    projects.find((p) => p.slug === slug) ??
    projects.find((p) => p.name.toLowerCase() === slug)
  );
}

/** Project hues rendered in the terminal palette rather than the page's. */
const TERM_HUE: Record<Hue, string> = {
  green: "var(--t-green)",
  sky: "var(--t-blue)",
  violet: "var(--t-purple)",
  rose: "var(--t-red)",
  amber: "var(--t-orange)",
};

export function termHue(hue?: Hue): string {
  return hue ? TERM_HUE[hue] : "var(--t-green)";
}

const PROJECT_ZONES = ZONE_SLUGS.filter((z) => z !== "hub");

function hostOf(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function Link({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {hostOf(href)}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

const DRIVING_KEYS = new Set(["F", "T", "W", "A", "S", "D", "Esc"]);

function GuideBody({ hasKeyboard }: { hasKeyboard: boolean }) {
  // Touch-only visitors stay on rails, so the wheel is not offered to them.
  const steps = hasKeyboard
    ? guide.steps
    : guide.steps.filter((s) => !s.keys.some((k) => DRIVING_KEYS.has(k)));
  return (
    <>
      <h2 className="term-h1">{guide.title}</h2>
      <p className="term-p">{guide.intro}</p>
      <h3 className="term-h2">## keys</h3>
      <dl className="term-keys">
        {steps.map((step) => (
          <div key={step.text} className="contents">
            <dt className="term-key">{step.keys.join(" ")}</dt>
            <dd>{step.text}</dd>
          </div>
        ))}
      </dl>
      <p className="term-p term-muted">{guide.outro}</p>
    </>
  );
}

function ProjectBody({ project, hue }: { project: Project; hue: string }) {
  return (
    <>
      <h2 className="term-h1" style={{ color: hue }}>
        {project.name}
      </h2>
      <p className="term-p">{project.tagline}</p>
      {project.highlight ? (
        <p className="term-quote" style={{ borderColor: hue }}>
          {project.highlight}
        </p>
      ) : null}
      {project.description ? (
        <p className="term-p">{project.description}</p>
      ) : null}
      {project.details && project.details.length > 0 ? (
        <>
          <h3 className="term-h2" style={{ color: hue }}>
            ## details
          </h3>
          <ul className="term-list">
            {project.details.map((line) => (
              <li key={line}>
                <span className="term-dash" aria-hidden="true">
                  -
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <h3 className="term-h2" style={{ color: hue }}>
        ## stack
      </h3>
      <p className="term-stack">
        {project.tech.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </p>
      {project.repo || project.demo ? (
        <dl className="term-links">
          {project.repo ? (
            <>
              <dt>repo</dt>
              <dd>
                <Link href={project.repo} />
              </dd>
            </>
          ) : null}
          {project.demo ? (
            <>
              <dt>demo</dt>
              <dd>
                <Link href={project.demo} />
              </dd>
            </>
          ) : null}
        </dl>
      ) : null}
    </>
  );
}

function StatusLine({ zone }: { zone: ZoneSlug }) {
  const district = ZONE_DISTRICT[zone];
  const index = (PROJECT_ZONES as readonly ZoneSlug[]).indexOf(zone);
  return (
    <footer className="term-status" aria-hidden="true">
      <span className="term-session">[sim]</span>
      {WINDOWS.map((w, i) => (
        <span
          key={w}
          className={w === district ? "term-win term-win-active" : "term-win"}
        >
          {i}:{windowName(w)}
        </span>
      ))}
      <span className="term-right">
        {index >= 0 ? `${index + 1}/${PROJECT_ZONES.length}  ` : ""}❄ nix
      </span>
    </footer>
  );
}

/**
 * The one place project text appears in the simulator: a terminal window
 * on the left, in the bamboo palette, showing the project the visitor is
 * next to as rendered markdown, or the guide at the hub as help output.
 * It collapses to a tab on the edge and stays collapsed until asked,
 * pulsing when a new zone arrives.
 */
export function ProjectPanel() {
  const zone = useSim((s) => s.zone);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const hasKeyboard = useSim((s) => s.hasKeyboard);
  const { collapsed, pulse } = usePanelState();
  const id = useId();
  const project = zone && zone !== "hub" ? projectForZone(zone) : undefined;
  const isGuide = zone === "hub";
  const hue = termHue(project?.accent);
  const title = isGuide ? guide.title : (project?.name ?? zone);
  const path = zone
    ? isGuide
      ? "~/sim"
      : `~/sim/${windowName(ZONE_DISTRICT[zone])}/${zone}`
    : "~";
  const command = isGuide ? "sim --help" : `glow ${zone}.md`;

  useEffect(() => {
    panel.dispatch({ type: "zone", zone });
  }, [zone]);

  const motion = reducedMotion ? "duration-0" : "duration-200";
  const hidden = !zone;

  return (
    <>
      <aside
        id={id}
        aria-live="polite"
        aria-hidden={collapsed || hidden}
        hidden={hidden}
        className={`pointer-events-none fixed z-20 flex transition-transform ease-out ${motion} inset-x-3 bottom-3 max-h-[54vh] md:inset-x-auto md:top-[5.25rem] md:bottom-auto md:left-5 md:max-h-[calc(100vh-9.5rem)] md:w-[min(44vw,41rem)] ${
          collapsed
            ? "translate-y-[calc(100%+1rem)] md:translate-x-[calc(-100%-1.5rem)] md:translate-y-0"
            : ""
        }`}
      >
        <div className="term pointer-events-auto">
          <header className="term-bar">
            <span className="truncate">
              <span className="term-user">dhruv@nixos</span> {path}
            </span>
            <button
              type="button"
              onClick={() => panel.dispatch({ type: "toggle" })}
              aria-expanded={!collapsed}
              aria-controls={id}
              aria-label={
                collapsed ? "Expand project panel" : "Collapse project panel"
              }
              className="term-btn"
            >
              hide <span aria-hidden="true">‹</span>
            </button>
          </header>
          <div className="term-body">
            <p className="term-cmd">
              <span className="term-prompt" aria-hidden="true">
                ❯
              </span>
              {command}
            </p>
            {isGuide ? (
              <GuideBody hasKeyboard={hasKeyboard} />
            ) : project ? (
              <ProjectBody project={project} hue={hue} />
            ) : (
              <p className="term-muted">content pending</p>
            )}
          </div>
          {zone ? <StatusLine zone={zone} /> : null}
        </div>
      </aside>

      {!hidden && collapsed ? (
        <button
          key={pulse}
          type="button"
          onClick={() => panel.dispatch({ type: "toggle" })}
          aria-expanded={false}
          aria-controls={id}
          aria-live="polite"
          className={`term-tab pointer-events-auto fixed bottom-3 left-3 z-20 flex items-center gap-2 rounded-md px-3 py-2 md:top-1/2 md:bottom-auto md:left-0 md:-translate-y-1/2 md:flex-col md:rounded-l-none md:px-2.5 md:py-4 ${
            pulse > 0 && !reducedMotion ? "panel-pulse" : ""
          }`}
          style={{ ["--pulse" as string]: hue }}
        >
          <span className="term-prompt" aria-hidden="true">
            ❯
          </span>
          <span
            className="font-semibold md:[writing-mode:vertical-rl] md:rotate-180"
            style={{ color: hue }}
          >
            {title}
          </span>
        </button>
      ) : null}
    </>
  );
}
