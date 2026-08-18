import type { CSSProperties } from "react";
import type { Project } from "../content/types";
import { hueVar, hueVividVar } from "../lib/hues";

export function ProjectCardCompact({ project }: { project: Project }) {
  const inner = (
    <article
      className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-(--pa)"
      style={
        {
          "--pa": hueVar(project.accent),
          "--pav": hueVividVar(project.accent),
        } as CSSProperties
      }
    >
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--pav)"
          aria-hidden="true"
        />
        <h3 className="font-display text-base font-semibold transition-colors group-hover:text-(--pa)">
          {project.name}
        </h3>
      </div>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
        {project.tagline}
      </p>
      <p className="mt-3 font-mono text-xs text-faint">
        {project.tech.slice(0, 3).join(" · ")}
      </p>
    </article>
  );

  if (!project.repo) return inner;
  return (
    <a
      href={project.repo}
      target="_blank"
      rel="noreferrer"
      className="block h-full rounded-xl"
      aria-label={`${project.name} on GitHub`}
    >
      {inner}
    </a>
  );
}
