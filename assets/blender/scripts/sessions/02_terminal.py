"""Session 02: Terminal district detail pass (the Speed arc).

Replaces ``World/Terminal`` plus its zones and colliders on top of session
01, leaving every other district alone:

    blender --background --python-exit-code 1 assets/blender/world.blend \
        --python assets/blender/scripts/sessions/02_terminal.py -- \
        --save assets/blender/world.blend

Installations, each a real artifact of the work:

* astute monument: the graph TUI in 3D. Every node is a braille cell (the
  TUI rasterizes the graph in braille), colored by the 1-5 importance ramp,
  placed on a now/later axis (x) with height by rank, linked by wikilink
  struts. One bold focus node tops the mast.
* stalk keyboard: his own 3x6 ortholinear split with thumb keys and an
  outer modifier column, beige base and green caps, at terrain scale with
  ramps so the Dozer can drive over the keys.
* dirnt grove: the plot and stepping stones are authored; the bamboo
  itself is instanced at runtime on the zone.dirnt anchor, colored on the
  Oklab age gradient.
"""

from __future__ import annotations

import math
import os
import random
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from worldlib import CENTERS, World, polar, save, session_args  # noqa: E402

C = CENTERS["terminal"]
ASTUTE = (C.x, C.y + 10.0)
KEYBOARD = (C.x - 10.0, C.y - 26.0)
GROVE = (C.x + 35.0, C.y + 40.0)

# Braille cell geometry (meters): 2 columns x 3 rows of dots.
DOT_R = 0.17
DOT_DX = 0.46
DOT_DZ = 0.46


def braille_pattern(rng: random.Random, importance: int) -> list[int]:
    """Six bits, top-left to bottom-right. More important items are denser."""
    bits = [0] * 6
    count = min(6, 2 + importance)
    for i in rng.sample(range(6), count):
        bits[i] = 1
    return bits


