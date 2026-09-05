import { describe, expect, it } from "vitest";
import {
  nextPanel,
  type PanelState,
  readCollapsed,
  STORAGE_KEY,
  writeCollapsed,
} from "./panelState.ts";

const open: PanelState = { collapsed: false, pulse: 0 };

describe("nextPanel", () => {
  it("toggles and clears the pulse", () => {
    const collapsed = nextPanel(open, { type: "toggle" });
    expect(collapsed).toEqual({ collapsed: true, pulse: 0 });
    const pulsed = nextPanel(collapsed, { type: "zone", zone: "orion" });
    expect(pulsed.pulse).toBe(1);
    expect(nextPanel(pulsed, { type: "toggle" })).toEqual(open);
  });

  it("pulses only while collapsed and only for a real zone", () => {
    expect(nextPanel(open, { type: "zone", zone: "orion" })).toBe(open);
    const collapsed = nextPanel(open, { type: "toggle" });
    expect(nextPanel(collapsed, { type: "zone", zone: null })).toBe(collapsed);
    const twice = nextPanel(
      nextPanel(collapsed, { type: "zone", zone: "astute" }),
      { type: "zone", zone: "synthesis" },
    );
    expect(twice.pulse).toBe(2);
  });
});

describe("persistence", () => {
  function storage(initial: Record<string, string> = {}) {
    const map = new Map(Object.entries(initial));
    return {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
      map,
    };
  }

  it("defaults to open and round-trips the collapsed flag", () => {
    expect(readCollapsed(null)).toBe(false);
    expect(readCollapsed(storage())).toBe(false);
    const s = storage();
    writeCollapsed(s, true);
    expect(s.map.get(STORAGE_KEY)).toBe("collapsed");
    expect(readCollapsed(s)).toBe(true);
    writeCollapsed(s, false);
    expect(readCollapsed(s)).toBe(false);
  });

  it("survives a storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(readCollapsed(broken)).toBe(false);
    expect(() => writeCollapsed(broken, true)).not.toThrow();
  });
});
