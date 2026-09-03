# Architecture

The site is a single React page that is, for capable browsers, a full-viewport explorable 3D world ("The Simulator").
Everyone else gets the earlier static portfolio page.

## Repository layout

```
assets/blender/            world authoring: contract.json, world.blend, scripts/
  scripts/worldlib.py      shared helpers and the world layout (centers, rail, looks, zone radii)
  scripts/sessions/NN_*.py numbered build sessions; run in order to recreate world.blend
  scripts/lint_scene.py    contract lint, run inside Blender
  scripts/export_world.py  headless export to glbs + meta.json
  scripts/review.py        renders cam.review.* cameras for checkpoints
  scripts/make_fixture.py  minimal valid scene for the pipeline test
scripts/                   build-world.ts, optimize-glb.ts, world-budgets.ts (Node, not bun)
public/world/              committed build output: one glb per district + meta.json
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
3. `WorldCanvas` (lazy, in the `three` chunk) loads `meta.json` and `shared.glb` plus the Dozer, then streams the other districts nearest-first and mounts the runtime instancers.
4. `CameraRig` is the frame loop: integrates the drive model, places the camera for the current mode, runs zone proximity, culls districts by distance (250 m), respawns the Dozer if it leaves the collision ground, samples stats.
5. `useRetint` reads `--c-*` custom properties from the DOM on every theme change and repaints every world material, the background and the fog over 200 ms.

## State

- `simStore.ts` holds React-visible state (`mode`, `zone`, readiness, `palette`, `signalLost`, stats) behind `useSyncExternalStore`, and a mutable `frame` object for per-frame values (scroll t, pointer, drive input, probe position) that never re-render React.
- Control mode is a pure transition table in `controlMachine.ts`: `rails` (scroll drives the camera) -> `driving` (F) -> `returning` (Escape) -> `rails`.
- Driving is unavailable on touch-only devices and until the world and Dozer are loaded.

## Pure cores, all unit tested

| Module | Responsibility |
|---|---|
| `controls/railPath.ts` | arc-length rail, eased look targets |
| `controls/driveController.ts` | fixed 120 Hz substeps, circle-vs-AABB push-out, ground follow |
| `proximity/proximity.ts` | one active zone, 1.25r exit hysteresis, handover to a closer overlapping zone |
| `theme/palette.ts`, `retint.ts`, `oklab.ts` | CSS color parsing, material-name binding, lerped repaint, Oklab gradients |
| `world/contract.ts`, `meta.ts` | typed contract, validation of the exported meta |
| `world/instancing/hexGrid.ts`, `ohlc.ts` | deterministic layouts for the instancers |

## Runtime instancers

`src/simulator/world/instancing/` holds one component per repetitive field, each a single `InstancedMesh` (two for frusta and candlesticks) anchored on a zone from `meta.json`.
Bamboo grove on `dirnt`, hex map on `cypher`, camera frusta on `altigoz`, candlesticks on `kerms` and `imc-prosperity-4`.
They derive per-instance colors from the palette in the store, so they follow the theme like authored materials.

## Overlays

All text is DOM: the HUD (identity, mode hints, loading and signal lines, dev stats), the dock (zone project card with a repo link), and the theme toggle.
Nothing is drawn as text inside the canvas.

## Commands

```sh
bun run dev | build | lint | test | format
bun run world:build       # Blender -> lint -> export -> optimize -> public/world/
```
