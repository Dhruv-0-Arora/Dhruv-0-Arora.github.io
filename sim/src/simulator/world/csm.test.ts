import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import {
  cascadeNormalBias,
  composeCsm,
  isCsmCurrent,
  isLitMaterial,
  shadowTexel,
  sweepCsm,
} from "./csm.ts";

const shader = {} as THREE.WebGLProgramParametersWithUniforms;
const renderer = {} as THREE.WebGLRenderer;

/** Behaves like `CSM.setupMaterial`: adds defines and takes the patch slot. */
function fakeCsm(log: string[]) {
  const patch = vi.fn(() => {
    log.push("csm");
  });
  return {
    patch,
    setupMaterial(m: THREE.Material) {
      m.defines = { ...(m.defines ?? {}), USE_CSM: 1 };
      m.onBeforeCompile = patch;
    },
  };
}

describe("composeCsm", () => {
  it("keeps an existing patch, runs it first and keys on both", () => {
    const log: string[] = [];
    const csm = fakeCsm(log);
    const m = new THREE.MeshStandardMaterial();
    m.onBeforeCompile = () => {
      log.push("terrain");
    };
    m.customProgramCacheKey = () => "terrain";
    expect(composeCsm(csm, m)).toBe(true);
    m.onBeforeCompile(shader, renderer);
    expect(log).toEqual(["terrain", "csm"]);
    expect(m.customProgramCacheKey()).toBe("terrain|csm");
    expect(m.defines?.USE_CSM).toBe(1);
    expect(isCsmCurrent(m)).toBe(true);
    expect(composeCsm(csm, m)).toBe(false);
  });

  it("keeps three's default key semantics for a patch without a key", () => {
    const csm = fakeCsm([]);
    const own = (_s: unknown) => {
      /* patch a */
    };
    const m = new THREE.MeshStandardMaterial();
    m.onBeforeCompile = own;
    composeCsm(csm, m);
    expect(m.customProgramCacheKey()).toBe(`${own.toString()}|csm`);
    const plain = new THREE.MeshStandardMaterial();
    composeCsm(csm, plain);
    expect(plain.customProgramCacheKey()).not.toBe(m.customProgramCacheKey());
  });

  it("re-wraps when the patch is replaced behind its back", () => {
    const log: string[] = [];
    const csm = fakeCsm(log);
    const m = new THREE.MeshStandardMaterial();
    composeCsm(csm, m);
    const later = () => {
      log.push("later");
    };
    m.onBeforeCompile = later;
    expect(isCsmCurrent(m)).toBe(false);
    expect(composeCsm(csm, m)).toBe(true);
    m.onBeforeCompile(shader, renderer);
    expect(log).toEqual(["later", "csm"]);
    expect(m.customProgramCacheKey()).toBe(`${later.toString()}|csm`);
  });
});

describe("sweepCsm", () => {
  it("composes lit materials only, once", () => {
    const csm = fakeCsm([]);
    const root = new THREE.Group();
    const std = new THREE.MeshStandardMaterial();
    const basic = new THREE.MeshBasicMaterial();
    root.add(new THREE.Mesh(new THREE.BoxGeometry(), std));
    root.add(
      new THREE.Mesh(new THREE.BoxGeometry(), [
        new THREE.MeshPhysicalMaterial(),
        basic,
      ]),
    );
    root.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial(),
      ),
    );
    expect(sweepCsm(csm, root)).toBe(2);
    expect(basic.onBeforeCompile).toBe(
      THREE.Material.prototype.onBeforeCompile,
    );
    expect(sweepCsm(csm, root)).toBe(0);
  });

  it("knows which materials read the light list", () => {
    expect(isLitMaterial(new THREE.MeshStandardMaterial())).toBe(true);
    expect(isLitMaterial(new THREE.MeshPhysicalMaterial())).toBe(true);
    expect(isLitMaterial(new THREE.MeshLambertMaterial())).toBe(true);
    expect(isLitMaterial(new THREE.MeshPhongMaterial())).toBe(true);
    expect(isLitMaterial(new THREE.MeshBasicMaterial())).toBe(false);
    expect(isLitMaterial(new THREE.ShaderMaterial())).toBe(false);
    expect(isLitMaterial(new THREE.LineBasicMaterial())).toBe(false);
  });
});

describe("cascade bias", () => {
  it("scales the normal bias with the cascade's texel", () => {
    const cam = new THREE.OrthographicCamera(-100, 100, 100, -100);
    const texel = shadowTexel(cam, 2048);
    expect(texel).toBeCloseTo(0.09765625, 8);
    expect(cascadeNormalBias(texel)).toBeCloseTo(0.1953125, 6);
    expect(cascadeNormalBias(0.001)).toBe(0.04);
    expect(cascadeNormalBias(5)).toBe(1.2);
  });
});
