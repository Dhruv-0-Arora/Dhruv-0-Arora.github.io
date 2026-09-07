# History

What was done, in order, and what is open.
Dates are absolute.

## 2026-09-06 to 2026-09-07: the rebuild

**Repo and tooling.** Git initialized with a generic ignore file and local excludes; bun installed through nix; vitest, gltf-transform and meshoptimizer added; the world contract, Blender lint/export/fixture scripts and the Node build script written with an end-to-end pipeline test.

**Greybox.** The whole world blocked out from `01_greybox.py`: hub with four roads, four districts as primitives with token materials, a closed rail loop, look targets, all 13 zones, colliders, review cameras. Exported and built at 99 KB.

**Runtime slice.** Pure cores first (rail path, drive controller, control machine, proximity, retint), then the React and three.js layer. Verified in headed Chrome on a real GPU: 60 fps, rails scroll with free-look, F to drive, Escape to return, proximity dock, retint in both themes.

**Systems.** Dock copy for every zone, capability reasons with the reduced-motion opt-in, touch excluded from free-look, portrait field of view, zone handover for overlaps, out-of-bounds respawn.

**Detail passes, one session per district.**

- Terminal: braille-cell node cloud on the importance ramp with wikilink struts and a now/later axis; beveled keycap terrain with ramps; grove plot; 300 instanced bamboo stalks on an Oklab age gradient.
- Evidence: Nazar two-layer graph with a dangling edge; AltiGoz streets and plaque; tower plinths; instanced hex map that brightens under attention, 40 sweeping frusta, two candlestick charts from seeded series.
- Fabrication: PCB traces, pads and chips; battery stack with threshold planes; Orion's real 27-node DAG on an open frame with the downstream-of-exposure path highlighted; B-rep solid beside its wire-only twin; real-scale FRC field.
- Shared and Redacted: hub inlay, guides, curbs and district gates; one chamfered sealed block with a seal band and bollards.

**Layout fixes found by looking.** The rail went through the grove, under the Orion deck and along the Redacted roof; the grove moved, the rail was lifted to 27 m over the gantry and bowed north of the block, and the deck became an open frame.

**Content and ship prep.** Experience rewritten to the approved ceiling, prize figures and framework removed, AI disclosure added, `llms.txt` updated, `/world/*` cache headers. Lighthouse on the production build: accessibility, best practices and SEO 1.0; performance 0.68 in headless only, from software WebGL.

**Incident.** On 2026-09-07 the Hyprland compositor on the authoring machine hung (main thread at 100%, IPC dead after a DRM hotplug scan); it was killed and greetd relaunched the login. `world.blend` was saved beforehand.

## Verification state at the end of that session

| Check | Result |
|---|---|
| lint, typecheck, build | green |
| tests | 96 across 18 files, including the Blender pipeline test |
| shipped world | about 530 KB, 30k authored triangles |
| runtime | 60 fps headed, 12 to 45 draw calls |

## 2026-09-07: detail pass

**Backdrop.** A `backdrop` district: one seeded heightfield ring around the plate with a Rainier-like volcano behind the hub, a flat-topped Adams, ridges and fillers; snow above blended snowlines, forest below the treeline; three climbing routes exported in `meta.routes`. New tokens `rock`, `snow`, `forest`. Bounds redefined as the `col.ground` AABB. Cull distance 320 m, fog 200 to 760 m, camera far 1000 m.

**Runtime fields.** Climbers (rope teams with headlamps), conifers scattered on the range, a palette sky dome with sun or moon and stars, one shadow-casting sun, soft shadow maps.

**Hub.** Topo contour rings, a socket and a chevron loop in Blender; at runtime a photo carousel (six frames, `src/content/gallery.ts`), an orrery of the projects, and a `hub` zone that opens the guide.

**Screens.** Floating 16:9 panels at Orion and Synthesis with a palette placeholder, ready for `public/media/<zone>.webm`.

**Drag to look.** Click-and-drag on the world replaces the pointer-position sway: deltas feed `DragLook`, which coasts, clamps pitch and recenters with rail travel; a drag that starts and ends between frames still lands.

**Panel.** The dock became `ProjectPanel`: a glass sheet on the left with larger type, highlight stat, all tech, repo and demo pills, a collapse tab with pulse, a bottom sheet under 768 px.

Verification: lint, build and 112 tests green; 60 fps headed in both themes at the hub, the north rail, Orion and Synthesis with 80 to 170 draw calls.

## 2026-09-07: mountain fidelity

**Range.** The backdrop heightfield went from 240 x 32 flat-shaded quads with per-face snow and forest slots to a 720 x 96 smooth-shaded surface (138k triangles, 777 KB) with domain-warped ridged noise, radial cleavers and rounded domes on the volcanoes, quads split along the flatter diagonal. Budgets raised to match (backdrop 150k tris, 900 KB; authored total 360k).

**Terrain shader.** Snow, glacier ice, rock strata, fall-line streaks, scree, meadow and forest floor are now decided per pixel on the rock material from height, slope, sun aspect and hash noise, with a bump on the rock and lower roughness on the snow. The conifer scatter reads the same field from `terrainField.ts`, denser and smaller (two-tier firs, up to 9000).

**Light.** The sun moved to the east-north-east at 30 degrees so the volcano is side-lit and the eastern range shadows the plate; a 4096 shadow map; a palette hemisphere light in `SunLight`; a horizon with some sky in it; fog pushed out to 240 to 1050 m. Rock, snow and forest tokens retuned toward andesite gray, cool white and deep conifer green.

