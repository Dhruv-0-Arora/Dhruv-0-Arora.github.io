import { describe, expect, it } from "vitest";
import {
  type ControlEvent,
  type ControlMode,
  transition,
} from "./controlMachine.ts";

const can = { canDrive: true };
const cannot = { canDrive: false };
const MODES: ControlMode[] = ["rails", "driving", "returning"];
const EVENTS: ControlEvent["type"][] = [
  "TAKE_WHEEL",
  "RELEASE",
  "RETURNED",
  "DISABLE",
];

describe("transition", () => {
  it("implements the full table", () => {
    const expected: Record<string, ControlMode> = {
      "rails+TAKE_WHEEL": "driving",
      "rails+RELEASE": "rails",
      "rails+RETURNED": "rails",
      "rails+DISABLE": "rails",
      "driving+TAKE_WHEEL": "driving",
      "driving+RELEASE": "returning",
      "driving+RETURNED": "driving",
      "driving+DISABLE": "returning",
      "returning+TAKE_WHEEL": "driving",
      "returning+RELEASE": "returning",
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

  it("refuses to take the wheel when driving is unavailable", () => {
    expect(transition("rails", { type: "TAKE_WHEEL" }, cannot)).toBe("rails");
    expect(transition("returning", { type: "TAKE_WHEEL" }, cannot)).toBe(
      "returning",
    );
  });

  it("always lets a driver release, even when driving becomes unavailable", () => {
    expect(transition("driving", { type: "RELEASE" }, cannot)).toBe(
      "returning",
    );
  });
});
