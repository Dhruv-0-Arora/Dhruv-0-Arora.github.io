/**
 * Arcade flight for the Flyer, as a pure fixed-step integrator like the
 * drive model. Throttle sets speed, bank turns, pitch climbs and dives;
 * the aircraft levels itself when the keys are released, never stalls,
 * and steers itself back when it reaches the edge of the world. It can be
 * flown into the ground: grazing the terrain skims along it, but meeting
 * it too fast, nose too far down, or flying into an installation ends the
 * flight with `crashed` set, after which the state no longer advances. Heading uses the same convention as driving:
 * yaw 0 points along +z, x = sin(yaw).
 */

export interface FlightState {
  x: number;
  y: number;
  z: number;
  yaw: number;
  /** Nose angle above the horizon, radians. */
  pitch: number;
  /** Bank angle, radians, positive banking right. */
  roll: number;
  /** Airspeed, m/s. */
  speed: number;
  /** Unconsumed time carried between frames. */
  acc: number;
  /** What ended the flight, or null while it is still flying. */
  crashed: CrashKind | null;
}

/** The terrain (or a lake) came up too fast, or an installation was hit. */
export type CrashKind = "ground" | "collider";

export interface FlightInput {
  /** -1..1: back off or open the throttle. */
  throttle: number;
  /** -1..1: bank left or right. */
  steer: number;
  /** -1..1: dive or climb. */
  pitch: number;
}

export interface FlightWorld {
  /** Height of the surface under this map position, metres. */
  floorHeight(x: number, z: number): number;
  /** True when a point is inside something solid (an installation). */
  hits?(x: number, y: number, z: number): boolean;
  /** Radius of the flyable circle around the origin, metres. */
  radius: number;
  ceiling: number;
}

export const FLIGHT = {
  step: 1 / 120,
  minSpeed: 9,
  maxSpeed: 30,
  /** Speed the throttle drifts back to when released. */
  cruise: 16,
  accel: 7,
  /** How fast the released throttle drifts to cruise, 1/s. */
  settle: 0.4,
  /** Climbing costs speed and diving gains it, m/s^2 per unit sine. */
  gravity: 5,
  rollMax: 0.8,
  rollRate: 2.4,
  /** Turn rate at full bank, rad/s. */
  yawRate: 0.85,
  pitchMax: 0.5,
  pitchRate: 1.6,
  /** Height of the rig origin above the floor when skimming level, m. */
  clearance: 1.2,
  /** Extra room kept under the lowest point of a banked or pitched hull, m. */
  hullMargin: 0.15,
  /**
   * Meeting the floor faster than this, m/s (the plane's own sink plus
   * the terrain rising under it), is a crash; slower skims along it.
   */
  crashClosure: 3,
  /** Touching the floor with the nose further down than this is a crash. */
  crashPitch: -0.15,
  /** Fraction of the radius past which the nose is steered home. */
  homing: 0.9,
  homingRate: 1.2,
} as const;

