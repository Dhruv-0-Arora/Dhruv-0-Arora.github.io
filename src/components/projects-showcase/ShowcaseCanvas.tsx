import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import { useCanvasActive } from "../../lib/useCanvasActive";
import { PaneScene } from "./PaneScene";

interface ShowcaseCanvasProps {
  progress: MotionValue<number>;
}

export default function ShowcaseCanvas({ progress }: ShowcaseCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useCanvasActive(containerRef);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 3], fov: 35 }}
      >
        <AdaptiveDpr pixelated />
        <PaneScene progress={progress} />
      </Canvas>
    </div>
  );
}
