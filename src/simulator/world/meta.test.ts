import { describe, expect, it } from "vitest";
import { contract } from "./contract.ts";
import { parseWorldMeta, validateWorldMeta, type WorldMeta } from "./meta.ts";

function validMeta(): WorldMeta {
  return {
    version: contract.version,
    rail: {
      points: [
        [0, 1, 0],
        [10, 1, 0],
        [10, 1, 10],
      ],
      closed: false,
    },
    looks: [
      { t: 0, position: [5, 0, 5] },
      { t: 0.5, position: [10, 0, 5] },
    ],
    zones: contract.zones.map((slug, i) => ({
      slug,
      position: [i * 10, 0, 0],
      radius: 8,
    })),
    routes: [
      {
        slug: "rainier",
        points: [
          [300, 10, 0],
          [310, 120, 5],
        ],
      },
    ],
    lakes: [{ slug: "tarn", center: [280, 60, -40], radius: 26 }],
    trails: [
      {
        slug: "tarn",
        points: [
          [212, 4, -10],
          [280, 58, -30],
        ],
      },
    ],
    terraces: contract.zones.map((slug, i) => ({
      slug,
      center: [i * 10, 2, 0],
      radius: 12,
    })),
    colliders: [
      { name: "col.box.plinth", center: [0, 1, 0], half: [1, 1, 1], yaw: 0.3 },
    ],
    bounds: { min: [-200, 0, -200], max: [200, 50, 200] },
  };
}

