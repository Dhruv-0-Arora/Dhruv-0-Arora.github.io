import { type MotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef } from "react";
import { featuredProjects } from "../../content/projects";
import { hueVar } from "../../lib/hues";

interface ShowcaseRailProps {
  progress: MotionValue<number>;
  activeIndex: number;
}

export function ShowcaseRail({ progress, activeIndex }: ShowcaseRailProps) {
  const tickRef = useRef<HTMLDivElement>(null);

  const applyTick = (p: number) => {
    if (tickRef.current) tickRef.current.style.height = `${p * 100}%`;
  };

  useMotionValueEvent(progress, "change", applyTick);
  // biome-ignore lint/correctness/useExhaustiveDependencies: initial paint only
  useEffect(() => {
    applyTick(progress.get());
  }, []);

  return (
    <div className="absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex">
      {featuredProjects.map((project, i) => (
        <span
          key={project.name}
          className="font-mono text-xs transition-colors duration-300"
          style={{
            color:
              i === activeIndex ? hueVar(project.accent) : "var(--c-faint)",
          }}
        >
          0{i + 1}
        </span>
      ))}
      <div className="relative mt-2 h-16 w-px overflow-hidden bg-border">
        <div
          ref={tickRef}
          className="absolute inset-x-0 top-0 bg-text"
          style={{ height: 0 }}
        />
      </div>
    </div>
  );
}
