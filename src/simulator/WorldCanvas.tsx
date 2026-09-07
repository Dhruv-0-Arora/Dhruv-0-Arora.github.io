import { Canvas } from "@react-three/fiber";
import {
  Suspense,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type * as THREE from "three";
import { useCanvasActive } from "../lib/useCanvasActive";
import { CameraRig } from "./controls/CameraRig.tsx";
import { DozerRig } from "./dozer/DozerRig.tsx";
import { FlyerRig } from "./flyer/FlyerRig.tsx";
import { sim } from "./simStore.ts";
import { useRetint } from "./theme/useRetint.ts";
import type { District, ZoneSlug } from "./world/contract.ts";
import { heightGridFromObject } from "./world/heightGrid.ts";
import { BambooGrove } from "./world/instancing/BambooGrove.tsx";
import { CameraFrusta } from "./world/instancing/CameraFrusta.tsx";
import { Candlesticks } from "./world/instancing/Candlesticks.tsx";
import { Climbers } from "./world/instancing/Climbers.tsx";
import { Conifers } from "./world/instancing/Conifers.tsx";
import { HexGround } from "./world/instancing/HexGround.tsx";
import { IMC_SHAPE, KERMS_SHAPE } from "./world/instancing/ohlc.ts";
import { PhotoCarousel } from "./world/instancing/PhotoCarousel.tsx";
import { ZoneScreen } from "./world/instancing/ZoneScreen.tsx";
import {
  DISTRICT_HINTS,
  districtLoadOrder,
  type LoadedDistrict,
  loadDistrict,
  loadWorldBase,
} from "./world/loadWorld.ts";
import { SkyDome } from "./world/SkyDome.tsx";
import { SunLight } from "./world/SunLight.tsx";
import { Terrain } from "./world/terrain/Terrain.tsx";
import { ZONE_SCREENS } from "./world/zoneScreens.ts";

function WorldScene() {
  const world = use(loadWorldBase());
  const dozerRef = useRef<THREE.Group>(null);
  const flyerRef = useRef<THREE.Group>(null);
  const [districts, setDistricts] = useState<LoadedDistrict[]>([]);
  const [instanced, setInstanced] = useState<LoadedDistrict[]>([]);
  useRetint(world.registry);
  const zone = (slug: ZoneSlug) =>
    world.meta.zones.find((z) => z.slug === slug);
  const dirnt = zone("dirnt");
  const cypher = zone("cypher");
  const altigoz = zone("altigoz");
  const kerms = zone("kerms");
  const imc = zone("imc-prosperity-4");

  // Runtime instancers register as cullable entries of their district.
  const register = useCallback(
    (district: District) => (group: THREE.Group, center: THREE.Vector3) => {
      setInstanced((prev) =>
        prev.some((d) => d.group === group)
          ? prev
          : [...prev, { district, group, center }],
      );
    },
    [],
  );
  const onTerminal = useMemo(() => register("terminal"), [register]);
  const onEvidence = useMemo(() => register("evidence"), [register]);
  const onBackdrop = useMemo(() => register("backdrop"), [register]);
  const onShared = useMemo(() => register("shared"), [register]);
  const onFabrication = useMemo(() => register("fabrication"), [register]);
  const backdrop = districts.find((d) => d.district === "backdrop")?.group;
  // The flight floor: a coarse polar heightmap of the range, built once.
  const terrain = useMemo(
    () => (backdrop ? heightGridFromObject(backdrop, 200, 480) : null),
    [backdrop],
  );

  useEffect(() => {
    sim.set({ worldReady: true });
    return () => sim.set({ worldReady: false });
  }, []);

  // Stream the other districts nearest-first from the hub.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const district of districtLoadOrder(
        DISTRICT_HINTS.shared,
        DISTRICT_HINTS,
      )) {
        if (cancelled) return;
        sim.set({ loading: district });
        try {
          const loaded = await loadDistrict(district, world.registry);
          if (cancelled) return;
          setDistricts((prev) => [...prev, loaded]);
          sim.set({ loaded: [...sim.get().loaded, district], loading: null });
        } catch (err) {
          console.error(`[world] failed to load ${district}`, err);
          sim.set({ loading: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [world]);

  return (
    <>
      <SkyDome />
      <SunLight />
      <primitive object={world.shared.group} />
      {districts.map((d) => (
        <primitive key={d.district} object={d.group} />
      ))}
      {dirnt ? <BambooGrove zone={dirnt} onMount={onTerminal} /> : null}
      {cypher ? <HexGround zone={cypher} onMount={onEvidence} /> : null}
      {altigoz ? <CameraFrusta zone={altigoz} onMount={onEvidence} /> : null}
      {kerms ? (
        <Candlesticks
          zone={kerms}
          shape={KERMS_SHAPE}
          name="evidence.kerms"
          onMount={onEvidence}
        />
      ) : null}
      {imc ? (
        <Candlesticks
          zone={imc}
          shape={IMC_SHAPE}
          name="evidence.imc"
          onMount={onEvidence}
        />
      ) : null}
      {world.meta.routes.length > 0 ? (
        <Climbers routes={world.meta.routes} onMount={onBackdrop} />
      ) : null}
      {backdrop ? <Terrain backdrop={backdrop} /> : null}
      {backdrop ? <Conifers backdrop={backdrop} onMount={onBackdrop} /> : null}
      <FlyerRig rigRef={flyerRef} />
      <PhotoCarousel onMount={onShared} />
      {ZONE_SCREENS.map((spec) => {
        const anchor = zone(spec.zone);
        return anchor ? (
          <ZoneScreen
            key={spec.zone}
            zone={anchor}
            spec={spec}
            onMount={onFabrication}
          />
        ) : null;
      })}
      <Suspense fallback={null}>
        <DozerRig rigRef={dozerRef} />
      </Suspense>
      <CameraRig
        world={world}
        districts={[world.shared, ...districts, ...instanced]}
        dozerRef={dozerRef}
        flyerRef={flyerRef}
        terrain={terrain}
      />
    </>
  );
}

export default function WorldCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useCanvasActive(containerRef);

  return (
    <div ref={containerRef} className="h-full w-full cursor-grab">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        shadows="soft"
        camera={{ fov: 50, near: 0.3, far: 1000, position: [0, 12, 40] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <WorldScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
