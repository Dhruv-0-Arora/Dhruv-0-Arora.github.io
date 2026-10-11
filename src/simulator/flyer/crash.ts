import { type CrashKind, hullSupport } from "../controls/flightController.ts";

/**
 * The Flyer's crash as pure data and closed-form motion, so the frame loop,
 * the effect and the tests share one timeline:
 *
 *   0          impact: the airframe bounces and tumbles, the props stop,
 *              shards and smoke burst out, a ring of dust runs outward,
 *              and the camera shakes for `shake` seconds.
 *   duration   relaunch: a fresh airframe pops in above the last safe point
 *              (only while still flying; Esc during the sequence lands).
 *   effectEnd  the last of the smoke is gone and the effect goes idle.
 *
 * Shards and puffs are functions of time and a seed rather than particles
 * with state, so nothing is integrated or allocated per frame.
 */
export const CRASH = {
  /** Seconds from impact to the relaunch. */
  duration: 2.4,
  /** Seconds from impact until every shard and puff is gone. */
  effectEnd: 3.2,
  /** Camera shake length, s, and its peak offset, m. */
  shake: 0.35,
  shakeAmp: 0.55,
  /** The relaunched airframe scales in over this long, s. */
  popIn: 0.4,
  /** Height of the relaunch above the terrain, m. */
  relaunchHeight: 40,
  /** The wreck's gravity, m/s^2: a touch heavier than life, so it reads. */
  gravity: 13,
  /** Upward kick off the ground at impact, m/s, as a share of airspeed. */
  popPerSpeed: 0.28,
  popMin: 3,
  popMax: 6.5,
  /** Horizontal speed the wreck keeps through the first impact. */
  carry: 0.5,
  /** Vertical restitution and horizontal keep on each later bounce. */
  restitution: 0.32,
  bounceKeep: 0.7,
  /** Below this landing speed the wreck stops bouncing and slides, m/s. */
  settleSpeed: 1.6,
  /** Sliding friction, 1/s. */
  friction: 2.2,
  /** The pose the wreck settles into: nose dug in, one wing down. */
  restPitch: -0.2,
  restRoll: 0.34,
  /** How fast the settled wreck eases into that pose, 1/s. */
  settleRate: 5,
  /** Angular damping in the air, 1/s. */
  spinDamp: 1.4,
  shards: 24,
  /** Rising smoke, then the dust that runs out along the ground. */
  smoke: 10,
  dust: 8,
  /** Peak opacity of a smoke puff and of the dust at its start. */
  smokeAlpha: 0.55,
  dustAlpha: 0.5,
  /** Which way the smoke drifts, a unit vector in XZ. */
  wind: [0.8, 0.6] as readonly [number, number],
  /** Seconds between samples of the last safe point, and how many are kept. */
  safeEvery: 1,
  safeKept: 4,
} as const;

export interface Wreck {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Angular velocities, rad/s. */
  wYaw: number;
  wPitch: number;
  wRoll: number;
  /** On the ground and sliding rather than bouncing. */
  settled: boolean;
}

export interface CrashState {
  /** Seconds since the impact; the effect runs while below `effectEnd`. */
  t: number;
  /** The effect is playing. */
  active: boolean;
  /** The rig shows the wreck rather than the flight. */
  wreck: boolean;
  /** A fresh airframe has been launched; drives the pop-in. */
  relaunched: boolean;
  kind: CrashKind;
  /** Where it happened: the shards and smoke start here. */
  x: number;
  y: number;
  z: number;
  /** Surface height under the impact. */
  ground: number;
  /** Horizontal direction of travel at impact, unit. */
  dirX: number;
  dirZ: number;
  /** Airspeed at impact, m/s. */
  speed: number;
  /** Varies the burst from one crash to the next. */
  seed: number;
  body: Wreck;
}

export function createCrashState(): CrashState {
  return {
    t: CRASH.effectEnd,
    active: false,
    wreck: false,
    relaunched: false,
    kind: "ground",
    x: 0,
    y: 0,
    z: 0,
    ground: 0,
    dirX: 0,
    dirZ: 1,
    speed: 0,
    seed: 0,
    body: {
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      wYaw: 0,
      wPitch: 0,
      wRoll: 0,
      settled: false,
    },
  };
}

/** The flight at the instant it ended. */
export interface Impact {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  speed: number;
  kind: CrashKind;
}

