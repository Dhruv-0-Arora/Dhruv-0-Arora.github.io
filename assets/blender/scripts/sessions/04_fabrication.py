"""Session 04: Fabrication district detail pass (the Physical arc).

Replaces ``World/Fabrication`` plus its zones and colliders on top of the
earlier sessions:

    blender --background --python-exit-code 1 assets/blender/world.blend \
        --python assets/blender/scripts/sessions/04_fabrication.py -- \
        --save assets/blender/world.blend

Each installation is built at a local origin (its anchor at (0, 0), its
floor at z = 0, its front facing local -Y as seen from the hub) and then
moved onto its terrace in the range with ``World.place``, which turns that
front toward the hub. Footprints fit inside the terrace radius, since the
ground banks away quickly outside it.

Installations:

* PCB board (Wisconsin Racing), terrace radius 22: a 34 x 26 m board.
  Copper traces with 45-degree bends are the roads, pads sit at the
  junctions, and chips block the way. The battery stack rises from the
  left half of the same board with the over- and under-voltage threshold
  planes the firmware guards.
* Orion gantry, radius 24: the 27-node compute DAG hung from a 46 x 18 m
  aerial frame, laid out as the real pipeline from decode to display
  transform. Nodes downstream of the exposure slider are the vivid ones:
  moving it recomputes only them.
* B-rep kernel, radius 16: a solid with its edges and vertices made
  legible, and next to it the wire-only twin the differential tests
  compare against OCCT.
* FRC field (Synthesis), radius 24: 16.5 x 8.2 m at real scale, low walls,
  driver stations at both ends, and a few game pieces. The Dozer's home.
"""

from __future__ import annotations

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from worldlib import World, polar, save, session_args  # noqa: E402

BOARD = (34.0, 26.0)
BATTERY = (-9.0, 0.0)


