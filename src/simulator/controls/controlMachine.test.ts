import { describe, expect, it } from "vitest";
import {
  type ControlEvent,
  type ControlMode,
  transition,
} from "./controlMachine.ts";

const can = { canDrive: true };
const cannot = { canDrive: false };
const MODES: ControlMode[] = ["rails", "driving", "flying", "returning"];
const EVENTS: ControlEvent["type"][] = [
  "TAKE_WHEEL",
  "TAKE_OFF",
  "RELEASE",
  "LAND",
  "RETURNED",
  "DISABLE",
];

describe("transition", () => {
  it("implements the full table", () => {
    const expected: Record<string, ControlMode> = {
      "rails+TAKE_WHEEL": "driving",
      "rails+TAKE_OFF": "flying",
      "rails+RELEASE": "rails",
      "rails+LAND": "rails",
      "rails+RETURNED": "rails",
      "rails+DISABLE": "rails",
      "driving+TAKE_WHEEL": "driving",
      "driving+TAKE_OFF": "driving",
      "driving+RELEASE": "returning",
      "driving+LAND": "driving",
      "driving+RETURNED": "driving",
      "driving+DISABLE": "returning",
      "flying+TAKE_WHEEL": "flying",
      "flying+TAKE_OFF": "flying",
      "flying+RELEASE": "flying",
      "flying+LAND": "returning",
      "flying+RETURNED": "flying",
      "flying+DISABLE": "returning",
      "returning+TAKE_WHEEL": "driving",
      "returning+TAKE_OFF": "flying",
      "returning+RELEASE": "returning",
      "returning+LAND": "returning",
      "returning+RETURNED": "rails",
      "returning+DISABLE": "returning",
    };
    for (const mode of MODES) {
      for (const type of EVENTS) {
        expect(transition(mode, { type }, can), `${mode}+${type}`).toBe(
          expected[`${mode}+${type}`],
        );
      }
    }
  });

  it("refuses the wheel and the Flyer when driving is unavailable", () => {
    expect(transition("rails", { type: "TAKE_WHEEL" }, cannot)).toBe("rails");
    expect(transition("rails", { type: "TAKE_OFF" }, cannot)).toBe("rails");
    expect(transition("returning", { type: "TAKE_WHEEL" }, cannot)).toBe(
      "returning",
    );
  });

  it("always lets a pilot release, even when driving becomes unavailable", () => {
    expect(transition("driving", { type: "RELEASE" }, cannot)).toBe(
      "returning",
    );
    expect(transition("flying", { type: "LAND" }, cannot)).toBe("returning");
  });
});