export const IDLE_FLIGHT: FlightInput = { throttle: 0, steer: 0, pitch: 0 };

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function ease(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

/** Smallest signed angle from `a` to `b`. */
export function angleTo(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function createFlightState(
  x: number,
  y: number,
  z: number,
  yaw = 0,
): FlightState {
  return {
    x,
    y,
    z,
    yaw,
    pitch: 0,
    roll: 0,
    speed: FLIGHT.cruise,
    acc: 0,
    crashed: null,
  };
}

/**
 * The Flyer's outline as a few extreme points in its own frame (nose +z,
 * lower wing at y = 0): the wing tips of both wings, the skid runners, the
 * elevator out front and the rudders behind. Mirrors the dimensions in
 * `FlyerRig.tsx`.
 */
const HULL: readonly (readonly [number, number, number])[] = [
  [-6.1, -0.14, 0],
  [6.1, -0.14, 0],
  [-6.1, 1.71, 0],
  [6.1, 1.71, 0],
  [-1.2, -0.78, -1.9],
  [1.2, -0.78, -1.9],
  [-1.2, -0.78, 1.8],
  [1.2, -0.78, 1.8],
  [0, 0.08, 3.6],
  [0, 0.86, 3.6],
  [0, 0.15, -3.7],
  [0, 1.9, -3.7],
];

/**
 * How far the lowest point of the hull hangs below the rig origin for a
 * given pitch and roll, m. The pose is `rotation.set(-pitch, yaw, roll,
 * "YXZ")`; yaw does not move anything up or down.
 */
export function hullSupport(pitch: number, roll: number): number {
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const ca = Math.cos(-pitch);
  const sa = Math.sin(-pitch);
  let low = 0;
  for (const [x, y, z] of HULL) {
    const y1 = x * sr + y * cr;
    const h = y1 * ca - z * sa;
    if (h < low) low = h;
  }
  return -low;
}

/** Rig origin height that keeps the hull clear of a surface at `ground`. */
export function floorFor(ground: number, pitch: number, roll: number): number {
  return (
    ground +
    Math.max(FLIGHT.clearance, hullSupport(pitch, roll) + FLIGHT.hullMargin)
  );
}

function substep(s: FlightState, input: FlightInput, world: FlightWorld) {
  const dt = FLIGHT.step;
  const throttle = clamp(input.throttle, -1, 1);
  const steer = clamp(input.steer, -1, 1);
  const wantPitch = clamp(input.pitch, -1, 1);

  let speed = s.speed;
  if (throttle !== 0) speed += throttle * FLIGHT.accel * dt;
  else speed += (FLIGHT.cruise - speed) * ease(FLIGHT.settle, dt);
  speed -= Math.sin(s.pitch) * FLIGHT.gravity * dt;
  speed = clamp(speed, FLIGHT.minSpeed, FLIGHT.maxSpeed);

  const roll =
    s.roll + (steer * FLIGHT.rollMax - s.roll) * ease(FLIGHT.rollRate, dt);
  let yaw = s.yaw - (roll / FLIGHT.rollMax) * FLIGHT.yawRate * dt;
  let pitch =
    s.pitch +
    (wantPitch * FLIGHT.pitchMax - s.pitch) * ease(FLIGHT.pitchRate, dt);

  // Past the homing line the nose is bent back toward the hub, harder
  // the further out it is, so the edge of the world is never a wall.
  const r = Math.hypot(s.x, s.z);
  const homeFrom = world.radius * FLIGHT.homing;
  if (r > homeFrom) {
    const home = Math.atan2(-s.x, -s.z);
    const urgency = clamp((r - homeFrom) / (world.radius - homeFrom), 0, 1);
    yaw += angleTo(yaw, home) * ease(FLIGHT.homingRate * (0.3 + urgency), dt);
  }

  const cp = Math.cos(pitch);
  let x = s.x + Math.sin(yaw) * cp * speed * dt;
  let z = s.z + Math.cos(yaw) * cp * speed * dt;
  let y = s.y + Math.sin(pitch) * speed * dt;

  const rr = Math.hypot(x, z);
  if (rr > world.radius) {
    x *= world.radius / rr;
    z *= world.radius / rr;
  }
  // The floor keeps the whole hull above the surface, so a bank near the
  // ground lifts the aircraft rather than burying a wing. Whether touching
  // it is a crash depends only on how fast the surface closes: the
  // aircraft's own sink plus the terrain rising under it.
  const ground = world.floorHeight(x, z);
  const floor = floorFor(ground, pitch, roll);
  let crashed: CrashKind | null = null;
  if (y < floor) {
    const closure =
      (s.y - y) / dt + (ground - world.floorHeight(s.x, s.z)) / dt;
    if (closure > FLIGHT.crashClosure || pitch < FLIGHT.crashPitch) {
      crashed = "ground";
    }
    y = floor;
  }
  if (y > world.ceiling) {
    y = world.ceiling;
    if (pitch > 0) pitch = 0;
  }
  if (!crashed && world.hits?.(x, y, z)) crashed = "collider";

  s.x = x;
  s.y = y;
  s.z = z;
  s.yaw = yaw;
  s.pitch = pitch;
  s.roll = roll;
  s.speed = speed;
  s.crashed = crashed;
}

/**
 * Advances the state by `dt` seconds in fixed substeps. Mutates and
 * returns `state`; leftover time is carried in `state.acc`. Once
 * `crashed` is set the state stays where it ended.
 */
export function advanceFlight(
  state: FlightState,
  input: FlightInput,
  dt: number,
  world: FlightWorld,
): FlightState {
  state.acc += Math.min(dt, 0.25);
  if (state.crashed) return state;
  while (state.acc >= FLIGHT.step) {
    substep(state, input, world);
    if (state.crashed) {
      state.acc = 0;
      break;
    }
    state.acc -= FLIGHT.step;
  }
  return state;
}