/** Deterministic hash of (seed, i, k) to [0, 1). */
export function rand(seed: number, i: number, k: number): number {
  const v = Math.sin(seed * 12.9898 + i * 78.233 + k * 37.719) * 43758.5453;
  return v - Math.floor(v);
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(a: number, b: number, v: number): number {
  const u = clamp((v - a) / (b - a), 0, 1);
  return u * u * (3 - 2 * u);
}

function easeOutCubic(u: number): number {
  const v = 1 - clamp(u, 0, 1);
  return 1 - v * v * v;
}

function wrap(a: number): number {
  const tau = Math.PI * 2;
  return a - tau * Math.round(a / tau);
}

/**
 * Starts the sequence: the effect from the impact point, and a wreck that
 * leaves it with the impact's momentum turned into a bounce and a tumble.
 */
export function startCrash(
  crash: CrashState,
  impact: Impact,
  ground: number,
  seed: number,
): void {
  const cp = Math.cos(impact.pitch);
  const dx = Math.sin(impact.yaw);
  const dz = Math.cos(impact.yaw);
  const hs = cp * impact.speed;
  crash.t = 0;
  crash.active = true;
  crash.wreck = true;
  crash.relaunched = false;
  crash.kind = impact.kind;
  crash.x = impact.x;
  crash.y = impact.kind === "ground" ? ground : impact.y;
  crash.z = impact.z;
  crash.ground = ground;
  crash.dirX = dx;
  crash.dirZ = dz;
  crash.speed = impact.speed;
  crash.seed = seed;

  const b = crash.body;
  const side = rand(seed, 0, 9) < 0.5 ? -1 : 1;
  b.x = impact.x;
  b.y = impact.y;
  b.z = impact.z;
  b.yaw = impact.yaw;
  b.pitch = impact.pitch;
  b.roll = impact.roll;
  b.settled = false;
  const pop = clamp(
    impact.speed * CRASH.popPerSpeed,
    CRASH.popMin,
    CRASH.popMax,
  );
  if (impact.kind === "ground") {
    // Nose digs in: forward momentum carries on in a hop, pitching over.
    b.vx = dx * hs * CRASH.carry;
    b.vz = dz * hs * CRASH.carry;
    b.vy = pop;
    b.wPitch = -(1.6 + 0.1 * impact.speed);
  } else {
    // Off a wall: thrown back and up, nose flung skyward.
    b.vx = -dx * hs * 0.22;
    b.vz = -dz * hs * 0.22;
    b.vy = pop * 0.6;
    b.wPitch = 0.8 + 0.03 * impact.speed;
  }
  // The roll follows the bank it went in with; level, a coin toss.
  const rollSign = Math.abs(impact.roll) > 0.05 ? Math.sign(impact.roll) : side;
  b.wRoll = rollSign * (1.3 + 0.9 * rand(seed, 1, 9));
  b.wYaw = -rollSign * (0.8 + 1.2 * rand(seed, 2, 9));
}

/**
 * Advances the wreck: ballistic in the air with damped tumbling, bounces
 * that lose most of their energy, then a slide that settles into the rest
 * pose. The hull's lowest point rests on the surface, whatever its tilt.
 */
export function stepWreck(
  b: Wreck,
  dt: number,
  groundAt: (x: number, z: number) => number,
): void {
  b.x += b.vx * dt;
  b.z += b.vz * dt;
  b.yaw += b.wYaw * dt;
  if (b.settled) {
    const keep = Math.exp(-CRASH.friction * dt);
    b.vx *= keep;
    b.vz *= keep;
    b.wYaw *= Math.exp(-4 * dt);
    const k = 1 - Math.exp(-CRASH.settleRate * dt);
    const restRoll = (b.roll < 0 ? -1 : 1) * CRASH.restRoll;
    b.pitch += wrap(CRASH.restPitch - b.pitch) * k;
    b.roll += wrap(restRoll - b.roll) * k;
    b.y = groundAt(b.x, b.z) + hullSupport(b.pitch, b.roll);
    return;
  }
  const damp = Math.exp(-CRASH.spinDamp * dt);
  b.wPitch *= damp;
  b.wRoll *= damp;
  b.pitch += b.wPitch * dt;
  b.roll += b.wRoll * dt;
  // Never past the wing tip or the tail: a wreck on its back would need
  // a different rest height, and a biplane rarely ends up there.
  b.roll = clamp(b.roll, -1.2, 1.2);
  b.pitch = clamp(b.pitch, -1.1, 0.8);
  b.vy -= CRASH.gravity * dt;
  b.y += b.vy * dt;
  const floor = groundAt(b.x, b.z) + hullSupport(b.pitch, b.roll);
  if (b.y <= floor) {
    b.y = floor;
    if (-b.vy > CRASH.settleSpeed) {
      b.vy = -b.vy * CRASH.restitution;
      b.vx *= CRASH.bounceKeep;
      b.vz *= CRASH.bounceKeep;
      b.wPitch *= -0.5;
      b.wRoll *= 0.5;
      b.wYaw *= 0.6;
    } else {
      b.vy = 0;
      b.settled = true;
    }
  }
}

/** One instance's pose: position, Euler rotation and per-axis scale. */
export interface Particle {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  sx: number;
  sy: number;
  sz: number;
  /** 0..1: how much of the hot color is left (smoke only). */
  heat: number;
  /** 0..1: opacity. */
  alpha: number;
}

export function createParticle(): Particle {
  return {
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    sx: 0,
    sy: 0,
    sz: 0,
    heat: 0,
    alpha: 0,
  };
}

function hide(out: Particle): Particle {
  out.sx = 0;
  out.sy = 0;
  out.sz = 0;
  out.heat = 0;
  out.alpha = 0;
  return out;
}

const SHARD_GRAVITY = 15;

/**
 * Shard `i` at `t` seconds: thrown up and out (and partly along the line
 * of flight), falling until it meets the impact's ground height, where it
 * stops and lies still, shrinking away near the end of its life. Scale 0
 * means hidden.
 */
export function shardAt(
  crash: CrashState,
  i: number,
  t: number,
  out: Particle,
): Particle {
  const r = (k: number) => rand(crash.seed, i, k);
  const life = 1.3 + 0.8 * r(0);
  if (t < 0 || t >= life) return hide(out);
  const az = r(1) * Math.PI * 2;
  const el = 0.35 + 0.9 * r(2);
  const sp = 5 + 7 * r(3);
  const carry = crash.kind === "ground" ? 0.35 : -0.2;
  const vx =
    Math.cos(el) * Math.cos(az) * sp + crash.dirX * crash.speed * carry;
  const vz =
    Math.cos(el) * Math.sin(az) * sp + crash.dirZ * crash.speed * carry;
  const vy = Math.sin(el) * sp;
  const y0 = crash.y + 0.5;
  const drop = Math.max(0, y0 - crash.ground);
  const land =
    (vy + Math.sqrt(vy * vy + 2 * SHARD_GRAVITY * drop)) / SHARD_GRAVITY;
  const tt = Math.min(t, land);
  out.x = crash.x + vx * tt;
  out.z = crash.z + vz * tt;
  out.y = Math.max(crash.ground, y0 + vy * tt - 0.5 * SHARD_GRAVITY * tt * tt);
  const spin = 5 + 9 * r(4);
  out.rx = r(5) * 6.28 + spin * tt;
  out.ry = r(6) * 6.28 + spin * 0.6 * tt;
  out.rz = r(7) * 6.28;
  // A splinter or a torn panel: long, thin, a little wide.
  const size = (0.45 + 0.6 * r(8)) * (1 - smoothstep(life * 0.55, life, t));
  // Pops to full size in the first frames rather than appearing whole.
  const grow = smoothstep(0, 0.06, t);
  out.sx = size * grow;
  out.sy = size * 0.3 * grow;
  out.sz = size * (1.4 + r(9)) * grow;
  out.heat = 0;
  out.alpha = 1;
  return out;
}

/**
 * Smoke puff `i` (0 <= i < smoke) or dust puff (smoke <= i < smoke + dust)
 * at `t` seconds.
 *
 * Smoke starts along the first few metres of the slide, staggered, rises
 * and swells, then shrinks away; the first few start hot (the effect lerps
 * them from the accent toward smoke). Dust runs out along the ground in a
 * ring and is gone in under a second. The dust's height is the impact's
 * ground; the effect lifts it onto the terrain where it has run to.
 */
export function puffAt(
  crash: CrashState,
  i: number,
  t: number,
  out: Particle,
): Particle {
  const r = (k: number) => rand(crash.seed, i + 100, k);
  if (i >= CRASH.smoke) {
    // Dust: a squashed, see-through skirt that hugs the ground as it runs
    // out, and is gone in about half a second.
    const j = i - CRASH.smoke;
    const life = 0.5 + 0.2 * r(0);
    if (t < 0 || t >= life) return hide(out);
    const u = t / life;
    const a = ((j + 0.3 * r(1)) / CRASH.dust) * Math.PI * 2;
    const reach = 1.5 + (4 + 2 * r(2)) * easeOutCubic(u);
    out.x = crash.x + Math.cos(a) * reach;
    out.z = crash.z + Math.sin(a) * reach;
    out.y = crash.ground + 0.12;
    out.rx = 0;
    out.ry = a + r(3);
    out.rz = 0;
    const s = (0.8 + 0.5 * r(4)) * (0.6 + 0.4 * easeOutCubic(u));
    out.sx = s * 1.4;
    out.sy = s * 0.28;
    out.sz = s * 1.4;
    out.heat = 0;
    out.alpha = CRASH.dustAlpha * (1 - u) * (1 - u);
    return out;
  }
  // Smoke: starts close around the wreck, keeps rising and drifting
  // downwind as it swells, and thins out to nothing over its life.
  const delay = i * 0.06 + 0.12 * r(0);
  const life = 1.5 + 0.9 * r(1);
  const local = t - delay;
  if (local < 0 || local >= life) return hide(out);
  const u = local / life;
  const along = crash.kind === "ground" ? (i / CRASH.smoke) * 3 * r(2) : 0;
  const side = (r(3) - 0.5) * 2.4;
  const rise = (6 + 4 * r(4)) * (0.55 * u + 0.45 * easeOutCubic(u));
  const drift = 3 * u * u;
  out.x =
    crash.x + crash.dirX * along + crash.dirZ * side + CRASH.wind[0] * drift;
  out.z =
    crash.z + crash.dirZ * along - crash.dirX * side + CRASH.wind[1] * drift;
  out.y = crash.y + 1.2 + rise;
  out.rx = r(5) * 6.28;
  out.ry = r(6) * 6.28 + 0.6 * local;
  out.rz = r(7) * 6.28;
  const s = (1.1 + 0.9 * r(8)) * (0.45 + 0.55 * easeOutCubic(u));
  out.sx = s;
  out.sy = s * 0.9;
  out.sz = s;
  const hot = i < 4;
  out.heat = hot ? 1 - smoothstep(0, 0.45, local) : 0;
  out.alpha =
    (hot ? CRASH.smokeAlpha + 0.15 : CRASH.smokeAlpha) *
    smoothstep(0, 0.08, u) *
    (1 - smoothstep(0.3, 1, u));
  return out;
}

/**
 * Camera shake at `t` seconds after impact, m, decaying to zero over
 * `shake`. Zero under reduced motion.
 */
export function shakeAt(
  t: number,
  reducedMotion: boolean,
  out: [number, number, number],
): [number, number, number] {
  const left = 1 - t / CRASH.shake;
  if (reducedMotion || t < 0 || left <= 0) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }
  const a = CRASH.shakeAmp * left * left;
  out[0] = a * Math.sin(t * 71);
  out[1] = a * 0.7 * Math.sin(t * 53 + 1.3);
  out[2] = a * Math.sin(t * 61 + 2.1);
  return out;
}

