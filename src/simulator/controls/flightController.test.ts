import { describe, expect, it } from "vitest";
import {
  advanceFlight,
  angleTo,
  createFlightState,
  FLIGHT,
  type FlightWorld,
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

  it("never goes below the terrain or above the ceiling", () => {
    const hilly: FlightWorld = { ...flat, floorHeight: () => 60 };
    const low = fly(hilly, { pitch: -1 }, 6);
    expect(low.y).toBeGreaterThanOrEqual(60 + FLIGHT.clearance);
    expect(low.pitch).toBeGreaterThanOrEqual(0);
    const high = fly(flat, { pitch: 1 }, 30);
    expect(high.y).toBeLessThanOrEqual(flat.ceiling);
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
});
