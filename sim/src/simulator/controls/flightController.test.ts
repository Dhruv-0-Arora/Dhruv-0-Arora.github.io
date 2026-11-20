import { describe, expect, it } from "vitest";
import {
  advanceFlight,
  angleTo,
  createFlightState,
  FLIGHT,
  type FlightWorld,
  floorFor,
  hullSupport,
  IDLE_FLIGHT,
} from "./flightController.ts";

const flat: FlightWorld = {
  floorHeight: () => 0,
  radius: 400,
  ceiling: 200,
};

function fly(
  world: FlightWorld,
  input: Partial<typeof IDLE_FLIGHT>,
  seconds: number,
  start = createFlightState(0, 40, 0),
) {
  const s = start;
  const full = { ...IDLE_FLIGHT, ...input };
  for (let i = 0; i < seconds * 60; i++) advanceFlight(s, full, 1 / 60, world);
  return s;
}

describe("flight", () => {
  it("cruises straight and level with no input", () => {
    const s = fly(flat, {}, 3);
    expect(s.x).toBeCloseTo(0, 5);
    expect(s.y).toBeCloseTo(40, 3);
    expect(s.z).toBeCloseTo(FLIGHT.cruise * 3, 0);
    expect(s.speed).toBeCloseTo(FLIGHT.cruise, 3);
  });

  it("climbs and dives with the pitch key, trading speed", () => {
    const up = fly(flat, { pitch: 1 }, 3);
    expect(up.y).toBeGreaterThan(45);
    expect(up.speed).toBeLessThan(FLIGHT.cruise);
    const down = fly(flat, { pitch: -1 }, 3);
    expect(down.y).toBeLessThan(35);
    expect(down.speed).toBeGreaterThan(FLIGHT.cruise);
  });

  it("banks into a turn and levels out after", () => {
    const s = fly(flat, { steer: 1 }, 2);
    expect(s.roll).toBeGreaterThan(0.5);
    expect(s.yaw).toBeLessThan(-0.5);
    expect(s.x).not.toBe(0);
    fly(flat, {}, 3, s);
    expect(Math.abs(s.roll)).toBeLessThan(0.02);
  });

  it("holds the speed between its limits", () => {
    const fast = fly(flat, { throttle: 1 }, 10);
    expect(fast.speed).toBe(FLIGHT.maxSpeed);
    const slow = fly(flat, { throttle: -1 }, 10);
    expect(slow.speed).toBe(FLIGHT.minSpeed);
  });

  it("skims a gentle graze along the terrain and never goes below it", () => {
    const hilly: FlightWorld = { ...flat, floorHeight: () => 60 };
    // A shallow descent onto the floor: under a metre a second of sink.
    const s = createFlightState(0, 64, 0);
    fly(hilly, { pitch: -0.08 }, 6, s);
    expect(s.crashed).toBeNull();
    expect(s.y).toBeCloseTo(60 + FLIGHT.clearance, 3);
    // Released, it levels off and keeps skimming.
    fly(hilly, {}, 4, s);
    expect(s.crashed).toBeNull();
    expect(s.y).toBeGreaterThanOrEqual(60 + FLIGHT.clearance - 1e-9);
    // A bank close to the ground lifts the hull clear of it.
    fly(hilly, { steer: 1 }, 1, s);
    expect(s.crashed).toBeNull();
    expect(s.y).toBeGreaterThanOrEqual(floorFor(60, s.pitch, s.roll) - 1e-9);
    expect(s.y).toBeGreaterThan(60 + FLIGHT.clearance + 1);
  });

  it("skims up a gentle slope", () => {
    // Rises 1 m every 10 m: 1.6 m/s under the cruise, below the crash line.
    const slope: FlightWorld = { ...flat, floorHeight: (_x, z) => z * 0.1 };
    const s = createFlightState(0, FLIGHT.clearance, 0);
    fly(slope, {}, 4, s);
    expect(s.crashed).toBeNull();
    expect(s.y).toBeCloseTo(s.z * 0.1 + FLIGHT.clearance, 3);
  });

  it("crashes in a steep dive", () => {
    const s = fly(flat, { pitch: -1 }, 10);
    expect(s.crashed).toBe("ground");
    // It ends touching the surface, not hovering a safety margin above it.
    expect(s.y).toBeLessThanOrEqual(floorFor(0, s.pitch, s.roll) + 1e-9);
    expect(s.y).toBeLessThan(2);
    // And stays there: a crashed state no longer advances.
    const at = { x: s.x, y: s.y, z: s.z };
    fly(flat, { throttle: 1 }, 1, s);
    expect({ x: s.x, y: s.y, z: s.z }).toEqual(at);
  });

  it("crashes into a hillside it flies at level", () => {
    // A wall of rock rising 2 m for every metre forward, from z = 40.
    const wall: FlightWorld = {
      ...flat,
      floorHeight: (_x, z) => Math.max(0, (z - 40) * 2),
    };
    const s = fly(wall, {}, 5, createFlightState(0, 10, 0));
    expect(s.crashed).toBe("ground");
    expect(s.z).toBeGreaterThan(40);
    expect(s.z).toBeLessThan(50);
  });

  it("crashes into an installation", () => {
    // A 10 m cube straight ahead at the cruise altitude.
    const tower: FlightWorld = {
      ...flat,
      hits: (x, y, z) =>
        Math.abs(x) < 5 && Math.abs(y - 40) < 5 && Math.abs(z - 60) < 5,
    };
    const s = fly(tower, {}, 6);
    expect(s.crashed).toBe("collider");
    expect(s.z).toBeGreaterThan(55);
    expect(s.z).toBeLessThan(56);
    // Flying over it is fine.
    const over = fly(tower, {}, 6, createFlightState(0, 50, 0));
    expect(over.crashed).toBeNull();
  });

  it("never goes above the ceiling", () => {
    const high = fly(flat, { pitch: 1 }, 30);
    expect(high.y).toBeLessThanOrEqual(flat.ceiling);
    expect(high.crashed).toBeNull();
  });

  it("measures the hull below the origin", () => {
    // Level: the skids are the lowest point.
    expect(hullSupport(0, 0)).toBeCloseTo(0.78, 6);
    // Banked: a wing tip hangs far lower.
    expect(hullSupport(0, 0.8)).toBeGreaterThan(4);
    expect(hullSupport(0, -0.8)).toBeCloseTo(hullSupport(0, 0.8), 6);
    // Nose up: the tail drops.
    expect(hullSupport(0.5, 0)).toBeGreaterThan(1.5);
  });

  it("turns for home at the edge of the world", () => {
    const s = fly(flat, { throttle: 1 }, 25);
    expect(Math.hypot(s.x, s.z)).toBeLessThanOrEqual(flat.radius + 1e-6);
    // Twenty-five seconds at full throttle is well past the radius: by now
    // it has either turned back inside the homing line or is pointed home.
    const home = Math.atan2(-s.x, -s.z);
    const inside = Math.hypot(s.x, s.z) < flat.radius * FLIGHT.homing;
    expect(inside || Math.abs(angleTo(s.yaw, home)) < Math.PI / 2).toBe(true);
    // And it is still flying, not pinned to the rim.
    const before = { x: s.x, z: s.z };
    fly(flat, { throttle: 1 }, 1, s);
    expect(Math.hypot(s.x - before.x, s.z - before.z)).toBeGreaterThan(5);
  });

  it("integrates identically at any frame rate", () => {
    const a = createFlightState(0, 40, 0);
    const b = createFlightState(0, 40, 0);
    const input = { throttle: 0.5, steer: 0.3, pitch: 0.2 };
    for (let i = 0; i < 120; i++) advanceFlight(a, input, 1 / 60, flat);
    for (let i = 0; i < 40; i++) advanceFlight(b, input, 1 / 20, flat);
    expect(a.x).toBeCloseTo(b.x, 6);
    expect(a.y).toBeCloseTo(b.y, 6);
    expect(a.yaw).toBeCloseTo(b.yaw, 6);
  });

  it("crashes at the same place at any frame rate", () => {
    const a = createFlightState(0, 40, 0);
    const b = createFlightState(0, 40, 0);
    const input = { throttle: 0.5, steer: 0.3, pitch: -1 };
    for (let i = 0; i < 600; i++) advanceFlight(a, input, 1 / 60, flat);
    for (let i = 0; i < 200; i++) advanceFlight(b, input, 1 / 20, flat);
    expect(a.crashed).toBe("ground");
    expect(b.crashed).toBe("ground");
    expect(a.x).toBeCloseTo(b.x, 6);
    expect(a.z).toBeCloseTo(b.z, 6);
    expect(a.y).toBeCloseTo(b.y, 6);
  });
});