/**
 * Scale of the relaunched airframe `since` seconds after it appears: from
 * nothing to a slight overshoot and back to 1. Always 1 under reduced
 * motion.
 */
export function popScale(since: number, reducedMotion: boolean): number {
  if (reducedMotion || since >= CRASH.popIn) return 1;
  if (since <= 0) return 0.001;
  const u = since / CRASH.popIn;
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const v = u - 1;
  return Math.max(0.001, 1 + c3 * v * v * v + c1 * v * v);
}

/**
 * Where the Flyer has recently been, sampled every `safeEvery` seconds of
 * flight, so a relaunch can start from a few seconds before the crash.
 */
export class SafeTrail {
  private readonly xs: number[] = [];
  private readonly zs: number[] = [];
  private clock = 0;

  reset(x: number, z: number): void {
    this.xs.length = 0;
    this.zs.length = 0;
    this.xs.push(x);
    this.zs.push(z);
    this.clock = 0;
  }

  record(x: number, z: number, dt: number): void {
    this.clock += dt;
    if (this.clock < CRASH.safeEvery) return;
    this.clock -= CRASH.safeEvery;
    this.xs.push(x);
    this.zs.push(z);
    if (this.xs.length > CRASH.safeKept) {
      this.xs.shift();
      this.zs.shift();
    }
  }

  /**
   * The oldest kept point, with a heading toward the hub from it (or
   * `fallbackYaw` right at the hub).
   */
  relaunch(fallbackYaw: number): { x: number; z: number; yaw: number } {
    const x = this.xs[0] ?? 0;
    const z = this.zs[0] ?? 0;
    const yaw = Math.hypot(x, z) > 20 ? Math.atan2(-x, -z) : fallbackYaw;
    return { x, z, yaw };
  }
}
