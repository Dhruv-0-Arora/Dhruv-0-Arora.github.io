import { useEffect, useId } from "react";
import { guide } from "../../content/guide";
import { projects } from "../../content/projects";
import type { Project } from "../../content/types";
import { type Hue, hueVar } from "../../lib/hues";
import { useSim } from "../simStore.ts";
import type { ZoneSlug } from "../world/contract.ts";
import { panel, usePanelState } from "./panelState.ts";

/** Zone slug to catalog entry; the hub has none and shows the guide. */
export function projectForZone(slug: ZoneSlug): Project | undefined {
  return (
    projects.find((p) => p.slug === slug) ??
    projects.find((p) => p.name.toLowerCase() === slug)
  );
}

const glass =
  "border border-border bg-surface/65 shadow-lg backdrop-blur-2xl backdrop-saturate-150";
const glassHighlight = {
  boxShadow:
    "inset 0 1px 0 rgb(255 255 255 / 0.35), 0 20px 50px -20px rgb(0 0 0 / 0.35)",
};

function Keycap({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-7 items-center justify-center rounded-md border border-border bg-surface px-2 py-1 font-mono text-[13px] text-text shadow-[0_1px_0_var(--c-border)]">
      {label}
    </kbd>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-border bg-surface/80 px-2 py-1 font-mono text-[13px] text-muted">
      {label}
    </span>
  );
}

function Pill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 font-mono text-[13px] text-text transition-colors hover:border-accent hover:text-accent"
    >
      {label}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
    </a>
  );
}

function CollapseButton({
  collapsed,
  controls,
}: {
  collapsed: boolean;
  controls: string;
}) {
  return (
    <button
      type="button"
      onClick={() => panel.dispatch({ type: "toggle" })}
      aria-expanded={!collapsed}
      aria-controls={controls}
      aria-label={collapsed ? "Expand project panel" : "Collapse project panel"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={collapsed ? "rotate-180" : ""}
      >
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>
  );
}

const DRIVING_KEYS = new Set(["F", "W", "A", "S", "D", "Esc"]);

function GuideBody({ hasKeyboard }: { hasKeyboard: boolean }) {
  // Touch-only visitors stay on rails, so the wheel is not offered to them.
  const steps = hasKeyboard
    ? guide.steps
    : guide.steps.filter((s) => !s.keys.some((k) => DRIVING_KEYS.has(k)));
  return (
    <>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">
        {guide.intro}
      </p>
      <ol className="mt-6 space-y-3.5">
        {steps.map((step) => (
          <li key={step.text} className="flex items-start gap-4">
            <span className="flex shrink-0 flex-wrap gap-1 pt-0.5">
              {step.keys.map((k) => (
                <Keycap key={k} label={k} />
              ))}
            </span>
            <span className="text-[17px] leading-relaxed">{step.text}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[15px] leading-relaxed text-muted">
        {guide.outro}
      </p>
    </>
  );
}

function ProjectBody({ project, hue }: { project: Project; hue?: Hue }) {
  return (
    <>
      <p className="mt-3 text-[18px] leading-relaxed">{project.tagline}</p>
      {project.highlight ? (
        <p className="mt-6">
          <span
            className="font-display text-[34px] leading-none font-semibold tracking-tight"
            style={{ color: hueVar(hue) }}
          >
            {project.highlight}
          </span>
        </p>
      ) : null}
      {project.description ? (
        <p className="mt-5 text-[17px] leading-relaxed text-muted">
          {project.description}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </div>
      {project.repo || project.demo ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {project.repo ? (
            <Pill
              href={project.repo}
              label={project.repo.replace(/^https?:\/\/(www\.)?/, "")}
            />
          ) : null}
          {project.demo ? (
            <Pill
              href={project.demo}
              label={project.demo.replace(/^https?:\/\/(www\.)?/, "")}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/**
 * The one place project text appears in the simulator: a floating glass
 * panel that fills the left half of the screen with the project the
 * visitor is next to, or the how-to guide at the hub. It collapses to a
 * tab on the edge and stays collapsed until asked, pulsing when a new
 * zone arrives.
 */
export function ProjectPanel() {
  const zone = useSim((s) => s.zone);
  const reducedMotion = useSim((s) => s.reducedMotion);
  const hasKeyboard = useSim((s) => s.hasKeyboard);
  const { collapsed, pulse } = usePanelState();
  const id = useId();
  const project = zone && zone !== "hub" ? projectForZone(zone) : undefined;
  const isGuide = zone === "hub";
  const hue = project?.accent;
  const eyebrow = isGuide ? guide.kicker : zone;
  const title = isGuide ? guide.title : (project?.name ?? zone);

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
        className={`pointer-events-none fixed z-20 flex transition-transform ease-out ${motion} inset-x-3 bottom-3 max-h-[52vh] md:inset-x-auto md:top-[5.5rem] md:bottom-auto md:left-5 md:max-h-[calc(100vh-10rem)] md:w-[min(44vw,40rem)] ${
          collapsed
            ? "translate-y-[calc(100%+1rem)] md:translate-x-[calc(-100%-1.5rem)] md:translate-y-0"
            : ""
        }`}
      >
        <div
          className={`pointer-events-auto flex h-full w-full flex-col overflow-hidden rounded-2xl ${glass}`}
          style={glassHighlight}
        >
          <div className="flex items-start justify-between gap-4 px-7 pt-6 md:px-8 md:pt-7">
            <div className="min-w-0">
              <p
                className="font-mono text-[12px] tracking-[0.2em] uppercase"
                style={{ color: hueVar(hue) }}
              >
                {eyebrow}
              </p>
              <h2 className="mt-2 font-display text-[28px] leading-tight font-semibold tracking-tight md:text-[32px]">
                {title}
              </h2>
            </div>
            <CollapseButton collapsed={collapsed} controls={id} />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7 md:px-8 md:pb-8">
            {isGuide ? (
              <GuideBody hasKeyboard={hasKeyboard} />
            ) : project ? (
              <ProjectBody project={project} hue={hue} />
            ) : (
              <p className="mt-3 font-mono text-sm text-faint">
                content pending
              </p>
            )}
          </div>
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
          className={`pointer-events-auto fixed bottom-3 left-3 z-20 flex items-center gap-3 rounded-full px-4 py-2.5 md:top-1/2 md:bottom-auto md:left-0 md:-translate-y-1/2 md:flex-col md:rounded-l-none md:rounded-r-2xl md:px-3 md:py-5 ${glass} ${pulse > 0 && !reducedMotion ? "panel-pulse" : ""}`}
          style={{ ...glassHighlight, ["--pulse" as string]: hueVar(hue) }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: hueVar(hue) }}
            aria-hidden="true"
          />
          <span className="font-display text-[15px] font-semibold tracking-tight md:[writing-mode:vertical-rl] md:rotate-180">
            {title}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-muted md:rotate-90"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      ) : null}
    </>
  );
}
