import type { CSSProperties } from "react";
import type { Project } from "../content/types";
import { hueVar } from "../lib/hues";
import { TechBadge } from "./TechBadge";

function ExternalIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export function ProjectCardFeatured({ project }: { project: Project }) {
  return (
    <article
      className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-(--pa)"
      style={{ "--pa": hueVar(project.accent) } as CSSProperties}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-semibold">{project.name}</h3>
        {project.highlight && (
          <p className="shrink-0 font-mono text-xs text-(--pa)">
            {project.highlight}
          </p>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-text">{project.tagline}</p>
      {project.description && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {project.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <TechBadge key={t} label={t} />
        ))}
      </div>
      <div className="mt-4 flex gap-4 border-t border-border pt-4">
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-(--pa)"
          >
            <ExternalIcon /> source
          </a>
        )}
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-(--pa)"
          >
            <ExternalIcon /> live
          </a>
        )}
      </div>
    </article>
  );
}
