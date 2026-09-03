import { TechBadge } from "../../components/TechBadge";
import { projects } from "../../content/projects";
import type { Project } from "../../content/types";
import { hueVar } from "../../lib/hues";
import { useSim } from "../simStore.ts";
import type { ZoneSlug } from "../world/contract.ts";

/** Zone slug to catalog entry; content is regenerated from data/ in M5. */
export function projectForZone(slug: ZoneSlug): Project | undefined {
  return (
    projects.find((p) => p.slug === slug) ??
    projects.find((p) => p.name.toLowerCase() === slug)
  );
}

/** The one place project text appears in the simulator: a mono card. */
export function ProjectDock() {
  const zone = useSim((s) => s.zone);
  const project = zone ? projectForZone(zone) : undefined;

  return (
    <aside
      className="pointer-events-none fixed bottom-5 left-5 z-20 w-[min(22rem,calc(100vw-2.5rem))]"
      aria-live="polite"
    >
      <div
        className="rounded-lg border border-border bg-surface/90 p-4 shadow-sm backdrop-blur transition-opacity duration-200"
        style={{ opacity: zone ? 1 : 0 }}
        hidden={!zone}
      >
        {zone ? (
          <>
            <p
              className="font-mono text-[11px] tracking-widest uppercase"
              style={{ color: hueVar(project?.accent) }}
            >
              {zone}
            </p>
            <p className="mt-1 font-display text-lg font-semibold tracking-tight">
              {project?.name ?? zone}
            </p>
            {project ? (
              <>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {project.tagline}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tech.slice(0, 4).map((t) => (
                    <TechBadge key={t} label={t} />
                  ))}
                </div>
                {project.repo ? (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto mt-3 inline-block font-mono text-[12px] text-muted underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                  >
                    {project.repo.replace(/^https?:\/\//, "")}
                  </a>
                ) : null}
              </>
            ) : (
              <p className="mt-1 font-mono text-xs text-faint">
                content pending
              </p>
            )}
          </>
        ) : null}
      </div>
    </aside>
  );
}
