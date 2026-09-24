"""Session 05: Shared hub polish and the Redacted building.

Replaces ``World/Shared`` and ``World/Redacted`` (plus their zones and
colliders) on top of the earlier sessions:

    blender --background --python-exit-code 1 assets/blender/world.blend \
        --python assets/blender/scripts/sessions/05_shared_redacted.py -- \
        --save assets/blender/world.blend

* Shared: the hub is the flat pad at the origin (``HUB_PAD_RADIUS``, cut
  by session 01; the terrain is the ground, so there is no ground plane).
  The plaza gets an inlay ring, a spawn pad where the Dozer waits, and
  four radial guides pointing down the hiking trails that leave the pad
  toward the gateway sites. Topographic contour rings and a chevron loop
  mark the plaza. On the south edge of the pad, beside the rail at
  ``rangelib.HUB_STATION``, a low station platform is where the visitor
  boards the train. Nothing else stands on the pad: the runtime hangs the
  Flyer and the photo carousel there. ``zone.hub`` lets the overlay show
  the how-to guide at spawn.
* Redacted: one sealed block, chamfered, with a single seal band and a
  ring of bollards, built at local (0, 0) and placed on the
  swiftlabs-platform terrace facing the hub. Nothing else, by design: the
  confidentiality rule is the installation. No text, no windows, no door.
"""

from __future__ import annotations

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

import rangelib as R  # noqa: E402
from worldlib import HUB, World, polar, save, session_args  # noqa: E402

REDACTED = "swiftlabs-platform"
REDACTED_BLOCK = 22.0  # side of the sealed block, m

STATION_LEN = 14.0
STATION_DEPTH = 3.0
STATION_GAP = 1.4  # curb face to rail centreline; the cars are 1.7 m wide
STATION_SKIRT = 0.4  # how far the platform and curb reach below the pad level
STATION_TRAIN_MID = 3.25  # the waiting train's middle, behind the seat along the rail


def build_shared(w: World) -> None:
    col = w.by_district["shared"]
    w.cylinder("shared.hub.ring", col, (0, 0, 0.15), 19.0, 0.3, "tok.accent", verts=48)
    w.cylinder("shared.hub.plaza", col, (0, 0, 0.3), 18.0, 0.6, "tok.surface", verts=48, drivable=True)
    w.cylinder("shared.hub.inlay", col, (0, 0, 0.62), 9.0, 0.06, "tok.surface-2", verts=48, drivable=True)
    w.cylinder("shared.hub.pad", col, (0, 0, 0.66), 2.5, 0.08, "tok.border", verts=32, drivable=True)
    build_hub_marks(w, col)
    w.zone("hub", (0.0, 0.0))

    # Radial guides on the plaza pointing down the four trail spokes.
    for slug in R.GATEWAYS:
        d = R.terrace_front(slug)
        d.z = 0.0
        d.normalize()
        yaw = math.atan2(d.y, d.x)
        g = HUB + d * 13.5
        w.box(f"shared.hub.guide.{slug}", col, (g.x, g.y, 0.64), (9.0, 0.5, 0.05), "tok.border", yaw=yaw, drivable=True)

    build_station(w, col)


def rail_points() -> list[Vector]:
    """The rail loop in world space. Session 01 starts the loop at the hub
    station, so index 0 is t = 0, where the train waits."""
    rail = bpy.data.objects["rail.path"]
    return [rail.matrix_world @ p.co.xyz for p in rail.data.splines[0].points]


def build_station(w: World, col) -> None:
    """The boarding platform beside the rail at the hub station, with a low
    curb along its rail side so the Dozer cannot roll onto the track.

    The line leaves the station heading west and bends away south-west, so
    it runs a few metres outside the pad rim rather than along it. The
    platform follows the real track (read from ``rail.path``) instead of a
    fixed spot: it is centred on the train as it waits at t = 0 (the cars
    trail east of the seat), squared to the chord of the track along its
    length and set in so the curb face keeps ``STATION_GAP`` from the rail
    centreline at the nearest point. The ground there is the flat pad
    shoulder, level with the pad to a few centimetres."""
    pts = rail_points()
    # Walk back (east, behind the seat) to the middle of the waiting train.
    walked, centre = 0.0, pts[0]
    for p in reversed(pts):
        walked += (p.xy - centre.xy).length
        centre = p
        if walked >= STATION_TRAIN_MID:
            break
    span = [p for p in pts[-40:] + pts[:40] if (p.xy - centre.xy).length <= STATION_LEN / 2 + 1.0]
    head, tail = span[-1].xy, span[0].xy
    along = (head - tail).normalized()
    yaw = math.atan2(along.y, along.x)
    # The normal toward the hub, and how far the track bulges toward it.
    n = Vector((-along.y, along.x))
    if n.dot(-centre.xy) < 0:
        n = -n
    mid = (head + tail) * 0.5
    reach = max((p.xy - mid).dot(n) for p in span)
    face = mid + n * (reach + STATION_GAP)
    curb = face + n * 0.15
    deck = face + n * (0.3 + STATION_DEPTH / 2)
    # Both run STATION_SKIRT below z = 0 so the shoulder dipping away past
    # the pad rim never shows a gap under them.
    w.box("shared.station.platform", col, (deck.x, deck.y, (0.5 - STATION_SKIRT) / 2), (STATION_LEN, STATION_DEPTH, 0.5 + STATION_SKIRT), "tok.surface", yaw=yaw, drivable=True)
    w.box("shared.station.curb", col, (curb.x, curb.y, (0.7 - STATION_SKIRT) / 2), (STATION_LEN, 0.3, 0.7 + STATION_SKIRT), "tok.border", yaw=yaw)


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
    """Built at local (0, 0) with its front on local -Y, then placed on the
    terrace (radius 22) as one rigid body turned to face the hub."""
    col = w.by_district["redacted"]
    w.box("redacted.building.plinth", col, (0, 0, 0.25), (32.0, 32.0, 0.5), "tok.surface-2", drivable=True, bevel=0.15)
    w.box("redacted.building.step", col, (0, 0, 0.7), (26.0, 26.0, 0.4), "tok.border", drivable=True, bevel=0.1)
    w.box("redacted.building.block", col, (0, 0, 0.9 + 8.0), (REDACTED_BLOCK, REDACTED_BLOCK, 16.0), "tok.on-accent", bevel=0.35)
    w.box("redacted.building.seal", col, (0, 0, 10.5), (22.4, 22.4, 0.5), "tok.text")
    for i in range(20):
        a = i / 20 * math.tau
        w.cylinder(f"redacted.bollard.{i:03d}", col, polar((0.0, 0.0), 15.0, a, 0.5 + 0.45), 0.35, 0.9, "tok.muted", verts=10)
    w.collider_box("redacted", (0.0, 0.0, 0.9 + 8.0), (REDACTED_BLOCK, REDACTED_BLOCK, 16.0))
    w.zone(REDACTED, (0.0, 0.0))
    T = w.place_site("redacted.", REDACTED, colliders=["redacted"], zones=[REDACTED])
    w.review_camera("cam.review.redacted-close", T, (26.0, -32.0, 14.0), (0.0, 0.0, 7.0))


def main() -> World:
    w = World()
    w.wipe_district("shared", ["hub"], [])
    w.wipe_district("redacted", [REDACTED], ["redacted"])
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
