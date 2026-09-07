/**
 * Arcade flight for the Flyer, as a pure fixed-step integrator like the
 * drive model. Throttle sets speed, bank turns, pitch climbs and dives;
 * the aircraft levels itself when the keys are released, never stalls,
 * never goes below the terrain, and steers itself back when it reaches
 * the edge of the world. Heading uses the same convention as driving:
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
}

export interface FlightInput {
  /** -1..1: back off or open the throttle. */
  throttle: number;
  /** -1..1: bank left or right. */
  steer: number;
  /** -1..1: dive or climb. */
  pitch: number;
}

export interface FlightWorld {
  /** Lowest safe altitude over this map position, metres. */
  floorHeight(x: number, z: number): number;
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
  /** Metres kept above the floor. */
  clearance: 5,
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
  return { x, y, z, yaw, pitch: 0, roll: 0, speed: FLIGHT.cruise, acc: 0 };
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
  const floor = world.floorHeight(x, z) + FLIGHT.clearance;
  if (y < floor) {
    y = floor;
    if (pitch < 0) pitch = 0;
  }
  if (y > world.ceiling) {
    y = world.ceiling;
    if (pitch > 0) pitch = 0;
  }

  s.x = x;
  s.y = y;
  s.z = z;
  s.yaw = yaw;
  s.pitch = pitch;
  s.roll = roll;
  s.speed = speed;
}

/**
 * Advances the state by `dt` seconds in fixed substeps. Mutates and
 * returns `state`; leftover time is carried in `state.acc`.
 */
export function advanceFlight(
  state: FlightState,
  input: FlightInput,
  dt: number,
  world: FlightWorld,
): FlightState {
  state.acc += Math.min(dt, 0.25);
  while (state.acc >= FLIGHT.step) {
    substep(state, input, world);
    state.acc -= FLIGHT.step;
  }
  return state;
}
