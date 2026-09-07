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
4. `CameraRig` is the frame loop: integrates the drive and flight models, places the camera for the current mode, runs zone proximity, culls districts by distance (320 m, never the backdrop), respawns the Dozer if it leaves the collision ground, samples stats.
5. `useRetint` reads `--c-*` custom properties from the DOM on every theme change and repaints every world material and the background over 200 ms; `SkyDome` lerps its own colors on the same clock and paints the fog color to match its horizon.

## State

- `simStore.ts` holds React-visible state (`mode`, `zone`, readiness, `palette`, `signalLost`, stats) behind `useSyncExternalStore`, and a mutable `frame` object for per-frame values (scroll t, pointer, drive input, probe position) that never re-render React.
- Control mode is a pure transition table in `controlMachine.ts`: `rails` (scroll drives the camera) -> `driving` (F) -> `returning` (Escape) -> `rails`.
- Driving and flying are unavailable on touch-only devices and until the world and Dozer are loaded.
- Modes: `rails`, `driving` (F), `flying` (T), `returning`; Escape leaves either vehicle and the camera glides to the nearest rail point. The Flyer keeps gliding during the return and re-perches once the rails have the camera.

## Pure cores, all unit tested

| Module | Responsibility |
|---|---|
| `controls/railPath.ts` | arc-length rail, eased look targets |
| `controls/dragLook.ts` | click-and-drag look offset with coasting and recentering |
| `controls/flightController.ts` | arcade flight for the Flyer: throttle, bank, pitch, floor and ceiling, homing at the edge |
| `world/heightGrid.ts` | polar heightmap of the range built from its vertices, the flight floor |
| `world/csm.ts` | composes the cascaded-shadow shader with a material's own patch, sweeps the scene for new materials, texel-scaled bias |
| `controls/devCamera.ts` | development-only fixed camera from `?cam=&at=&fov=` |
| `flyer/flyerGeometry.ts` | cambered fabric surfaces, twisted propeller blades and the muslin rib painter for the Flyer |
| `rail/railTrack.ts` | stations along the rail, wrap on the loop, tangent orientation, car spacing |
| `overlay/zoneDistrict.ts` | which district each zone lives in, for the panel's status line |
| `world/terrain/terrainField.ts` | treeline and forest weight, mirrored in the terrain shader |
| `world/terrain/trailMask.ts` | polar mask of the trails and lake shores from `meta.trails` and `meta.lakes`, sampled by the terrain shader and the conifer scatter |
| `controls/driveController.ts` | fixed 120 Hz substeps, circle-vs-AABB push-out, ground follow |
| `proximity/proximity.ts` | one active zone, 1.25r exit hysteresis, handover to a closer overlapping zone |
| `theme/palette.ts`, `retint.ts`, `oklab.ts` | CSS color parsing, material-name binding, lerped repaint, Oklab gradients |
| `world/contract.ts`, `meta.ts` | typed contract, validation of the exported meta |
| `world/instancing/hexGrid.ts`, `ohlc.ts` | deterministic layouts for the instancers |

## Runtime instancers

