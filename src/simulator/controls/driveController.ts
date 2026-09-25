/**
 * Kinematic arcade drive model for the Dozer. No physics engine: velocity
 * and yaw are integrated in fixed 120 Hz substeps so 30, 60 and 120 Hz
 * callers produce the same trajectory, the ground is followed by a height
 * query, and oriented box colliders push the vehicle out as a circle in XZ.
 *
 * Traction: a substep that would climb steeper than `DRIVE.maxGrade`
 * along its motion is refused, so the Dozer climbs every trail and ramp
 * but not a cliff. The grade is measured over at least `gradeProbe` of
 * horizontal run, so a small lip between two surfaces reads as the step it
 * is rather than a wall, and the verdict does not depend on speed.
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
  /** Whether the last accepted position had ground under it. */
  grounded: boolean;
}

export interface DriveInput {
  /** -1 (reverse) to 1 (forward). */
  throttle: number;
  /** -1 (left) to 1 (right). */
  steer: number;
}

/** A box in XZ: centre, half extents and a yaw about +Y (Y is ignored). */
export interface OrientedBox {
  center: readonly [number, number, number];
  half: readonly [number, number, number];
  yaw: number;
}

export interface DriveWorld {
  /** Ground height under (x, z), or null when off the world. */
  groundHeight(x: number, z: number): number | null;
  colliders: readonly OrientedBox[];
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
  /** Steepest uphill grade (rise over run) the tracks hold, ~35 degrees. */
  maxGrade: 0.7,
  /** Shortest horizontal run the grade is measured over, meters. */
  gradeProbe: 0.5,
  /** Speed kept when a climb is refused. */
  refusedSpeed: 0.5,
} as const;

export const IDLE_INPUT: DriveInput = { throttle: 0, steer: 0 };

export function createDriveState(
  x: number,
  y: number,
  z: number,
  yaw = 0,
): DriveState {
  return { x, y, z, yaw, speed: 0, acc: 0, grounded: true };
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

  // Colliders: circle vs oriented box in XZ, two passes so corners
  // resolve. The vehicle is taken into the box's own frame, pushed out of
  // the axis-aligned box there and brought back; only the position is
  // corrected, so motion along a wall keeps sliding.
  for (let pass = 0; pass < 2; pass++) {
    for (const box of world.colliders) {
      const c = Math.cos(box.yaw);
      const sn = Math.sin(box.yaw);
      const wx = x - box.center[0];
      const wz = z - box.center[2];
      // Local axes: +X is (c, -sn) in world XZ, +Z is (sn, c).
      let lx = c * wx - sn * wz;
      let lz = sn * wx + c * wz;
      const hx = box.half[0];
      const hz = box.half[2];
      const cx = clamp(lx, -hx, hx);
      const cz = clamp(lz, -hz, hz);
      const dx = lx - cx;
      const dz = lz - cz;
      const d = Math.hypot(dx, dz);
      if (d >= DRIVE.radius) continue;
      if (d === 0) {
        // Center inside the box: exit through the nearest face.
        const toMin = [lx + hx, lz + hz];
        const toMax = [hx - lx, hz - lz];
        const m = Math.min(toMin[0], toMin[1], toMax[0], toMax[1]);
        if (m === toMin[0]) lx -= DRIVE.radius + m;
        else if (m === toMax[0]) lx += DRIVE.radius + m;
        else if (m === toMin[1]) lz -= DRIVE.radius + m;
        else lz += DRIVE.radius + m;
      } else {
        const push = DRIVE.radius - d;
        lx += (dx / d) * push;
        lz += (dz / d) * push;
      }
      x = box.center[0] + c * lx + sn * lz;
      z = box.center[2] - sn * lx + c * lz;
      speed *= DRIVE.scrape;
    }
  }

  const b = world.bounds;
  x = clamp(x, b.minX + DRIVE.radius, b.maxX - DRIVE.radius);
  z = clamp(z, b.minZ + DRIVE.radius, b.maxZ - DRIVE.radius);

  const ground = world.groundHeight(x, z);
  if (ground !== null && tooSteep(s, x, z, ground, world)) {
    // Refused: the tracks spin. Heading still changes so the driver can
    // turn away or back off; downhill is never refused.
    s.yaw = yaw;
    s.speed = speed * DRIVE.refusedSpeed;
    return;
  }
  s.x = x;
  s.z = z;
  s.y = ground === null ? s.y : ground + DRIVE.ride;
  s.grounded = ground !== null;
  s.yaw = yaw;
  s.speed = speed;
}

/**
 * Uphill grade from the current ground to the candidate position, rise over
 * horizontal run. A step shorter than `gradeProbe` is measured over that
 * probe distance along the same direction instead, so the answer is the
 * slope of the ground, not of one 1/120 s hop.
 */
function tooSteep(
  s: DriveState,
  x: number,
  z: number,
  ground: number,
  world: DriveWorld,
): boolean {
  const dx = x - s.x;
  const dz = z - s.z;
  const run = Math.hypot(dx, dz);
  if (run < 1e-9) return false;
  const from = s.y - DRIVE.ride;
  let ahead = ground;
  let span = run;
  // The probe runs ahead of every hop, so it meets a slope before the
  // vehicle does and a lip of a few centimetres reads as a few percent.
  if (run < DRIVE.gradeProbe) {
    span = DRIVE.gradeProbe;
    const k = span / run;
    const probe = world.groundHeight(s.x + dx * k, s.z + dz * k);
    if (probe === null) return false;
    ahead = probe;
  }
  return (ahead - from) / span > DRIVE.maxGrade;
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

/** Circle-vs-oriented-box test, for the tests. */
export function penetrates(state: DriveState, box: OrientedBox): boolean {
  const c = Math.cos(box.yaw);
  const sn = Math.sin(box.yaw);
  const wx = state.x - box.center[0];
  const wz = state.z - box.center[2];
  const lx = c * wx - sn * wz;
  const lz = sn * wx + c * wz;
  const cx = clamp(lx, -box.half[0], box.half[0]);
  const cz = clamp(lz, -box.half[2], box.half[2]);
  return Math.hypot(lx - cx, lz - cz) < DRIVE.radius - 1e-6;
}
