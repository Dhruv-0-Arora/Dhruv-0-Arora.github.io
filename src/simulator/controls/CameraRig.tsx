import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DOZER_YAW_OFFSET } from "../dozer/DozerRig.tsx";
import {
  CRASH,
  popScale,
  SafeTrail,
  shakeAt,
  startCrash,
  stepWreck,
} from "../flyer/crash.ts";
import { FLYER_PERCH } from "../flyer/FlyerRig.tsx";
import { ProximityTracker } from "../proximity/proximity.ts";
import { frame, sim } from "../simStore.ts";
import { contract } from "../world/contract.ts";
import { flightFloor } from "../world/flightFloor.ts";
import type { HeightGrid } from "../world/heightGrid.ts";
import type { LoadedDistrict, WorldBase } from "../world/loadWorld.ts";
import type { TerrainSampler } from "../world/terrainSampler.ts";
import { clampAboveGround } from "./cameraGuard.ts";
import type { ControlMode } from "./controlMachine.ts";
import { parseDevCamera } from "./devCamera.ts";
import {
  advance,
  createDriveState,
  type DriveWorld,
  IDLE_INPUT,
} from "./driveController.ts";
import {
  advanceFlight,
  createFlightState,
  type FlightWorld,
  IDLE_FLIGHT,
} from "./flightController.ts";
import { lookTargetAt } from "./railPath.ts";
import { scroller, scrollMax } from "./scroller.ts";
import { buildLayout, buildStations, scrollFromRail } from "./stations.ts";
import { scrollTargetT } from "./useInputs.ts";

/**
 * Rail-following feel. The camera rides the rail; all smoothing is in t,
 * so it can never cut a chord through a hillside between two points of a
 * bend. A hop's own eased tween is followed exactly, so the camera stops
 * the moment the hop does; the smoothing below only softens a scroll
 * that is not a hop (a scrollbar drag).
 */
const RAILS = {
  /** How fast the smoothed rail t chases a non-hop scroll position, 1/s. */
  scrollFollow: 10,
  /**
   * Top speed along the rail for a non-hop scroll, m/s, so a scrollbar
   * yank is a fast ride rather than a teleport.
   */
  maxSpeed: 600,
  /** Closer than this to the scroll position, the rail t just lands, m. */
  land: 0.05,
  /** Aim damping, 1/s. */
  aimFollow: 8,
} as const;

/**
 * Station framing: at a site the camera lifts out of the lead car to a
 * third-person spot behind the train, and the lens widens, so the whole
 * installation reads with the train in the foreground. The weight runs
 * from 0, the seat in the lead car, to 1, fully framed.
 */
const FRAMING = {
  /**
   * Distance back from the seat for the framed eye, as a share of the
   * distance to the site, m/m, so a site close to the rail on a tight
   * terrace is not pushed out of reading range; clamped to [backMin, backMax].
   */
  backPerMeter: 0.45,
  backMin: 6,
  backMax: 12,
  /**
   * How much of "back" follows the rail (behind the train) rather than
   * the line from the site to the seat (behind the train as the camera
   * sees it), 0..1.
   */
  alongRail: 0.3,
  /**
   * Height above the seat for the framed eye, m: `up` at the full
   * pull-back, rising to `upTight` at the shortest one. On a tight terrace
   * the eye sits close to the train, so it climbs to look over the cars
   * rather than across them, and they stay low in the frame.
   */
  up: 4.5,
  upTight: 6.5,
  /** Fully framed within this many metres of a station... */
  near: 4,
  /** ...and not at all beyond this many. */
  far: 45,
  /** Weight damping, 1/s. */
  rate: 2.5,
  /** Framed vertical FOV by orientation, degrees. */
  fovLandscape: 64,
  fovPortrait: 82,
  /** Smallest FOV change worth a projection update, degrees. */
  fovEpsilon: 0.05,
} as const;

const CHASE = {
  back: 9.5,
  up: 4.2,
  aimUp: 1.1,
  follow: 5,
} as const;

