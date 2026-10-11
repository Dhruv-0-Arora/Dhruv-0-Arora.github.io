import { afterEach, describe, expect, it } from "vitest";
import {
  hint,
  nextHint,
  readSeen,
  STORAGE_KEY,
  writeSeen,
} from "./hintState.ts";

describe("nextHint", () => {
  it("dismisses once and then holds", () => {
    const unseen = { seen: false };
    const seen = nextHint(unseen, { type: "dismiss" });
    expect(seen).toEqual({ seen: true });
    expect(nextHint(seen, { type: "dismiss" })).toBe(seen);
  });
});

describe("hint store", () => {
  afterEach(() => hint.reset());

  it("notifies on the first dismissal only", () => {
    let calls = 0;
    const off = hint.subscribe(() => {
      calls++;
    });
    hint.dispatch({ type: "dismiss" });
    hint.dispatch({ type: "dismiss" });
    off();
    expect(hint.get().seen).toBe(true);
    expect(calls).toBe(1);
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

  it("defaults to unseen and remembers a dismissal", () => {
    expect(readSeen(null)).toBe(false);
    const s = storage();
    expect(readSeen(s)).toBe(false);
    writeSeen(s);
    expect(s.map.get(STORAGE_KEY)).toBe("seen");
    expect(readSeen(s)).toBe(true);
  });

  it("ignores a value it did not write", () => {
    expect(readSeen(storage({ [STORAGE_KEY]: "yes" }))).toBe(false);
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
    expect(readSeen(broken)).toBe(false);
    expect(() => writeSeen(broken)).not.toThrow();
  });
});
