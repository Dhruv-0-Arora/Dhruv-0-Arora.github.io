"""Session 03: Evidence district detail pass (the Judgment arc).

Replaces ``World/Evidence`` plus its zones and colliders on top of the
earlier sessions:

    blender --background --python-exit-code 1 assets/blender/world.blend \
        --python assets/blender/scripts/sessions/03_evidence.py -- \
        --save assets/blender/world.blend

Each installation is built at a local origin (anchor (0, 0), floor at
z = 0, front facing local -Y) and then moved onto its own terrace in the
range with ``World.place``, turned so the front faces the hub. Every
footprint fits inside its terrace radius.

Installations:

* Cypher: the terrace floor is the risk map, a round field about 80 m
  across with a raised border lip. The field is authored here; the hexes
  are instanced at runtime on zone.cypher, laid over the zone's diameter
  and cut round, and light up under the camera or the Dozer.
* AltiGoz: street segments on the ground plus a blank plaque (all text is
  DOM). The 40 sweeping camera frusta are instanced at runtime on
  zone.altigoz.
* Nazar: a two-layer graph hung from a beam between two pylons. Hard
  evidence is the lower layer of dark cubes; the model's reasoning is the
  upper layer of violet spheres; footnote struts tie every claim down to a
  piece of evidence. One strut ends in nothing: the dangling edge Nazar
  hunts, drawn in accent.
* kerms and IMC Prosperity 4: plinths with a zero line, each on its own
  terrace; the candlesticks are instanced at runtime on their zones.
"""

from __future__ import annotations

import math
import os
import random
import sys

import bmesh
import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from worldlib import World, save, session_args  # noqa: E402

# The hex field: ground top at 0.2 (the runtime lays hexes at zone z + 0.2)
# inside a border lip whose top is 0.4, like the old square plate's edge.
FIELD_RADIUS = 39.2
EDGE_RADIUS = 40.0
FIELD_VERTS = 96


def ring(w: World, name: str, col, inner: float, outer: float, z0: float, z1: float, mat: str, verts: int, drivable=False):
    """A flat annulus (a tube with square section) from z0 to z1."""
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    loops = []
    for r, z in ((inner, z0), (outer, z0), (outer, z1), (inner, z1)):
        loops.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for a in (2.0 * math.pi * i / verts for i in range(verts))])
    for k in range(4):
        a, b = loops[k], loops[(k + 1) % 4]
        for i in range(verts):
            j = (i + 1) % verts
            bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    return w._add(obj, col, mat, drivable)


def build_cypher(w: World, col):
    w.cylinder("evidence.cypher.ground", col, (0.0, 0.0, 0.1), FIELD_RADIUS, 0.2, "tok.surface-2", verts=FIELD_VERTS, drivable=True)
    # A thin border so the map has an edge to read against the terrain.
    ring(w, "evidence.cypher.edge", col, FIELD_RADIUS, EDGE_RADIUS, 0.0, 0.4, "tok.border", FIELD_VERTS, drivable=True)
    w.zone("cypher", (0.0, 0.0))
    return w.place_site("evidence.cypher.", "cypher", zones=["cypher"])


def build_altigoz(w: World, col):
    rng = random.Random(21)
    w.box("evidence.altigoz.plaque", col, (0.0, -12.0, 1.2), (10.0, 0.5, 2.4), "tok.text")
    w.box("evidence.altigoz.plaque.foot", col, (0.0, -12.0, 0.25), (11.0, 1.6, 0.5), "tok.border", drivable=True)
    # Street segments: the index is camera bearing vs street geometry.
    for i in range(7):
        a = rng.uniform(0, math.pi)
        length = rng.uniform(10.0, 18.0)
        x = rng.uniform(-8.0, 8.0)
        y = rng.uniform(-6.0, 6.0)
        w.box(f"evidence.altigoz.street.{i:03d}", col, (x, y, 0.28), (length, 1.2, 0.16), "tok.muted", yaw=a, drivable=True)
    w.zone("altigoz", (0.0, 0.0))
    return w.place_site("evidence.altigoz.", "altigoz", zones=["altigoz"])


