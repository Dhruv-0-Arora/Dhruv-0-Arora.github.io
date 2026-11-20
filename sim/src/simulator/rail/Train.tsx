import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { RailPath } from "../controls/railPath.ts";
import { frame, useSim } from "../simStore.ts";
import type { Rgba } from "../theme/palette.ts";
import type { Vec3 } from "../world/meta.ts";
import { RAIL, TRAIN } from "./railStyle.ts";
import { carOffsets, quaternionAlong, railPoint, wrapT } from "./railTrack.ts";

/**
 * The train the visitor rides: open observation cars on the rail, the
 * camera seated in the lead car. It sits at `frame.railT`, the same
 * parameter the camera follows, so it waits on the track while the Dozer
 * or the Flyer is out and is there when the camera glides back.
 */

function toColor(rgb: Rgba, out = new THREE.Color()): THREE.Color {
  return out.setRGB(rgb.r, rgb.g, rgb.b, THREE.SRGBColorSpace);
}

interface Materials {
  body: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
  lamp: THREE.MeshStandardMaterial;
  tail: THREE.MeshStandardMaterial;
}

interface Car {
  group: THREE.Group;
  wheels: THREE.Mesh[];
}

function shadowed<T extends THREE.Mesh>(m: T): T {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  geometries: THREE.BufferGeometry[],
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  geometries.push(geo);
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  return shadowed(m);
}

function buildCar(
  mat: Materials,
  shared: { wheel: THREE.BufferGeometry; rail: THREE.BufferGeometry },
  geometries: THREE.BufferGeometry[],
  lead: boolean,
  last: boolean,
): Car {
  const g = new THREE.Group();
  const { length: L, width: W } = TRAIN.car;
  const floor = TRAIN.floor;
  const wallTop = floor + TRAIN.wall;
  // Floor and the low side and end walls of an open car.
  g.add(box(W, 0.1, L, 0, floor - 0.05, 0, mat.body, geometries));
  for (const s of [-1, 1]) {
    g.add(
      box(
        0.06,
        TRAIN.wall,
        L,
        s * (W / 2 - 0.03),
        floor + TRAIN.wall / 2,
        0,
        mat.body,
        geometries,
      ),
    );
    const top = new THREE.Mesh(shared.rail, mat.frame);
    top.position.set(s * (W / 2 - 0.03), wallTop + 0.03, 0);
    g.add(shadowed(top));
    // Bench along each wall.
    g.add(
      box(
        0.42,
        0.08,
        L - 0.5,
        s * (W / 2 - 0.28),
        floor + 0.42,
        0,
        mat.wood,
        geometries,
      ),
    );
  }
  for (const s of [-1, 1]) {
    g.add(
      box(
        W,
        TRAIN.wall,
        0.06,
        0,
        floor + TRAIN.wall / 2,
        s * (L / 2 - 0.03),
        mat.body,
        geometries,
      ),
    );
  }
  // Bogies and wheels.
  const wheels: THREE.Mesh[] = [];
  for (const z of TRAIN.axles) {
    g.add(
      box(
        RAIL.gauge + 0.3,
        0.16,
        0.7,
        0,
        floor - 0.28,
        z,
        mat.frame,
        geometries,
      ),
    );
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(shared.wheel, mat.frame);
      w.position.set((s * RAIL.gauge) / 2, TRAIN.wheelRadius + 0.02, z);
      g.add(shadowed(w));
      wheels.push(w);
    }
  }
  // Coupler to the car behind.
  if (!last) {
    g.add(
      box(
        0.1,
        0.1,
        TRAIN.car.gap + 0.1,
        0,
        floor - 0.2,
        -L / 2 - TRAIN.car.gap / 2,
        mat.frame,
        geometries,
      ),
    );
  }
  if (lead) {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 10),
      mat.lamp,
    );
    geometries.push(lamp.geometry);
    lamp.position.set(0, floor + 0.3, L / 2 + 0.04);
    g.add(lamp);
  }
  if (last) {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8),
      mat.tail,
    );
    geometries.push(lamp.geometry);
    lamp.position.set(0, floor + 0.3, -L / 2 - 0.04);
    g.add(lamp);
  }
  return { group: g, wheels };
}

