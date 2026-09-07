import { type RefObject, use, useEffect } from "react";
import type * as THREE from "three";
import { loadRobot } from "../../mirabuf/loadRobot";
import { sim } from "../simStore.ts";

/**
 * buildRobot normalizes the Dozer to 1.6 units on its longest side. The
 * real robot is about 1.1 m; in the world it drives at 2 m so it reads
 * from the rails and holds its own against the installations.
 */
export const DOZER_LENGTH = 2.0;
export const DOZER_SCALE = DOZER_LENGTH / 1.6;

/** Rotation added to the drive heading so the CAD front faces forward. */
export const DOZER_YAW_OFFSET = 0;

interface DozerRigProps {
  rigRef: RefObject<THREE.Group | null>;
}

/** The vehicle: the same live-parsed .mira the hero shows, at world scale. */
export function DozerRig({ rigRef }: DozerRigProps) {
  const { group } = use(loadRobot());

  useEffect(() => {
    sim.set({ dozerReady: true });
    return () => sim.set({ dozerReady: false });
  }, []);

  return (
    <group ref={rigRef}>
      <primitive object={group} scale={DOZER_SCALE} />
    </group>
  );
}
