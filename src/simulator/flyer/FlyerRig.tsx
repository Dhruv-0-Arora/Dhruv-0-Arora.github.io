import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSim } from "../simStore.ts";
import type { Rgba } from "../theme/palette.ts";
import {
  bladeGeometry,
  paintFabric,
  surfaceGeometry,
} from "./flyerGeometry.ts";

/**
 * The Flyer: the 1903 Wright machine at life size (12.3 m span, 6.4 m
 * long), built from primitives and two generated surfaces. Cambered muslin
 * wings with rib pockets and drooping tips, spruce struts with crossed
 * bracing in every bay, the biplane elevator out front on the skid
 * outriggers, twin rudders on the tail booms, the four-cylinder engine
 * lying on its side right of centre with its flywheel and radiator, chain
 * drives in their tubes (the left one crossed) to two counter-rotating
 * twisted pusher propellers, and the pilot prone in the hip cradle on the
 * left. It hangs over the spawn pad like the original hangs in the
 * Smithsonian, props idling, until someone presses T. Nose points +z in
 * its own frame, the same convention as the Dozer and the flight model.
 */

export const FLYER_PERCH = new THREE.Vector3(0, 10.5, 0);
const PERCH_SPIN = 0.09;
const PERCH_SWAY = 0.12;
const PROP_IDLE = 0.8;
const PROP_FLYING = 38;

const SPAN = 12.3;
const CHORD = 2.0;
const GAP = 1.85;
const RIB = 0.3;
const LE = CHORD / 2;
const TE = -CHORD / 2;
const SPAR_F = LE - 0.06;
const SPAR_R = TE + 0.08;
const STRUT_X = [-5.9, -4.4, -2.95, -1.5, 0, 1.5, 2.95, 4.4, 5.9];
const STRUT_Z = [SPAR_F, SPAR_R];
const SKID_X = 1.2;
const SKID_Y = -0.78;
const PROP_X = 1.55;
const PROP_Y = 0.95;
const PROP_Z = -1.4;
const ENGINE = new THREE.Vector3(0.55, 0.3, -0.15);
const SPROCKET = new THREE.Vector3(0.55, 0.3, -0.82);

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

interface Materials {
  fabric: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  cloth: THREE.MeshStandardMaterial;
  wire: THREE.LineBasicMaterial;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function shadowed<T extends THREE.Mesh>(m: T): T {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function box(
  w: number,
  h: number,
  d: number,
  at: THREE.Vector3,
  material: THREE.Material,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.copy(at);
  return shadowed(m);
}

/** A strut or boom between two points; `flat` widens it along z. */
function rod(
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  material: THREE.Material,
  flat = 1,
): THREE.Mesh {
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(r, r, len, 8);
  if (flat !== 1) geo.scale(1, 1, flat);
  const m = new THREE.Mesh(geo, material);
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.clone().sub(a).normalize(),
  );
  return shadowed(m);
}

function cylinder(
  r: number,
  len: number,
  at: THREE.Vector3,
  axis: "x" | "y" | "z",
  material: THREE.Material,
  segments = 12,
): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, len, segments),
    material,
  );
  if (axis === "x") m.rotation.z = Math.PI / 2;
  if (axis === "z") m.rotation.x = Math.PI / 2;
  m.position.copy(at);
  return shadowed(m);
}

function tube(
  points: THREE.Vector3[],
  r: number,
  material: THREE.Material,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  return shadowed(
    new THREE.Mesh(new THREE.TubeGeometry(curve, 28, r, 7, false), material),
  );
}