function build() {
  const materials: Materials = {
    body: new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.1 }),
    frame: new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.6 }),
    wood: new THREE.MeshStandardMaterial({ roughness: 0.8 }),
    lamp: new THREE.MeshStandardMaterial({ roughness: 0.4 }),
    tail: new THREE.MeshStandardMaterial({ roughness: 0.4 }),
  };
  const geometries: THREE.BufferGeometry[] = [];
  const wheel = new THREE.CylinderGeometry(
    TRAIN.wheelRadius,
    TRAIN.wheelRadius,
    TRAIN.wheelWidth,
    16,
  );
  wheel.rotateZ(Math.PI / 2);
  const rail = new THREE.CylinderGeometry(0.03, 0.03, TRAIN.car.length, 8);
  rail.rotateX(Math.PI / 2);
  geometries.push(wheel, rail);
  const group = new THREE.Group();
  group.name = "train";
  const cars: Car[] = [];
  for (let k = 0; k < TRAIN.cars; k++) {
    const car = buildCar(
      materials,
      { wheel, rail },
      geometries,
      k === 0,
      k === TRAIN.cars - 1,
    );
    group.add(car.group);
    cars.push(car);
  }
  return { group, cars, materials, geometries };
}

export function Train({ rail }: { rail: RailPath }) {
  const palette = useSim((s) => s.palette);
  const built = useMemo(() => build(), []);
  const offsets = useMemo(
    () => carOffsets(TRAIN.cars, TRAIN.car.length, TRAIN.car.gap),
    [],
  );
  const lastT = useRef<number | null>(null);
  const scratch = useMemo<{ v: Vec3; p: THREE.Vector3 }>(
    () => ({ v: [0, 0, 0], p: new THREE.Vector3() }),
    [],
  );

  useEffect(() => {
    if (!palette) return;
    const night = palette.bg.r < 0.5;
    const m = built.materials;
    // Coachwork in a deep accent green, ironwork dark, benches in pale wood.
    toColor(palette.accent, m.body.color).lerp(toColor(palette.text), 0.3);
    toColor(palette.text, m.frame.color).lerp(toColor(palette.muted), 0.3);
    toColor(palette["hue-amber"], m.wood.color).lerp(
      toColor(night ? palette.text : palette["surface-2"]),
      night ? 0.25 : 0.5,
    );
    toColor(palette["hue-amber"], m.lamp.color);
    m.lamp.emissive.copy(m.lamp.color);
    m.lamp.emissiveIntensity = night ? 1.2 : 0.35;
    toColor(palette["hue-rose"], m.tail.color);
    m.tail.emissive.copy(m.tail.color);
    m.tail.emissiveIntensity = night ? 1.0 : 0.3;
  }, [palette, built]);

  useEffect(() => {
    return () => {
      for (const g of built.geometries) g.dispose();
      for (const m of Object.values(built.materials)) m.dispose();
    };
  }, [built]);

  useFrame(() => {
    const t = frame.railT;
    const head = t + TRAIN.headOffset / rail.length;
    built.cars.forEach((car, k) => {
      const tk = wrapT(head - offsets[k] / rail.length, rail.closed);
      railPoint(rail, tk, RAIL.drop, scratch.p, scratch.v);
      car.group.position.copy(scratch.p);
      quaternionAlong(rail.tangentAt(tk, scratch.v), car.group.quaternion);
    });
    // Wheels turn with the distance travelled.
    if (lastT.current !== null) {
      let dt = t - lastT.current;
      if (rail.closed && Math.abs(dt) > 0.5) dt -= Math.sign(dt);
      const spin = (dt * rail.length) / TRAIN.wheelRadius;
      for (const car of built.cars) {
        for (const w of car.wheels) w.rotation.x += spin;
      }
    }
    lastT.current = t;
  });

  return <primitive object={built.group} />;
}
