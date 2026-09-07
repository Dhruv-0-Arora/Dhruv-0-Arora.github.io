import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../simStore.ts";
import type { Rgba } from "../theme/palette.ts";

/**
 * The Flyer: a 1903 Wright-style biplane built from primitives at life
 * size (12.3 m span, 6.4 m long). It hangs over the spawn pad like the
 * original hangs in the Smithsonian, props idling, until someone presses
 * T; then it is the second vehicle. Nose points +z in its own frame, the
 * same convention as the Dozer and the flight model.
 */

export const FLYER_PERCH = new THREE.Vector3(0, 10.5, 0);
const PERCH_SPIN = 0.09;
const PERCH_SWAY = 0.12;
const PROP_IDLE = 0.8;
const PROP_FLYING = 38;

const SPAN = 12.3;
const CHORD = 2.0;
const GAP = 1.85;
const STRUT_R = 0.035;
const STRUT_X = [-5.4, -3.6, -1.8, 0, 1.8, 3.6, 5.4];
const STRUT_Z = [-0.72, 0.72];

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

interface Materials {
  fabric: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  wire: THREE.LineBasicMaterial;
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

/** A strut or boom between two points. */
function rod(
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  material: THREE.Material,
): THREE.Mesh {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), material);
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.clone().sub(a).normalize(),
  );
  m.castShadow = true;
  return m;
}

function buildFlyer(mat: Materials) {
  const model = new THREE.Group();
  model.name = "flyer";
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Wings: fabric panels with spars along both edges.
  for (const y of [0, GAP]) {
    model.add(box(SPAN, 0.04, CHORD, 0, y, 0, mat.fabric));
    for (const z of [-CHORD / 2 + 0.05, CHORD / 2 - 0.05]) {
      model.add(box(SPAN + 0.1, 0.07, 0.07, 0, y, z, mat.wood));
    }
  }
  // Interplane struts and the X bracing wires in every bay.
  const wires: number[] = [];
  for (const z of STRUT_Z) {
    for (const x of STRUT_X) {
      model.add(rod(v(x, 0, z), v(x, GAP, z), STRUT_R, mat.wood));
    }
    for (let i = 0; i + 1 < STRUT_X.length; i++) {
      const a = STRUT_X[i];
      const b = STRUT_X[i + 1];
      wires.push(a, 0, z, b, GAP, z, a, GAP, z, b, 0, z);
    }
  }
  // Canard (the front elevator) on outrigger booms.
  for (const y of [0.35, 1.05]) {
    model.add(box(4.6, 0.035, 0.9, 0, y, 3.0, mat.fabric));
    model.add(box(4.7, 0.05, 0.05, 0, y, 3.4, mat.wood));
  }
  for (const x of [-0.7, 0.7]) {
    model.add(rod(v(x, 0.05, CHORD / 2), v(x, 0.35, 3.3), 0.03, mat.wood));
    model.add(
      rod(v(x, GAP - 0.05, CHORD / 2), v(x, 1.05, 3.3), 0.03, mat.wood),
    );
    model.add(rod(v(x, 0.35, 3.35), v(x, 1.05, 3.35), 0.025, mat.wood));
    wires.push(
      x,
      0.35,
      3.35,
      x,
      GAP,
      CHORD / 2,
      x,
      1.05,
      3.35,
      x,
      0,
      CHORD / 2,
    );
  }
  // Twin rudders on tail booms.
  for (const x of [-0.4, 0.4]) {
    const fin = box(0.03, 1.8, 0.8, x, 1.05, -3.2, mat.fabric);
    model.add(fin);
  }
  for (const x of [-0.9, 0.9]) {
    model.add(rod(v(x, 0.05, -CHORD / 2), v(x, 0.3, -3.5), 0.03, mat.wood));
    model.add(
      rod(v(x, GAP - 0.05, -CHORD / 2), v(x, 1.8, -3.5), 0.03, mat.wood),
    );
    model.add(rod(v(x, 0.3, -3.5), v(x, 1.8, -3.5), 0.025, mat.wood));
  }
  model.add(box(1.9, 0.05, 0.05, 0, 0.3, -3.5, mat.wood));
  model.add(box(1.9, 0.05, 0.05, 0, 1.8, -3.5, mat.wood));
  // Skids and their supports.
  for (const x of [-1.1, 1.1]) {
    model.add(box(0.08, 0.06, 5.2, x, -0.7, 0.9, mat.wood));
    model.add(rod(v(x, -0.7, 3.4), v(x, 0.35, 3.3), 0.03, mat.wood));
    model.add(rod(v(x, -0.7, -1.4), v(x, 0, -CHORD / 2), 0.03, mat.wood));
    model.add(rod(v(x, -0.7, 0.9), v(x, 0, 0.6), 0.03, mat.wood));
  }
  // Engine to the right of center, the pilot's cradle to the left.
  model.add(box(0.95, 0.5, 0.55, 0.65, 0.3, -0.15, mat.metal));
  model.add(box(1.4, 0.12, 0.6, -0.7, 0.12, 0.1, mat.wood));
  // Pusher propellers behind the trailing edge, counter-rotating.
  const props: THREE.Group[] = [];
  for (const x of [-1.55, 1.55]) {
    const hub = new THREE.Group();
    hub.position.set(x, 0.95, -1.35);
    hub.add(box(0.14, 2.7, 0.05, 0, 0, 0, mat.wood));
    const boss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8),
      mat.metal,
    );
    boss.rotation.x = Math.PI / 2;
    hub.add(boss);
    model.add(hub);
    props.push(hub);
    // Shaft and chain guard back from the engine.
    model.add(rod(v(0.65, 0.5, -0.4), v(x, 0.95, -1.28), 0.02, mat.metal));
  }
  const wireGeo = new THREE.BufferGeometry();
  wireGeo.setAttribute("position", new THREE.Float32BufferAttribute(wires, 3));
  model.add(new THREE.LineSegments(wireGeo, mat.wire));
  return { model, props };
}

