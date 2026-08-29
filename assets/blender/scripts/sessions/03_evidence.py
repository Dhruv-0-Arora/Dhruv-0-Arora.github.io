"""Session 03: Evidence district detail pass (the Judgment arc).

Replaces ``World/Evidence`` plus its zones and colliders on top of the
earlier sessions:

    blender --background --python-exit-code 1 assets/blender/world.blend \
        --python assets/blender/scripts/sessions/03_evidence.py -- \
        --save assets/blender/world.blend

Installations:

* Cypher: the district floor is the risk map. The plate is authored here;
  the ~3,400 hexes are instanced at runtime on zone.cypher and light up
  under the camera or the Dozer.
* AltiGoz: street segments on the ground plus a blank plaque (all text is
  DOM). The 40 sweeping camera frusta are instanced at runtime on
  zone.altigoz.
* Nazar: a two-layer graph hung from a beam between two pylons. Hard
  evidence is the lower layer of dark cubes; the model's reasoning is the
  upper layer of violet spheres; footnote struts tie every claim down to a
  piece of evidence. One strut ends in nothing: the dangling edge Nazar
  hunts, drawn in accent.
* kerms and IMC Prosperity 4: plinths with a zero line; the candlesticks
  are instanced at runtime on their zones.
"""

from __future__ import annotations

import math
import os
import random
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from worldlib import CENTERS, World, save, session_args  # noqa: E402

C = CENTERS["evidence"]
CYPHER = (C.x, C.y - 5.0)
FIELD = 150.0
ALTIGOZ = (C.x - 50.0, C.y - 40.0)
NAZAR = (C.x, C.y + 32.0)
KERMS = (C.x + 45.0, C.y - 45.0)
IMC = (C.x + 71.0, C.y - 45.0)


def build_cypher(w: World, col) -> None:
    cx, cy = CYPHER
    w.box("evidence.cypher.ground", col, (cx, cy, 0.1), (FIELD, FIELD, 0.2), "tok.surface-2", drivable=True)
    # A thin border so the map has an edge to read against the ground.
    for name, (dx, dy, sx, sy) in {
        "n": (0.0, FIELD / 2, FIELD + 0.8, 0.8),
        "s": (0.0, -FIELD / 2, FIELD + 0.8, 0.8),
        "e": (FIELD / 2, 0.0, 0.8, FIELD + 0.8),
        "w": (-FIELD / 2, 0.0, 0.8, FIELD + 0.8),
    }.items():
        w.box(f"evidence.cypher.edge.{name}", col, (cx + dx, cy + dy, 0.2), (sx, sy, 0.4), "tok.border", drivable=True)
    w.zone("cypher", (cx, cy))


def build_altigoz(w: World, col) -> None:
    px, py = ALTIGOZ
    rng = random.Random(21)
    w.box("evidence.altigoz.plaque", col, (px, py - 14.0, 1.2), (10.0, 0.5, 2.4), "tok.text")
    w.box("evidence.altigoz.plaque.foot", col, (px, py - 14.0, 0.25), (11.0, 1.6, 0.5), "tok.border", drivable=True)
    # Street segments: the index is camera bearing vs street geometry.
    for i in range(7):
        a = rng.uniform(0, math.pi)
        length = rng.uniform(14.0, 26.0)
        x = px + rng.uniform(-12.0, 12.0)
        y = py + rng.uniform(-8.0, 10.0)
        w.box(f"evidence.altigoz.street.{i:03d}", col, (x, y, 0.28), (length, 1.2, 0.16), "tok.muted", yaw=a, drivable=True)
    w.zone("altigoz", (px, py))