/** Both fabric surfaces of a biplane cell with their spars. */
function wings(model: THREE.Group, mat: Materials) {
  const geo = surfaceGeometry({
    span: SPAN,
    chord: CHORD,
    camber: 0.1,
    peakAt: 0.3,
    droop: 0.14,
    tipRound: 0.7,
    ribPitch: RIB,
    segmentsSpan: 56,
    segmentsChord: 10,
  });
  for (const y of [0, GAP]) {
    const wing = shadowed(new THREE.Mesh(geo, mat.fabric));
    wing.position.y = y;
    model.add(wing);
    // Spars follow the droop: a few straight pieces along each edge.
    const pieces = 6;
    for (let i = 0; i < pieces; i++) {
      const x0 = -SPAN / 2 + (SPAN * i) / pieces;
      const x1 = -SPAN / 2 + (SPAN * (i + 1)) / pieces;
      const d = (x: number) => -0.14 * (Math.abs(x) / (SPAN / 2)) ** 2;
      model.add(
        rod(
          v(x0, y + d(x0) + 0.01, SPAR_F),
          v(x1, y + d(x1) + 0.01, SPAR_F),
          0.032,
          mat.wood,
        ),
      );
      model.add(
        rod(v(x0, y + d(x0), SPAR_R), v(x1, y + d(x1), SPAR_R), 0.02, mat.wood),
      );
    }
  }
}

function struts(model: THREE.Group, mat: Materials, wires: number[]) {
  const droop = (x: number) => -0.14 * (Math.abs(x) / (SPAN / 2)) ** 2;
  for (const z of STRUT_Z) {
    for (const x of STRUT_X) {
      const y0 = droop(x);
      model.add(rod(v(x, y0, z), v(x, y0 + GAP, z), 0.024, mat.wood, 1.7));
      // Metal fittings at both ends.
      model.add(box(0.07, 0.05, 0.09, v(x, y0 + 0.03, z), mat.metal));
      model.add(box(0.07, 0.05, 0.09, v(x, y0 + GAP - 0.03, z), mat.metal));
    }
    // Crossed flying wires in every bay.
    for (let i = 0; i + 1 < STRUT_X.length; i++) {
      const a = STRUT_X[i];
      const b = STRUT_X[i + 1];
      wires.push(a, droop(a), z, b, droop(b) + GAP, z);
      wires.push(a, droop(a) + GAP, z, b, droop(b), z);
    }
  }
  // Drag wires in the plane of each wing, front spar to rear spar.
  for (const y of [0, GAP]) {
    for (let i = 0; i + 1 < STRUT_X.length; i++) {
      const a = STRUT_X[i];
      const b = STRUT_X[i + 1];
      wires.push(a, y + droop(a), SPAR_F, b, y + droop(b), SPAR_R);
      wires.push(a, y + droop(a), SPAR_R, b, y + droop(b), SPAR_F);
    }
  }
}

function skids(model: THREE.Group, mat: Materials) {
  for (const s of [-1, 1]) {
    const x = s * SKID_X;
    model.add(
      tube(
        [
          v(x, SKID_Y, -1.9),
          v(x, SKID_Y, 0.4),
          v(x, SKID_Y, 1.8),
          v(x, SKID_Y + 0.12, 3.0),
          v(x, SKID_Y + 0.5, 3.85),
        ],
        0.035,
        mat.wood,
      ),
    );
    // Uprights to the spars and the forward diagonal.
    model.add(rod(v(x, SKID_Y, SPAR_R), v(x, 0, SPAR_R), 0.022, mat.wood));
    model.add(rod(v(x, SKID_Y, SPAR_F), v(x, 0, SPAR_F), 0.022, mat.wood));
    model.add(rod(v(x, SKID_Y + 0.05, 2.6), v(x, 0, SPAR_F), 0.02, mat.wood));
    model.add(rod(v(x, SKID_Y, -1.5), v(x, 0, SPAR_R), 0.02, mat.wood));
  }
  // Cross members tying the skids together.
  model.add(
    rod(
      v(-SKID_X, SKID_Y + 0.02, 3.2),
      v(SKID_X, SKID_Y + 0.02, 3.2),
      0.02,
      mat.wood,
    ),
  );
  model.add(
    rod(
      v(-SKID_X, SKID_Y + 0.02, -1.6),
      v(SKID_X, SKID_Y + 0.02, -1.6),
      0.02,
      mat.wood,
    ),
  );
}