def build_astute(w: World, col) -> None:
    ax, ay = ASTUTE
    rng = random.Random(11)

    # Plinth with a lower step and the now/later axis bar with five ticks.
    w.cylinder("terminal.astute.step", col, (ax, ay, 0.2), 13.5, 0.4, "tok.border", verts=32, drivable=True)
    w.cylinder("terminal.astute.base", col, (ax, ay, 0.7), 12.0, 0.6, "tok.surface", verts=32, drivable=True)
    w.box("terminal.astute.axis", col, (ax, ay - 10.0, 1.1), (22.0, 0.35, 0.2), "tok.muted")
    for i in range(5):
        w.box(f"terminal.astute.tick.{i:03d}", col, (ax - 11.0 + i * 5.5, ay - 10.0, 1.3), (0.2, 1.2, 0.6), "tok.muted")
    w.cylinder("terminal.astute.mast", col, (ax, ay, 10.0), 0.35, 19.0, "tok.border", verts=8)

    # Nodes: x is the now/later axis, height is rank, importance is color.
    nodes = []
    for i in range(96):
        importance = 1 + min(4, int(rng.expovariate(1.1)))
        urgency = rng.random() ** 1.5 * (0.5 + importance / 10.0)
        x = ax - 8.5 + 17.0 * min(1.0, urgency + rng.uniform(-0.1, 0.1))
        y = ay + rng.uniform(-6.5, 6.5)
        z = 3.0 + 14.0 * rng.random()
        nodes.append((x, y, z, importance))
        bits = braille_pattern(rng, importance)
        for b, on in enumerate(bits):
            if not on:
                continue
            cx = x + (b % 2 - 0.5) * DOT_DX
            cz = z + (1 - b // 2) * DOT_DZ
            w.sphere(f"terminal.astute.node.{i:03d}.dot{b}", col, (cx, y, cz), DOT_R, f"ramp.importance.{importance}", subdivisions=0)

    # Wikilink struts: each node to its two nearest neighbours, deduplicated.
    links = set()
    for i, (x, y, z, _) in enumerate(nodes):
        near = sorted(
            (j for j in range(len(nodes)) if j != i),
            key=lambda j: (nodes[j][0] - x) ** 2 + (nodes[j][1] - y) ** 2 + (nodes[j][2] - z) ** 2,
        )[:2]
        for j in near:
            links.add((min(i, j), max(i, j)))
    for k, (i, j) in enumerate(sorted(links)):
        a, b = nodes[i], nodes[j]
        w.strut(f"terminal.astute.edge.{k:03d}", col, (a[0], a[1], a[2]), (b[0], b[1], b[2]), 0.045, "tok.border", verts=5)

    # The focus item: bold, red, ringed, on top of the mast.
    for b in range(6):
        cx = ax + (b % 2 - 0.5) * DOT_DX * 1.6
        cz = 20.0 + (1 - b // 2) * DOT_DZ * 1.6
        w.sphere(f"terminal.astute.focus.dot{b}", col, (cx, ay, cz), DOT_R * 1.6, "ramp.importance.5", subdivisions=1)
    w.torus("terminal.astute.focus.ring", col, (ax, ay, 20.0), 1.6, 0.08, "ramp.importance.5", major_segments=32, minor_segments=6)
    bpy.data.objects["terminal.astute.focus.ring"].rotation_euler = (math.pi / 2, 0.0, 0.0)

    w.collider_box("astute-mast", (ax, ay, 10.0), (0.9, 0.9, 20.0))
    w.zone("astute", (ax, ay))


KEY = 2.6
PITCH = 3.1
CAP_H = 1.0


def keycap(w: World, col, name: str, center, size_u: float, yaw: float, origin, mat="tok.hue-green"):
    """A keycap of ``size_u`` units, rotated about the half's origin by yaw."""
    ox, oy = origin
    dx, dy = center[0] - ox, center[1] - oy
    rx = ox + dx * math.cos(yaw) - dy * math.sin(yaw)
    ry = oy + dx * math.sin(yaw) + dy * math.cos(yaw)
    return w.box(name, col, (rx, ry, center[2]), (KEY * size_u + (size_u - 1) * (PITCH - KEY), KEY, CAP_H), mat, yaw=yaw, drivable=True, bevel=0.22)


def build_keyboard(w: World, col) -> None:
    kx, ky = KEYBOARD
    for side, sign in (("left", -1.0), ("right", 1.0)):
        yaw = -sign * 0.14
        ox, oy = kx + sign * 15.0, ky
        base_z = 0.6
        w.box(f"terminal.keyboard.{side}.base", col, (ox, oy, base_z), (25.0, 16.0, 1.2), "tok.surface-2", yaw=yaw, drivable=True, bevel=0.5)
        # Ramp on the south side so the Dozer can climb onto the keys.
        ramp_len = 9.0
        rcx, rcy = ox, oy - 8.0 - ramp_len / 2 + 0.6
        ramp = w.box(f"terminal.keyboard.{side}.ramp", col, (rcx, rcy, base_z), (6.0, ramp_len, 0.25), "tok.surface-2", drivable=True)
        # Rotate the ramp about the half's origin with the base; its +Y end
        # rises to the base top, its -Y end meets the ground.
        dx, dy = rcx - ox, rcy - oy
        ramp.location = (ox + dx * math.cos(yaw) - dy * math.sin(yaw), oy + dx * math.sin(yaw) + dy * math.cos(yaw), base_z)
        ramp.rotation_euler = (math.atan2(2 * base_z, ramp_len), 0.0, yaw)

        # 3 x 6 matrix, columns indexed from the inner edge outward.
        z = base_z + 0.6 + CAP_H / 2
        for row in range(3):
            for c in range(6):
                x = ox + sign * (-8.5 + c * PITCH)
                y = oy + 4.5 - row * PITCH
                keycap(w, col, f"terminal.keyboard.{side}.key.r{row}c{c}", (x, y, z), 1.0, yaw, (ox, oy))
        # Outer modifier column, one key per row, slightly lower.
        for row in range(3):
            x = ox + sign * (-8.5 + 6 * PITCH)
            y = oy + 4.5 - row * PITCH
            keycap(w, col, f"terminal.keyboard.{side}.mod.r{row}", (x, y, z - 0.15), 1.0, yaw, (ox, oy), mat="tok.hue-green-vivid")
        # Thumb cluster: one 1.5u and one 1u, angled inward.
        tx = ox + sign * (-8.5 + 3.5 * PITCH)
        ty = oy + 4.5 - 3 * PITCH - 0.4
        keycap(w, col, f"terminal.keyboard.{side}.thumb.big", (tx - sign * 2.4, ty, z), 1.5, yaw, (ox, oy), mat="tok.hue-green-vivid")
        keycap(w, col, f"terminal.keyboard.{side}.thumb.small", (tx + sign * 1.8, ty - 0.6, z), 1.0, yaw, (ox, oy), mat="tok.hue-green-vivid")

    w.zone("stalk", (kx, ky))


def build_grove(w: World, col) -> None:
    gx, gy = GROVE
    w.cylinder("terminal.bamboo.plot", col, (gx, gy, 0.15), 14.0, 0.3, "tok.surface-2", verts=32, drivable=True)
    # A spiral of stepping stones toward the middle; the grove grows around it.
    for i in range(9):
        a = i * 0.8
        r = 12.0 - i * 1.25
        w.cylinder(f"terminal.bamboo.stone.{i:03d}", col, polar((gx, gy), r, a, 0.38), 1.1, 0.16, "tok.border", verts=10, drivable=True)
    w.cylinder("terminal.bamboo.stone.center", col, (gx, gy, 0.4), 2.2, 0.2, "tok.surface", verts=16, drivable=True)
    w.zone("dirnt", (gx, gy))


def build_terminal(w: World) -> None:
    col = w.by_district["terminal"]
    build_astute(w, col)
    build_keyboard(w, col)
    build_grove(w, col)
    w.camera("cam.review.terminal-astute", (ASTUTE[0] + 26.0, ASTUTE[1] - 34.0, 16.0), (ASTUTE[0], ASTUTE[1], 9.0), lens=35.0)
    w.camera("cam.review.terminal-keyboard", (KEYBOARD[0] + 4.0, KEYBOARD[1] - 40.0, 22.0), (KEYBOARD[0], KEYBOARD[1], 1.5), lens=35.0)
    w.camera("cam.review.terminal-grove", (GROVE[0] + 22.0, GROVE[1] - 26.0, 14.0), (GROVE[0], GROVE[1], 2.0), lens=35.0)


def main() -> World:
    w = World()
    w.wipe_district("terminal", ["astute", "stalk", "dirnt"], ["astute", "keyboard"])
    build_terminal(w)
    w.rebuild_ground()
    return w


if __name__ == "__main__":
    main()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
