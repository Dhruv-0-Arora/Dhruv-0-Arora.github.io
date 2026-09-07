# Decisions

One entry per decision, with the reason.
Add new entries at the bottom with the date; do not rewrite old ones.

## Concept and interaction

- **The portfolio is one explorable world, not a page with 3D accents** (2026-09-06). The model takes the whole viewport, at up-to-city scale, in the site's existing token aesthetic.
- **Hybrid interaction**: scroll-driven rails with pointer free-look by default; F takes the wheel of the Dozer; Escape glides back to the nearest rail point. Chosen explicitly over pure rails or pure driving.
- **The Dozer is the vehicle, reusing the live-parsed `.mira`.** The site already parses a real Synthesis CAD file; driving it is the homage. Not remodelled.
- **Districts follow the three narrative arcs**: Terminal (speed), Evidence (judgment), Fabrication (physical), plus a sealed Redacted block for the confidential platform, where the confidentiality rule is the design.
- **All text is DOM.** No in-canvas text; project copy comes from `src/content/projects.ts` by zone slug.

## Runtime

- **No physics engine.** A ~170 line kinematic drive model with fixed 120 Hz substeps is deterministic, unit-testable and arcade-feeling. Frame-rate independence is a test.
- **Ground follow by raycast against a hidden `col.ground` mesh**, which is the ground plane joined with every surface flagged drivable in Blender. Box colliders are AABBs from `meta.json`.
- **Theming by material name, no textures.** Blender materials are named after CSS tokens; the runtime reads real values from `getComputedStyle` so `src/index.css` stays the only color source. Dark theme adds emissive to accent and hue tokens (night sim); light theme is a day sim.
- **Instancers derive colors from the palette in the store** rather than registering with the material registry, because their colors are per instance.
- **Authored versus procedural split.** Blender authors unique meshes; repetitive fields (bamboo, hexes, frusta, candles) are runtime `InstancedMesh`es anchored on zones from `meta.json`.
- **meshopt over Draco**: 40 KB decoder against 300 KB of wasm, near-parity on flat-color low-poly geometry.
- **No LOD; districts are culled beyond 250 m.** Draw calls stay between 12 and 45.
- **Part names are stripped and meshes joined per material in the build.** The runtime addresses the world through `meta.json` and material names, never part names; only `col.*` keep their names.
- **Zones may overlap; a closer containing zone takes over at once**, while a single zone keeps 1.25r exit hysteresis. Needed because the hex map is the floor under the Nazar graph.
- **Look `t` is derived, not hand-tuned.** The exporter sets each look's rail parameter to the nearest rail point; only the hub pins `t` to 0 and 1.
- **Scroll maps to the rail through a 14-screen spacer.** Programmatic returns from driving set the scroll position to the rail t, so the two never disagree.
- **Mobile is rails-only**; the wheel needs `(hover: hover) and (pointer: fine)`. Below 380 px, or without WebGL, the static page serves. Reduced motion serves the static page with an opt-in that replaces every camera glide with a cut.
- **Out of bounds means "off `col.ground` for 0.6 s"**, then a respawn at the nearest rail point with a HUD line, rather than invisible walls.

## Pipeline and repo

- **A single JSON contract shared by Python and TypeScript**, with literal TS lists checked against it by a test, because a JSON import types arrays as `string[]`.
- **The world is code.** Numbered session scripts on top of `worldlib.py`; `world.blend` is a saved artifact of running them, tracked in plain git (under 1 MB, orphans purged, nothing packed).
- **Build artifacts in `public/world/` are committed** so Vercel never runs Blender. They are served with a one hour cache plus stale-while-revalidate because they are not content-hashed.
- **`build-world.ts` runs under Node**, not bun; see the file header.
- **Generic `.gitignore` only.** Personal and agent material is ignored through `.git/info/exclude`, so the tracked ignore file stays neutral.
- **Conventional commits, no co-author lines, scoped** `chore(repo|pipeline)`, `feat(sim|world|overlay)`, `content(...)`, `test(...)`, `perf(...)`, `docs`.

## Content

- **Every shipped string passes the content rules** in [content-rules.md](content-rules.md); tests guard the client ceiling, prize figures and the AI disclosure.
- **Copy is regenerated from the local corpus, never invented.** Numbers are printed exactly or not at all; losses and defects are kept because they make the wins credible.

## Detail pass (2026-09-07)

- **The backdrop is a district, not a sky texture.** A `backdrop` collection exports like any other so budgets, lint and the retint registry apply; it is exempt from distance culling and loads first because its center is the hub.
- **One heightfield, not separate peaks.** An annular grid with a seeded height function guarantees nothing floats and gives continuous ridgelines; peaks are cones with domain-warped ridged noise, volcanoes carry radial cleavers and a rounded dome.
- **Bounds mean the drivable world.** The Dozer clamp reads the AABB of `col.ground`, so scenery can extend to 470 m without changing driving.
- **Climbing routes are authored, not computed.** `route.<slug>` curves snapped to the mesh in Blender export as polylines; the runtime only interpolates.
- **Trees are scattered at runtime from the loaded mesh.** Every triangle's area, height and slope are read from the glb and weighted by the terrain field; no tree positions in meta.
- **Sky and sun are palette-driven.** A shader dome and one directional light share `sky.ts`; day is a warm sun in the east-north-east, low enough to side-light the volcano and lay the eastern range's shadow over the plate, night is a moon in the south-west with stars.
- **Shadows are real shadow maps.** One 4096 map over the whole ring; soft PCF; loaded meshes cast and receive, instancers opt in. Measured at 60 fps on the authoring GPU.
- **Pictures never enter the world pipeline.** Photos and clips are runtime textures on `MediaSurface`; a palette placeholder shows until a source exists.
- **The hub zone is the guide.** A `hub` contract zone at the origin makes the proximity tracker open the how-to panel at spawn without special-casing rails.
- **Panel collapse is remembered.** Collapsing once means collapsed until reopened; a new zone pulses the tab instead of reopening.
- **Look is click-and-drag, not pointer sway** (2026-09-07). The world follows the pointer, coasts after release with a capped velocity, and eases back to the rail's aim as the visitor scrolls, so a section is never entered facing backwards. Only the canvas starts a drag, so overlays keep their clicks; touch keeps scrolling as the travel gesture. Pure state machine in `controls/dragLook.ts`.

## Mountain fidelity (2026-09-07)

- **The range ships as shape only; its surface is painted per pixel.** The mesh is one smooth-shaded `tok.rock` surface at 720 x 96 (138k triangles). A patch on its standard material (`world/terrain/terrainShader.ts`) decides snow, glacier ice, bare rock, scree, meadow and forest floor at each fragment from height, slope, sun aspect and noise, and adds strata, fall-line streaks and a fine bump. Per-face material slots could never give a crisp snowline or texture between vertices, and image textures are forbidden by the contract.
- **The terrain field exists twice, on purpose.** `terrainField.ts` is the CPU copy of the shader's treeline and forest weight so the conifer scatter and the tests agree with what the shader paints. The noise is the same hash and octaves on both sides.
- **Colors stay tokens.** Rock is the material's `diffuse` (kept current by the registry); snow, forest and meadow are uniforms lerped from the palette on the retint clock, so the range still glides between the day and night sims.
- **Quads split along the flatter diagonal.** A crest crossing the grid otherwise renders as a staircase of alternating triangles under side light; the ridged noise is also rounded over a few metres for the same reason.
- **A dev camera lives in the URL.** `?cam=x,y,z&at=x,y,z&fov=n` pins the rig in development only, so any slope can be inspected at any zoom without touching the rails.

