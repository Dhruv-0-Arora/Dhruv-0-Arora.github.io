# World pipeline

The world is authored in Blender as code, exported headlessly, optimized, and committed.
Deploys never need Blender.

## The contract

`assets/blender/contract.json` is the single source of truth for districts, zone slugs, material tokens, required objects, world size and budgets.
`lint_scene.py` enforces it inside Blender; `src/simulator/world/contract.ts` mirrors the literal lists for TypeScript and `contract.test.ts` asserts they match.

Scene rules the lint checks:

- Collections `World/{Shared,Terminal,Evidence,Fabrication,Redacted,Backdrop,Colliders,Rails}`; cameras may live outside `World`.
- District objects are named `<district>.<installation>.<part>[.<sub>...]`, prefix matching their collection.
- Materials are named `tok.<token>`, `ramp.importance.1-5` or `grad.dirnt`, no image textures.
- `Colliders` holds `col.ground` (mesh) and `col.box.<slug>` empties whose world AABB is the collider.
- `Rails` holds one `rail.path` curve, `rail.look.NN` empties (optional custom `t`), one `zone.<slug>` empty per contract zone with a `radius` property, and `route.<slug>` polyline curves for the climbers.
- Per-district and per-installation triangle budgets (contract `budgets.tris`).

## Sessions

`assets/blender/scripts/sessions/` is a numbered series of scripts built on `worldlib.py`.
`01_greybox.py` wipes the scene and builds every district as primitives, the rail, zones, colliders and review cameras.
Each later session (`02_terminal`, `03_evidence`, `04_fabrication`, `05_shared_redacted`, `06_backdrop`) calls `w.wipe_district(...)` for its own district, zones and colliders, rebuilds them in detail, and calls `w.rebuild_ground()`.
`06_backdrop` is procedural: one smooth-shaded annular heightfield (720 segments x 96 rings) around the plate with seeded peaks, domain-warped ridged noise and radial cleavers on the volcanoes, plus three routes snapped onto the surface with `obj.ray_cast`.
The range is a single `tok.rock` surface; snow, forest and rock detail are painted at runtime by the terrain shader (`src/simulator/world/terrain/`), so the session only shapes the ground.
Each quad is split along the diagonal with the smaller height difference so crests do not render as staircases.
Running the sessions in order recreates `world.blend` from git history alone.

Helpers in `worldlib.py`: `box`, `cylinder`, `strut` (a to b), `sphere`, `plane`, `torus`, `empty`, `zone`, `collider_box`, `camera`, plus `material(name)` which sets preview colors from the light theme.
Objects flagged `drivable=True` are baked into `col.ground` by `rebuild_ground()`.

Layout constants (`CENTERS`, `RAIL`, `LOOKS`, `ZONE_RADII`) live in `worldlib.py`.
`LOOKS` entries with `t=None` get their rail parameter from the exporter as the nearest rail point, so aims are exact when the camera is abeam.

## Running a session

Headless, from the repo root:

```sh
blender --background --python-exit-code 1 assets/blender/world.blend \
  --python assets/blender/scripts/sessions/03_evidence.py -- --save assets/blender/world.blend
```

Live, through the Blender MCP: load `worldlib`, the sessions and `lint_scene` with `importlib` (register each in `sys.modules` first, or dataclasses fail), call `build()` / `main()`, print `lint_scene.lint().text()`, render `review.render_reviews(dir)`, then `worldlib.save(path)`.
Always run the lint before saving; the exporter refuses a failing scene anyway.

## Export and build

`export_world.py` writes `<district>.glb` (Y-up, materials by name, modifiers applied; `shared.glb` also carries `col.ground`), `meta.json` (rail polyline, looks, zones, routes, box colliders, bounds, all Y-up) and `lint.json`.
`bounds` is the AABB of `col.ground`, the drivable world, so scenery beyond the plate never widens the Dozer's clamp.
`scripts/build-world.ts` runs Blender, validates `meta.json` with `parseWorldMeta`, optimizes each glb with gltf-transform (`dedup({keepUniqueNames})`, `flatten`, `join` everything except `col.*`, `weld`, `prune`, meshopt) and enforces wire and triangle budgets.
It runs under Node because bun resolves a CJS entry that eagerly requires the native `sharp` module.

Budgets (contract): per district up to 70k tris and 1.2 MB, 240k authored tris total, 4.0 MB soft and 5.0 MB hard total wire.
The current world is about 800 KB and 48k authored triangles (15k of them the backdrop ring), plus roughly 300k triangles at runtime with instancers and the shadow pass.

## Media

Photos for the hub carousel come from originals in `assets/gallery/` (untracked): `bun run media:build` cover-fits them to 3:2 at 1280 px into `public/gallery/` and prints the entries to paste into `src/content/gallery.ts`.
Clips for the zone screens are transcoded with `scripts/transcode-media.sh <clip> <zone>` (ffmpeg via `nix shell nixpkgs#ffmpeg`) into `public/media/<zone>.webm` and `.mp4`, then referenced by `src` in `src/simulator/world/zoneScreens.ts`.
The lint forbids textures in the world itself; every picture is applied at runtime.

## Verification loop for a world change

1. Headless run of the session on a copy of `world.blend`, then the lint.
2. Live run through the MCP with review renders (`plan/checkpoints/` style, or any scratch directory).
3. `bun run world:build`, then `bun run test` (includes the Blender end-to-end pipeline test, skipped when Blender is absent).
4. Browser pass at the district's scroll positions in both themes; a probe script over `meta.json` with `RailPath` and `lookTargetAt` tells you where the camera is at a given t.

## Gotchas

- Blender exits 0 on Python exceptions unless `--python-exit-code 1` is passed.
- Passing `export_loglevel` to the 5.1 glTF exporter crashes it.
- three's `GLTFLoader` strips dots from node names; `loadWorld.ts` matches colliders through `PropertyBinding.sanitizeNodeName`.
- A multi-material collider arrives as a Group named after the node; detach by name at any depth.
- The rail is a Bezier with AUTO handles and bulges at sharp corners; check camera positions numerically, not by eye.
- `bpy.data.orphans_purge` works from the MCP; the outliner operator needs UI context.