def build_nazar(w: World, col):
    rng = random.Random(22)
    for sx in (-17.0, 17.0):
        tag = "w" if sx < 0 else "e"
        w.box(f"evidence.nazar.pylon.{tag}", col, (sx, 0.0, 9.5), (1.6, 1.6, 19.0), "tok.text", bevel=0.15)
        w.box(f"evidence.nazar.foot.{tag}", col, (sx, 0.0, 0.3), (4.0, 4.0, 0.6), "tok.border", drivable=True)
        w.collider_box(f"nazar-{tag}", (sx, 0.0, 9.5), (1.6, 1.6, 19.0))
    w.box("evidence.nazar.beam", col, (0.0, 0.0, 19.0), (36.0, 0.9, 0.9), "tok.text")

    # Evidence layer: files as dark cubes in a loose grid on the ground.
    evidence = []
    for i in range(18):
        x = -13.0 + (i % 6) * 5.2 + rng.uniform(-1.2, 1.2)
        y = -6.0 + (i // 6) * 6.0 + rng.uniform(-1.2, 1.2)
        z = 0.6
        evidence.append((x, y, z))
        w.box(f"evidence.nazar.evidence.{i:03d}", col, (x, y, z), (1.2, 1.2, 1.2), "tok.text", bevel=0.1)

    # Reasoning layer: claims as violet spheres hung from the beam.
    claims = []
    for i in range(12):
        x = -14.5 + i * 2.65 + rng.uniform(-0.6, 0.6)
        y = rng.uniform(-2.5, 2.5)
        z = 12.0 + rng.uniform(-2.5, 3.0)
        claims.append((x, y, z))
        w.strut(f"evidence.nazar.hang.{i:03d}", col, (x, 0.0, 19.0), (x, y, z), 0.04, "tok.border", verts=4)
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
    w.zone("nazar", (0.0, 0.0))
    return w.place_site("evidence.nazar.", "nazar", colliders=["nazar"], zones=["nazar"])


def build_tower(w: World, col, name: str, slug: str):
    w.box(f"evidence.{name}.base", col, (0.0, 0.0, 0.5), (20.0, 10.0, 1.0), "tok.surface", drivable=True, bevel=0.2)
    w.box(f"evidence.{name}.zero", col, (0.0, -4.6, 1.15), (20.0, 0.3, 0.3), "tok.muted")
    w.collider_box(name, (0.0, 0.0, 0.5), (20.0, 10.0, 1.0))
    w.zone(slug, (0.0, 0.0))
    return w.place_site(f"evidence.{name}.", slug, colliders=[name], zones=[slug])


def build_evidence(w: World) -> None:
    col = w.by_district["evidence"]
    t_cypher = build_cypher(w, col)
    t_altigoz = build_altigoz(w, col)
    t_nazar = build_nazar(w, col)
    t_kerms = build_tower(w, col, "kerms", "kerms")
    t_imc = build_tower(w, col, "imc", "imc-prosperity-4")

    w.review_camera("cam.review.evidence-cypher", t_cypher, (0.0, -70.0, 40.0), (0.0, 0.0, 0.0))
    w.review_camera("cam.review.evidence-nazar", t_nazar, (18.0, -40.0, 18.0), (0.0, 0.0, 9.0))
    w.review_camera("cam.review.evidence-altigoz", t_altigoz, (16.0, -32.0, 16.0), (0.0, 0.0, 1.0))
    w.review_camera("cam.review.evidence-kerms", t_kerms, (12.0, -26.0, 12.0), (0.0, 0.0, 1.0))
    w.review_camera("cam.review.evidence-imc", t_imc, (12.0, -26.0, 12.0), (0.0, 0.0, 1.0))


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
