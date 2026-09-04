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
