import { describe, expect, it } from "vitest";
import {
  advance,
  createDriveState,
  DRIVE,
  type DriveInput,
  type DriveWorld,
  IDLE_INPUT,
  type OrientedBox,
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
    const world: DriveWorld = {
      ...flat,
      colliders: [{ center: [0, 1.5, 11], half: [5, 1.5, 1], yaw: 0 }],
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
      colliders: [{ center: [5, 1.5, 7], half: [3, 1.5, 2], yaw: 0 }],
    };
    const state = createDriveState(0, 0, 0, 0.35);
    for (let i = 0; i < 60 * 6; i++) {
      advance(state, { throttle: 1, steer: 0 }, 1 / 60, world);
      expect(penetrates(state, world.colliders[0])).toBe(false);
    }
    expect(state.z).toBeGreaterThan(9);
  });

  it("respects a turned wall along its true faces", () => {
    // A long thin wall turned 45 degrees: its world-aligned box would be
    // 12 m square and stop the vehicle 5 m early; the oriented test lets
    // it reach the face and then slide along it.
    const wall: OrientedBox = {
      center: [0, 1.5, 14],
      half: [8, 1.5, 0.5],
      yaw: Math.PI / 4,
    };
    const world: DriveWorld = { ...flat, colliders: [wall] };
    const state = createDriveState(0, 0, 0);
    let maxZ = 0;
    for (let i = 0; i < 60 * 6; i++) {
      advance(state, { throttle: 1, steer: 0 }, 1 / 60, world);
      expect(penetrates(state, wall)).toBe(false);
      maxZ = Math.max(maxZ, state.z);
    }
    // The wall's face at x = 0 is at z = 14 - 0.5 * sqrt(2); the vehicle
    // gets within its radius of it, then slides off along the face.
    expect(maxZ).toBeGreaterThan(14 - 0.71 - 2.6);
    expect(Math.abs(state.x)).toBeGreaterThan(3);
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

  describe("traction", () => {
    /** Flat to z = 5, then a slope of the given angle uphill along +z. */
    const ramp = (degrees: number): DriveWorld => {
      const grade = Math.tan((degrees * Math.PI) / 180);
      return {
        ...flat,
        groundHeight: (_x, z) => Math.max(0, (z - 5) * grade),
      };
    };

    it("climbs a 30 degree ramp", () => {
      const s = run(ramp(30), { throttle: 1, steer: 0 }, 5, 60);
      expect(s.z).toBeGreaterThan(30);
      expect(s.y).toBeCloseTo((s.z - 5) * Math.tan(Math.PI / 6), 6);
    });

    it("refuses a 45 degree wall and loses speed against it", () => {
      const s = run(ramp(45), { throttle: 1, steer: 0 }, 5, 60);
      expect(s.z).toBeLessThan(5.5);
      expect(s.y).toBeLessThan(0.5);
      expect(s.speed).toBeLessThan(1);
    });

    it("backs away from a wall it cannot climb", () => {
      const stuck = run(ramp(45), { throttle: 1, steer: 0 }, 3, 60);
      const backed = run(ramp(45), { throttle: -1, steer: 0 }, 2, 60, stuck);
      expect(backed.z).toBeLessThan(stuck.z - 2);
    });

    it("drives down a slope it could not climb", () => {
      const cliff: DriveWorld = {
        ...flat,
        groundHeight: (_x, z) => Math.max(0, 20 - z * 2),
      };
      const s = run(
        cliff,
        { throttle: 1, steer: 0 },
        3,
        60,
        createDriveState(0, 20, 0),
      );
      expect(s.z).toBeGreaterThan(15);
      expect(s.y).toBe(0);
    });

    it("rolls over a lip of a few centimetres, even from a crawl", () => {
      const lip: DriveWorld = {
        ...flat,
        groundHeight: (_x, z) => (z > 1 ? 0.08 : 0),
      };
      const s = run(lip, { throttle: 0.2, steer: 0 }, 4, 60);
      expect(s.z).toBeGreaterThan(3);
      expect(s.y).toBeCloseTo(0.08, 6);
    });

    it("stays frame-rate independent on a slope", () => {
      const input = { throttle: 1, steer: 0.2 };
      const world = ramp(40);
      const a = run(world, input, 4, 30);
      const b = run(world, input, 4, 60);
      const c = run(world, input, 4, 120);
      for (const key of ["x", "y", "z", "yaw", "speed"] as const) {
        expect(a[key]).toBeCloseTo(b[key], 9);
        expect(b[key]).toBeCloseTo(c[key], 9);
      }
    });

    it("reports whether the last position had ground", () => {
      const edge: DriveWorld = {
        ...flat,
        groundHeight: (_x, z) => (z > 5 ? null : 0),
      };
      expect(run(edge, { throttle: 1, steer: 0 }, 0.5, 60).grounded).toBe(true);
      expect(run(edge, { throttle: 1, steer: 0 }, 2, 60).grounded).toBe(false);
    });
  });
});