def build_pcb(w: World, col) -> None:
    bw, bd = BOARD
    w.box("fabrication.pcb.ground", col, (0.0, 0.0, 0.1), (bw, bd, 0.2), "tok.surface-2", drivable=True)
    # Silkscreen outline and mounting holes at the corners.
    inset = 0.8
    for name, (dx, dy, sx, sy) in {
        "n": (0.0, bd / 2 - inset, bw - 2 * inset, 0.4),
        "s": (0.0, -bd / 2 + inset, bw - 2 * inset, 0.4),
        "e": (bw / 2 - inset, 0.0, 0.4, bd - 2 * inset),
        "w": (-bw / 2 + inset, 0.0, 0.4, bd - 2 * inset),
    }.items():
        w.box(f"fabrication.pcb.silk.{name}", col, (dx, dy, 0.22), (sx, sy, 0.06), "tok.border", drivable=True)
    for i, (sx, sy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        w.cylinder(f"fabrication.pcb.hole.{i:03d}", col, (sx * (bw / 2 - 2.2), sy * (bd / 2 - 2.2), 0.24), 1.0, 0.1, "tok.hue-amber", verts=16, drivable=True)

    # Traces on the right half (the battery holds the left): a bus with
    # branches that jog at 45 degrees to a pad.
    trace_w = 1.2
    n = 0

    def trace(a, b):
        nonlocal n
        ax, ay = a
        bx, by = b
        length = math.hypot(bx - ax, by - ay)
        w.box(f"fabrication.pcb.trace.{n:03d}", col, ((ax + bx) / 2, (ay + by) / 2, 0.25), (length + trace_w, trace_w, 0.1), "tok.hue-amber", yaw=math.atan2(by - ay, bx - ax), drivable=True)
        n += 1

    def pad(p, r=1.0):
        nonlocal n
        w.cylinder(f"fabrication.pcb.pad.{n:03d}", col, (p[0], p[1], 0.26), r, 0.12, "tok.hue-amber", verts=12, drivable=True)
        n += 1

    bus_y = -4.0
    trace((-1.0, bus_y), (15.0, bus_y))
    for i, x in enumerate((0.0, 6.0, 12.0)):
        up = i % 2 == 0
        # Up branches end just under a chip's pins; the down branch stays
        # inside the silkscreen.
        dy = 6.0 if up else -5.0
        bend = 2.0 if up else -2.0
        stub = 2.0 if x < 10.0 else 1.0
        jog = abs(bend)
        # Vertical run, 45-degree jog, then a horizontal stub to a pad.
        trace((x, bus_y), (x, bus_y + dy))
        trace((x, bus_y + dy), (x + jog, bus_y + dy + bend))
        trace((x + jog, bus_y + dy + bend), (x + jog + stub, bus_y + dy + bend))
        pad((x + jog + stub, bus_y + dy + bend))
        pad((x, bus_y))
    # Chips: ICs the roads route around.
    for i, (x, y, sx, sy) in enumerate(((2.0, 8.5, 7.0, 5.0), (10.0, 8.5, 7.5, 5.0))):
        size = (sx, sy, 1.6)
        w.box(f"fabrication.pcb.chip.{i:03d}", col, (x, y, 0.2 + size[2] / 2), size, "tok.text", bevel=0.15)
        w.collider_box(f"chip-{i}", (x, y, 0.2 + size[2] / 2), size)
        for k in range(5):
            w.box(f"fabrication.pcb.chip.{i:03d}.pin.{k}", col, (x - sx / 2 + 1.0 + k * (sx - 2.0) / 4, y - sy / 2 - 0.5, 0.3), (0.5, 0.8, 0.1), "tok.hue-amber", drivable=True)
    w.zone("wisconsin-racing", (0.0, 0.0))


def build_battery(w: World, col) -> None:
    bx, by = BATTERY
    cells = 10
    pitch = 2.3
    for i in range(cells):
        w.cylinder(f"fabrication.battery.cell.{i:03d}", col, (bx, by, 1.2 + i * pitch), 4.0, 2.1, "tok.surface", verts=24)
        w.cylinder(f"fabrication.battery.cell.{i:03d}.cap", col, (bx, by, 1.2 + i * pitch + 1.1), 1.0, 0.1, "tok.muted", verts=12)
    # Bus bars up two sides; balancing leads as thin struts.
    top = 1.2 + (cells - 1) * pitch + 1.0
    for side, sx in (("e", 4.3), ("w", -4.3)):
        w.box(f"fabrication.battery.bus.{side}", col, (bx + sx, by, top / 2), (0.5, 1.2, top), "tok.hue-amber")
    for i in range(cells):
        z = 1.2 + i * pitch
        w.strut(f"fabrication.battery.lead.{i:03d}", col, (bx + 4.0, by + 1.0, z), (bx + 4.3, by + 0.6, z + 0.6), 0.06, "tok.faint", verts=4)
    w.collider_box("battery", (bx, by, top / 2), (9.4, 9.4, top))
    # Threshold planes the protection code holds the pack between.
    w.box("fabrication.battery.plane.high", col, (bx, by, top + 1.6), (13.0, 13.0, 0.12), "tok.hue-rose")
    w.box("fabrication.battery.plane.low", col, (bx, by, 2.6), (13.0, 13.0, 0.12), "tok.hue-amber")
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        w.strut(f"fabrication.battery.post.{i:03d}", col, polar((bx, by), 8.8, a, 0.2), polar((bx, by), 8.8, a, top + 1.6), 0.12, "tok.border", verts=6)


# Orion's pipeline as a DAG: (name, stage column, row, upstream names).
ORION_DAG = [
    ("decode", 0, 1, []),
    ("linearize", 1, 1, ["decode"]),
    ("white-balance", 2, 1, ["linearize"]),
    ("white-clip", 3, 1, ["white-balance"]),
    ("demosaic", 4, 1, ["white-clip"]),
    ("highlight", 5, 1, ["demosaic"]),
    ("denoise-1", 6, 0, ["highlight"]),
    ("denoise-2", 6, 1, ["highlight"]),
    ("denoise-3", 6, 2, ["highlight"]),
    ("denoise-4", 7, 1, ["denoise-1", "denoise-2", "denoise-3"]),
    ("lens", 8, 1, ["denoise-4"]),
    ("sharpen", 9, 1, ["lens"]),
    ("camera-matrix", 10, 1, ["sharpen"]),
    ("guided", 11, 1, ["camera-matrix"]),
    ("exposure", 12, 0, ["guided"]),
    ("tone", 12, 1, ["guided"]),
    ("color", 12, 2, ["guided"]),
    ("grade-lift", 13, 0, ["exposure", "tone"]),
    ("grade-gamma", 13, 1, ["tone", "color"]),
    ("grade-gain", 13, 2, ["color"]),
    ("agx", 14, 1, ["grade-lift", "grade-gamma", "grade-gain"]),
    ("curve", 15, 1, ["agx"]),
    ("crop", 16, 0, ["curve"]),
    ("straighten", 16, 1, ["curve"]),
    ("orientation", 16, 2, ["curve"]),
    ("display", 17, 1, ["crop", "straighten", "orientation"]),
    ("viewport", 18, 1, ["display"]),
]


def downstream_of(name: str) -> set[str]:
    out = {name}
    changed = True
    while changed:
        changed = False
        for node, _, _, ups in ORION_DAG:
            if node not in out and any(u in out for u in ups):
                out.add(node)
                changed = True
    return out


def build_orion(w: World, col) -> None:
    assert len(ORION_DAG) == 27
    deck_w, deck_d, deck_z = 46.0, 18.0, 17.0
    for sx in (-21.0, 21.0):
        for sy in (-7.0, 7.0):
            tag = f"{'w' if sx < 0 else 'e'}{'s' if sy < 0 else 'n'}"
            w.box(f"fabrication.orion.pylon.{tag}", col, (sx, sy, deck_z / 2), (1.3, 1.3, deck_z), "tok.text", bevel=0.12)
            w.box(f"fabrication.orion.foot.{tag}", col, (sx, sy, 0.35), (3.6, 3.6, 0.7), "tok.border", drivable=True)
            w.collider_box(f"orion-{tag}", (sx, sy, deck_z / 2), (1.3, 1.3, deck_z))
    # An open frame, not a solid deck: the DAG must read from above and below.
    w.box("fabrication.orion.beam.n", col, (0.0, deck_d / 2, deck_z), (deck_w, 0.7, 0.7), "tok.text")
    w.box("fabrication.orion.beam.s", col, (0.0, -deck_d / 2, deck_z), (deck_w, 0.7, 0.7), "tok.text")
    for column in range(19):
        x = -deck_w / 2 + 3.0 + column * (deck_w - 6.0) / 18
        w.box(f"fabrication.orion.tie.{column:03d}", col, (x, 0.0, deck_z), (0.35, deck_d, 0.35), "tok.border")

    hot = downstream_of("exposure")
    positions = {}
    node = 1.6
    for name, column, row, _ in ORION_DAG:
        x = -deck_w / 2 + 3.0 + column * (deck_w - 6.0) / 18
        y = (row - 1) * 5.5
        z = deck_z - 3.5 - (row - 1) * 0.8
        positions[name] = (x, y, z)
        mat = "tok.hue-sky-vivid" if name in hot else "tok.hue-sky"
        w.box(f"fabrication.orion.node.{name}", col, (x, y, z), (node, node, node), mat, bevel=0.2)
        w.strut(f"fabrication.orion.hang.{name}", col, (x, y, deck_z - 0.17), (x, y, z + node / 2), 0.05, "tok.border", verts=4)
    for name, _, _, ups in ORION_DAG:
        for up in ups:
            mat = "tok.hue-sky-vivid" if up in hot and name in hot else "tok.faint"
            w.strut(f"fabrication.orion.edge.{up}.{name}", col, positions[up], positions[name], 0.07, mat, verts=5)
    w.zone("orion", (0.0, 0.0))


def build_brep(w: World, col) -> None:
    size = (10.0, 8.0, 6.0)
    # The solids stand on the plinth top, so the bottom vertices do not
    # sink into the terrace.
    base = 0.3

    def solid(prefix: str, origin, faces: bool):
        x, y = origin
        z = base + size[2] / 2
        if faces:
            w.box(f"{prefix}.block", col, (x, y, z), size, "tok.surface")
            w.cylinder(f"{prefix}.boss", col, (x, y, base + size[2] + 1.5), 2.6, 3.0, "tok.surface", verts=24)
        # Edges: the 12 block edges plus the boss circles.
        hx, hy, hz = size[0] / 2, size[1] / 2, base + size[2]
        corners = [(x + sx * hx, y + sy * hy) for sx in (-1, 1) for sy in (-1, 1)]
        k = 0
        for cx, cy in corners:
            w.strut(f"{prefix}.edge.{k:03d}", col, (cx, cy, base), (cx, cy, hz), 0.08, "tok.hue-violet", verts=5)
            k += 1
        for zz in (base, hz):
            for a, b in (((x - hx, y - hy), (x + hx, y - hy)), ((x + hx, y - hy), (x + hx, y + hy)), ((x + hx, y + hy), (x - hx, y + hy)), ((x - hx, y + hy), (x - hx, y - hy))):
                w.strut(f"{prefix}.edge.{k:03d}", col, (a[0], a[1], zz), (b[0], b[1], zz), 0.08, "tok.hue-violet", verts=5)
                k += 1
        for zz in (hz, hz + 3.0):
            w.torus(f"{prefix}.edge.{k:03d}", col, (x, y, zz), 2.6, 0.08, "tok.hue-violet", major_segments=24, minor_segments=5)
            k += 1
        # Vertices.
        for i, (cx, cy) in enumerate(corners):
            for j, zz in enumerate((base, hz)):
                w.sphere(f"{prefix}.vertex.{i}{j}", col, (cx, cy, zz), 0.22, "tok.hue-violet-vivid", subdivisions=1)

    solid("fabrication.brep.occt", (-8.0, 0.0), faces=True)
    solid("fabrication.brep.rust", (8.0, 0.0), faces=False)
    w.collider_box("brep-occt", (-8.0, 0.0, base + size[2] / 2), size)
    w.collider_box("brep-rust", (8.0, 0.0, base + size[2] / 2), size)
    w.box("fabrication.brep.plinth", col, (0.0, 0.0, 0.15), (28.0, 13.0, 0.3), "tok.surface-2", drivable=True, bevel=0.1)
    # The parity bar between them: the conformance run's measured overlap.
    w.box("fabrication.brep.parity", col, (0.0, -5.8, 0.55), (13.0, 0.4, 0.5), "tok.border")
    w.box("fabrication.brep.parity.fill", col, (-0.8, -5.8, 0.6), (11.4, 0.42, 0.52), "tok.hue-violet")
    w.zone("agentic-cad-spike", (0.0, 0.0))


def build_frc(w: World, col) -> None:
    L, W = 16.5, 8.2
    w.box("fabrication.frc.floor", col, (0.0, 0.0, 0.3), (L, W, 0.2), "tok.surface", drivable=True)
    w.box("fabrication.frc.apron", col, (0.0, 0.0, 0.1), (L + 6.0, W + 6.0, 0.2), "tok.surface-2", drivable=True)
    wall_h = 0.5
    for name, (dy, sx, sy) in {"n": (W / 2, L, 0.15), "s": (-W / 2, L, 0.15)}.items():
        w.box(f"fabrication.frc.wall.{name}", col, (0.0, dy, 0.4 + wall_h / 2), (sx, sy, wall_h), "tok.border")
        w.collider_box(f"frc-{name}", (0.0, dy, 0.4 + wall_h / 2), (sx, sy, wall_h))
    # Driver stations: taller end walls in alliance accents.
    for name, dx, mat in (("e", L / 2, "tok.hue-rose"), ("w", -L / 2, "tok.hue-sky")):
        w.box(f"fabrication.frc.station.{name}", col, (dx, 0.0, 0.4 + 1.0), (0.2, W + 0.3, 2.0), mat)
        w.collider_box(f"frc-{name}", (dx, 0.0, 1.4), (0.2, W + 0.3, 2.0))
    # Game pieces and a central hub.
    w.cylinder("fabrication.frc.hub", col, (0.0, 0.0, 0.4 + 0.6), 1.2, 1.2, "tok.muted", verts=16)
    w.collider_box("frc-hub", (0.0, 0.0, 1.0), (2.4, 2.4, 1.2))
    for i in range(6):
        px, py, _ = polar((0.0, 0.0), 3.0 + (i % 2) * 1.8, i * math.pi / 3, 0.0)
        w.sphere(f"fabrication.frc.cargo.{i:03d}", col, (px, py, 0.64), 0.24, "tok.hue-amber", subdivisions=1)
    w.zone("synthesis", (0.0, 0.0))


def build_fabrication(w: World) -> None:
    col = w.by_district["fabrication"]
    # The board and the battery share one terrace, so they move as two
    # bodies with the same anchor and yaw.
    build_pcb(w, col)
    build_battery(w, col)
    board = w.place_site("fabrication.pcb.", "wisconsin-racing", colliders=["chip"], zones=["wisconsin-racing"])
    w.place_site("fabrication.battery.", "wisconsin-racing", colliders=["battery"])
    w.review_camera("cam.review.fabrication-board", board, (22.0, -48.0, 30.0), (0.0, 0.0, 11.0))

    build_orion(w, col)
    orion = w.place_site("fabrication.orion.", "orion", colliders=["orion"], zones=["orion"])
    w.review_camera("cam.review.fabrication-orion", orion, (30.0, -50.0, 24.0), (0.0, 0.0, 10.0))

    build_brep(w, col)
    brep = w.place_site("fabrication.brep.", "agentic-cad-spike", colliders=["brep"], zones=["agentic-cad-spike"])
    w.review_camera("cam.review.fabrication-brep", brep, (18.0, -32.0, 14.0), (0.0, 0.0, 3.0))

    build_frc(w, col)
    frc = w.place_site("fabrication.frc.", "synthesis", colliders=["frc"], zones=["synthesis"])
    w.review_camera("cam.review.fabrication-frc", frc, (12.0, -20.0, 10.0), (0.0, 0.0, 0.5))


def main() -> World:
    w = World()
    w.wipe_district("fabrication", ["wisconsin-racing", "orion", "agentic-cad-spike", "synthesis"], ["battery", "orion", "brep", "frc", "chip"])
    build_fabrication(w)
    w.rebuild_ground()
    return w


if __name__ == "__main__":
    main()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
