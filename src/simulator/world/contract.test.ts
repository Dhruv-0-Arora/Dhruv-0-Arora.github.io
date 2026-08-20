import { describe, expect, it } from "vitest";
import {
  contract,
  contractSource,
  DISTRICTS,
  isDistrict,
  isToken,
  isZoneSlug,
  TOKENS,
  ZONE_SLUGS,
} from "./contract.ts";

describe("contract", () => {
  it("keeps the TypeScript literal lists in sync with contract.json", () => {
    expect([...DISTRICTS]).toEqual(contractSource.districts);
    expect([...ZONE_SLUGS]).toEqual(contractSource.zones);
    expect([...TOKENS]).toEqual(contractSource.materials.tokens);
  });

  it("has a budget entry for every district", () => {
    for (const district of DISTRICTS) {
      expect(contract.budgets.tris.districts[district]).toBeGreaterThan(0);
      expect(contract.budgets.bytes.districts[district]).toBeGreaterThan(0);
    }
  });

  it("keeps per-district budgets within the totals", () => {
    const tris = Object.values(contract.budgets.tris.districts).reduce(
      (a, b) => a + b,
      0,
    );
    expect(tris).toBeLessThanOrEqual(contract.budgets.tris.authoredTotal);
    const bytes = Object.values(contract.budgets.bytes.districts).reduce(
      (a, b) => a + b,
      0,
    );
    expect(bytes).toBeLessThanOrEqual(contract.budgets.bytes.totalSoft);
    expect(contract.budgets.bytes.totalSoft).toBeLessThan(
      contract.budgets.bytes.totalHard,
    );
  });

  it("exposes type guards", () => {
    expect(isDistrict("terminal")).toBe(true);
    expect(isDistrict("Terminal")).toBe(false);
    expect(isZoneSlug("astute")).toBe(true);
    expect(isZoneSlug("orion-2")).toBe(false);
    expect(isToken("hue-green")).toBe(true);
    expect(isToken("green")).toBe(false);
  });
});
