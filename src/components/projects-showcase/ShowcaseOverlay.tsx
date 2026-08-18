import { type MotionValue, useMotionValueEvent } from "motion/react";
import { type CSSProperties, useEffect, useRef } from "react";
import { featuredProjects } from "../../content/projects";
import type { Project } from "../../content/types";
import { hueVar } from "../../lib/hues";
import { TechBadge } from "../TechBadge";
import {
  fadeInputs,
  fadeOutputs,
  interp,
  slideInputs,
  slideOutputs,
} from "./showcaseConfig";

function applyBlockStyle(el: HTMLDivElement, index: number, p: number) {
  el.style.opacity = String(interp(p, fadeInputs(index), fadeOutputs(index)));
  const x = interp(p, slideInputs(index), slideOutputs(index));
  el.style.transform = `translateX(${x}px)`;
}

interface OverlayBlockProps {
  project: Project;
  index: number;
  active: boolean;
  blockRef: (el: HTMLDivElement | null) => void;
}

function OverlayBlock({ project, index, active, blockRef }: OverlayBlockProps) {
  return (
    <div
      ref={blockRef}
      style={{ opacity: 0, "--pa": hueVar(project.accent) } as CSSProperties}
      className={`absolute inset-0 flex flex-col justify-center ${
        active ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <p className="font-mono text-sm text-(--pa)">0{index + 1}</p>
      <h3 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
        {project.name}
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        {project.tagline}
      </p>
      {project.highlight && (
        <p className="mt-2 font-mono text-xs text-(--pa)">
          {project.highlight}
        </p>
      )}
      <div className="mt-4 flex max-w-sm flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <TechBadge key={t} label={t} />
        ))}
      </div>
      <div className="mt-5 flex gap-4">
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            tabIndex={-1}
            className="font-mono text-xs text-muted underline-offset-4 transition-colors hover:text-(--pa) hover:underline"
          >
            source
          </a>
        )}
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noreferrer"
            tabIndex={-1}
            className="font-mono text-xs text-muted underline-offset-4 transition-colors hover:text-(--pa) hover:underline"
          >
            live
          </a>
        )}
      </div>
    </div>
  );
}

interface ShowcaseOverlayProps {
  progress: MotionValue<number>;
  activeIndex: number;
}

export function ShowcaseOverlay({
  progress,
  activeIndex,
}: ShowcaseOverlayProps) {
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const applyAll = (p: number) => {
    blockRefs.current.forEach((el, i) => {
      if (el) applyBlockStyle(el, i, p);
    });
  };

  useMotionValueEvent(progress, "change", applyAll);
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial paint only
  useEffect(() => {
    applyAll(progress.get());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="mx-auto flex h-full max-w-5xl items-center px-6">
        <div className="relative h-80 w-full max-w-xs md:max-w-sm">
          {featuredProjects.map((project, i) => (
            <OverlayBlock
              key={project.name}
              project={project}
              index={i}
              active={i === activeIndex}
              blockRef={(el) => {
                blockRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