def build_nazar(w: World, col) -> None:
    nx, ny = NAZAR
    rng = random.Random(22)
    for sx in (-20.0, 20.0):
        tag = "w" if sx < 0 else "e"
        w.box(f"evidence.nazar.pylon.{tag}", col, (nx + sx, ny, 9.5), (1.6, 1.6, 19.0), "tok.text", bevel=0.15)
        w.box(f"evidence.nazar.foot.{tag}", col, (nx + sx, ny, 0.3), (4.0, 4.0, 0.6), "tok.border", drivable=True)
        w.collider_box(f"nazar-{tag}", (nx + sx, ny, 9.5), (1.6, 1.6, 19.0))
    w.box("evidence.nazar.beam", col, (nx, ny, 19.0), (42.0, 0.9, 0.9), "tok.text")

    # Evidence layer: files as dark cubes in a loose grid on the ground.
    evidence = []
    for i in range(18):
        x = nx - 15.0 + (i % 6) * 6.0 + rng.uniform(-1.2, 1.2)
        y = ny - 6.0 + (i // 6) * 6.0 + rng.uniform(-1.2, 1.2)
        z = 0.6
        evidence.append((x, y, z))
        w.box(f"evidence.nazar.evidence.{i:03d}", col, (x, y, z), (1.2, 1.2, 1.2), "tok.text", bevel=0.1)

    # Reasoning layer: claims as violet spheres hung from the beam.
    claims = []
    for i in range(12):
        x = nx - 17.0 + i * 3.1 + rng.uniform(-0.6, 0.6)
        y = ny + rng.uniform(-2.5, 2.5)
        z = 12.0 + rng.uniform(-2.5, 3.0)
        claims.append((x, y, z))
        w.strut(f"evidence.nazar.hang.{i:03d}", col, (x, ny, 19.0), (x, y, z), 0.04, "tok.border", verts=4)
        w.sphere(f"evidence.nazar.claim.{i:03d}", col, (x, y, z), 0.8, "tok.hue-violet" if i % 3 else "tok.hue-violet-vivid", subdivisions=1)

    # Footnotes: every claim points at real evidence, except one.
    for i, (x, y, z) in enumerate(claims):
        if i == 7:
            # The dangling edge: a config pointing at a machine that is not there.
            w.strut("evidence.nazar.dangling", col, (x, y, z), (x + 6.0, y + 7.0, 3.0), 0.09, "tok.accent", verts=6)
            continue
        ex, ey, ez = evidence[(i * 5) % len(evidence)]
        w.strut(f"evidence.nazar.footnote.{i:03d}", col, (x, y, z), (ex, ey, ez + 0.6), 0.05, "tok.faint", verts=4)
    # Claims that share evidence also link sideways: the graph walk.
    for i in range(0, len(claims) - 1, 2):
        a, b = claims[i], claims[i + 1]
        w.strut(f"evidence.nazar.walk.{i:03d}", col, a, b, 0.04, "tok.hue-violet", verts=4)
    w.zone("nazar", (nx, ny))


def build_towers(w: World, col) -> None:
    for name, slug, (x, y) in (("kerms", "kerms", KERMS), ("imc", "imc-prosperity-4", IMC)):
        w.box(f"evidence.{name}.base", col, (x, y, 0.5), (20.0, 10.0, 1.0), "tok.surface", drivable=True, bevel=0.2)
        w.box(f"evidence.{name}.zero", col, (x, y - 4.6, 1.15), (20.0, 0.3, 0.3), "tok.muted")
        w.collider_box(name, (x, y, 0.5), (20.0, 10.0, 1.0))
        w.zone(slug, (x, y))


def build_evidence(w: World) -> None:
    col = w.by_district["evidence"]
    build_cypher(w, col)
    build_altigoz(w, col)
    build_nazar(w, col)
    build_towers(w, col)
    w.camera("cam.review.evidence-nazar", (NAZAR[0] + 30.0, NAZAR[1] - 40.0, 18.0), (NAZAR[0], NAZAR[1], 9.0), lens=35.0)
    w.camera("cam.review.evidence-altigoz", (ALTIGOZ[0] + 24.0, ALTIGOZ[1] - 34.0, 16.0), (ALTIGOZ[0], ALTIGOZ[1], 3.0), lens=35.0)
    w.camera("cam.review.evidence-towers", (KERMS[0] + 30.0, KERMS[1] - 34.0, 16.0), (IMC[0] - 13.0, KERMS[1], 3.0), lens=35.0)


def main() -> World:
    w = World()
    w.wipe_district("evidence", ["cypher", "altigoz", "nazar", "kerms", "imc-prosperity-4"], ["nazar", "kerms", "imc"])
    build_evidence(w)
    w.rebuild_ground()
    return w


if __name__ == "__main__":
    main()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
