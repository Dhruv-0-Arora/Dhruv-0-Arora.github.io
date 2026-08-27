import { beforeEach, describe, expect, it } from "vitest";
import { frame, sim } from "./simStore.ts";

describe("sim store", () => {
  beforeEach(() => sim.reset());

  it("only allows driving once the world, the Dozer and a keyboard exist", () => {
    expect(sim.dispatch({ type: "TAKE_WHEEL" })).toBe("rails");
    sim.set({ worldReady: true, dozerReady: true });
    expect(sim.dispatch({ type: "TAKE_WHEEL" })).toBe("rails");
    sim.set({ hasKeyboard: true });
    expect(sim.dispatch({ type: "TAKE_WHEEL" })).toBe("driving");
  });

  it("clears inputs and the return target when leaving the wheel", () => {
    sim.set({ worldReady: true, dozerReady: true, hasKeyboard: true });
    sim.dispatch({ type: "TAKE_WHEEL" });
    frame.input = { throttle: 1, steer: -1 };
    frame.returnT = 0.4;
    expect(sim.dispatch({ type: "RELEASE" })).toBe("returning");
    expect(frame.input).toEqual({ throttle: 0, steer: 0 });
    expect(frame.returnT).toBeNull();
    expect(sim.dispatch({ type: "RETURNED" })).toBe("rails");
  });

  it("notifies subscribers on change only", () => {
    let calls = 0;
    const unsubscribe = sim.subscribe(() => calls++);
    sim.dispatch({ type: "RELEASE" });
    expect(calls).toBe(0);
    sim.set({ zone: "astute" });
    expect(calls).toBe(1);
    unsubscribe();
    sim.set({ zone: null });
    expect(calls).toBe(1);
  });
});
