import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { DOZER_YAW_OFFSET } from "../dozer/DozerRig.tsx";
import { ProximityTracker } from "../proximity/proximity.ts";
import { frame, sim } from "../simStore.ts";
import { contract } from "../world/contract.ts";
import type { LoadedDistrict, WorldBase } from "../world/loadWorld.ts";
import { parseDevCamera } from "./devCamera.ts";
import {
  advance,
  createDriveState,
  type DriveWorld,
  IDLE_INPUT,
} from "./driveController.ts";
import { lookTargetAt } from "./railPath.ts";

/** Rail-following and chase-camera feel. */
const RAILS = {
  /** How fast the smoothed rail t chases the scroll position, 1/s. */
  scrollFollow: 4,
  /** Camera position damping, 1/s. */
  positionFollow: 8,
} as const;

const CHASE = {
  back: 7,
  up: 3.2,
  aimUp: 0.8,
  follow: 5,
} as const;

const RETURN = {
  follow: 3,
  /** Distance to the rail point at which the return counts as done, m. */
  arrive: 0.4,
} as const;

/** Where the ground raycast starts; nothing is taller than this. */
const RAY_HEIGHT = 200;

/** Seconds off the collision ground before the Dozer is respawned. */
const SIGNAL_LOST_AFTER = 0.6;
/** How long the "SIGNAL LOST" line stays up after the respawn, seconds. */
const SIGNAL_LOST_HOLD = 1.4;

/** Vertical field of view by orientation: portrait phones need to see more. */
const FOV_LANDSCAPE = 50;
const FOV_PORTRAIT = 70;

interface CameraRigProps {
  world: WorldBase;
  districts: readonly LoadedDistrict[];
  dozerRef: RefObject<THREE.Group | null>;
}

/**
 * The frame loop: integrates the Dozer, places the camera for the current
 * control mode, runs proximity, culls far districts, and samples stats.
 */
