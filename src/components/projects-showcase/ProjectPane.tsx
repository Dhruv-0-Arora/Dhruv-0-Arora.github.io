import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Project } from "../../content/types";
import { HUE_HEX } from "../../lib/hues";
import { useTheme } from "../../lib/theme";
import { shadowTexture, usePaneTexture } from "./paneTexture";
import {
  ENTRY_DX,
  ENTRY_DY,
  EXIT_DX,
  EXIT_DY,
  EXIT_LINGER,
  EXIT_MIN_OPACITY,
  ROT_Y,
  ROT_Z,
  SCALE_ENTRY,
  SCALE_EXIT,
  shapeD,
} from "./showcaseConfig";

interface ProjectPaneProps {
  project: Project;
  index: number;
  getSmoothed: () => number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function ProjectPane({ project, index, getSmoothed }: ProjectPaneProps) {
  const texture = usePaneTexture(project);
  const group = useRef<THREE.Group>(null);
  const shadowMesh = useRef<THREE.Mesh>(null);
  const borderMesh = useRef<THREE.Mesh>(null);
  const imageMesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const borderMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const { viewport } = useThree();
  const [theme] = useTheme();

  const width = Math.min(viewport.width * 0.52, viewport.height * 1.15);
  const height = width * 0.625;
  const border = width * 0.008;

  const borderColor = useMemo(
    () =>
      new THREE.Color(
        project.accent
          ? HUE_HEX[project.accent][theme === "dark" ? "dark" : "lightVivid"]
          : theme === "dark"
            ? "#f97316"
            : "#e05e0b",
      ),
    [project.accent, theme],
  );

  useFrame((state) => {
    const node = group.current;
    if (!node) return;

    const d = clamp(getSmoothed() - index, -1, 1 + EXIT_LINGER);
    const t = shapeD(Math.min(d, 1));
    const enter = Math.max(0, -t);
    const exit = Math.max(0, t);
    const W = viewport.width;
    const H = viewport.height;

    // Diagonal: bottom-right -> park -> top-left, with a park-only idle float.
    const parked = 1 - enter - exit;
    node.position.x = enter * ENTRY_DX * W + exit * EXIT_DX * W;
    node.position.y =
      enter * ENTRY_DY * H +
      exit * EXIT_DY * H +
      Math.sin(state.clock.elapsedTime * 0.5 + index * 1.7) *
        0.012 *
        H *
        Math.max(0, parked);
    node.position.z = 0;
    node.rotation.y = -ROT_Y * t;
    node.rotation.z = ROT_Z * t;
    node.scale.setScalar(
      1 + enter * (SCALE_ENTRY - 1) + exit * (SCALE_EXIT - 1),
    );

    let opacity: number;
    if (d <= 1) {
      opacity = enter > 0 ? 1 - enter : 1 - (1 - EXIT_MIN_OPACITY) * exit;
    } else {
      opacity = EXIT_MIN_OPACITY * (1 - (d - 1) / EXIT_LINGER);
    }
    node.visible = d > -1 + 1e-4 && opacity > 0.002;
    if (!node.visible) return;

    const at = Math.abs(t);
    // Parked pane always draws on top; each trio stays shadow < border < image.
    const priority = 10 * (1 - Math.min(1, at));
    if (shadowMesh.current) shadowMesh.current.renderOrder = priority;
    if (borderMesh.current) borderMesh.current.renderOrder = priority + 0.1;
    if (imageMesh.current) imageMesh.current.renderOrder = priority + 0.2;

    if (material.current) {
      material.current.opacity = opacity;
      material.current.color.setScalar(1 - 0.15 * at);
    }
    if (borderMaterial.current) {
      borderMaterial.current.color.copy(borderColor);
      borderMaterial.current.opacity = opacity * (1 - 0.3 * at);
    }
    if (shadowMaterial.current) {
      shadowMaterial.current.opacity =
        (theme === "dark" ? 0.28 : 0.4) * opacity * (1 - 0.5 * at);
    }
  });

  return (
    <group ref={group}>
      <mesh
        ref={shadowMesh}
        position={[0, -height * 0.1, -0.06]}
        scale={[width * 1.25, height * 1.1, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={shadowMaterial}
          map={shadowTexture()}
          color="#000000"
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={borderMesh} position-z={-0.01}>
        <planeGeometry args={[width + border * 2, height + border * 2]} />
        <meshBasicMaterial
          ref={borderMaterial}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={imageMesh}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={material}
          map={texture}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
