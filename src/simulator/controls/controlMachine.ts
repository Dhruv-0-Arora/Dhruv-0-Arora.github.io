/**
 * The simulator's control mode as a pure transition table.
 *
 * rails      scroll drives the camera along the rail; pointer free-looks.
 * driving    the visitor pilots the Dozer; camera chases it.
 * returning  camera glides from the Dozer back to the nearest rail point.
 */
export type ControlMode = "rails" | "driving" | "returning";

export type ControlEvent =
  | { type: "TAKE_WHEEL" }
  | { type: "RELEASE" }
  | { type: "RETURNED" }
  | { type: "DISABLE" };

export interface ControlContext {
  /** False on touch-only devices or before the world and Dozer are loaded. */
  canDrive: boolean;
}

const TABLE: Record<
  ControlMode,
  Partial<Record<ControlEvent["type"], ControlMode>>
> = {
  rails: { TAKE_WHEEL: "driving" },
  driving: { RELEASE: "returning", DISABLE: "returning" },
  returning: { RETURNED: "rails", TAKE_WHEEL: "driving", DISABLE: "returning" },
};

/** Returns the next mode, or the same mode when the event does not apply. */
export function transition(
  mode: ControlMode,
  event: ControlEvent,
  ctx: ControlContext,
): ControlMode {
  if (event.type === "TAKE_WHEEL" && !ctx.canDrive) return mode;
  return TABLE[mode][event.type] ?? mode;
}
