import { describe, expect, it } from "vitest";
import { TOKENS } from "../world/contract.ts";
import { parseCssColor, parseMaterialName, readPalette } from "./palette.ts";

const close = (value: number, expected: number) =>
  expect(value).toBeCloseTo(expected, 3);

describe("parseCssColor", () => {
  it("parses six-digit hex like the light accent", () => {
    const c = parseCssColor("#e05e0b");
    close(c.r, 224 / 255);
    close(c.g, 94 / 255);
    close(c.b, 11 / 255);
    close(c.a, 1);
  });

  it("parses short hex and hex with alpha", () => {
    expect(parseCssColor("#fff")).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    close(parseCssColor("#ff000080").a, 128 / 255);
    close(parseCssColor("#f008").a, 136 / 255);
  });

  it("parses the modern rgb() syntax used by the soft tokens", () => {
    const c = parseCssColor("rgb(224 94 11 / 0.18)");
    close(c.r, 224 / 255);
    close(c.a, 0.18);
    close(parseCssColor("rgb(5 150 105 / 18%)").a, 0.18);
  });

  it("parses the legacy comma syntax getComputedStyle may return", () => {
    const c = parseCssColor("rgba(224, 94, 11, 0.5)");
    close(c.g, 94 / 255);
    close(c.a, 0.5);
    close(parseCssColor("rgb(0, 0, 255)").b, 1);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseCssColor("  #000000 ").r).toBe(0);
  });

  it("throws on anything else", () => {
    for (const bad of ["", "red", "hsl(0 0% 0%)", "#12345", "rgb(1 2)"]) {
      expect(() => parseCssColor(bad)).toThrow(/unsupported CSS color/);
    }
  });
});

describe("readPalette", () => {
  it("reads every contract token through the --c- prefix", () => {
    const seen: string[] = [];
    const palette = readPalette((prop) => {
      seen.push(prop);
      return "#102030";
    });
    expect(seen).toEqual(TOKENS.map((t) => `--c-${t}`));
    close(palette.accent.r, 16 / 255);
    close(palette["hue-green-soft"].b, 48 / 255);
  });

  it("names every missing token", () => {
    expect(() =>
      readPalette((prop) => (prop === "--c-accent" ? "" : "#000")),
    ).toThrow(/missing tokens: accent$/);
  });
});

describe("parseMaterialName", () => {
  it("maps tok.* to contract tokens", () => {
    expect(parseMaterialName("tok.accent")).toEqual({
      kind: "token",
      token: "accent",
    });
    expect(parseMaterialName("tok.hue-green-vivid")).toEqual({
      kind: "token",
      token: "hue-green-vivid",
    });
  });

  it("maps ramp.importance.N within 1..5", () => {
    expect(parseMaterialName("ramp.importance.3")).toEqual({
      kind: "ramp",
      ramp: "importance",
      step: 3,
      steps: 5,
    });
    expect(() => parseMaterialName("ramp.importance.0")).toThrow();
    expect(() => parseMaterialName("ramp.importance.6")).toThrow();
  });

  it("maps grad.dirnt", () => {
    expect(parseMaterialName("grad.dirnt")).toEqual({
      kind: "gradient",
      gradient: "dirnt",
    });
  });

  it("throws on Blender defaults and typos", () => {
    for (const bad of ["Material", "tok.orange", "tok.accent.1", "ramp.x.1"]) {
      expect(() => parseMaterialName(bad)).toThrow(/not in the world contract/);
    }
  });
});
