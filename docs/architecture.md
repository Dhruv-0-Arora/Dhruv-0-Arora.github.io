# Architecture

The site is a single React page that is, for capable browsers, a full-viewport explorable 3D world ("The Simulator").
Everyone else gets the earlier static portfolio page.

## Repository layout

```
assets/blender/            world authoring: contract.json, world.blend, scripts/
assets/gallery/            (untracked) photo originals for scripts/build-media.ts
  scripts/worldlib.py      shared helpers and the world layout (centers, rail, looks, zone radii)
  scripts/sessions/NN_*.py numbered build sessions; run in order to recreate world.blend
  scripts/lint_scene.py    contract lint, run inside Blender
  scripts/export_world.py  headless export to glbs + meta.json
  scripts/review.py        renders cam.review.* cameras for checkpoints
  scripts/make_fixture.py  minimal valid scene for the pipeline test
scripts/                   build-world.ts, optimize-glb.ts, world-budgets.ts, build-media.ts (Node, not bun)
public/world/              committed build output: one glb per district + meta.json
public/gallery/, media/    carousel photos and zone screen clips, built from originals
public/models/dozer.mira   the vehicle, parsed live in the browser
src/simulator/             the simulator (see below)
src/components/            the static page sections, reused as the fallback
src/content/               all copy, typed data modules; components never hard-code text
src/mirabuf/               .mira parser and robot builder (visual-only port of Synthesis Fission)
src/lib/                   theme store, capability hooks
```

Untracked local material (excluded in `.git/info/exclude`): the content corpus in `data/`, agent instructions, planning notes.
Nothing in tracked files may depend on them.

## Runtime flow

1. `SimulatorRoot` decides capability: `simulator`, or `reduced-motion` (static page with an "enter anyway" button), `narrow` (<380px) and `no-webgl` (static page).
2. `SimulatorShell` mounts DOM listeners (`useInputs`), a fixed full-viewport canvas layer, a tall scroll spacer (14 screens = one loop of the rail), the `HUD`, the `ProjectDock`, and a screen-reader-only project list.
3. `WorldCanvas` (lazy, in the `three` chunk) loads `meta.json` and `shared.glb` plus the Dozer, then streams the other districts nearest-first (the `backdrop` ring first, since its center is the hub) and mounts the runtime instancers, the sky dome and the sun.
4. `CameraRig` is the frame loop: integrates the drive model, places the camera for the current mode, runs zone proximity, culls districts by distance (320 m, never the backdrop), respawns the Dozer if it leaves the collision ground, samples stats.
5. `useRetint` reads `--c-*` custom properties from the DOM on every theme change and repaints every world material and the background over 200 ms; `SkyDome` lerps its own colors on the same clock and paints the fog color to match its horizon.

## State

- `simStore.ts` holds React-visible state (`mode`, `zone`, readiness, `palette`, `signalLost`, stats) behind `useSyncExternalStore`, and a mutable `frame` object for per-frame values (scroll t, pointer, drive input, probe position) that never re-render React.
- Control mode is a pure transition table in `controlMachine.ts`: `rails` (scroll drives the camera) -> `driving` (F) -> `returning` (Escape) -> `rails`.
- Driving is unavailable on touch-only devices and until the world and Dozer are loaded.

## Pure cores, all unit tested

| Module | Responsibility |
|---|---|
| `controls/railPath.ts` | arc-length rail, eased look targets |
| `controls/dragLook.ts` | click-and-drag look offset with coasting and recentering |
| `controls/devCamera.ts` | development-only fixed camera from `?cam=&at=&fov=` |
| `world/terrain/terrainField.ts` | treeline and forest weight, mirrored in the terrain shader |
| `controls/driveController.ts` | fixed 120 Hz substeps, circle-vs-AABB push-out, ground follow |
| `proximity/proximity.ts` | one active zone, 1.25r exit hysteresis, handover to a closer overlapping zone |
| `theme/palette.ts`, `retint.ts`, `oklab.ts` | CSS color parsing, material-name binding, lerped repaint, Oklab gradients |
| `world/contract.ts`, `meta.ts` | typed contract, validation of the exported meta |
| `world/instancing/hexGrid.ts`, `ohlc.ts` | deterministic layouts for the instancers |

## Runtime instancers

`src/simulator/world/instancing/` holds one component per repetitive or animated field, anchored on a zone, a route or a loaded district from `meta.json`.
Bamboo grove on `dirnt`, hex map on `cypher`, camera frusta on `altigoz`, candlesticks on `kerms` and `imc-prosperity-4`.
On the backdrop: `Climbers` (rope teams walking `meta.routes`, pure path math in `climbPath.ts`) and `Conifers` (trees scattered over the loaded range in proportion to the terrain field's forest weight).
At the hub: `HubOrrery` (a ring per district, an orb per project) and `PhotoCarousel` (six frames fed by `src/content/gallery.ts`).
`ZoneScreen` hangs a 16:9 panel at the zones listed in `world/zoneScreens.ts`; `mediaSurface.ts` paints its placeholder and swaps in a photo or a looping video.
They derive per-instance colors from the palette in the store, so they follow the theme like authored materials.

## Terrain shading

`world/terrain/terrainShader.ts` patches the range's `tok.rock` material: per fragment it derives snow, glacier ice, rock strata, scree, meadow and forest floor from world height, slope, sun aspect and hash noise, lowers roughness on snow, and bends the normal with a fine bump.
`world/terrain/terrainField.ts` is the CPU mirror of the treeline and forest weight, used by `Conifers` and the tests.
`world/terrain/Terrain.tsx` attaches the patch to the loaded backdrop and lerps the snow, forest and meadow uniforms from the palette on the retint clock.

## Sky, sun and shadows

`world/SkyDome.tsx` is a camera-following gradient dome in palette colors with a sun disc by day and a moon and stars by night.
`world/SunLight.tsx` is the one shadow-casting light; `world/sky.ts` holds the sun direction both agree on.
Loaded meshes cast and receive shadows; instancers opt in.

## Overlays

All text is DOM: the HUD (identity, mode hints, loading and signal lines, dev stats), the project panel, and the theme toggle.
Nothing is drawn as text inside the canvas.
The panel (`overlay/ProjectDock.tsx`, exported as `ProjectPanel`) is a floating glass sheet on the left with the project the visitor is next to, or the how-to guide from `src/content/guide.ts` at the `hub` zone.
It collapses to an edge tab; `overlay/panelState.ts` keeps that choice in `localStorage` and pulses the tab when a new zone arrives while collapsed.

## Commands

```sh
bun run dev | build | lint | test | format
bun run world:build       # Blender -> lint -> export -> optimize -> public/world/
bun run media:build       # assets/gallery/ originals -> public/gallery/ (sharp)
scripts/transcode-media.sh clip.gif orion   # ffmpeg -> public/media/orion.{webm,mp4}
```