export function CameraRig({ world, districts, dozerRef }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const driveWorld = useMemo<DriveWorld>(() => {
    const origin = new THREE.Vector3();
    const down = new THREE.Vector3(0, -1, 0);
    const b = world.meta.bounds;
    return {
      groundHeight(x, z) {
        origin.set(x, RAY_HEIGHT, z);
        raycaster.set(origin, down);
        const hit = raycaster.intersectObject(world.ground, true)[0];
        lastHeight.current = hit ? hit.point.y : null;
        return lastHeight.current;
      },
      colliders: world.meta.colliders.map((c) => ({ min: c.min, max: c.max })),
      bounds: {
        minX: b.min[0],
        maxX: b.max[0],
        minZ: b.min[2],
        maxZ: b.max[2],
      },
    };
  }, [world, raycaster]);

  const drive = useRef(createDriveState(0, 0, 0, 0));
  const offGround = useRef(0);
  const lostHold = useRef(0);
  const lastHeight = useRef<number | null>(0);
  const tracker = useMemo(
    () => new ProximityTracker(world.meta.zones),
    [world],
  );

  // Scratch vectors, allocated once.
  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      aim: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      right: new THREE.Vector3(),
      target: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      v3: [0, 0, 0] as [number, number, number],
    }),
    [],
  );
  const smoothT = useRef(0);
  const currentTarget = useRef<THREE.Vector3 | null>(null);
  const statClock = useRef({ t: 0, frames: 0 });
  const devCamera = useMemo(
    () => (import.meta.env.DEV ? parseDevCamera(window.location.search) : null),
    [],
  );

  const finishFrame = (rawDt: number) => {
    // Distance culling per district. The backdrop is the horizon: always on.
    const cull = contract.world.cullDistanceMeters;
    for (const d of districts) {
      d.group.visible =
        d.district === "backdrop" ||
        d.center.distanceTo(camera.position) < cull;
    }

    // Stats, twice a second.
    const clock = statClock.current;
    clock.t += rawDt;
    clock.frames++;
    if (clock.t >= 0.5) {
      sim.set({
        stats: {
          fps: Math.round(clock.frames / clock.t),
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
        },
      });
      clock.t = 0;
      clock.frames = 0;
    }
  };

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const snap = sim.get();
    if (devCamera && camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(...devCamera.position);
      camera.lookAt(...devCamera.target);
      if (camera.fov !== devCamera.fov) {
        camera.fov = devCamera.fov;
        camera.updateProjectionMatrix();
      }
      finishFrame(rawDt);
      return;
    }
    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = camera.aspect < 1 ? FOV_PORTRAIT : FOV_LANDSCAPE;
      if (camera.fov !== fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
    const s = scratch;
    // Reduced motion: every follow becomes an instant cut.
    const damp = snap.reducedMotion
      ? () => 1
      : (rate: number) => 1 - Math.exp(-rate * dt);

    // Vehicle: always integrated so a parked Dozer settles onto the ground.
    const input = snap.mode === "driving" ? frame.input : IDLE_INPUT;
    advance(drive.current, input, dt, driveWorld);

    // Out of bounds: off the collision ground for long enough means the
    // world has no floor here. Put the Dozer back on the nearest rail point.
    offGround.current =
      lastHeight.current === null ? offGround.current + dt : 0;
    if (offGround.current > SIGNAL_LOST_AFTER) {
      const t = world.rail.nearestT([
        drive.current.x,
        drive.current.y,
        drive.current.z,
      ]);
      world.rail.pointAt(t, s.v3);
      const ground = driveWorld.groundHeight(s.v3[0], s.v3[2]) ?? 0;
      drive.current.x = s.v3[0];
      drive.current.z = s.v3[2];
      drive.current.y = ground;
      drive.current.speed = 0;
      offGround.current = 0;
      lostHold.current = SIGNAL_LOST_HOLD;
      if (!snap.signalLost) sim.set({ signalLost: true });
    } else if (lostHold.current > 0) {
      lostHold.current -= dt;
      if (lostHold.current <= 0 && snap.signalLost)
        sim.set({ signalLost: false });
    }
    const dozer = dozerRef.current;
    if (dozer) {
      dozer.position.set(drive.current.x, drive.current.y, drive.current.z);
      dozer.rotation.y = drive.current.yaw + DOZER_YAW_OFFSET;
    }

    if (!currentTarget.current) {
      currentTarget.current = new THREE.Vector3();
      lookTargetAt(world.meta.looks, 0, s.v3);
      currentTarget.current.set(s.v3[0], s.v3[1], s.v3[2]);
      world.rail.pointAt(0, s.v3);
      camera.position.set(s.v3[0], s.v3[1], s.v3[2]);
    }
    const target = currentTarget.current;

    let probeX = drive.current.x;
    let probeZ = drive.current.z;

    if (snap.mode === "rails") {
      const before = smoothT.current;
      smoothT.current +=
        (frame.scrollT - smoothT.current) * damp(RAILS.scrollFollow);
      const t = smoothT.current;
      const travel = Math.abs(t - before);
      world.rail.pointAt(t, s.v3);
      s.pos.set(s.v3[0], s.v3[1], s.v3[2]);
      lookTargetAt(world.meta.looks, t, s.v3);
      s.aim.set(s.v3[0], s.v3[1], s.v3[2]);
      probeX = s.aim.x;
      probeZ = s.aim.z;

      // Click-and-drag look: rotate the aim by the offset, which coasts
      // after release and recenters as the rail travels.
      frame.look.options.reducedMotion = snap.reducedMotion;
      const look = frame.look.step(dt, travel);
      s.dir.subVectors(s.aim, s.pos);
      s.right.crossVectors(s.dir, s.up).normalize();
      s.dir.applyAxisAngle(s.up, look.yaw);
      s.dir.applyAxisAngle(s.right, look.pitch);
      s.desired.addVectors(s.pos, s.dir);

      camera.position.lerp(s.pos, damp(RAILS.positionFollow));
      target.lerp(s.desired, damp(RAILS.positionFollow));
    } else if (snap.mode === "driving") {
      const yaw = drive.current.yaw;
      s.desired.set(
        drive.current.x - Math.sin(yaw) * CHASE.back,
        drive.current.y + CHASE.up,
        drive.current.z - Math.cos(yaw) * CHASE.back,
      );
      camera.position.lerp(s.desired, damp(CHASE.follow));
      s.aim.set(
        drive.current.x,
        drive.current.y + CHASE.aimUp,
        drive.current.z,
      );
      target.lerp(s.aim, damp(CHASE.follow * 2));
    } else {
      if (frame.returnT === null) {
        frame.returnT = world.rail.nearestT([
          drive.current.x,
          drive.current.y,
          drive.current.z,
        ]);
        smoothT.current = frame.returnT;
        frame.look.reset();
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: frame.returnT * max, behavior: "instant" });
      }
      const t = frame.returnT;
      world.rail.pointAt(t, s.v3);
      s.pos.set(s.v3[0], s.v3[1], s.v3[2]);
      lookTargetAt(world.meta.looks, t, s.v3);
      s.aim.set(s.v3[0], s.v3[1], s.v3[2]);
      camera.position.lerp(s.pos, damp(RETURN.follow));
      target.lerp(s.aim, damp(RETURN.follow));
      probeX = s.aim.x;
      probeZ = s.aim.z;
      if (camera.position.distanceTo(s.pos) < RETURN.arrive) {
        sim.dispatch({ type: "RETURNED" });
      }
    }
    camera.lookAt(target);

    // Proximity, and the probe other systems react to (hex glow).
    frame.probe[0] = probeX;
    frame.probe[1] = drive.current.y;
    frame.probe[2] = probeZ;
    const change = tracker.update(probeX, probeZ);
    if (change.entered || change.exited) {
      sim.set({ zone: change.active });
      if (import.meta.env.DEV) {
        console.log(
          "[proximity]",
          change.exited ? `exit ${change.exited}` : "",
          change.entered ? `enter ${change.entered}` : "",
        );
      }
    }

    finishFrame(rawDt);
  });

  return null;
}
