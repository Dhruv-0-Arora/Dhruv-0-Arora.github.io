import * as THREE from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RailPath } from "../controls/railPath.ts";
import { MaterialRegistry } from "../theme/retint.ts";
import { contract, type District } from "./contract.ts";
import { parseWorldMeta, type WorldMeta } from "./meta.ts";

export const WORLD_URL = "/world";

export interface LoadedDistrict {
  district: District;
  group: THREE.Group;
  /** World-space center, for distance culling and load ordering. */
  center: THREE.Vector3;
}

export interface WorldBase {
  meta: WorldMeta;
  rail: RailPath;
  registry: MaterialRegistry;
  shared: LoadedDistrict;
  /** Hidden collision geometry, kept out of the scene and raycast directly. */
  ground: THREE.Object3D;
}

let loader: GLTFLoader | null = null;

/**
 * GLTFLoader strips dots from node names (PropertyBinding.sanitizeNodeName),
 * so `col.ground` arrives as `colground`. Compare through the same function.
 */
const GROUND_NAME = THREE.PropertyBinding.sanitizeNodeName("col.ground");
const BOX_PREFIX = THREE.PropertyBinding.sanitizeNodeName("col.box.");

export function isColliderName(name: string): boolean {
  return name === GROUND_NAME || name.startsWith(BOX_PREFIX);
}

function getLoader(): GLTFLoader {
  if (!loader) {
    loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
  }
  return loader;
}

interface DistrictLoad extends LoadedDistrict {
  colliders: THREE.Object3D[];
}

/**
 * Loads one district glb: registers every material with the registry (which
 * throws on names outside the contract), detaches `col.*` nodes so they
 * never render, and measures the center.
 */
export async function loadDistrict(
  district: District,
  registry: MaterialRegistry,
): Promise<DistrictLoad> {
  const gltf = await getLoader().loadAsync(`${WORLD_URL}/${district}.glb`);
  const group = gltf.scene;
  group.name = district;
  const seen = new Set<THREE.Material>();
  // A multi-material collider arrives as a Group of meshes named after the
  // node, so detach by name at any depth before touching materials.
  const colliders: THREE.Object3D[] = [];
  group.traverse((obj) => {
    if (isColliderName(obj.name)) colliders.push(obj);
  });
  for (const col of colliders) {
    col.removeFromParent();
    col.updateMatrixWorld(true);
  }
  const meshes: THREE.Mesh[] = [];
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) meshes.push(obj);
  });
  for (const mesh of meshes) {
    mesh.matrixAutoUpdate = false;
    // The sun casts real shadows: the range onto the plate, buildings onto
    // the ground. Instancers opt in individually.
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    const replaced = materials.map((m) => {
      if (seen.has(m)) return m;
      seen.add(m);
      return registry.register(m);
    });
    mesh.material = Array.isArray(mesh.material) ? replaced : replaced[0];
  }
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  const center = box.isEmpty()
    ? new THREE.Vector3()
    : box.getCenter(new THREE.Vector3());
  return { district, group, center, colliders };
}

let basePromise: Promise<WorldBase> | null = null;

/** meta.json + shared.glb: everything needed to be interactive. */
export function loadWorldBase(): Promise<WorldBase> {
  basePromise ??= (async () => {
    const registry = new MaterialRegistry();
    const [metaJson, shared] = await Promise.all([
      fetch(`${WORLD_URL}/meta.json`).then((r) => {
        if (!r.ok) throw new Error(`meta.json: ${r.status}`);
        return r.json();
      }),
      loadDistrict("shared", registry),
    ]);
    const meta = parseWorldMeta(metaJson);
    const ground = shared.colliders.find((m) => m.name === GROUND_NAME);
    if (!ground) {
      throw new Error("shared.glb has no col.ground");
    }
    const { colliders: _colliders, ...district } = shared;
    return {
      meta,
      rail: new RailPath(meta.rail),
      registry,
      shared: district,
      ground,
    };
  })();
  return basePromise;
}

/** Districts other than shared, ordered nearest-first from `from`. */
export function districtLoadOrder(
  from: THREE.Vector3,
  centers: Partial<Record<District, THREE.Vector3>>,
): District[] {
  const rest = contract.districts.filter((d) => d !== "shared");
  return rest.sort((a, b) => {
    const da = centers[a]?.distanceToSquared(from) ?? Number.POSITIVE_INFINITY;
    const db = centers[b]?.distanceToSquared(from) ?? Number.POSITIVE_INFINITY;
    return da - db;
  });
}

/** Rough district centers from the blockout, for ordering before load. */
export const DISTRICT_HINTS: Record<District, THREE.Vector3> = {
  shared: new THREE.Vector3(0, 0, 0),
  terminal: new THREE.Vector3(-130, 0, -20),
  redacted: new THREE.Vector3(-70, 0, -140),
  evidence: new THREE.Vector3(110, 0, -110),
  fabrication: new THREE.Vector3(110, 0, 100),
  // The mountain ring surrounds everything; its center is the hub so it
  // streams right after shared and is never distance-culled.
  backdrop: new THREE.Vector3(0, 0, 0),
};
