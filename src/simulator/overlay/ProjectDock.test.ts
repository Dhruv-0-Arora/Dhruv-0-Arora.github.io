import { describe, expect, it } from "vitest";
import { projects } from "../../content/projects";
import { ZONE_SLUGS } from "../world/contract.ts";
import { projectForZone } from "./ProjectDock.tsx";

describe("projectForZone", () => {
  it("resolves every project zone to a catalog entry with copy", () => {
    for (const slug of ZONE_SLUGS) {
      // The hub is the one zone without a project: the panel shows the guide.
      if (slug === "hub") continue;
      const project = projectForZone(slug);
      expect(project, slug).toBeDefined();
      expect(project?.tagline.length, slug).toBeGreaterThan(10);
      expect(project?.tech.length, slug).toBeGreaterThan(0);
    }
  });

  it("gives every zone project a description and technical details", () => {
    for (const slug of ZONE_SLUGS) {
      if (slug === "hub") continue;
      const project = projectForZone(slug);
      expect(project?.description?.length, slug).toBeGreaterThan(120);
      expect(project?.details?.length, slug).toBeGreaterThanOrEqual(2);
      for (const line of project?.details ?? []) {
        expect(line, slug).not.toContain("\u2014");
      }
    }
  });

  it("keeps the fixed authorship framings", () => {
    const text = JSON.stringify(projects);
    expect(text).not.toMatch(/I built Orion|I made Orion|my Orion/);
    const orion = projects.find((p) => p.slug === "orion");
    expect(JSON.stringify(orion)).toMatch(/contribute to|work on with Aditya/);
    expect(JSON.stringify(orion)).toMatch(/not my share/);
    const imc = projects.find((p) => p.slug === "imc-prosperity-4");
    expect(JSON.stringify(imc)).toMatch(/team DAAB/);
    expect(JSON.stringify(imc)).toMatch(/not a closing result/);
    const synthesis = projects.find((p) => p.slug === "synthesis");
    expect(JSON.stringify(synthesis)).not.toMatch(/\d+ commits/);
    const kerms = projects.find((p) => p.slug === "kerms");
    expect(JSON.stringify(kerms)).not.toMatch(/win rate of|P&L|returned \d/);
    const altigoz = projects.find((p) => p.slug === "altigoz");
    expect(JSON.stringify(altigoz)).not.toMatch(/placed|1st|2nd|3rd/);
  });

  it("keeps slugs unique", () => {
    const slugs = projects.map((p) => p.slug).filter(Boolean);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("never names the government client anywhere in the catalog", () => {
    const text = JSON.stringify(projects).toLowerCase();
    for (const forbidden of ["iowa", "administrators", "evaluation"]) {
      expect(text).not.toContain(forbidden);
    }
  });

  it("never prints a Soundwave prize figure and discloses AI assistance", () => {
    const text = JSON.stringify(projects);
    expect(text).not.toMatch(/\$7K|\$12K|\$3,000/);
    const monkeytype = projects.find((p) => p.name === "monkeytype-tui");
    expect(monkeytype?.tagline).toMatch(/AI assistance/);
  });
});
