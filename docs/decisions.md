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

## Trails and lakes (2026-09-07)

- **Lakes are discs clipped by terrain, not shaped meshes.** A basin is carved into the height function and a flat `tok.water` disc sits at the water level; wherever the ground rises through the disc is the shoreline, so the outline comes from the same noise as the rest of the range and never needs authoring.
- **Trails are routed, not drawn.** A* over the carved height field, with a cost of length times a grade penalty plus a turn penalty and a shore discount, finds valley floors and real switchbacks; the result is a `trail.<slug>` curve like a route, so the exporter and meta already know the shape.
- **Trails are painted from a polar mask texture, not by distance to polylines per pixel.** Two trails of 150 points would cost 300 segment distances per fragment across 138k triangles; one 2048 x 256 RGBA texture built once from meta costs a single sample, wraps naturally in theta, and gives the conifer scatter the same answer on the CPU.
- **The water's alpha is the token's alpha.** `--c-water` carries `/ 0.92`, so the registry keeps the lakes translucent through every retint instead of a shader patch fighting it.
- **Panel collapse is remembered.** Collapsing once means collapsed until reopened; a new zone pulses the tab instead of reopening.
- **Look is click-and-drag, not pointer sway** (2026-09-07). The world follows the pointer sideways and the view follows it vertically (drag down looks down), coasts after release with a capped velocity, and eases back to the rail's aim as the visitor scrolls, so a section is never entered facing backwards. Only the canvas starts a drag, so overlays keep their clicks; touch keeps scrolling as the travel gesture. Pure state machine in `controls/dragLook.ts`.

## Mountain fidelity (2026-09-07)

- **The range ships as shape only; its surface is painted per pixel.** The mesh is one smooth-shaded `tok.rock` surface at 720 x 96 (138k triangles). A patch on its standard material (`world/terrain/terrainShader.ts`) decides snow, glacier ice, bare rock, scree, meadow and forest floor at each fragment from height, slope, sun aspect and noise, and adds strata, fall-line streaks and a fine bump. Per-face material slots could never give a crisp snowline or texture between vertices, and image textures are forbidden by the contract.
- **The terrain field exists twice, on purpose.** `terrainField.ts` is the CPU copy of the shader's treeline and forest weight so the conifer scatter and the tests agree with what the shader paints. The noise is the same hash and octaves on both sides.
- **Colors stay tokens.** Rock is the material's `diffuse` (kept current by the registry); snow, forest and meadow are uniforms lerped from the palette on the retint clock, so the range still glides between the day and night sims.
- **Quads split along the flatter diagonal.** A crest crossing the grid otherwise renders as a staircase of alternating triangles under side light; the ridged noise is also rounded over a few metres for the same reason.
- **A dev camera lives in the URL.** `?cam=x,y,z&at=x,y,z&fov=n` pins the rig in development only, so any slope can be inspected at any zoom without touching the rails.

## Hub centerpiece, accent and Dozer (2026-09-07)

- **The hub centerpiece is the Flyer, not an orrery.** The orrery read as generic. A 1903 Wright-style biplane at life size hangs over the pad the way the original hangs in the Smithsonian, props idling, and it is the second vehicle: T takes off from the perch. Built from primitives in `flyer/FlyerRig.tsx` so it retints like everything else.
- **Flight is arcade and pure.** `controls/flightController.ts` is a fixed-step integrator like the drive model: throttle sets speed with a cruise it drifts back to, bank turns, pitch climbs and dives and trades speed, the aircraft levels itself, and past 90% of the flyable radius the nose is bent home so the edge is never a wall. The floor is a polar heightmap of the range (`world/heightGrid.ts`) built once from the loaded vertices, not a per-frame raycast.
- **The accent is forest green.** `#2f7d4f` by day, `#5fc383` by night, with `on-accent` flipped to suit. Everything authored as `tok.accent` (the hub ring, chevrons, climber jackets, screen strips) follows through the retint; the five data hues, amber included, are unchanged so project colors keep their meaning.
- **The Dozer drives at 2 m.** Doubled from its real 1.1 m so it reads from the rails; collision radius and chase camera scaled with it.
- **Project copy carries a `details` list.** Descriptions were rewritten from the local GitHub corpus with one technical fact per line; the panel renders them as a list. Framings stay fixed and are now asserted by tests.

