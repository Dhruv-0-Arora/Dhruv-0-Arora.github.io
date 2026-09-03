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

## Open items

- World poster images for the moment before the canvas is ready.
- The keyboard-terrain drive (ramps and keys as ground) has not been exercised in a browser.
- Dark-theme lighting is flat on large surfaces; a hemisphere and directional pair is all there is.
- The hub-to-Terminal road passes between the keyboard halves.
- Owner questions in [content-rules.md](content-rules.md).
- No git remote and no Vercel deploy yet.
