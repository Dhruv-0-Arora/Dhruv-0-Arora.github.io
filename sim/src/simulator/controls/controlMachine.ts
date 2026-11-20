/**
 * The simulator's control mode as a pure transition table.
 *
 * rails      scroll drives the camera along the rail; pointer free-looks.
 * driving    the visitor pilots the Dozer; camera chases it.
 * flying     the visitor flies the Flyer; camera chases it.
 * returning  camera glides from the vehicle back to the nearest rail point.
 */
export type ControlMode = "rails" | "driving" | "flying" | "returning";

export type ControlEvent =
  | { type: "TAKE_WHEEL" }
  | { type: "TAKE_OFF" }
  | { type: "RELEASE" }
  | { type: "LAND" }
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
  rails: { TAKE_WHEEL: "driving", TAKE_OFF: "flying" },
  driving: { RELEASE: "returning", DISABLE: "returning" },
  flying: { LAND: "returning", DISABLE: "returning" },
  returning: {
    RETURNED: "rails",
    TAKE_WHEEL: "driving",
    TAKE_OFF: "flying",
    DISABLE: "returning",
  },
};

/** Returns the next mode, or the same mode when the event does not apply. */
export function transition(
  mode: ControlMode,
  event: ControlEvent,
  ctx: ControlContext,
): ControlMode {
  if (
    (event.type === "TAKE_WHEEL" || event.type === "TAKE_OFF") &&
    !ctx.canDrive
  ) {
    return mode;
  }
  return TABLE[mode][event.type] ?? mode;
}
