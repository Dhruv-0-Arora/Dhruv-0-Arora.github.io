import { describe, expect, it } from "vitest";
import { DRAG_LOOK_DEFAULTS, DragLook } from "./dragLook.ts";

const DT = 1 / 60;

function drag(look: DragLook, dx: number, dy: number, frames = 10) {
  look.begin();
  for (let i = 0; i < frames; i++) {
    look.move(dx / frames, dy / frames);
    look.step(DT);
  }
}

describe("DragLook", () => {
  it("moves the world with the pointer and clamps pitch", () => {
    const look = new DragLook();
    // Dragging right pulls the world right, so the view turns left (+yaw).
    drag(look, 0.25, 0);
    expect(look.yaw).toBeCloseTo(0.25 * DRAG_LOOK_DEFAULTS.sensitivity);
    expect(look.pitch).toBe(0);
    // Dragging down looks down (-pitch), clamped at the limit.
    drag(look, 0, 3);
    expect(look.pitch).toBe(-DRAG_LOOK_DEFAULTS.pitchLimit);
  });

  it("keeps a drag that starts and ends between frames", () => {
    const look = new DragLook();
    look.begin();
    look.move(0.2, 0);
    look.end();
    look.step(DT);
    // The full drag lands, plus at most one frame of coasting.
    const dragged = 0.2 * DRAG_LOOK_DEFAULTS.sensitivity;
    expect(look.yaw).toBeGreaterThanOrEqual(dragged);
    expect(look.yaw).toBeLessThan(
      dragged + DRAG_LOOK_DEFAULTS.maxVelocity * DT + 1e-9,
    );
  });

  it("ignores motion when not dragging", () => {
    const look = new DragLook();
    look.move(1, 1);
    look.step(DT);
    expect(look.yaw).toBe(0);
    expect(look.pitch).toBe(0);
  });

  it("coasts after release and comes to rest", () => {
    const look = new DragLook();
    drag(look, 0.2, 0);
    const atRelease = look.yaw;
    look.end();
    look.step(DT);
    const afterOne = look.yaw;
    expect(Math.abs(afterOne)).toBeGreaterThan(Math.abs(atRelease));
    for (let i = 0; i < 600; i++) look.step(DT);
    const rest = look.yaw;
    look.step(DT);
    expect(look.yaw).toBe(rest);
    expect(Math.abs(rest)).toBeLessThan(DRAG_LOOK_DEFAULTS.yawLimit);
  });

  it("recenters as the rail travels, faster for more travel", () => {
    const a = new DragLook();
    const b = new DragLook();
    drag(a, 0.3, 0.05);
    drag(b, 0.3, 0.05);
    a.end();
    b.end();
    for (let i = 0; i < 60; i++) {
      a.step(DT, 0.001);
      b.step(DT, 0.004);
    }
    expect(Math.abs(a.yaw)).toBeGreaterThan(Math.abs(b.yaw));
    expect(Math.abs(b.yaw)).toBeLessThan(0.08);
    expect(Math.sign(b.pitch)).toBe(Math.sign(a.pitch));
  });

  it("follows the pointer exactly under reduced motion", () => {
    const look = new DragLook({ reducedMotion: true });
    drag(look, 0.1, 0);
    const held = look.yaw;
    look.end();
    for (let i = 0; i < 30; i++) look.step(DT);
    expect(look.yaw).toBe(held);
    look.step(DT, 0.01);
    expect(Math.abs(look.yaw)).toBe(0);
  });

  it("resets to center", () => {
    const look = new DragLook();
    drag(look, 0.4, 0.1);
    look.reset();
    expect(look.active).toBe(false);
    expect(look.step(DT)).toMatchObject({ yaw: 0, pitch: 0 });
  });
});