/** The biplane elevator out front, pivoting on the skid outriggers. */
function canard(model: THREE.Group, mat: Materials, wires: number[]) {
  const CZ = 3.2;
  const geo = surfaceGeometry({
    span: 4.6,
    chord: 0.85,
    camber: 0.03,
    peakAt: 0.35,
    droop: 0,
    tipRound: 0.35,
    ribPitch: RIB,
    segmentsSpan: 24,
    segmentsChord: 6,
  });
  const levels = [0.08, 0.86];
  for (const y of levels) {
    const s = shadowed(new THREE.Mesh(geo, mat.fabric));
    s.position.set(0, y, CZ);
    model.add(s);
    model.add(rod(v(-2.3, y, CZ + 0.38), v(2.3, y, CZ + 0.38), 0.02, mat.wood));
  }
  for (const x of [-1.9, -0.6, 0.6, 1.9]) {
    model.add(
      rod(v(x, levels[0], CZ), v(x, levels[1], CZ), 0.018, mat.wood, 1.5),
    );
  }
  for (const s of [-1, 1]) {
    const x = s * SKID_X;
    // Pivot post from the skid tip, and the diagonals from both wings.
    model.add(
      rod(v(x, SKID_Y + 0.5, 3.85), v(x, levels[0], CZ + 0.2), 0.022, mat.wood),
    );
    model.add(
      rod(v(x * 0.75, 0, LE), v(x * 0.75, levels[1], CZ - 0.2), 0.02, mat.wood),
    );
    model.add(
      rod(
        v(x * 0.75, GAP, LE),
        v(x * 0.75, levels[1], CZ + 0.1),
        0.02,
        mat.wood,
      ),
    );
    wires.push(x * 0.75, levels[0], CZ, x * 0.75, GAP, LE);
  }
}

/** Twin rudders hung between the tail booms. */
function rudders(model: THREE.Group, mat: Materials, wires: number[]) {
  const RZ = -3.4;
  const geo = surfaceGeometry({
    span: 1.75,
    chord: 0.62,
    camber: 0,
    peakAt: 0.4,
    droop: 0,
    tipRound: 0.3,
    ribPitch: RIB,
    segmentsSpan: 8,
    segmentsChord: 4,
  });
  const yLo = 0.15;
  const yHi = 1.9;
  for (const x of [-0.36, 0.36]) {
    const fin = shadowed(new THREE.Mesh(geo, mat.fabric));
    fin.rotation.z = Math.PI / 2;
    fin.position.set(x, (yLo + yHi) / 2, RZ);
    model.add(fin);
    model.add(rod(v(x, yLo, RZ + 0.28), v(x, yHi, RZ + 0.28), 0.018, mat.wood));
  }
  for (const x of [-0.55, 0.55]) {
    model.add(rod(v(x, yLo, RZ), v(x, yHi, RZ), 0.02, mat.wood));
  }
  model.add(rod(v(-0.6, yLo, RZ), v(0.6, yLo, RZ), 0.018, mat.wood));
  model.add(rod(v(-0.6, yHi, RZ), v(0.6, yHi, RZ), 0.018, mat.wood));
  for (const s of [-1, 1]) {
    const xb = s * 0.55;
    model.add(rod(v(s * 1.5, 0, SPAR_R), v(xb, yLo, RZ), 0.02, mat.wood));
    model.add(rod(v(s * 1.5, GAP, SPAR_R), v(xb, yHi, RZ), 0.02, mat.wood));
    model.add(
      rod(v(s * SKID_X, SKID_Y, -1.9), v(xb, yLo, RZ), 0.016, mat.wood),
    );
    wires.push(s * 1.5, 0, SPAR_R, xb, yHi, RZ);
    wires.push(s * 1.5, GAP, SPAR_R, xb, yLo, RZ);
  }
}

