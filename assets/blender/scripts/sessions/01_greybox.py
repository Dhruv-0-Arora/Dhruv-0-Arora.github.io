"""Session 01: greybox blockout of the whole world.

Idempotent: wipes every object in the scene and rebuilds from scratch, so
it can be re-run in the live Blender through the MCP or headlessly:

    blender --background --python-exit-code 1 \
        --python assets/blender/scripts/sessions/01_greybox.py -- \
        --save assets/blender/world.blend

Later sessions (02_terminal.py, ...) replace one district at a time on top
of this. Re-creating the world from git means running the sessions in
order. This file stays the record of the layout: district centers, road
graph, rail loop, zones, review cameras.
"""

from __future__ import annotations

import math
import os
import random
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from worldlib import CENTERS, HUB, LOOKS, RAIL, World, save, session_args  # noqa: E402


def build_shared(w: World) -> None:
    col = w.by_district["shared"]
    size = w.contract["world"]["sizeMeters"]
    w.plane("shared.ground.base", col, (0, 0, 0), (size, size), "tok.bg")
    # Accent rim: a wider, lower cylinder so only a 1 m ring shows around the plaza.
    w.cylinder("shared.hub.ring", col, (0, 0, 0.15), 19.0, 0.3, "tok.accent", verts=32)
    w.cylinder("shared.hub.plaza", col, (0, 0, 0.3), 18.0, 0.6, "tok.surface", verts=32, drivable=True)
    # Spawn pad: the Dozer starts here facing -Y toward the rail start.
    w.cylinder("shared.hub.pad", col, (0, 0, 0.65), 2.5, 0.1, "tok.border", verts=24)
    for district, center in CENTERS.items():
        d = center - HUB
        mid = HUB + d * 0.5
        w.box(
            f"shared.road.{district}",
            col,
            (mid.x, mid.y, 0.05),
            (d.length, 8.0, 0.1),
            "tok.surface-2",
            yaw=math.atan2(d.y, d.x),
            drivable=True,
        )


def build_terminal(w: World) -> None:
    col = w.by_district["terminal"]
    c = CENTERS["terminal"]
    rng = random.Random(1)

    ax, ay = c.x, c.y + 10.0
    w.cylinder("terminal.astute.base", col, (ax, ay, 0.4), 12.0, 0.8, "tok.surface", verts=24, drivable=True)
    w.cylinder("terminal.astute.mast", col, (ax, ay, 9.0), 0.4, 18.0, "tok.border", verts=8)
    for i in range(40):
        importance = 1 + min(4, int(rng.expovariate(1.2)))
        r = rng.uniform(1.5, 9.0)
        a = rng.uniform(0, math.tau)
        z = 3.0 + rng.uniform(0, 14.0)
        w.box(f"terminal.astute.node.{i:03d}", col, (ax + r * math.cos(a), ay + r * math.sin(a), z), (0.8, 0.8, 0.8), f"ramp.importance.{importance}")
    w.collider_box("astute", (ax, ay, 0.4), (24.0, 24.0, 0.8))

    for side, sx in (("left", c.x - 24.0), ("right", c.x + 4.0)):
        base_c = (sx, c.y - 26.0, 0.6)
        w.box(f"terminal.keyboard.{side}", col, base_c, (22.0, 14.0, 1.2), "tok.surface-2", yaw=0.12 if side == "left" else -0.12)
        w.collider_box(f"keyboard-{side}", base_c, (22.0, 14.0, 1.2))
        for row in range(3):
            for k in range(6):
                w.box(f"terminal.keyboard.key.{side[0]}{row}{k}", col, (sx - 8.0 + k * 3.2, c.y - 21.0 - row * 3.4, 1.7), (2.6, 2.6, 1.0), "tok.hue-green")
        for k in range(2):
            w.box(f"terminal.keyboard.thumb.{side[0]}{k}", col, (sx + 2.0 + k * 3.4, c.y - 33.5, 1.7), (2.6, 3.2, 1.0), "tok.hue-green-vivid")

    gx, gy = c.x + 35.0, c.y + 40.0
    w.cylinder("terminal.bamboo.plot", col, (gx, gy, 0.15), 14.0, 0.3, "tok.surface-2", verts=24, drivable=True)
    for i in range(12):
        a = i / 12 * math.tau
        w.cylinder(f"terminal.bamboo.stalk.{i:03d}", col, (gx + 9.0 * math.cos(a), gy + 9.0 * math.sin(a), 4.0), 0.25, 8.0, "grad.dirnt", verts=6)

    w.zone("astute", (ax, ay))
    w.zone("stalk", (c.x - 10.0, c.y - 26.0))
    w.zone("dirnt", (gx, gy))