/** Chase camera for the Flyer: further back, looking well ahead of the nose. */
const FLY = {
  back: 16,
  up: 5,
  aimAhead: 14,
  follow: 4,
  /**
   * After a crash the follow point freezes at the impact: the eye eases
   * back along the line of flight and up, to keep the wreck and the
   * burst in frame, and holds there.
   */
  crashBack: 18,
  crashUp: 14,
  crashFollow: 1.6,
} as const;

/** Extra room around an installation's box before the Flyer hits it, m. */
const FLIGHT_HIT_MARGIN = 1.2;

/** The flyable circle stays inside the terrain disc (470 m). */
const FLIGHT_RADIUS = 460;
const FLIGHT_CEILING = 230;

const RETURN = {
  follow: 3,
  /** Distance to the rail point at which the return counts as done, m. */
  arrive: 0.4,
} as const;

/** Where the ground raycast starts; nothing drivable is taller than this. */
const RAY_HEIGHT = 400;

/** Seconds with no ground underneath before the Dozer is respawned. */
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
  flyerRef: RefObject<THREE.Group | null>;
  /** Terrain heights for the flight floor; null until the range loads. */
  terrain: HeightGrid | null;
  /** The drivable terrain surface; null until the range loads. */
  sampler: TerrainSampler | null;
}

/**
 * The frame loop: integrates the Dozer and the Flyer, places the camera
 * for the current control mode, runs proximity, culls far districts, and
 * samples stats.
 */