/** The horizontal four, its flywheel, radiator, tank and the chain drives. */
function engine(model: THREE.Group, mat: Materials) {
  model.add(box(0.3, 0.3, 0.95, ENGINE, mat.metal));
  // Cylinders point out to the right, finned.
  for (let i = 0; i < 4; i++) {
    const z = ENGINE.z + 0.36 - i * 0.24;
    const c = v(ENGINE.x + 0.28, ENGINE.y + 0.02, z);
    model.add(cylinder(0.055, 0.28, c, "x", mat.metal, 10));
    for (let f = 0; f < 4; f++) {
      model.add(
        cylinder(
          0.075,
          0.012,
          v(c.x - 0.09 + f * 0.06, c.y, z),
          "x",
          mat.metal,
          12,
        ),
      );
    }
  }
  // Crankshaft bearers, flywheel and sprocket at the rear.
  model.add(
    cylinder(
      0.24,
      0.05,
      v(ENGINE.x, ENGINE.y, ENGINE.z - 0.52),
      "z",
      mat.metal,
      24,
    ),
  );
  model.add(cylinder(0.09, 0.03, SPROCKET, "z", mat.metal, 16));
  // Radiator on the front strut right of centre, and the tank under the top wing.
  model.add(box(0.07, 0.8, 0.32, v(1.32, 0.95, 0.55), mat.metal));
  model.add(rod(v(1.32, 1.35, 0.55), v(1.5, GAP, SPAR_F), 0.012, mat.metal));
  model.add(cylinder(0.07, 0.4, v(0.35, GAP - 0.28, 0.25), "z", mat.metal, 12));
  model.add(
    rod(v(0.35, GAP - 0.21, 0.12), v(0.35, GAP, 0.12), 0.01, mat.metal),
  );
  model.add(
    rod(v(0.35, GAP - 0.21, 0.38), v(0.35, GAP, 0.38), 0.01, mat.metal),
  );
  // Chains in their tubes: two runs each, the left pair crossed.
  for (const s of [-1, 1]) {
    const hub = v(s * PROP_X, PROP_Y, PROP_Z);
    const dir = hub.clone().sub(SPROCKET).normalize();
    const side = new THREE.Vector3(0, 0, 1)
      .cross(dir)
      .normalize()
      .multiplyScalar(0.055);
    const crossed = s < 0 ? -1 : 1;
    model.add(
      rod(
        SPROCKET.clone().add(side),
        hub.clone().add(side.clone().multiplyScalar(crossed)),
        0.014,
        mat.metal,
      ),
    );
    model.add(
      rod(
        SPROCKET.clone().sub(side),
        hub.clone().sub(side.clone().multiplyScalar(crossed)),
        0.014,
        mat.metal,
      ),
    );
    model.add(cylinder(0.08, 0.03, hub, "z", mat.metal, 16));
  }
}

/** Prone pilot in the hip cradle on the left, head forward. */
function pilot(model: THREE.Group, mat: Materials) {
  const px = -0.58;
  model.add(box(0.5, 0.06, 0.55, v(px, 0.12, 0.05), mat.wood));
  model.add(box(0.06, 0.16, 0.55, v(px - 0.25, 0.2, 0.05), mat.wood));
  model.add(box(0.06, 0.16, 0.55, v(px + 0.25, 0.2, 0.05), mat.wood));
  const torso = shadowed(
    new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.5, 4, 10), mat.cloth),
  );
  torso.rotation.x = Math.PI / 2;
  torso.position.set(px, 0.3, 0.12);
  model.add(torso);
  const head = shadowed(
    new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mat.cloth),
  );
  head.position.set(px, 0.34, 0.62);
  model.add(head);
  for (const dx of [-0.08, 0.08]) {
    const leg = shadowed(
      new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.62, 4, 8), mat.cloth),
    );
    leg.rotation.x = Math.PI / 2;
    leg.position.set(px + dx, 0.24, -0.6);
    model.add(leg);
    const arm = shadowed(
      new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.4, 4, 8), mat.cloth),
    );
    arm.rotation.x = Math.PI / 2 - 0.3;
    arm.position.set(px + dx * 2.6, 0.26, 0.55);
    model.add(arm);
  }
  // Elevator lever by the right hand.
  model.add(
    rod(v(px + 0.3, 0.05, 0.6), v(px + 0.32, 0.45, 0.78), 0.012, mat.wood),
  );
}

