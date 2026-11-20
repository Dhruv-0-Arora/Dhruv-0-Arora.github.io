import { describe, expect, it } from "vitest";
import { resolveTheme, themeForHour } from "./theme";

const at = (hour: number) => new Date(2026, 9, 3, hour, 30);

describe("themeForHour", () => {
  it.each([
    [0, "dark"],
    [6, "dark"],
    [7, "light"],
    [12, "light"],
    [18, "light"],
    [19, "dark"],
    [23, "dark"],
  ] as const)("hour %i is %s", (hour, theme) => {
    expect(themeForHour(hour)).toBe(theme);
  });
});

describe("resolveTheme", () => {
  it("follows the local clock without an override", () => {
    expect(resolveTheme(at(12), "")).toBe("light");
    expect(resolveTheme(at(0), "")).toBe("dark");
  });

  it("honors ?theme=dark at noon", () => {
    expect(resolveTheme(at(12), "?theme=dark")).toBe("dark");
  });

  it("honors ?theme=light at midnight", () => {
    expect(resolveTheme(at(0), "?theme=light")).toBe("light");
  });

  it("ignores a garbage override", () => {
    expect(resolveTheme(at(12), "?theme=purple")).toBe("light");
    expect(resolveTheme(at(0), "?theme=")).toBe("dark");
  });
});
