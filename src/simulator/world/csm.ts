import * as THREE from "three";

/**
 * Glue between three's cascaded shadow maps and materials that already
 * carry their own shader patches. `CSM.setupMaterial` assigns
 * `material.onBeforeCompile`, which would silently discard the terrain
 * or water patch; `composeCsm` keeps whatever patch is installed, runs it
 * first, then the CSM one, and keys the program cache on both. A sweep
 * over the scene every frame catches materials created later and
 * patches that were replaced after the first setup.
 */

/** The part of `CSM` this module needs, so tests can fake it. */
export interface CsmLike {
  setupMaterial(material: THREE.Material): void;
}

type Patch = THREE.Material["onBeforeCompile"];

interface Wrapped {
  patch: Patch;
  key: () => string;
}

const wrapped = new WeakMap<THREE.Material, Wrapped>();

/** Only materials that read the light list need the cascade uniforms. */
export function isLitMaterial(material: THREE.Material): boolean {
  const m = material as THREE.Material & {
    isMeshStandardMaterial?: boolean;
    isMeshLambertMaterial?: boolean;
    isMeshPhongMaterial?: boolean;
    isMeshToonMaterial?: boolean;
  };
  return (
    m.isMeshStandardMaterial === true ||
    m.isMeshLambertMaterial === true ||
    m.isMeshPhongMaterial === true ||
    m.isMeshToonMaterial === true
  );
}

/** True when `composeCsm` installed the patch that is on the material now. */
export function isCsmCurrent(material: THREE.Material): boolean {
  const entry = wrapped.get(material);
  return entry !== undefined && material.onBeforeCompile === entry.patch;
}

/**
 * Sets a material up for CSM without losing its existing patch. Returns
 * true when it changed the material (first setup, or a re-wrap after
 * someone replaced `onBeforeCompile` behind its back).
 */
export function composeCsm(csm: CsmLike, material: THREE.Material): boolean {
  if (isCsmCurrent(material)) return false;
  const entry = wrapped.get(material);
  const prev = material.onBeforeCompile;
  const ownKey = material.customProgramCacheKey;
  const defaultKey = THREE.Material.prototype.customProgramCacheKey;
  // Three's default key is the patch's source text. Keep that meaning for
  // the patch that is there now (not for our wrapper), also when someone
  // swapped the patch but left our key in place.
  const baseKey: () => string =
    ownKey === defaultKey || (entry && ownKey === entry.key)
      ? () => prev.toString()
      : () => ownKey.call(material);
  csm.setupMaterial(material);
  const csmPatch = material.onBeforeCompile;
  const patch: Patch = function (this: THREE.Material, shader, renderer) {
    prev.call(material, shader, renderer);
    csmPatch.call(material, shader, renderer);
  };
  const key = () => `${baseKey()}|csm`;
  material.onBeforeCompile = patch;
  material.customProgramCacheKey = key;
  material.needsUpdate = true;
  wrapped.set(material, { patch, key });
  return true;
}

/** Composes every lit material under `root`. Returns how many changed. */
export function sweepCsm(csm: CsmLike, root: THREE.Object3D): number {
  let changed = 0;
  root.traverse((obj) => {
    const m = (obj as THREE.Mesh).material as
      | THREE.Material
      | THREE.Material[]
      | undefined;
    if (!m) return;
    if (Array.isArray(m)) {
      for (const mat of m)
        if (isLitMaterial(mat) && composeCsm(csm, mat)) changed++;
    } else if (isLitMaterial(m) && composeCsm(csm, m)) {
      changed++;
    }
  });
  return changed;
}

/** World-space size of one shadow texel for an orthographic cascade. */
export function shadowTexel(
  camera: THREE.OrthographicCamera,
  mapSize: number,
): number {
  return (camera.right - camera.left) / mapSize;
}

/**
 * Normal bias proportional to the cascade's texel: enough to hide acne on
 * the smooth range, small enough that a strut still touches its shadow.
 */
export function cascadeNormalBias(texel: number, factor = 2): number {
  return THREE.MathUtils.clamp(texel * factor, 0.04, 1.2);
}
