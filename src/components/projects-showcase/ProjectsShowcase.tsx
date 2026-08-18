import { type MotionValue, useMotionValueEvent, useScroll } from "motion/react";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { featuredProjects } from "../../content/projects";
import type { Project } from "../../content/types";
import { hueSoftVar } from "../../lib/hues";
import { useIdleMount } from "../../lib/useIdleMount";
import { CanvasErrorBoundary } from "../CanvasErrorBoundary";
import { FeaturedGrid } from "./FeaturedGrid";
import { ShowcaseOverlay } from "./ShowcaseOverlay";
import { ShowcaseRail } from "./ShowcaseRail";
import {
  fadeInputs,
  fadeOutputs,
  interp,
  N,
  WRAPPER_HEIGHT,
} from "./showcaseConfig";
import { useSnapAssist } from "./useSnapAssist";

const ShowcaseCanvas = lazy(() => import("./ShowcaseCanvas"));

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(listener: () => void) {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener("change", listener);
  window.addEventListener("resize", listener);
  return () => {
    mql.removeEventListener("change", listener);
    window.removeEventListener("resize", listener);
  };
}

function shouldFallback(): boolean {
  return window.matchMedia(REDUCED_QUERY).matches || window.innerWidth < 768;
}

/** The showcase needs real estate and motion; otherwise serve the grid. */
function useShowcaseFallback(): boolean {
  return useSyncExternalStore(subscribe, shouldFallback);
}

function GlowLayer({
  projects,
  progress,
}: {
  projects: Project[];
  progress: MotionValue<number>;
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const applyAll = (p: number) => {
    refs.current.forEach((el, i) => {
      if (el)
        el.style.opacity = String(interp(p, fadeInputs(i), fadeOutputs(i)));
    });
  };

  useMotionValueEvent(progress, "change", applyAll);
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial paint only
  useEffect(() => {
    applyAll(progress.get());
  }, []);

  return (
    <>
      {projects.map((project, i) => (
        <div
          key={project.name}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute inset-0"
          style={{
            opacity: 0,
            background: `radial-gradient(640px circle at 58% 52%, ${hueSoftVar(project.accent)}, transparent 70%)`,
          }}
        />
      ))}
    </>
  );
}

/** Linear, keyboard-and-screen-reader copy of the showcase content. */
function AccessibleProjectList() {
  return (
    <ul className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-20 focus-within:left-6 focus-within:z-50 focus-within:max-w-sm focus-within:rounded-xl focus-within:border focus-within:border-border focus-within:bg-surface focus-within:p-4">
      {featuredProjects.map((project) => (
        <li key={project.name} className="py-1">
          <span className="font-medium">{project.name}</span>
          <span className="text-muted"> - {project.tagline} </span>
          {project.repo && (
            <a href={project.repo} className="underline">
              source
            </a>
          )}{" "}
          {project.demo && (
            <a href={project.demo} className="underline">
              live
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ProjectsShowcase() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fallback = useShowcaseFallback();
  const [canvasFailed, setCanvasFailed] = useState(false);
  const idle = useIdleMount();
  const [near, setNear] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActiveIndex(Math.min(N - 1, Math.max(0, Math.round(p * (N - 1)))));
  });

  useSnapAssist(wrapperRef, scrollYProgress, !fallback && !canvasFailed);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || fallback) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "800px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallback]);

  if (fallback || canvasFailed) {
    return <FeaturedGrid />;
  }

  return (
    <>
      <AccessibleProjectList />
      <div
        ref={wrapperRef}
        className="relative left-1/2 w-screen -translate-x-1/2"
        style={{ height: WRAPPER_HEIGHT }}
      >
        <div className="sticky top-0 h-svh overflow-hidden" aria-hidden="true">
          <GlowLayer projects={featuredProjects} progress={scrollYProgress} />
          {idle && near && (
            <CanvasErrorBoundary
              fallback={null}
              onError={() => setCanvasFailed(true)}
            >
              <Suspense fallback={null}>
                <ShowcaseCanvas progress={scrollYProgress} />
              </Suspense>
            </CanvasErrorBoundary>
          )}
          <ShowcaseOverlay
            progress={scrollYProgress}
            activeIndex={activeIndex}
          />
          <ShowcaseRail progress={scrollYProgress} activeIndex={activeIndex} />
        </div>
      </div>
    </>
  );
}
