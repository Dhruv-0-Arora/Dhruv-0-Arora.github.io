import { ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { use, useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { loadRobot } from "../../mirabuf/loadRobot";

const INITIAL_YAW = 4.35;
const DRAG_SENSITIVITY = 0.008;
const VELOCITY_DAMPING = 0.94;
const PARALLAX_TILT = 0.1;

export function RobotScene() {
  const { group } = use(loadRobot());
  const pivot = useRef<THREE.Group>(null);
  const yaw = useRef(INITIAL_YAW);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, -0.15, 0);
  }, [camera]);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.6;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastX.current = e.clientX;
      el.style.cursor = "grabbing";
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture is best-effort; drag still works without it.
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      velocity.current = dx * DRAG_SENSITIVITY;
      yaw.current += velocity.current;
    };
    const onUp = () => {
      dragging.current = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const node = pivot.current;
    if (!node) return;

    if (!dragging.current) {
      velocity.current *= VELOCITY_DAMPING;
      yaw.current += velocity.current + delta * 0.06;
    }
    node.rotation.y = yaw.current;

    const targetTilt = dragging.current ? 0 : -state.pointer.y * PARALLAX_TILT;
    node.rotation.x += (targetTilt - node.rotation.x) * 0.06;

    node.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.4} />
      <pointLight position={[-3, 1.2, -3]} intensity={8} color="#5fc383" />
      <group ref={pivot} position={[0, -0.68, 0]}>
        <primitive object={group} />
      </group>
      <ContactShadows
        position={[0, -0.7, 0]}
        opacity={0.32}
        scale={3.4}
        blur={1.9}
        far={1.1}
        resolution={512}
        frames={Number.POSITIVE_INFINITY}
      />
    </>
  );
}