**Tooling.** `?cam=x,y,z&at=x,y,z&fov=n` pins a development camera for close inspection.

## 2026-09-07: the Flyer, green accent, bigger Dozer, technical copy

**Centerpiece and second vehicle.** The project orrery is gone; a life-size 1903 Flyer hangs over the spawn pad with its props idling. T takes off from the perch into an arcade flight model (W and S throttle, A and D bank, arrows climb and dive, Escape lands); the terrain floor is a polar heightmap of the range built once at load, and the world's edge turns the nose home.

**Accent.** Ember orange became forest green in both themes (`--c-accent`, `on-accent`, favicon, hero light, showcase fallbacks); the authored `tok.accent` meshes followed through the retint.

**Dozer.** Drives at 2 m instead of 1.1 m; collision radius 1.3 m; chase camera pulled back.

**Copy.** All thirteen zone projects rewritten from the corpus with a `details` list of technical facts, rendered in the panel; tests assert the fixed authorship framings.

## 2026-09-07: remote and deploy

**Remote.** The history was rebuilt on top of the old 2023 site in the `Dhruv-0-Arora.github.io` repository and pushed.

**Deploy.** `.github/workflows/deploy.yml` lints, tests, builds and publishes `dist/` to GitHub Pages on every push to `main`; `public/CNAME` sets the custom domain darora1.me, and `index.html` carries the canonical URL.
The cache headers in `vercel.json` do not apply on Pages.

## 2026-09-07: cascaded shadows, night light and the Milky Way

**Shadows.** One 4096 orthographic map over the whole ring became four camera-following cascades (`world/SunLight.tsx`, three's `CSM`; `world/csm.ts` composes the cascade shader with the terrain and water patches).
Near shadows went from 25 cm texels to about 10 cm; the far range keeps its shadows to 700 m.

**Night.** The moon now casts through the same cascades at low intensity, with a slightly stronger hemisphere and ambient, so the night theme keeps soft shadows.

**Sky.** A procedural Milky Way with dust lanes and a bulge, plus a fainter second star field, arches over the side of the night sky opposite the moon.

## 2026-09-07: trails and lakes

**Lakes.** Two tarns in the lowest saddles of the range, Mowich (east of Rainier, basin radius 28 m) and Tipsoo (between Stuart and Adams, 24 m), carved into the height field with a bank, a moraine lip and an irregular noisy shoreline; a new `water` token, a `tok.water` disc per lake in the backdrop glb, and `Lake.tsx` for ripples and fresnel.

**Trails.** One trail per lake from the foot of the range to the shore and over the saddle, routed by A* with grade and turn penalties in `06_backdrop.py`, exported as `meta.trails`, painted by the terrain shader from a polar mask (`trailMask.ts`) as a dirt tread with trodden margins; gravel shores around the water; no trees on trails or in lakes.

**Pipeline.** `meta.lakes` and `meta.trails` with validation and tests; lint accepts `trail.<slug>` curves and `<district>.lake.<slug>` meshes (water only); the fixture and the end-to-end test carry one of each.

## 2026-09-07: a real Flyer, a terminal panel, the rail made visible

**Flyer.** Rebuilt from boxes into the 1903 machine: cambered muslin surfaces generated in `flyerGeometry.ts` (1-in-20 camber peaking at a third of the chord, drooping tips, rounded trailing corners) with a painted rib texture shared across wings, elevator and rudders; spars and streamlined struts with metal fittings; crossed flying wires and drag wires in every bay; skids that curve up to carry the biplane elevator; twin rudders on the tail booms; the horizontal four-cylinder engine with fins, flywheel, radiator and tank; two chain runs in their tubes to each propeller, the left pair crossed; twisted two-blade pusher propellers; the pilot prone in the hip cradle.

**Panel.** The glass project panel became a terminal window in the bamboo.nvim palette (vulgaris at night, light by day): a `dhruv@nixos` path bar, a prompt line, the project rendered like glow renders markdown (title, tagline, a quoted highlight, description, `## details`, `## stack`, repo and demo links) and a tmux-style status line with the five districts as windows. The guide is `sim --help` output with the keys in a yellow column. The HUD name is set in the same mono face.

**Rail made visible.** The camera's rail is now a track: two steel rails on floating ties over a slim beam, generated in `src/simulator/rail/` from the exported rail curve, and a three-car open train that rides `frame.railT`, the same smoothed parameter the camera follows. The visitor stands in the lead car; the train waits on the track while the Dozer or the Flyer is out. Everything about the look lives in `railStyle.ts`; the shape is the Blender rail, so rerouting for a new project changes no runtime code.

**Tuning.** Drag-look no longer inverts vertically (drag down looks down). The moon is brighter (1.6) and the ground plate is lifted off black at night in the registry so moon shadows show on it. The Milky Way is broader, fainter and more mottled than the first cut.

## Open items

- Photos for the carousel and clips for the two screens are placeholders until Dhruv provides them.
- The range's fine detail is procedural noise; real crevasse fields and moraines would need authored masks.

- World poster images for the moment before the canvas is ready.
- The keyboard-terrain drive (ramps and keys as ground) has not been exercised in a browser.
- Dark-theme lighting is flat on large surfaces; a hemisphere and directional pair is all there is.
- The hub-to-Terminal road passes between the keyboard halves.
- Owner questions in [content-rules.md](content-rules.md).