export function CameraRig({
  world,
  districts,
  dozerRef,
  flyerRef,
  terrain,
  sampler,
}: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const driveWorld = useMemo<DriveWorld>(() => {
    const origin = new THREE.Vector3();
    const down = new THREE.Vector3(0, -1, 0);
    const b = world.meta.bounds;
    const lakes = world.meta.lakes;
    return {
      // Installation surfaces first (plaza, keys, field, boards), then the
      // range itself. Open water has no floor: the Dozer does not swim.
      groundHeight(x, z) {
        origin.set(x, RAY_HEIGHT, z);
        raycaster.set(origin, down);
        const hit = raycaster.intersectObject(world.ground, true)[0];
        if (hit) return hit.point.y;
        for (const lake of lakes) {
          const dx = x - lake.center[0];
          const dz = z - lake.center[2];
          if (dx * dx + dz * dz < lake.radius * lake.radius) return null;
        }
        return sampler ? sampler.heightAt(x, z) : null;
      },
      colliders: world.meta.colliders,
      bounds: {
        minX: b.min[0],
        maxX: b.max[0],
        minZ: b.min[2],
        maxZ: b.max[2],
      },
    };
  }, [world, raycaster, sampler]);

  const drive = useRef(createDriveState(0, 0, 0, 0));
  const flight = useRef(
    createFlightState(FLYER_PERCH.x, FLYER_PERCH.y, FLYER_PERCH.z),
  );
  const flightWorld = useMemo<FlightWorld>(() => {
    const colliders = world.meta.colliders;
    const m = FLIGHT_HIT_MARGIN;
    return {
      floorHeight: flightFloor(sampler, terrain, world.meta.lakes),
      // A point (with a margin for the wings) inside any installation box.
      hits(x, y, z) {
        for (const box of colliders) {
          if (Math.abs(y - box.center[1]) > box.half[1] + m) continue;
          const c = Math.cos(box.yaw);
          const sn = Math.sin(box.yaw);
          const wx = x - box.center[0];
          const wz = z - box.center[2];
          if (
            Math.abs(c * wx - sn * wz) < box.half[0] + m &&
            Math.abs(sn * wx + c * wz) < box.half[2] + m
          ) {
            return true;
          }
        }
        return false;
      },
      radius: FLIGHT_RADIUS,
      ceiling: FLIGHT_CEILING,
    };
  }, [world, terrain, sampler]);
  /** Recent flight positions, for the relaunch after a crash. */
  const safeTrail = useMemo(() => new SafeTrail(), []);
  /** The crash shake added to the camera last frame, taken off this one. */
  const shake = useMemo(() => new THREE.Vector3(), []);
  /** The airframe was relaunched this frame: the chase camera cuts to it. */
  const relaunchCut = useRef(false);
  const lastMode = useRef<ControlMode>("rails");
  /** Which vehicle the camera left from, for the glide back to the rail. */
  const vehicle = useRef<"dozer" | "flyer">("dozer");
  const offGround = useRef(0);
  const lostHold = useRef(0);
  const tracker = useMemo(
    () => new ProximityTracker(world.meta.zones),
    [world],
  );

  // The scroll layout needs the world meta, so it is published from here.
  // The scroll position is re-read through it at once: the page may have
  // been scrolled while the world was still loading.
  useEffect(() => {
    frame.layout = buildLayout(
      buildStations(world.meta, world.rail),
      world.rail.length,
    );
    frame.scrollT = scrollTargetT();
    return () => {
      frame.layout = null;
    };
  }, [world]);

  // Scratch vectors, allocated once.
  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      aim: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      right: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      target: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      v3: [0, 0, 0] as [number, number, number],
      shake: [0, 0, 0] as [number, number, number],
    }),
    [],
  );
  const smoothT = useRef(0);
  /** A hop was in flight last frame. */
  const hopped = useRef(false);
  /** Station framing weight, 0..1 (see FRAMING). */
  const framing = useRef(0);
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
    const s = scratch;
    const crash = frame.crash;
    camera.position.sub(shake);
    shake.set(0, 0, 0);
    // Reduced motion: every follow becomes an instant cut.
    const damp = snap.reducedMotion
      ? () => 1
      : (rate: number) => 1 - Math.exp(-rate * dt);

    // Station framing rises as the rail t closes on a station and falls
    // as it leaves; only the rails are ever framed.
    {
      let goal = 0;
      const layout = frame.layout;
      if (snap.mode === "rails" && layout) {
        let nearest = Number.POSITIVE_INFINITY;
        for (const st of layout.stations) {
          const d = Math.abs(smoothT.current - st.t) * world.rail.length;
          if (d < nearest) nearest = d;
        }
        const u = Math.min(
          1,
          Math.max(0, (nearest - FRAMING.near) / (FRAMING.far - FRAMING.near)),
        );
        goal = 1 - u * u * (3 - 2 * u);
      }
      framing.current += (goal - framing.current) * damp(FRAMING.rate);
    }
    if (camera instanceof THREE.PerspectiveCamera) {
      const portrait = camera.aspect < 1;
      const base = portrait ? FOV_PORTRAIT : FOV_LANDSCAPE;
      const wide = portrait ? FRAMING.fovPortrait : FRAMING.fovLandscape;
      const fov = base + (wide - base) * framing.current;
      if (Math.abs(camera.fov - fov) > FRAMING.fovEpsilon) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }

    // Mode changes: taking off starts the flight from wherever the Flyer
    // hangs, heading the way it was facing.
    // A wreck left behind by Esc stays where it lies until the rails have
    // the camera back, then the Flyer re-perches.
    if (snap.mode !== lastMode.current) {
      const rig = flyerRef.current;
      if (snap.mode === "flying" && rig) {
        crash.wreck = false;
        crash.relaunched = false;
        rig.scale.setScalar(1);
        flight.current = createFlightState(
          rig.position.x,
          rig.position.y,
          rig.position.z,
          rig.rotation.y,
        );
        safeTrail.reset(rig.position.x, rig.position.z);
        vehicle.current = "flyer";
      } else if (snap.mode === "driving") {
        vehicle.current = "dozer";
      } else if (snap.mode === "rails") {
        crash.wreck = false;
      }
      if (snap.mode !== "flying") {
        crash.relaunched = false;
        rig?.scale.setScalar(1);
        if (snap.crashed) sim.set({ crashed: false });
      }
      lastMode.current = snap.mode;
    }

    // Vehicle: always integrated so a parked Dozer settles onto the ground.
    const input = snap.mode === "driving" ? frame.input : IDLE_INPUT;
    advance(drive.current, input, dt, driveWorld);

    // The Flyer keeps gliding while the camera returns from it, so it never
    // freezes mid-air in view; it re-perches once the rails have it.
    const flyerActive =
      snap.mode === "flying" ||
      (snap.mode === "returning" && vehicle.current === "flyer");
    if (crash.active) {
      crash.t += dt;
      if (crash.t >= CRASH.effectEnd) crash.active = false;
    }
    if (flyerActive) {
      const rig = flyerRef.current;
      if (!crash.wreck) {
        const f = advanceFlight(
          flight.current,
          snap.mode === "flying" ? frame.flight : IDLE_FLIGHT,
          dt,
          flightWorld,
        );
        if (f.crashed) {
          startCrash(
            crash,
            { ...f, kind: f.crashed },
            flightWorld.floorHeight(f.x, f.z),
            Math.random() * 1000,
          );
          if (snap.mode === "flying") sim.set({ crashed: true });
        } else if (snap.mode === "flying") {
          safeTrail.record(f.x, f.z, dt);
        }
      } else {
        stepWreck(crash.body, dt, flightWorld.floorHeight);
        // Relaunch: a fresh airframe above where it was a few seconds ago,
        // heading for the hub at cruise speed.
        if (snap.mode === "flying" && crash.t >= CRASH.duration) {
          const r = safeTrail.relaunch(flight.current.yaw);
          const y = Math.min(
            FLIGHT_CEILING - 10,
            flightWorld.floorHeight(r.x, r.z) + CRASH.relaunchHeight,
          );
          flight.current = createFlightState(r.x, y, r.z, r.yaw);
          safeTrail.reset(r.x, r.z);
          crash.wreck = false;
          crash.relaunched = true;
          relaunchCut.current = true;
          sim.set({ crashed: false });
        }
      }
      if (rig) {
        if (crash.wreck) {
          const b = crash.body;
          rig.position.set(b.x, b.y, b.z);
          rig.rotation.set(-b.pitch, b.yaw, b.roll, "YXZ");
        } else {
          const f = flight.current;
          rig.position.set(f.x, f.y, f.z);
          rig.rotation.set(-f.pitch, f.yaw, f.roll, "YXZ");
          rig.scale.setScalar(
            crash.relaunched
              ? popScale(crash.t - CRASH.duration, snap.reducedMotion)
              : 1,
          );
        }
      }
    }

    // Out of bounds: no ground for long enough means the world has no
    // floor here (off the disc, in a lake). Put the Dozer back on the
    // nearest rail point.
    offGround.current = drive.current.grounded ? 0 : offGround.current + dt;
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
      drive.current.grounded = true;
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

    // First frame: start where the scroll already is (a reload mid-page)
    // rather than riding there from the hub under the speed limit.
    if (!currentTarget.current) {
      currentTarget.current = new THREE.Vector3();
      smoothT.current = frame.scrollT;
      lookTargetAt(world.meta.looks, smoothT.current, s.v3);
      currentTarget.current.set(s.v3[0], s.v3[1], s.v3[2]);
      world.rail.pointAt(smoothT.current, s.v3);
      camera.position.set(s.v3[0], s.v3[1], s.v3[2]);
    }
    const target = currentTarget.current;

    let probeX = drive.current.x;
    let probeZ = drive.current.z;

    if (snap.mode === "rails") {
      const before = smoothT.current;
      const L = world.rail.length;
      let next = frame.scrollT;
      // A hop is already eased: ride it exactly, so the camera arrives
      // with it. Anything else (a scrollbar drag) is smoothed and capped.
      // The frame after a hop ends still rides it, so a dropped frame at
      // the end of the tween can never leave a smoothed tail behind.
      const hopping = scroller.tweening || hopped.current;
      hopped.current = scroller.tweening;
      if (
        !hopping &&
        !snap.reducedMotion &&
        Math.abs(next - before) * L > RAILS.land
      ) {
        next = before + (next - before) * damp(RAILS.scrollFollow);
        const maxStep = (RAILS.maxSpeed / L) * dt;
        if (next > before + maxStep) next = before + maxStep;
        else if (next < before - maxStep) next = before - maxStep;
      }
      smoothT.current = next;
      const t = next;
      const travel = Math.abs(t - before);
      frame.railT = t;
      world.rail.pointAt(t, s.v3);
      s.pos.set(s.v3[0], s.v3[1], s.v3[2]);
      lookTargetAt(world.meta.looks, t, s.v3);
      s.aim.set(s.v3[0], s.v3[1], s.v3[2]);
      // Framed: blend toward a spot behind the train, as seen from the
      // site: back along the rail (the train faces +t) and away from the
      // aim, then up, so the train sits in the foreground of the shot.
      const w = framing.current;
      if (w > 0) {
        world.rail.tangentAt(t, s.v3);
        s.forward.set(-s.v3[0], 0, -s.v3[2]).normalize();
        s.dir.set(s.pos.x - s.aim.x, 0, s.pos.z - s.aim.z);
        const back = Math.min(
          FRAMING.backMax,
          Math.max(FRAMING.backMin, s.dir.length() * FRAMING.backPerMeter),
        );
        const tight =
          (FRAMING.backMax - back) / (FRAMING.backMax - FRAMING.backMin);
        const up = FRAMING.up + (FRAMING.upTight - FRAMING.up) * tight;
        s.dir.normalize();
        s.forward
          .multiplyScalar(FRAMING.alongRail)
          .addScaledVector(s.dir, 1 - FRAMING.alongRail);
        if (s.forward.lengthSq() < 1e-6) s.forward.copy(s.dir);
        s.forward.normalize();
        s.target
          .copy(s.pos)
          .addScaledVector(s.forward, back)
          .setY(s.pos.y + up);
        s.pos.lerp(s.target, w);
      }
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

      camera.position.copy(s.pos);
      target.lerp(s.desired, damp(RAILS.aimFollow));
    } else if (snap.mode === "flying" && crash.wreck) {
      // Down: the follow point stays at the impact, the eye eases back and
      // up from it, the aim tracks the tumbling wreck, and the first
      // instant shakes.
      const b = crash.body;
      s.desired.set(
        crash.x - crash.dirX * FLY.crashBack,
        crash.y + FLY.crashUp,
        crash.z - crash.dirZ * FLY.crashBack,
      );
      camera.position.lerp(s.desired, damp(FLY.crashFollow));
      s.aim.set(b.x, b.y, b.z);
      target.lerp(s.aim, damp(FLY.follow * 2));
      shakeAt(crash.t, snap.reducedMotion, s.shake);
      shake.set(s.shake[0], s.shake[1], s.shake[2]);
      camera.position.add(shake);
      probeX = b.x;
      probeZ = b.z;
    } else if (snap.mode === "flying") {
      const f = flight.current;
      const cp = Math.cos(f.pitch);
      s.forward.set(
        Math.sin(f.yaw) * cp,
        Math.sin(f.pitch),
        Math.cos(f.yaw) * cp,
      );
      s.desired.set(f.x, f.y, f.z).addScaledVector(s.forward, -FLY.back);
      s.desired.y += FLY.up;
      s.aim.set(f.x, f.y, f.z).addScaledVector(s.forward, FLY.aimAhead);
      if (relaunchCut.current) {
        // A fresh airframe somewhere else: cut to it, no long glide over.
        camera.position.copy(s.desired);
        target.copy(s.aim);
        relaunchCut.current = false;
      } else {
        camera.position.lerp(s.desired, damp(FLY.follow));
        target.lerp(s.aim, damp(FLY.follow * 2));
      }
      probeX = f.x;
      probeZ = f.z;
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
        const from =
          vehicle.current === "flyer" ? flight.current : drive.current;
        frame.returnT = world.rail.nearestT([from.x, from.y, from.z]);
        smoothT.current = frame.returnT;
        frame.look.reset();
        // Park the page where the scroll maps back onto this rail t, so
        // the next wheel notch continues from here rather than jumping.
        const parked = frame.layout
          ? scrollFromRail(frame.returnT, frame.layout)
          : frame.returnT;
        window.scrollTo({ top: parked * scrollMax(), behavior: "instant" });
      }
      const t = frame.returnT;
      frame.railT = t;
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

    // Safety net for every mode: the range is hollow underneath, so the
    // eye never goes below the surface, whichever path brought it here.
    if (sampler) {
      camera.position.y = clampAboveGround(
        camera.position.y,
        sampler.heightAt(camera.position.x, camera.position.z),
      );
    }
    camera.lookAt(target);

    // Proximity, and the probe other systems react to (hex glow).
    frame.probe[0] = probeX;
    frame.probe[1] =
      snap.mode === "flying" ? flight.current.y : drive.current.y;
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
