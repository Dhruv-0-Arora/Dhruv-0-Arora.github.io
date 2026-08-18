import * as THREE from "three";
import type { mirabuf } from "./proto/mirabuf";

/**
 * Builds a renderable THREE.Group from a decoded Mirabuf assembly.
 * A visual-only port of Autodesk/synthesis fission/src/mirabuf
 * (MirabufParser.loadGlobalTransforms + MirabufInstance), Apache-2.0.
 * Physics, joints, and rigid-node partitioning are intentionally dropped.
 */

/** Mirabuf stores centimeters; three.js scenes use meters. */
const CM_TO_M = 0.01;

const FALLBACK_COLOR = 0x8a8f98;

function miraTransformToMatrix(transform: mirabuf.ITransform): THREE.Matrix4 {
  const arr = transform.spatialMatrix;
  if (arr?.length !== 16) return new THREE.Matrix4();
  const pos = new THREE.Vector3(
    arr[3] * CM_TO_M,
    arr[7] * CM_TO_M,
    arr[11] * CM_TO_M,
  );
  const mat = new THREE.Matrix4().fromArray(arr);
  const rotation = new THREE.Matrix4().extractRotation(mat).transpose();
  const quat = new THREE.Quaternion().setFromRotationMatrix(rotation);
  return new THREE.Matrix4().compose(pos, quat, new THREE.Vector3(1, 1, 1));
}

function computeGlobalTransforms(
  assembly: mirabuf.Assembly,
): Map<string, THREE.Matrix4> {
  const transforms = new Map<string, THREE.Matrix4>();
  const partInstances = assembly.data?.parts?.partInstances ?? {};
  const partDefinitions = assembly.data?.parts?.partDefinitions ?? {};

  const walk = (node: mirabuf.INode, parent: THREE.Matrix4) => {
    for (const child of node.children ?? []) {
      if (!child.value) continue;
      const instance = partInstances[child.value];
      if (!instance || transforms.has(child.value)) continue;
      const mat = instance.transform
        ? miraTransformToMatrix(instance.transform)
        : new THREE.Matrix4();
      transforms.set(child.value, mat.clone().premultiply(parent));
      walk(child, mat);
    }
  };

  for (const root of assembly.designHierarchy?.nodes ?? []) {
    if (!root.value) continue;
    const instance = partInstances[root.value];
    if (!instance) continue;
    const definition = partDefinitions[instance.partDefinitionReference ?? ""];
    const mat = instance.transform
      ? miraTransformToMatrix(instance.transform)
      : definition?.baseTransform
        ? miraTransformToMatrix(definition.baseTransform)
        : new THREE.Matrix4();
    transforms.set(root.value, mat);
    walk(root, mat);
  }
  return transforms;
}

function loadMaterials(
  assembly: mirabuf.Assembly,
): Map<string, THREE.MeshStandardMaterial> {
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const appearances = assembly.data?.materials?.appearances ?? {};
  for (const [id, appearance] of Object.entries(appearances)) {
    const { A, B, G, R } = appearance.albedo ?? {};
    const hasColor = A != null && B != null && G != null && R != null;
    const color = hasColor ? (R << 16) | (G << 8) | B : FALLBACK_COLOR;
    const opacity = hasColor ? A / 255 : 1;
    materials.set(
      id,
      new THREE.MeshStandardMaterial({
        color,
        roughness: appearance.roughness ?? 0.5,
        metalness: appearance.metallic ?? 0,
        opacity,
        transparent: opacity < 1,
      }),
    );
  }
  return materials;
}

function buildGeometry(mesh: mirabuf.IMesh): THREE.BufferGeometry | null {
  const { verts, normals, indices } = mesh;
  if (!verts?.length || !normals?.length || !indices?.length) return null;

  const positions = new Float32Array(verts.length);
  for (let i = 0; i < verts.length; i++) {
    positions[i] = verts[i] * CM_TO_M;
  }

  const norms = new Float32Array(normals.length);
  for (let i = 0; i < normals.length; i += 3) {
    const x = normals[i];
    const y = normals[i + 1];
    const z = normals[i + 2];
    const len = Math.sqrt(x * x + y * y + z * z) || 1;
    norms[i] = x / len;
    norms[i + 1] = y / len;
    norms[i + 2] = z / len;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(norms, 3));
  geometry.setIndex(indices);
  return geometry;
}

export interface RobotModel {
  group: THREE.Group;
  /** Longest dimension of the robot in scene units, after normalization. */
  size: number;
}

/**
 * Returns the assembly as a group centered at the origin, resting on y = 0,
 * normalized so its longest dimension is `targetSize` units.
 */
export function buildRobot(
  assembly: mirabuf.Assembly,
  targetSize = 1.6,
): RobotModel {
  const group = new THREE.Group();
  const transforms = computeGlobalTransforms(assembly);
  const materials = loadMaterials(assembly);
  const fallbackMaterial = new THREE.MeshStandardMaterial({
    color: FALLBACK_COLOR,
    roughness: 0.6,
    metalness: 0.2,
  });

  const partInstances = assembly.data?.parts?.partInstances ?? {};
  const partDefinitions = assembly.data?.parts?.partDefinitions ?? {};

  for (const [guid, instance] of Object.entries(partInstances)) {
    const definition = partDefinitions[instance.partDefinitionReference ?? ""];
    const transform = transforms.get(guid);
    if (!definition || !transform) continue;

    for (const body of definition.bodies ?? []) {
      const mesh = body.triangleMesh?.mesh;
      if (!mesh) continue;
      const geometry = buildGeometry(mesh);
      if (!geometry) continue;

      const override = body.appearanceOverride;
      const material =
        (override && materials.get(override)) || fallbackMaterial;
      const threeMesh = new THREE.Mesh(geometry, material);
      threeMesh.applyMatrix4(transform);
      threeMesh.matrixAutoUpdate = false;
      threeMesh.castShadow = true;
      group.add(threeMesh);
    }
  }

  const bounds = new THREE.Box3().setFromObject(group);
  const dims = bounds.getSize(new THREE.Vector3());
  if (import.meta.env.DEV) {
    console.log(
      "[mirabuf] raw dims",
      dims.toArray().map((v) => v.toFixed(3)),
      "bounds min",
      bounds.min.toArray().map((v) => v.toFixed(3)),
    );
  }
  const scale = targetSize / (Math.max(dims.x, dims.y, dims.z) || 1);
  const center = bounds.getCenter(new THREE.Vector3());

  const normalized = new THREE.Group();
  group.position.set(
    -center.x * scale,
    -bounds.min.y * scale,
    -center.z * scale,
  );
  group.scale.setScalar(scale);
  normalized.add(group);

  return { group: normalized, size: targetSize };
}