## Cascaded shadows, night light and the Milky Way (2026-09-07)

- **Cascaded shadow maps instead of one orthographic map over the ring.** A single 4096 map over 1040 m gave 25 cm texels everywhere: blurry on a strut two meters from the rail, sharper than a pixel on a peak 500 m away. Four cascades from three's `CSM` (practical split, 700 m far, 2048 per cascade and 4096 for the last) give about 10 cm texels near the camera and 40 to 50 cm on the far range, which is still under two screen pixels at that distance. Fading between cascades hides the seams. The extra depth passes cost less than the old map's fill.
- **The cascade shader is composed, not assigned.** `CSM.setupMaterial` overwrites `onBeforeCompile`, which would wipe the terrain patch. `world/csm.ts` runs the material's own patch first and the cascade one second, keys the program cache on both, re-wraps when a patch is replaced later, and a per-frame sweep in `scene.onBeforeRender` catches materials created by runtime components before their first compile, so nothing is ever lit by all four cascade lights at once.
- **Bias scales with the texel.** Each cascade's normal bias is two of its texels, so the smooth range shows no acne in the far cascade and a strut still meets its shadow in the near one.
- **Night keeps its shadows.** The moon casts through the same cascades at 1.6 of a cool blue-white, and the ground plate, painted in the page background that is near black at night, is lifted toward the muted tone by the registry (`NIGHT_GROUND_LIFT`) so there is an albedo for a moon shadow to fall on; buildings and the range throw soft shadows and shaded faces stay legible instead of flat.
- **The Milky Way is procedural and on brand.** A great circle around a pole set next to the moon, so the band arches over the opposite half of the sky at about 61 degrees, with fbm dust structure, a warm bulge, a broken dark rift and a second, fainter star lattice that thickens toward the band. Only at night, only from the fragment shader, in the same pale tones as the stars.

## Flyer, terminal panel and the rail (2026-09-07)

- **The Flyer is generated, not modelled.** Two surface builders (camber, droop, tip rounding) and one blade builder cover every fabric and propeller part, so the whole aircraft stays in one file with unit tests instead of an opaque glb, and it still retints with the palette.
- **One texture for all muslin.** The rib texture's u coordinate is metres along the span, so the same canvas paints ribs at true 0.3 m pitch on the wings, the elevator and the rudders.
- **The panel is a terminal.** The previous glass sheet with an uppercase eyebrow, a display title, chips and pills read as generated. A terminal window has one face, one grid, a real hierarchy (prompt, heading, quote, list) and a status line, and every part of it is something the reader has seen on a real machine. The bamboo palette was chosen because its greens sit next to the forest accent; project hues map onto the terminal's own colors.
- **The track is derived, never authored.** Rails, ties, beam and train are all built from `meta.rail` at load, so the rail curve in Blender stays the single source of truth for where the visitor travels and what they ride on. Ties and beam are one instanced mesh each; the rails are two tubes; the loop costs four draw calls. The camera rides 2.4 m above the rail, a standing eye height over the lead car's floor, so the car stays out of a level view and appears when the visitor looks down or back.
- **Drag down looks down.** The first drag-look moved the world with the pointer on both axes; vertically that reads as inverted to anyone used to a mouse, so only the horizontal axis keeps the grab-the-world feel.

## The range is the world (2026-09-27)

