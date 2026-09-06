/**
 * Click-and-drag look for the rails camera, as a pure state machine.
 *
 * Pointer deltas (in viewport heights, so a full-height drag is 1.0) turn
 * into a yaw and pitch offset applied to the rail's aim. Releasing keeps
 * the momentum and lets it coast; travelling along the rail eases the
 * offset back to center so a section is never entered facing backwards.
 */

export interface LookOffset {
  yaw: number;
  pitch: number;
}

export interface DragLookOptions {
  /** Radians of yaw per viewport height of horizontal drag. */
  sensitivity: number;
  pitchLimit: number;
  yawLimit: number;
  /** Per-second decay of the coasting velocity; higher stops sooner. */
  damping: number;
  /** Fastest coast, radians per second, so a flick never spins the view. */
  maxVelocity: number;
  /** How fast a unit of rail travel (t 0..1) recenters the offset. */
  recenter: number;
  /** No coasting, no easing: the offset follows the pointer exactly. */
  reducedMotion: boolean;
}

export const DRAG_LOOK_DEFAULTS: DragLookOptions = {
  sensitivity: 2.6,
  pitchLimit: 0.7,
  yawLimit: Math.PI,
  damping: 6,
  maxVelocity: 3,
  recenter: 14,
  reducedMotion: false,
};

const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

export class DragLook {
  readonly options: DragLookOptions;
  yaw = 0;
  pitch = 0;
  private vYaw = 0;
  private vPitch = 0;
  private dragging = false;
  /** Deltas gathered since the last step, in viewport heights. */
  private dx = 0;
  private dy = 0;

  constructor(options: Partial<DragLookOptions> = {}) {
    this.options = { ...DRAG_LOOK_DEFAULTS, ...options };
  }

  get active(): boolean {
    return this.dragging;
  }

  begin(): void {
    this.dragging = true;
    this.vYaw = 0;
    this.vPitch = 0;
  }

  /** Accumulates pointer motion; +dx is rightward, +dy is downward. */
  move(dx: number, dy: number): void {
    if (!this.dragging) return;
    this.dx += dx;
    this.dy += dy;
  }

  /** Applies whatever the pointer sent since the last step. */
  private consume(dt: number): void {
    const o = this.options;
    if (this.dx === 0 && this.dy === 0) return;
    // The world follows the pointer: dragging right turns the view left.
    // Positive yaw turns left, positive pitch looks up.
    const dYaw = this.dx * o.sensitivity;
    const dPitch = this.dy * o.sensitivity;
    this.yaw += dYaw;
    this.pitch += dPitch;
    // Smooth the velocity estimate so one jittery frame cannot fling.
    const blend = 0.5;
    this.vYaw = o.reducedMotion
      ? 0
      : clamp(this.vYaw + (dYaw / dt - this.vYaw) * blend, o.maxVelocity);
    this.vPitch = o.reducedMotion
      ? 0
      : clamp(this.vPitch + (dPitch / dt - this.vPitch) * blend, o.maxVelocity);
    this.dx = 0;
    this.dy = 0;
  }

  end(): void {
    this.dragging = false;
  }

  /**
   * Advances by `dt` seconds. `travel` is the rail distance covered this
   * step, as a fraction of the loop, used to recenter the look.
   */
  step(dt: number, travel = 0): LookOffset {
    const o = this.options;
    if (dt <= 0) return this;
    // A drag that began and ended between two frames still counts.
    this.consume(dt);
    if (!this.dragging) {
      this.yaw += this.vYaw * dt;
      this.pitch += this.vPitch * dt;
      const decay = Math.exp(-o.damping * dt);
      this.vYaw *= decay;
      this.vPitch *= decay;
      if (Math.abs(this.vYaw) < 1e-4) this.vYaw = 0;
      if (Math.abs(this.vPitch) < 1e-4) this.vPitch = 0;
      if (travel > 0) {
        const keep = o.reducedMotion ? 0 : Math.exp(-o.recenter * travel);
        this.yaw *= keep;
        this.pitch *= keep;
      }
    }
    this.yaw = clamp(this.yaw, o.yawLimit);
    this.pitch = clamp(this.pitch, o.pitchLimit);
    if (Math.abs(this.pitch) === o.pitchLimit) this.vPitch = 0;
    return this;
  }

  reset(): void {
    this.yaw = 0;
    this.pitch = 0;
    this.vYaw = 0;
    this.vPitch = 0;
    this.dx = 0;
    this.dy = 0;
    this.dragging = false;
  }
}
