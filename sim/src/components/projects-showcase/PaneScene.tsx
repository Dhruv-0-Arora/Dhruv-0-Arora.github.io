import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import * as THREE from "three";
import { featuredProjects } from "../../content/projects";
import { ProjectPane } from "./ProjectPane";
import { DAMP_LAMBDA, N, PARK_X } from "./showcaseConfig";

interface PaneSceneProps {
  progress: MotionValue<number>;
}

export function PaneScene({ progress }: PaneSceneProps) {
  const smoothed = useRef(progress.get() * (N - 1));
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame((state, delta) => {
    const raw = progress.get() * (N - 1);
    // Single damp = the whole showcase's smoothed, physical feel.
    smoothed.current = THREE.MathUtils.damp(
      smoothed.current,
      raw,
      DAMP_LAMBDA,
      delta,
    );

    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      state.pointer.x * 0.05,
      4,
      delta,
    );
    g.rotation.x = THREE.MathUtils.damp(
      g.rotation.x,
      -state.pointer.y * 0.035,
      4,
      delta,
    );
  });

  return (
    <group ref={group} position-x={viewport.width * PARK_X}>
      {featuredProjects.map((project, i) => (
        <ProjectPane
          key={project.name}
          project={project}
          index={i}
          getSmoothed={() => smoothed.current}
        />
      ))}
    </group>
  );
}