describe("validateWorldMeta", () => {
  it("accepts a complete export", () => {
    expect(validateWorldMeta(validMeta())).toEqual([]);
    expect(parseWorldMeta(validMeta())).toEqual(validMeta());
  });

  it("rejects non-objects", () => {
    expect(validateWorldMeta(null)).toEqual(["meta is not an object"]);
    expect(validateWorldMeta("x")).toEqual(["meta is not an object"]);
  });

  it("requires every contract zone exactly once", () => {
    const meta = validMeta();
    const removed = meta.zones.pop();
    meta.zones.push({ ...meta.zones[0] });
    const errors = validateWorldMeta(meta);
    expect(errors).toContain(`zone '${removed?.slug}' is missing`);
    expect(errors).toContain(`zone '${meta.zones[0].slug}' is duplicated`);
  });

  it("rejects unknown zones and bad radii", () => {
    const meta = validMeta();
    (meta.zones[0] as { slug: string }).slug = "not-a-project";
    meta.zones[1].radius = 0;
    const errors = validateWorldMeta(meta);
    expect(errors).toContain("zone 'not-a-project' is not in the contract");
    expect(errors).toContain(`zone '${meta.zones[1].slug}' needs radius > 0`);
  });

  it("requires a rail with at least two finite points", () => {
    const meta = validMeta();
    meta.rail.points = [[0, 0, 0]];
    expect(validateWorldMeta(meta)).toContain(
      "rail.points needs at least 2 points",
    );
    meta.rail.points = [
      [0, 0, 0],
      [Number.NaN, 0, 0],
    ];
    expect(validateWorldMeta(meta)).toContain(
      "rail.points contains a non-finite point",
    );
  });

  it("requires looks sorted by t within [0, 1]", () => {
    const meta = validMeta();
    meta.looks = [
      { t: 0.7, position: [0, 0, 0] },
      { t: 0.2, position: [0, 0, 0] },
      { t: 1.5, position: [0, 0, 0] },
    ];
    const errors = validateWorldMeta(meta);
    expect(errors).toContain("looks must be sorted by t");
    expect(errors).toContain("look at t=1.5 is outside [0, 1]");
  });

  it("accepts a world without routes", () => {
    const meta = validMeta();
    meta.routes = [];
    expect(validateWorldMeta(meta)).toEqual([]);
  });

  it("requires routes to be unique polylines with contract-style slugs", () => {
    const meta = validMeta();
    meta.routes = [
      { slug: "rainier", points: [[0, 0, 0]] },
      {
        slug: "rainier",
        points: [
          [0, 0, 0],
          [1, Number.NaN, 1],
        ],
      },
      {
        slug: "Mt Adams",
        points: [
          [0, 0, 0],
          [1, 1, 1],
        ],
      },
    ];
    const errors = validateWorldMeta(meta);
    expect(errors).toContain("route 'rainier' needs at least 2 points");
    expect(errors).toContain("route 'rainier' is duplicated");
    expect(errors).toContain("route 'rainier' contains a non-finite point");
    expect(errors).toContain("route 'Mt Adams' has a bad slug");
  });

  it("accepts a world without lakes or trails", () => {
    const meta = validMeta();
    meta.lakes = [];
    meta.trails = [];
    expect(validateWorldMeta(meta)).toEqual([]);
  });

  it("checks trails like routes", () => {
    const meta = validMeta();
    meta.trails = [
      { slug: "tarn", points: [[0, 0, 0]] },
      {
        slug: "tarn",
        points: [
          [0, 0, 0],
          [1, 1, 1],
        ],
      },
      {
        slug: "Big Lake",
        points: [
          [0, 0, 0],
          [1, 1, 1],
        ],
      },
    ];
    const errors = validateWorldMeta(meta);
    expect(errors).toContain("trail 'tarn' needs at least 2 points");
    expect(errors).toContain("trail 'tarn' is duplicated");
    expect(errors).toContain("trail 'Big Lake' has a bad slug");
  });

  it("requires lakes to have unique slugs, a finite center and a radius", () => {
    const meta = validMeta();
    meta.lakes = [
      { slug: "tarn", center: [0, Number.NaN, 0], radius: 10 },
      { slug: "tarn", center: [0, 0, 0], radius: 0 },
    ];
    const errors = validateWorldMeta(meta);
    expect(errors).toContain("lake 'tarn' has a bad center");
    expect(errors).toContain("lake 'tarn' is duplicated");
    expect(errors).toContain("lake 'tarn' needs radius > 0");
    (meta as { lakes: unknown }).lakes = undefined;
    expect(validateWorldMeta(meta)).toContain("lakes must be an array");
  });

  it("requires one terrace per contract zone with a center and a radius", () => {
    const meta = validMeta();
    const removed = meta.terraces.pop();
    meta.terraces.push({ ...meta.terraces[0] });
    meta.terraces[1].radius = -1;
    meta.terraces[2].center = [0, Number.NaN, 0];
    (meta.terraces[3] as { slug: string }).slug = "plateau";
    const errors = validateWorldMeta(meta);
    const [first, second, third] = meta.terraces;
    expect(errors).toContain(`terrace '${removed?.slug}' is missing`);
    expect(errors).toContain(`terrace '${first.slug}' is duplicated`);
    expect(errors).toContain(`terrace '${second.slug}' needs radius > 0`);
    expect(errors).toContain(`terrace '${third.slug}' has a bad center`);
    expect(errors).toContain("terrace 'plateau' is not a contract zone");
    (meta as { terraces: unknown }).terraces = undefined;
    expect(validateWorldMeta(meta)).toContain("terraces must be an array");
  });

  it("rejects collider boxes with no extent or a bad yaw", () => {
    const meta = validMeta();
    meta.colliders[0].half = [2, 0, 1];
    expect(validateWorldMeta(meta)).toContain(
      "collider 'col.box.plinth' has a non-positive extent",
    );
    meta.colliders[0].yaw = Number.NaN;
    expect(validateWorldMeta(meta)).toContain(
      "collider 'col.box.plinth' has a bad yaw",
    );
  });

  it("rejects a version mismatch", () => {
    const meta = { ...validMeta(), version: contract.version + 1 };
    expect(validateWorldMeta(meta)[0]).toMatch(/does not match contract/);
    expect(() => parseWorldMeta(meta)).toThrow(/invalid world meta/);
  });
});
