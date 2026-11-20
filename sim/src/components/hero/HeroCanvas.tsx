import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { useCanvasActive } from "../../lib/useCanvasActive";
import { CanvasErrorBoundary } from "../CanvasErrorBoundary";
import { HeroFallback } from "./HeroFallback";
import { RobotScene } from "./RobotScene";

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useCanvasActive(containerRef);

  return (
    <div ref={containerRef} className="h-full w-full">
      <CanvasErrorBoundary fallback={<HeroFallback />}>
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, 1.75]}
          camera={{ position: [0, 1.35, 3.45], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <AdaptiveDpr pixelated />
          <Suspense fallback={null}>
            <RobotScene />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
