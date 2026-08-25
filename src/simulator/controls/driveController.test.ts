import { describe, expect, it } from "vitest";
import {
  advance,
  createDriveState,
  DRIVE,
  type DriveInput,
  type DriveWorld,
  IDLE_INPUT,
  penetrates,
} from "./driveController.ts";

const flat: DriveWorld = {
  groundHeight: () => 0,
  colliders: [],
  bounds: { minX: -200, maxX: 200, minZ: -200, maxZ: 200 },
};

function run(
  world: DriveWorld,
  input: DriveInput,
  seconds: number,
  hz: number,
  start = createDriveState(0, 0, 0),
) {
  const state = { ...start };
  const frames = Math.round(seconds * hz);
  for (let i = 0; i < frames; i++) advance(state, input, 1 / hz, world);
  return state;
}

describe("advance", () => {
  it("accelerates forward along +Z at yaw 0 and caps at maxSpeed", () => {
    const s = run(flat, { throttle: 1, steer: 0 }, 3, 60);
    expect(s.speed).toBeCloseTo(DRIVE.maxSpeed, 6);
    expect(s.z).toBeGreaterThan(20);
    expect(Math.abs(s.x)).toBeLessThan(1e-9);
  });

  it("is frame-rate independent at 30, 60 and 120 Hz", () => {
    const input = { throttle: 1, steer: 0.6 };
    const a = run(flat, input, 4, 30);
    const b = run(flat, input, 4, 60);
    const c = run(flat, input, 4, 120);
    for (const key of ["x", "z", "yaw", "speed"] as const) {
      expect(a[key]).toBeCloseTo(b[key], 9);
      expect(b[key]).toBeCloseTo(c[key], 9);
    }
  });

  it("does not turn at a standstill", () => {
    const s = run(flat, { throttle: 0, steer: 1 }, 1, 60);
    expect(s.yaw).toBe(0);
    expect(s.x).toBe(0);
  });

  it("coasts to a stop with no throttle", () => {
    const moving = run(flat, { throttle: 1, steer: 0 }, 2, 60);
    const stopped = run(flat, IDLE_INPUT, 5, 60, moving);
    expect(stopped.speed).toBe(0);
  });

  it("brakes harder than it coasts and reverses slower than it drives", () => {
    const moving = run(flat, { throttle: 1, steer: 0 }, 2, 60);
    const braked = run(flat, { throttle: -1, steer: 0 }, 0.3, 60, moving);
    const coasted = run(flat, IDLE_INPUT, 0.3, 60, moving);
    expect(braked.speed).toBeLessThan(coasted.speed);
    const reversing = run(flat, { throttle: -1, steer: 0 }, 4, 60);
    expect(reversing.speed).toBeCloseTo(-DRIVE.maxReverse, 6);
    expect(reversing.z).toBeLessThan(0);
  });

  it("follows the ground height and keeps the last height off the world", () => {
    let calls = 0;
    const hilly: DriveWorld = {
      ...flat,
      groundHeight: (_x, z) => {
        calls++;
        return z > 5 ? null : z * 0.5;
      },
    };
    const s = run(hilly, { throttle: 1, steer: 0 }, 1.5, 60);
    expect(calls).toBeGreaterThan(0);
    expect(s.z).toBeGreaterThan(5);
    expect(s.y).toBeCloseTo(2.5, 1);
  });

  it("never penetrates a box collider", () => {
    const wall = { min: [-5, 0, 10] as const, max: [5, 3, 12] as const };
    const world: DriveWorld = {
      ...flat,
      colliders: [{ min: [...wall.min], max: [...wall.max] }],
    };
    const state = createDriveState(0, 0, 0);
    for (let i = 0; i < 60 * 5; i++) {
      advance(state, { throttle: 1, steer: 0 }, 1 / 60, world);
      expect(penetrates(state, world.colliders[0])).toBe(false);
    }
    expect(state.z).toBeLessThan(10);
    expect(state.z).toBeGreaterThan(8);
  });

  it("slides out of a box corner instead of sticking", () => {
    const world: DriveWorld = {
      ...flat,
      colliders: [{ min: [2, 0, 5], max: [8, 3, 9] }],
    };
    const state = createDriveState(0, 0, 0, 0.35);
    for (let i = 0; i < 60 * 6; i++) {
      advance(state, { throttle: 1, steer: 0 }, 1 / 60, world);
      expect(penetrates(state, world.colliders[0])).toBe(false);
    }
    expect(state.z).toBeGreaterThan(9);
  });

  it("stays inside the world bounds", () => {
    const small: DriveWorld = {
      ...flat,
      bounds: { minX: -5, maxX: 5, minZ: -5, maxZ: 5 },
    };
    const s = run(small, { throttle: 1, steer: 0 }, 4, 60);
    expect(s.z).toBeCloseTo(5 - DRIVE.radius, 6);
  });

  it("caps a huge dt so a resumed tab does not teleport", () => {
    const s = advance(
      createDriveState(0, 0, 0),
      { throttle: 1, steer: 0 },
      30,
      flat,
    );
    expect(s.z).toBeLessThan(DRIVE.maxSpeed * 0.25 + 1e-6);
  });
});