/** The pusher propellers on their shaft mounts, returned for spinning. */
function propellers(model: THREE.Group, mat: Materials): THREE.Group[] {
  const blade = bladeGeometry({
    radius: 1.28,
    rootRadius: 0.12,
    pitch: 2.4,
    chord: 0.24,
  });
  const props: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const hub = v(s * PROP_X, PROP_Y, PROP_Z);
    const p = new THREE.Group();
    p.position.copy(hub);
    for (const k of [0, 1]) {
      const b = shadowed(new THREE.Mesh(blade, mat.wood));
      b.rotation.z = k * Math.PI;
      p.add(b);
    }
    const boss = shadowed(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10),
        mat.metal,
      ),
    );
    boss.rotation.x = Math.PI / 2;
    p.add(boss);
    model.add(p);
    props.push(p);
    // Shaft bearers to the rear spars.
    model.add(rod(v(s * PROP_X, 0, SPAR_R), hub, 0.016, mat.metal));
    model.add(rod(v(s * PROP_X, GAP, SPAR_R), hub, 0.016, mat.metal));
    model.add(rod(v(s * 2.95, 0, SPAR_R), hub, 0.012, mat.metal));
  }
  return props;
}

function buildFlyer(mat: Materials) {
  const model = new THREE.Group();
  model.name = "flyer";
  const wires: number[] = [];
  wings(model, mat);
  struts(model, mat, wires);
  skids(model, mat);
  canard(model, mat, wires);
  rudders(model, mat, wires);
  engine(model, mat);
  pilot(model, mat);
  const props = propellers(model, mat);
  const wireGeo = new THREE.BufferGeometry();
  wireGeo.setAttribute("position", new THREE.Float32BufferAttribute(wires, 3));
  model.add(new THREE.LineSegments(wireGeo, mat.wire));
  return { model, props };
}

function fabricTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) paintFabric(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  return tex;
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
    const fabric = fabricTexture();
    const materials: Materials = {
      fabric: new THREE.MeshStandardMaterial({
        map: fabric,
        bumpMap: fabric,
        bumpScale: 0.6,
        roughness: 0.92,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      wood: new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0 }),
      metal: new THREE.MeshStandardMaterial({
        roughness: 0.42,
        metalness: 0.65,
      }),
      cloth: new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 }),
      wire: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 }),
    };
    return { materials, fabric, ...buildFlyer(materials) };
  }, []);

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    const m = built.materials;
    // Unbleached muslin: the snow tone warmed a touch toward amber.
    toColor(palette.snow, m.fabric.color).lerp(
      toColor(palette["hue-amber"]),
      night ? 0.04 : 0.07,
    );
    m.fabric.emissive.copy(m.fabric.color);
    m.fabric.emissiveIntensity = night ? 0.1 : 0;
    // Varnished spruce: amber pulled toward the warm surface tone by day
    // (a pale tan), toward the text tone at night.
    toColor(
      night ? palette["hue-amber"] : palette["hue-amber-vivid"],
      m.wood.color,
    ).lerp(
      toColor(night ? palette.text : palette["surface-2"]),
      night ? 0.25 : 0.45,
    );
    // Cast iron and aluminium: a dark grey rather than the text black.
    toColor(palette.text, m.metal.color).lerp(toColor(palette.muted), 0.5);
    toColor(palette.text, m.cloth.color).lerp(toColor(palette.muted), 0.15);
    toColor(palette.text, m.wire.color);
  }, [palette, built]);

  useEffect(() => {
    return () => {
      const seen = new Set<THREE.BufferGeometry>();
      built.model.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          seen.add(obj.geometry);
        }
      });
      for (const g of seen) g.dispose();
      for (const m of Object.values(built.materials)) m.dispose();
      built.fabric.dispose();
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
