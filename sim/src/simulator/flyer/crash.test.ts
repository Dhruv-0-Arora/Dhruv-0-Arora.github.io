import { describe, expect, it } from "vitest";
import { FLIGHT, hullSupport } from "../controls/flightController.ts";
import {
  CRASH,
  createCrashState,
  createParticle,
  type Impact,
  popScale,
  puffAt,
  rand,
  SafeTrail,
  shakeAt,
  shardAt,
  startCrash,
  stepWreck,
} from "./crash.ts";

const flat = () => 0;

const dive: Impact = {
  x: 10,
  y: FLIGHT.clearance,
  z: 20,
  yaw: 0,
  pitch: -0.4,
  roll: 0,
  speed: 24,
  kind: "ground",
};

function crashed(impact = dive, seed = 3) {
  const c = createCrashState();
  startCrash(c, impact, 0, seed);
  return c;
}

describe("crash", () => {
  it("starts idle", () => {
    const c = createCrashState();
    expect(c.active).toBe(false);
    expect(c.wreck).toBe(false);
  });

  it("bounces the wreck forward, then settles it onto the ground", () => {
    const c = crashed();
    const b = c.body;
    let peak = b.y;
    for (let i = 0; i < 2.4 * 120; i++) {
      stepWreck(b, 1 / 120, flat);
      peak = Math.max(peak, b.y);
      // The hull never goes into the ground.
      expect(b.y).toBeGreaterThanOrEqual(hullSupport(b.pitch, b.roll) - 1e-9);
    }
    // A real hop off the impact, carried on along the line of flight.
    expect(peak).toBeGreaterThan(1.2);
    expect(b.z).toBeGreaterThan(20 + 5);
    expect(Math.abs(b.x - 10)).toBeLessThan(1e-9);
    // At rest by the relaunch: settled, slow, in the rest pose.
    expect(b.settled).toBe(true);
    expect(Math.hypot(b.vx, b.vz)).toBeLessThan(1.5);
    expect(b.pitch).toBeCloseTo(CRASH.restPitch, 1);
    expect(Math.abs(b.roll)).toBeCloseTo(CRASH.restRoll, 1);
    expect(b.y).toBeCloseTo(hullSupport(b.pitch, b.roll), 6);
  });

  it("throws the wreck back off a wall", () => {
    const c = crashed({ ...dive, y: 12, pitch: 0, kind: "collider" });
    const b = c.body;
    for (let i = 0; i < 60; i++) stepWreck(b, 1 / 120, flat);
    expect(b.z).toBeLessThan(20);
    expect(b.y).toBeLessThan(12 + 2);
    // The effect starts where it hit, in the air.
    expect(c.y).toBe(12);
    expect(c.ground).toBe(0);
  });

  it("follows the terrain as it slides", () => {
    const c = crashed();
    const slope = (_x: number, z: number) => z * 0.05;
    for (let i = 0; i < 3 * 120; i++) stepWreck(c.body, 1 / 120, slope);
    const b = c.body;
    expect(b.y).toBeCloseTo(slope(b.x, b.z) + hullSupport(b.pitch, b.roll), 6);
  });

  it("throws shards out and lets them come to rest on the ground", () => {
    const c = crashed();
    const p = createParticle();
    let maxY = 0;
    for (let i = 0; i < CRASH.shards; i++) {
      for (let t = 0; t < 1.3; t += 0.05) {
        shardAt(c, i, t, p);
        expect(p.y).toBeGreaterThanOrEqual(0);
        maxY = Math.max(maxY, p.y);
      }
      // Gone by the end of the effect.
      expect(shardAt(c, i, CRASH.effectEnd, p).sx).toBe(0);
    }
    expect(maxY).toBeGreaterThan(2);
    // Lying still once landed: same place a little later.
    const a = { ...shardAt(c, 0, 1.2, createParticle()) };
    const b = shardAt(c, 0, 1.25, createParticle());
    if (a.y === 0) {
      expect(b.x).toBeCloseTo(a.x, 9);
      expect(b.z).toBeCloseTo(a.z, 9);
    }
  });

  it("swells, lifts and clears the smoke within the effect", () => {
    const c = crashed();
    const p = createParticle();
    const early = puffAt(c, 0, 0.3, createParticle());
    const later = puffAt(c, 0, 1.0, createParticle());
    expect(later.y).toBeGreaterThan(early.y);
    expect(later.sx).toBeGreaterThan(early.sx);
    // The first puffs start hot and cool.
    expect(early.heat).toBeGreaterThan(0);
    expect(later.heat).toBe(0);
    expect(puffAt(c, 7, 0.3, p).heat).toBe(0);
    for (let i = 0; i < CRASH.smoke + CRASH.dust; i++) {
      expect(puffAt(c, i, CRASH.effectEnd, p).sx).toBe(0);
    }
  });

  it("thins the smoke out over its life rather than leaving it solid", () => {
    const c = crashed();
    for (let i = 0; i < CRASH.smoke; i++) {
      let peak = 0;
      let last = 1;
      for (let t = 0; t < CRASH.effectEnd; t += 0.02) {
        const q = puffAt(c, i, t, createParticle());
        if (q.sx === 0) continue;
        peak = Math.max(peak, q.alpha);
        last = q.alpha;
        // Never opaque, and never bigger than the wreck is long.
        expect(q.alpha).toBeLessThanOrEqual(0.75);
        expect(q.sx).toBeLessThan(2.1);
      }
      expect(peak).toBeGreaterThan(0.3);
      expect(last).toBeLessThan(0.05);
    }
  });

  it("keeps the dust low, flat and quick", () => {
    const c = crashed();
    for (let i = CRASH.smoke; i < CRASH.smoke + CRASH.dust; i++) {
      const a = puffAt(c, i, 0.05, createParticle());
      expect(a.sy).toBeLessThan(a.sx * 0.3);
      expect(a.y).toBeLessThan(0.2);
      expect(a.alpha).toBeLessThanOrEqual(CRASH.dustAlpha);
      expect(puffAt(c, i, 0.4, createParticle()).alpha).toBeLessThan(
        a.alpha / 2,
      );
      expect(puffAt(c, i, 0.75, createParticle()).sx).toBe(0);
    }
  });

  it("runs the dust out along the ground", () => {
    const c = crashed();
    const i = CRASH.smoke;
    const a = puffAt(c, i, 0.05, createParticle());
    const b = puffAt(c, i, 0.4, createParticle());
    const reach = (q: { x: number; z: number }) =>
      Math.hypot(q.x - c.x, q.z - c.z);
    expect(reach(b)).toBeGreaterThan(reach(a) + 2);
    expect(b.y).toBeCloseTo(0.12, 9);
    expect(puffAt(c, i, 1.2, createParticle()).sx).toBe(0);
  });

  it("is the same burst for the same seed and a different one otherwise", () => {
    const a = shardAt(crashed(dive, 3), 5, 0.4, createParticle());
    const b = shardAt(crashed(dive, 3), 5, 0.4, createParticle());
    const d = shardAt(crashed(dive, 4), 5, 0.4, createParticle());
    expect(b).toEqual(a);
    expect(d.x).not.toBeCloseTo(a.x, 3);
    for (let i = 0; i < 50; i++) {
      const v = rand(i * 0.37, i, i % 7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("shakes briefly, and never under reduced motion", () => {
    const out: [number, number, number] = [0, 0, 0];
    shakeAt(0.02, false, out);
    expect(Math.hypot(...out)).toBeGreaterThan(0.1);
    shakeAt(CRASH.shake, false, out);
    expect(out).toEqual([0, 0, 0]);
    shakeAt(0.02, true, out);
    expect(out).toEqual([0, 0, 0]);
  });

  it("pops the relaunched airframe in", () => {
    expect(popScale(0, false)).toBeLessThan(0.01);
    expect(popScale(CRASH.popIn * 0.7, false)).toBeGreaterThan(1);
    expect(popScale(CRASH.popIn, false)).toBe(1);
    expect(popScale(0, true)).toBe(1);
  });

  it("orders the timeline", () => {
    expect(CRASH.shake).toBeLessThan(CRASH.duration);
    expect(CRASH.duration + CRASH.popIn).toBeLessThanOrEqual(CRASH.effectEnd);
  });
});

describe("safe trail", () => {
  it("relaunches from a few seconds back, heading for the hub", () => {
    const trail = new SafeTrail();
    trail.reset(0, 0);
    for (let s = 1; s <= 10; s++) trail.record(100 + s * 10, 0, 1);
    const r = trail.relaunch(0);
    // Four samples kept: the oldest is from three seconds before the last.
    expect(r.x).toBe(170);
    expect(r.z).toBe(0);
    expect(r.yaw).toBeCloseTo(-Math.PI / 2, 9);
  });

  it("keeps the heading at the hub", () => {
    const trail = new SafeTrail();
    trail.reset(2, 3);
    expect(trail.relaunch(1.25)).toEqual({ x: 2, z: 3, yaw: 1.25 });
  });
});
