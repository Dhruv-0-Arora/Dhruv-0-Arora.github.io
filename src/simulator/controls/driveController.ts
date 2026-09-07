/**
 * Kinematic arcade drive model for the Dozer. No physics engine: velocity
 * and yaw are integrated in fixed 120 Hz substeps so 30, 60 and 120 Hz
 * callers produce the same trajectory, the ground is followed by a height
 * query, and box colliders push the vehicle out as a circle in XZ.
 */

export interface DriveState {
  x: number;
  y: number;
  z: number;
  /** Heading in radians about +Y; forward is (sin yaw, 0, cos yaw). */
  yaw: number;
  /** Signed speed along the heading, m/s. Negative is reverse. */
  speed: number;
  /** Unconsumed simulation time, seconds. */
  acc: number;
}

export interface DriveInput {
  /** -1 (reverse) to 1 (forward). */
  throttle: number;
  /** -1 (left) to 1 (right). */
  steer: number;
}

export interface Aabb {
  min: [number, number, number];
  max: [number, number, number];
}

export interface DriveWorld {
  /** Ground height under (x, z), or null when off the world. */
  groundHeight(x: number, z: number): number | null;
  colliders: readonly Aabb[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export const DRIVE = {
  /** Fixed substep, seconds. */
  step: 1 / 120,
  maxSpeed: 12,
  maxReverse: 4,
  accel: 16,
  brake: 26,
  /** Speed lost per second with no throttle, m/s^2. */
  coast: 6,
  /** Yaw rate at full steer, rad/s, scaled by how fast the vehicle moves. */
  turnRate: 2.4,
  /** Speed at which the vehicle turns at its full rate, m/s. */
  turnSaturation: 5,
  /** Collision circle, meters, for the 2 m Dozer. */
  radius: 1.3,
  /** Vehicle body height above the ground sample, meters. */
  ride: 0,
  /** Speed kept per substep while rubbing a collider (~0.55/s of contact). */
  scrape: 0.995,
} as const;

export const IDLE_INPUT: DriveInput = { throttle: 0, steer: 0 };

export function createDriveState(
  x: number,
  y: number,
  z: number,
  yaw = 0,
): DriveState {
  return { x, y, z, yaw, speed: 0, acc: 0 };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function substep(s: DriveState, input: DriveInput, world: DriveWorld): void {
  const dt = DRIVE.step;
  const throttle = clamp(input.throttle, -1, 1);
  const steer = clamp(input.steer, -1, 1);

  // Longitudinal: throttle accelerates, opposing throttle brakes, nothing coasts.
  let speed = s.speed;
  if (
    throttle !== 0 &&
    Math.sign(throttle) !== Math.sign(speed) &&
    speed !== 0
  ) {
    speed -= Math.sign(speed) * DRIVE.brake * dt;
    if (Math.sign(speed) !== Math.sign(s.speed)) speed = 0;
  } else if (throttle !== 0) {
    speed += throttle * DRIVE.accel * dt;
  } else if (speed !== 0) {
    const decel = DRIVE.coast * dt;
    speed = Math.abs(speed) <= decel ? 0 : speed - Math.sign(speed) * decel;
  }
  speed = clamp(speed, -DRIVE.maxReverse, DRIVE.maxSpeed);

  // Yaw: no turning at a standstill; reverse steers like a car backing up.
  const turn = clamp(Math.abs(speed) / DRIVE.turnSaturation, 0, 1);
  const yaw =
    s.yaw - steer * Math.sign(speed || 0) * DRIVE.turnRate * turn * dt;

  let x = s.x + Math.sin(yaw) * speed * dt;
  let z = s.z + Math.cos(yaw) * speed * dt;

  // Colliders: circle vs AABB in XZ, two passes so corners resolve. Only the
  // position is corrected, so motion along a wall keeps sliding.
  for (let pass = 0; pass < 2; pass++) {
    for (const box of world.colliders) {
      const cx = clamp(x, box.min[0], box.max[0]);
      const cz = clamp(z, box.min[2], box.max[2]);
      let dx = x - cx;
      let dz = z - cz;
      let d = Math.hypot(dx, dz);
      if (d >= DRIVE.radius) continue;
      if (d === 0) {
        // Center inside the box: exit through the nearest face.
        const toMin = [x - box.min[0], z - box.min[2]];
        const toMax = [box.max[0] - x, box.max[2] - z];
        const m = Math.min(toMin[0], toMin[1], toMax[0], toMax[1]);
        if (m === toMin[0]) dx = -1;
        else if (m === toMax[0]) dx = 1;
        else if (m === toMin[1]) dz = -1;
        else dz = 1;
        d = 0;
        x += dx * (DRIVE.radius + m);
        z += dz * (DRIVE.radius + m);
      } else {
        const push = DRIVE.radius - d;
        x += (dx / d) * push;
        z += (dz / d) * push;
      }
      speed *= DRIVE.scrape;
    }
  }

  const b = world.bounds;
  x = clamp(x, b.minX + DRIVE.radius, b.maxX - DRIVE.radius);
  z = clamp(z, b.minZ + DRIVE.radius, b.maxZ - DRIVE.radius);

  const ground = world.groundHeight(x, z);
  s.x = x;
  s.z = z;
  s.y = ground === null ? s.y : ground + DRIVE.ride;
  s.yaw = yaw;
  s.speed = speed;
}

/**
 * Advances the state by `dt` seconds in fixed substeps. Mutates and returns
 * `state`. Leftover time is carried in `state.acc`, so any frame rate
 * integrates the identical sequence of substeps.
 */
export function advance(
  state: DriveState,
  input: DriveInput,
  dt: number,
  world: DriveWorld,
): DriveState {
  // Cap so a background tab does not simulate minutes on resume.
  state.acc += Math.min(dt, 0.25);
  while (state.acc >= DRIVE.step) {
    substep(state, input, world);
    state.acc -= DRIVE.step;
  }
  return state;
}

/** Circle-vs-AABB test used by the out-of-bounds check and tests. */
export function penetrates(state: DriveState, box: Aabb): boolean {
  const cx = clamp(state.x, box.min[0], box.max[0]);
  const cz = clamp(state.z, box.min[2], box.max[2]);
  return Math.hypot(state.x - cx, state.z - cz) < DRIVE.radius - 1e-6;
}
