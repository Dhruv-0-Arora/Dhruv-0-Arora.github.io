"""Session 05: Shared hub polish and the Redacted building.

Replaces ``World/Shared`` and ``World/Redacted`` (plus their zones and
colliders) on top of the earlier sessions:

    blender --background --python-exit-code 1 assets/blender/world.blend \
        --python assets/blender/scripts/sessions/05_shared_redacted.py -- \
        --save assets/blender/world.blend

* Shared: the hub plaza gets an inlay ring, radial guides toward each road,
  curbs along the roads, and a pair of gate pylons where each road enters
  its district. The spawn pad is where the Dozer waits. Topographic contour
  rings and a chevron loop mark the plaza; the runtime hangs the photo
  carousel and the project orrery above it. ``zone.hub`` lets the overlay
  show the how-to guide at spawn.
* Redacted: one sealed block, chamfered, with a single seal band and a
  ring of bollards. Nothing else, by design: the confidentiality rule is
  the installation. No text, no windows, no door.
"""

from __future__ import annotations

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from worldlib import CENTERS, HUB, World, polar, save, session_args  # noqa: E402

ROAD_W = 8.0


def build_shared(w: World) -> None:
    col = w.by_district["shared"]
    size = w.contract["world"]["sizeMeters"]
    w.plane("shared.ground.base", col, (0, 0, 0), (size, size), "tok.bg")
    w.cylinder("shared.hub.ring", col, (0, 0, 0.15), 19.0, 0.3, "tok.accent", verts=48)
    w.cylinder("shared.hub.plaza", col, (0, 0, 0.3), 18.0, 0.6, "tok.surface", verts=48, drivable=True)
    w.cylinder("shared.hub.inlay", col, (0, 0, 0.62), 9.0, 0.06, "tok.surface-2", verts=48, drivable=True)
    w.cylinder("shared.hub.pad", col, (0, 0, 0.66), 2.5, 0.08, "tok.border", verts=32, drivable=True)
    build_hub_marks(w, col)
    w.zone("hub", (0.0, 0.0))

    for district, center in CENTERS.items():
        d = center - HUB
        yaw = math.atan2(d.y, d.x)
        mid = HUB + d * 0.5
        w.box(f"shared.road.{district}", col, (mid.x, mid.y, 0.05), (d.length, ROAD_W, 0.1), "tok.surface-2", yaw=yaw, drivable=True)
        # Curbs along both edges, from the plaza rim to the district.
        for side, s in (("l", 1.0), ("r", -1.0)):
            nx, ny = -math.sin(yaw) * s * (ROAD_W / 2 + 0.2), math.cos(yaw) * s * (ROAD_W / 2 + 0.2)
            start = HUB + d.normalized() * 19.5
            end = center
            cm = (start + end) * 0.5
            w.box(f"shared.road.{district}.curb.{side}", col, (cm.x + nx, cm.y + ny, 0.12), ((end - start).length, 0.4, 0.24), "tok.border", yaw=yaw, drivable=True)
        # Radial guide on the plaza pointing down the road.
        g = HUB + d.normalized() * 13.5
        w.box(f"shared.hub.guide.{district}", col, (g.x, g.y, 0.64), (9.0, 0.5, 0.05), "tok.border", yaw=yaw, drivable=True)
        # Gate pylons at the district threshold.
        gate = center - d.normalized() * 12.0
        for side, s in (("l", 1.0), ("r", -1.0)):
            px, py = gate.x - math.sin(yaw) * s * (ROAD_W / 2 + 1.6), gate.y + math.cos(yaw) * s * (ROAD_W / 2 + 1.6)
            w.box(f"shared.gate.{district}.{side}", col, (px, py, 2.4), (0.8, 0.8, 4.8), "tok.text", yaw=yaw, bevel=0.08)
            w.collider_box(f"gate-{district}-{side}", (px, py, 2.4), (0.8, 0.8, 4.8))
        w.box(f"shared.gate.{district}.lintel", col, (gate.x, gate.y, 4.9), (0.5, ROAD_W + 4.0, 0.3), "tok.text", yaw=yaw)


def build_hub_marks(w: World, col) -> None:
    """Contour rings like a topo map, a socket around the pad, and a chevron
    loop that invites the visitor to take the wheel. All thin and not
    drivable, so the ground raycast never sees them."""
    w.torus("shared.hub.socket", col, (0, 0, 0.70), 3.1, 0.08, "tok.border", major_segments=48, minor_segments=6)
    w.torus("shared.hub.contour.a", col, (0, 0, 0.66), 5.5, 0.06, "tok.border", major_segments=64, minor_segments=6)
    w.torus("shared.hub.contour.b", col, (0, 0, 0.61), 12.0, 0.06, "tok.border", major_segments=64, minor_segments=6)
    w.torus("shared.hub.contour.c", col, (0, 0, 0.61), 15.5, 0.06, "tok.border", major_segments=64, minor_segments=6)
    # Chevrons on the inlay, pointing counterclockwise around the loop.
    for i in range(8):
        a = i / 8 * math.tau
        cx, cy, _ = polar(HUB, 6.5, a)
        heading = a + math.pi / 2
        for side, s in (("l", 1.0), ("r", -1.0)):
            yaw = heading + s * 0.55
            ox, oy = -math.cos(yaw) * 0.55, -math.sin(yaw) * 0.55
            w.box(f"shared.hub.chevron.{i:02d}.{side}", col, (cx + ox, cy + oy, 0.67), (1.5, 0.3, 0.04), "tok.accent", yaw=yaw)


def build_redacted(w: World) -> None:
    col = w.by_district["redacted"]
    c = CENTERS["redacted"]
    w.box("redacted.building.plinth", col, (c.x, c.y, 0.25), (44.0, 44.0, 0.5), "tok.surface-2", drivable=True, bevel=0.15)
    w.box("redacted.building.step", col, (c.x, c.y, 0.7), (34.0, 34.0, 0.4), "tok.border", drivable=True, bevel=0.1)
    w.box("redacted.building.block", col, (c.x, c.y, 0.9 + 9.0), (30.0, 30.0, 18.0), "tok.on-accent", bevel=0.35)
    w.box("redacted.building.seal", col, (c.x, c.y, 12.0), (30.4, 30.4, 0.5), "tok.text")
    w.collider_box("redacted", (c.x, c.y, 9.9), (30.0, 30.0, 18.0))
    for i in range(20):
        a = i / 20 * math.tau
        w.cylinder(f"redacted.bollard.{i:03d}", col, polar((c.x, c.y), 20.0, a, 0.5 + 0.45), 0.35, 0.9, "tok.muted", verts=10)
    w.zone("swiftlabs-platform", (c.x, c.y))
    w.camera("cam.review.redacted-close", (c.x + 34.0, c.y - 40.0, 16.0), (c.x, c.y, 8.0), lens=35.0)


def main() -> World:
    w = World()
    w.wipe_district("shared", ["hub"], ["gate"])
    w.wipe_district("redacted", ["swiftlabs-platform"], ["redacted"])
    build_shared(w)
    build_redacted(w)
    w.rebuild_ground()
    w.camera("cam.review.hub", (40.0, -70.0, 30.0), (0.0, 0.0, 2.0), lens=35.0)
    return w


if __name__ == "__main__":
    main()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