interface FlyerRigProps {
  rigRef: RefObject<THREE.Group | null>;
}

/**
 * Mounts the Flyer. The rig group is posed by `CameraRig` (perched over
 * the pad, or flown); this component owns the geometry, the palette and
 * the propellers.
 */
export function FlyerRig({ rigRef }: FlyerRigProps) {
  const palette = useSim((s) => s.palette);
  const mode = useSim((s) => s.mode);
  const reducedMotion = useSim((s) => s.reducedMotion);

  const built = useMemo(() => {
    const materials: Materials = {
      fabric: new THREE.MeshStandardMaterial({
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      wood: new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0 }),
      metal: new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3 }),
      wire: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.55 }),
    };
    return { materials, ...buildFlyer(materials) };
  }, []);

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    const m = built.materials;
    toColor(palette.snow, m.fabric.color);
    m.fabric.emissive.copy(m.fabric.color);
    m.fabric.emissiveIntensity = night ? 0.08 : 0;
    // Spruce: the amber hue pulled toward the text tone.
    toColor(palette["hue-amber"], m.wood.color).lerp(
      toColor(palette.text),
      0.45,
    );
    toColor(palette.text, m.metal.color);
    toColor(palette.text, m.wire.color);
  }, [palette, built]);

  useEffect(() => {
    return () => {
      built.model.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
        }
      });
      for (const m of Object.values(built.materials)) m.dispose();
    };
  }, [built]);

  useFrame((state, dt) => {
    if (reducedMotion) return;
    const rate = mode === "flying" ? PROP_FLYING : PROP_IDLE;
    built.props.forEach((p, i) => {
      p.rotation.z += (i === 0 ? rate : -rate) * dt;
    });
    // Hung over the pad, it turns and sways gently on its cables.
    const rig = rigRef.current;
    if (rig && mode !== "flying" && mode !== "returning") {
      const t = state.clock.elapsedTime;
      rig.position.copy(FLYER_PERCH);
      rig.rotation.set(
        Math.sin(t * 0.5) * 0.02,
        t * PERCH_SPIN,
        Math.sin(t * 0.37) * PERCH_SWAY * 0.25,
        "YXZ",
      );
    }
  });

  return (
    <group ref={rigRef} position={FLYER_PERCH}>
      <primitive object={built.model} />
    </group>
  );
}