`src/simulator/world/instancing/` holds one component per repetitive or animated field, anchored on a zone, a route or a loaded district from `meta.json`.
Bamboo grove on `dirnt`, hex map on `cypher`, camera frusta on `altigoz`, candlesticks on `kerms` and `imc-prosperity-4`.
On the backdrop: `Climbers` (rope teams walking `meta.routes`, pure path math in `climbPath.ts`) and `Conifers` (trees scattered over the loaded range in proportion to the terrain field's forest weight).
At the hub: `PhotoCarousel` (six frames fed by `src/content/gallery.ts`) and, hanging over the pad, the Flyer (`flyer/FlyerRig.tsx`, a life-size 1903 biplane: generated cambered muslin surfaces with a rib texture, spruce struts and wires, the engine and its chain drives, twisted pusher propellers and the prone pilot, props idling until it is flown).

The rail itself is visible: `rail/RailTrack.tsx` builds two rail tubes, instanced ties and a beam from the exported rail curve, and `rail/Train.tsx` parks three open cars at `frame.railT`, the smoothed parameter the camera follows, so the visitor rides the lead car and the train waits on the track while a vehicle is out. Every visual constant is in `rail/railStyle.ts`; the shape is the Blender rail.
`ZoneScreen` hangs a 16:9 panel at the zones listed in `world/zoneScreens.ts`; `mediaSurface.ts` paints its placeholder and swaps in a photo or a looping video.
They derive per-instance colors from the palette in the store, so they follow the theme like authored materials.

## Terrain shading

`world/terrain/terrainShader.ts` patches the range's `tok.rock` material: per fragment it derives snow, glacier ice, rock strata, scree, meadow and forest floor from world height, slope, sun aspect and hash noise, lowers roughness on snow, and bends the normal with a fine bump.
`world/terrain/terrainField.ts` is the CPU mirror of the treeline and forest weight, used by `Conifers` and the tests.
`world/terrain/Terrain.tsx` attaches the patch to the loaded backdrop and lerps the snow, forest and meadow uniforms from the palette on the retint clock.
Trails and lake shores are not in the noise: `trailMask.ts` rasterizes `meta.trails` (a 3.5 m tread with a soft edge) and a gravel ring around each of `meta.lakes` into one polar texture (theta across and wrapping, rho from the plate's edge to the rim), and the shader samples it with the same mapping to paint dirt and gravel and to keep forest and meadow off the tread.
`Conifers` reads the same mask so no tree stands on a trail or in a lake.
`world/Lake.tsx` patches the `tok.water` disc material: scrolling ripple normals, low roughness, and a fresnel mix toward the palette's sky color at grazing angles; the water color and its alpha are the token, kept current by the registry.

## Sky, sun and shadows

`world/SkyDome.tsx` is a camera-following gradient dome in palette colors with a sun disc by day and, by night, a moon, two star lattices and a procedural Milky Way (a great circle around `galacticPole()` with a bulge, dust lanes and a wide halo, all fbm in the fragment shader).
`world/SunLight.tsx` drives four cascaded shadow maps (three's `CSM`, practical split to 700 m, 2048 per cascade and 4096 for the far one, fading between cascades) that follow the camera, plus the hemisphere and ambient lights; by night the same cascades cast from the moon at low intensity so shadows stay present.
`world/sky.ts` holds the sun, moon and galactic pole directions the dome and the lights agree on.
Every lit material is composed with the cascade shader in `scene.onBeforeRender` through `world/csm.ts`, which keeps the terrain and water patches intact; light direction, color and intensity glide on the retint clock.
Loaded meshes cast and receive shadows; instancers opt in.

## Overlays

All text is DOM: the HUD (identity, mode hints, loading and signal lines, dev stats), the project panel, and the theme toggle.
Nothing is drawn as text inside the canvas.
The panel (`overlay/ProjectDock.tsx`, exported as `ProjectPanel`) is a terminal window on the left in the bamboo.nvim palette (`--t-*` tokens in `index.css`): a `dhruv@nixos` path bar, a prompt line, the project rendered like glow renders markdown (title, tagline, quoted highlight, description, details, stack, links), and a tmux-style status line with the districts as windows from `overlay/zoneDistrict.ts`. At the `hub` zone it shows the how-to guide from `src/content/guide.ts` as `sim --help` output.
It collapses to an edge tab; `overlay/panelState.ts` keeps that choice in `localStorage` and pulses the tab when a new zone arrives while collapsed.

## Commands

```sh
bun run dev | build | lint | test | format
bun run world:build       # Blender -> lint -> export -> optimize -> public/world/
bun run media:build       # assets/gallery/ originals -> public/gallery/ (sharp)
scripts/transcode-media.sh clip.gif orion   # ffmpeg -> public/media/orion.{webm,mp4}
```