- **The mountains are the scene, not its backdrop.** The flat 400 m plate and its four districts gave way to one 470 m terrain disc: a valley floor around the hub rising into the same range, with every project on a terrace cut into a summit, a shoulder or a lakeshore and a mountain railway that visits each in turn.
  The relief functions and the terrain shader were kept, since they were the best part of the old world.
- **Districts survive as sectors.** They still load as separate glbs and still name the panel's status-line windows, now in rail order (hub, terminal, redacted, fabrication, evidence), so streaming, culling and the overlay needed new numbers, not new machinery.
- **Terraces are exported, not inferred.** `meta.terraces` carries every site's centre and radius, so the forest, the instancers and anything later can keep off a site without guessing it from zone radii.
- **Driving ground is a sampler, not a ground plane.** `col.ground` keeps only the drivable installations; everything else is a polar grid of exact terrain heights rasterized once from the loaded range's triangles.
  Rasterizing the surface, rather than bucketing vertices by their authored ring and segment, survives the build joining other rock into the mesh, weld and meshopt quantization, and any ring spacing the range session picks.
  It builds in about 200 ms on 200k triangles and answers in constant time, where a raycast against the range every substep would not.
- **Traction is a grade limit.** A substep climbing steeper than 0.7 along its motion is refused and the speed halves; downhill is free.
  The grade is taken over at least half a metre ahead of the vehicle, because over a single 1/120 s hop a two-centimetre seam between the pad and the terrain would read as a wall at a crawl.
  Trails are routed under 0.5, so the Dozer can drive every trail and no cliff.
- **Water has no floor.** Driving into a lake counts as leaving the world, so the camera never follows the Dozer under the surface; it respawns on the rail like at the rim.
- **The forest is capped by thinning, not truncation.** With the whole disc forested, 12,000 trees no longer cover every candidate, and stopping at the cap left whatever came last in triangle order bare.
  The scatter now draws every candidate and keeps an even subset, still in one instanced draw call.
- **Far is 1400 m and fog reaches 1300 m.** From one rim the opposite rim is about 940 m away; the far plane and the fog were stretched so the range across the valley softens rather than clips, and districts cull at 800 m because the whole range is visible from everywhere.
- **A terrace is a bench with steep banks, not a pillow.** The first cut eased into the slope over most of the radius, which read as a smooth mound with the building sunk in it.
  Now the flat level runs to the site radius, an apron bench falls at 0.12 for the railway and the trails to arrive on, and the fill and cut banks take over within 2 m at grades of 1.4 and 2.5, so the terrace reads as cut into the mountain.
- **Routers see the mesh, not the height function.** `sample_polar` reproduces the exporter's diagonal split per quad, so the grade the router measures is the grade the visitor drives; the earlier mismatch produced trails that passed their check and were still 1.7 on the ground.
  Routes step on a 1.25 m raster with a midpoint check, are relaxed by a grade-constrained Laplacian smoother that only accepts improving moves and repairs the gradient afterwards, and the railway gets a separate grade-limited vertical profile instead of following the ground.
- **The railway may cut across a cliff the Dozer may not.** The rail's cliff check runs at 0.9 where the trails run at 0.6, because one leg of the ring had no other way round and the train does not need traction.
- **Colliders are oriented boxes.** Sites are yawed toward the hub, and an AABB around a turned wall inflated it into the terrace; the exporter writes centre, half extents and yaw and the drive model pushes out in the box's own frame.
- **Looks between sites are forward looks.** With no site abeam, aiming at the last site swung the camera back across the mountain; a forward look every 80 m along the leg, dropped 0.8 m, keeps the ride facing the way the train goes, and the site look takes over 60 m out.
- **Zone radii are terrace radii.** The overlay's proximity, the instancers and the forest clearing all use one number per site, taken from the site table in `rangelib`; the hub keeps its own wider radius.
- **Districts keep their order, the ring does not.** The railway leaves the hub west to the terminal, then redacted, fabrication and evidence, so the panel's windows and the culling list follow the rail, not the old compass.