def build_evidence(w: World) -> None:
    col = w.by_district["evidence"]
    c = CENTERS["evidence"]
    rng = random.Random(2)

    w.box("evidence.cypher.ground", col, (c.x, c.y, 0.1), (150.0, 150.0, 0.2), "tok.surface-2", drivable=True)
    for i in range(7):
        a = i / 7 * math.tau
        w.cylinder(f"evidence.cypher.hex.{i:03d}", col, (c.x + 22.0 * math.cos(a), c.y - 15.0 + 22.0 * math.sin(a), 0.35), 6.0, 0.3, "tok.hue-green" if i % 3 else "tok.hue-rose", verts=6)

    px, py = c.x - 50.0, c.y - 40.0
    w.box("evidence.altigoz.plaque", col, (px, py - 12.0, 1.0), (10.0, 0.6, 2.0), "tok.text")
    for i in range(8):
        x = px - 14.0 + (i % 4) * 9.0
        y = py + (i // 4) * 10.0
        w.cylinder(f"evidence.altigoz.pole.{i:03d}", col, (x, y, 4.0), 0.3, 8.0, "tok.border", verts=8)
        w.box(f"evidence.altigoz.cone.{i:03d}", col, (x + 2.5, y, 8.0), (5.0, 1.6, 0.4), "tok.hue-sky", yaw=rng.uniform(0, math.tau))

    nx, ny = c.x, c.y + 25.0
    for sx in (-18.0, 18.0):
        tag = "w" if sx < 0 else "e"
        w.box(f"evidence.nazar.pylon.{tag}", col, (nx + sx, ny, 9.0), (1.6, 1.6, 18.0), "tok.text")
        w.collider_box(f"nazar-{tag}", (nx + sx, ny, 9.0), (1.6, 1.6, 18.0))
    w.box("evidence.nazar.beam", col, (nx, ny, 18.0), (38.0, 0.8, 0.8), "tok.text")
    for i in range(14):
        w.sphere(f"evidence.nazar.node.{i:03d}", col, (nx + rng.uniform(-15.0, 15.0), ny + rng.uniform(-4.0, 4.0), rng.uniform(6.0, 15.0)), 0.9, "tok.hue-violet" if i % 2 else "tok.hue-violet-vivid")
    w.box("evidence.nazar.dangling", col, (nx + 12.0, ny + 6.0, 5.0), (0.3, 0.3, 6.0), "tok.accent")

    for name, x in (("kerms", c.x + 45.0), ("imc", c.x + 45.0 + 26.0)):
        w.box(f"evidence.{name}.base", col, (x, c.y - 45.0, 0.5), (18.0, 12.0, 1.0), "tok.surface", drivable=True)
        w.collider_box(name, (x, c.y - 45.0, 0.5), (18.0, 12.0, 1.0))
        for i in range(6):
            up = rng.random() > 0.4
            h = rng.uniform(2.0, 9.0)
            w.box(f"evidence.{name}.candle.{i:03d}", col, (x - 7.0 + i * 2.8, c.y - 45.0, 1.0 + h / 2), (1.6, 1.6, h), "tok.hue-green" if up else "tok.hue-rose")

    w.zone("cypher", (c.x, c.y - 15.0))
    w.zone("altigoz", (px, py + 5.0))
    w.zone("nazar", (nx, ny))
    w.zone("kerms", (c.x + 45.0, c.y - 45.0))
    w.zone("imc-prosperity-4", (c.x + 71.0, c.y - 45.0))


def build_fabrication(w: World) -> None:
    col = w.by_district["fabrication"]
    c = CENTERS["fabrication"]
    rng = random.Random(3)

    w.box("fabrication.pcb.ground", col, (c.x, c.y, 0.1), (130.0, 130.0, 0.2), "tok.surface-2", drivable=True)
    for i in range(6):
        horizontal = i % 2 == 0
        off = -40.0 + i * 16.0
        w.box(f"fabrication.pcb.trace.{i:03d}", col, (c.x + (0.0 if horizontal else off), c.y + (off if horizontal else 0.0), 0.25), (110.0 if horizontal else 2.0, 2.0 if horizontal else 110.0, 0.1), "tok.hue-amber")

    bx, by = c.x - 40.0, c.y - 30.0
    for i in range(10):
        w.cylinder(f"fabrication.battery.cell.{i:03d}", col, (bx, by, 1.2 + i * 2.4), 4.0, 2.2, "tok.surface", verts=20)
    w.collider_box("battery", (bx, by, 12.0), (8.0, 8.0, 24.0))
    w.box("fabrication.battery.plane.high", col, (bx, by, 21.0), (12.0, 12.0, 0.15), "tok.hue-rose")
    w.box("fabrication.battery.plane.low", col, (bx, by, 5.0), (12.0, 12.0, 0.15), "tok.hue-amber")

    ox, oy = c.x + 5.0, c.y + 15.0
    for sx in (-22.0, 22.0):
        for sy in (-14.0, 14.0):
            tag = f"{'w' if sx < 0 else 'e'}{'s' if sy < 0 else 'n'}"
            w.box(f"fabrication.orion.pylon.{tag}", col, (ox + sx, oy + sy, 8.0), (1.2, 1.2, 16.0), "tok.text")
            w.collider_box(f"orion-{tag}", (ox + sx, oy + sy, 8.0), (1.2, 1.2, 16.0))
    w.box("fabrication.orion.deck", col, (ox, oy, 16.0), (46.0, 30.0, 0.4), "tok.border")
    for i in range(27):
        x, y, z = i % 3, (i // 3) % 3, i // 9
        w.box(f"fabrication.orion.node.{i:03d}", col, (ox - 16.0 + x * 16.0, oy - 10.0 + y * 10.0, 18.0 + z * 4.0), (2.0, 2.0, 2.0), "tok.hue-sky" if rng.random() > 0.3 else "tok.hue-sky-vivid")

    rx, ry = c.x + 45.0, c.y - 40.0
    w.box("fabrication.brep.solid", col, (rx, ry, 5.0), (10.0, 10.0, 10.0), "tok.surface")
    w.collider_box("brep", (rx, ry, 5.0), (10.0, 10.0, 10.0))
    for i, (dx, dy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        w.box(f"fabrication.brep.edge.{i:03d}", col, (rx + dx * 5.2, ry + dy * 5.2, 5.0), (0.3, 0.3, 10.6), "tok.hue-violet")

    fx, fy = c.x - 30.0, c.y + 40.0
    w.box("fabrication.frc.field", col, (fx, fy, 0.3), (16.5, 8.2, 0.2), "tok.surface", drivable=True)
    for name, (dx, dy, sx, sy) in {"n": (0.0, 4.2, 16.9, 0.2), "s": (0.0, -4.2, 16.9, 0.2), "e": (8.35, 0.0, 0.2, 8.6), "w": (-8.35, 0.0, 0.2, 8.6)}.items():
        w.box(f"fabrication.frc.wall.{name}", col, (fx + dx, fy + dy, 0.7), (sx, sy, 0.6), "tok.accent")
        w.collider_box(f"frc-{name}", (fx + dx, fy + dy, 0.7), (sx, sy, 0.6))

    w.zone("wisconsin-racing", (bx, by))
    w.zone("orion", (ox, oy))
    w.zone("agentic-cad-spike", (rx, ry))
    w.zone("synthesis", (fx, fy))


def build_redacted(w: World) -> None:
    col = w.by_district["redacted"]
    c = CENTERS["redacted"]
    # One sealed block. on-accent is near-black in both themes.
    w.box("redacted.building.block", col, (c.x, c.y, 9.0), (30.0, 30.0, 18.0), "tok.on-accent")
    w.box("redacted.building.plinth", col, (c.x, c.y, 0.25), (40.0, 40.0, 0.5), "tok.surface-2", drivable=True)
    w.collider_box("redacted", (c.x, c.y, 9.0), (30.0, 30.0, 18.0))
    w.zone("swiftlabs-platform", (c.x, c.y))


def build_rails(w: World) -> None:
    curve = bpy.data.curves.new("rail.path", type="CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 24
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(RAIL) - 1)
    for point, co in zip(spline.bezier_points, RAIL):
        point.co = co
        point.handle_left_type = point.handle_right_type = "AUTO"
    spline.use_cyclic_u = True
    rail = bpy.data.objects.new("rail.path", curve)
    w.rails.objects.link(rail)
    for i, (t, target) in enumerate(LOOKS):
        look = w.empty(f"rail.look.{i:02d}", w.rails, target, size=1.5)
        if t is not None:
            look["t"] = t


def build_review_cameras(w: World) -> None:
    from mathutils import Vector

    w.camera("cam.review.overview", (0.0, -420.0, 300.0), (0.0, 20.0, 0.0), lens=28.0)
    w.camera("cam.review.hub", (40.0, -70.0, 30.0), (0.0, 0.0, 2.0), lens=35.0)
    for district, center in CENTERS.items():
        offset = Vector((60.0, -90.0, 55.0))
        w.camera(f"cam.review.{district}", tuple(center + offset), (center.x, center.y, 4.0), lens=32.0)


def build() -> World:
    w = World()
    w.wipe_all()
    build_shared(w)
    build_terminal(w)
    build_evidence(w)
    build_fabrication(w)
    build_redacted(w)
    build_rails(w)
    w.rebuild_ground()
    build_review_cameras(w)
    bpy.context.scene.camera = bpy.data.objects["cam.review.overview"]
    return w


if __name__ == "__main__":
    build()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
