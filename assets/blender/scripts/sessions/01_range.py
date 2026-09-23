"""Session 01: the range, the railway and the trails.

Idempotent: wipes every object in the scene and rebuilds the ground the
whole world stands on, so it can be re-run in the live Blender through the
MCP or headlessly:

    blender --background --python-exit-code 1 \
        --python assets/blender/scripts/sessions/01_range.py -- \
        --save assets/blender/world.blend

Later sessions (02_terminal.py, ...) build their installations and move
them onto the terraces cut here with ``World.place``. Re-creating the world
from git means running the sessions in order.

The world is one terrain disc (``backdrop.range.ring``) around the hub: a
rolling alpine valley floor with the flat hub pad at its centre, rising
into the Cascade skyline modelled in ``rangelib``. The mesh is a polar grid
(one centre vertex, then rings of ``SEGMENTS`` vertices at
``rangelib.ring_radii()``), coarse across the valley and fine in the range,
smooth-shaded, a single ``tok.rock`` surface: snow, forest and rock detail
are painted at runtime by the terrain shader from height, slope and aspect.
Each quad is split along the diagonal with the smaller height difference
so crests and terrace edges do not render as staircases.

Every project site is a flat terrace cut into a landmark (``rangelib.SITES``)
and marked by a ``terrace.<slug>`` empty. The rail is a mountain railway: a
closed loop from the hub station through every site's station in order and
back, routed by A* over the carved height field (strong grade penalty, a
hard cap, a minimum curve radius, terrace interiors and water off limits),
resampled every 2 m, smoothed under a grade constraint, snapped to the
mesh and given a grade-limited vertical profile under the camera's ride
height. Trails are four spokes from the hub pad to the gateway sites
and a ring through every site, routed the same way with a gentler cost so
the Dozer can climb them. Three climbing routes run up Rainier, Adams and
Baker. Zones are not made here: each district session owns its ``zone.*``.

Everything is seeded, so the range is the same on every run.
"""

from __future__ import annotations

import math
import os
import random
import sys
import time

import bmesh
import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

import rangelib as R  # noqa: E402
from worldlib import HUB, HUB_PAD_RADIUS, World, save, session_args  # noqa: E402

RAIL_LIFT = 3.0  # the camera rides the curve; the track top is 2.4 m under it
RAIL_STEP = 2.0
RAIL_CLEARANCE = 2.5  # least rail height over the ground anywhere, midpoints included
RAIL_GRADE = 0.45  # steepest the track's own profile may run
# Between stations the camera looks down the line: forward look targets
# start LOOK_DEPART metres after a station, end LOOK_ARRIVE metres before
# the next and repeat every LOOK_SPACING metres, each aimed LOOK_AHEAD
# metres up the track and a little below the ride height, so the eased
# aim follows the curve instead of cutting through a mountain toward the
# next site or staring up the bank a station stands on.
LOOK_DEPART = 45.0
LOOK_ARRIVE = 60.0
LOOK_SPACING = 80.0
LOOK_AHEAD = 50.0
LOOK_DROP = 0.8
RAIL_RELAX_GRADE = 0.9  # the smoother keeps the line off cliffs; the profile does the rest
TRAIL_STEP = 2.0  # exported point spacing
TRAIL_FINE = 1.0  # spacing the trails are smoothed and graded at
TRAIL_LIFT = 0.25
TRAIL_RELAX_GRADE = 0.5  # smoothed trails hold this on the raster
TRAIL_GRADE = 0.6  # and this on the finished mesh; the Dozer holds 0.7
ROUTE_LIFT = 0.6
# After the last site the line swings round the south of the hub pad and
# comes into the station heading west, the way it left, so the loop closes
# without a hairpin.
HUB_APPROACH = [Vector((52.0, -100.0, 0.0)), Vector((48.0, -52.0, 0.0))]
WEST = 2  # index of (-1, 0) in rangelib.STEPS


def build_range(w: World) -> bpy.types.Object:
    """The terrain disc from the polar grid of exact heights."""
    heights = R.polar_heights()
    radii = R.ring_radii()
    seg = R.SEGMENTS
    rings = len(radii)
    angles = np.arange(seg) / seg * math.tau
    verts = [(0.0, 0.0, float(heights[0, 0]))]
    for i in range(1, rings):
        r = radii[i]
        xs, ys = r * np.cos(angles), r * np.sin(angles)
        verts.extend(zip(xs.tolist(), ys.tolist(), heights[i].tolist()))

    def vid(i: int, j: int) -> int:
        return 0 if i == 0 else 1 + (i - 1) * seg + (j % seg)

    faces = []
    for j in range(seg):
        faces.append((0, vid(1, j), vid(1, j + 1)))
    for i in range(1, rings - 1):
        row, nxt = heights[i], heights[i + 1]
        for j in range(seg):
            j1 = (j + 1) % seg
            a, b, c, d = vid(i, j), vid(i, j1), vid(i + 1, j1), vid(i + 1, j)
            # Each quad splits along the diagonal with the smaller height
            # difference, so a crest, gully or terrace edge that crosses the
            # grid keeps a clean edge instead of a staircase of alternating
            # triangles. Wound so the normals point up; three.js culls back faces.
            if abs(row[j] - nxt[j1]) <= abs(row[j1] - nxt[j]):
                faces.extend(((a, d, c), (a, c, b)))
            else:
                faces.extend(((a, d, b), (d, c, b)))
    mesh = bpy.data.meshes.new("backdrop.range.ring")
    mesh.from_pydata(verts, [], faces)
    mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))
    mesh.update()
    obj = bpy.data.objects.new("backdrop.range.ring", mesh)
    w._add(obj, w.by_district["backdrop"], "tok.rock", False)
    bpy.context.view_layer.update()
    return obj


def build_lakes(w: World) -> None:
    """A flat disc at each water level; the terrain rising through it draws
    the shore. Exported as ``backdrop.lake.<slug>`` so the runtime finds the
    center, level and radius in meta."""
    col = w.by_district["backdrop"]
    for entry in R.LAKES:
        c = R.lake_center(entry)
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=True, radius=entry[3] * R.LAKE_DISC, segments=64)
        for face in bm.faces:
            face.smooth = True
        mesh = bpy.data.meshes.new(f"backdrop.lake.{entry[0]}")
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(f"backdrop.lake.{entry[0]}", mesh)
        obj.location = (c.x, c.y, R.lake_level(entry[0]))
        w._add(obj, col, "tok.water", False)


def build_terraces(w: World) -> None:
    for slug in R.site_slugs():
        c = R.site_center(slug)
        obj = w.empty(f"terrace.{slug}", w.rails, tuple(c), size=R.site_radius(slug), radius=R.site_radius(slug))
        obj.empty_display_type = "CIRCLE"


def ground(ring: bpy.types.Object, x: float, y: float) -> float:
    hit, loc, _normal, _index = ring.ray_cast(Vector((x, y, 800.0)), Vector((0.0, 0.0, -1.0)))
    return loc.z if hit else R.height_at(x, y)


def polyline(w: World, name: str, points, cyclic: bool = False) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, type="CURVE")
    curve.dimensions = "3D"
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, p in zip(spline.points, points):
        point.co = (p[0], p[1], p[2], 1.0)
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    w.rails.objects.link(obj)
    return obj


def build_routes(w: World, ring: bpy.types.Object, rng: random.Random) -> None:
    """Switchbacking routes from the hub-facing foot of a peak to its summit,
    snapped onto the finished mesh so the climbers walk on the surface.
    Adams's route ends on the astute terrace at the summit; Rainier's and
    Baker's pass beside the terraces on their shoulders."""
    beside = {"rainier": "synthesis", "baker": "agentic-cad-spike"}
    for p in R.PEAKS:
        slug, theta, rho, _h, s_along, _s_across, _cleavers, _cap = p
        if slug not in R.ROUTES:
            continue
        summit = R.peak_center(theta, rho)
        if slug == "adams":
            summit = R.site_center("astute").to_2d().to_3d()
        toward = (HUB - summit).normalized()
        side = Vector((-toward.y, toward.x, 0.0))
        foot = summit + toward * (2.1 * s_along)
        n = 48
        phase = rng.uniform(0.0, math.tau)
        points = []
        for k in range(n):
            s = k / (n - 1)
            pos = foot.lerp(summit, s) + side * (14.0 * math.sin(s * math.tau * 1.5 + phase) * (1.0 - s))
            if slug in beside:
                # Swing wide of the terrace on the side the wobble favours.
                c = R.site_center(beside[slug]).to_2d().to_3d()
                keep = 1.35 * R.site_radius(beside[slug])
                d = pos - c
                if d.length < keep:
                    lateral = side if d.dot(side) >= 0.0 else -side
                    along = d.dot(toward)
                    pos = c + toward * along + lateral * math.sqrt(max(0.0, keep * keep - along * along))
            points.append(pos)
        points = R.chaikin(points, 2)
        snapped = [(q.x, q.y, ground(ring, q.x, q.y) + ROUTE_LIFT) for q in points]
        polyline(w, f"route.{slug}", snapped)


RELAXED: list[str] = []


def route_loop(waypoints: list[Vector], prof: R.Profile, heading: int, label: str, names=None) -> list[Vector]:
    path: list[Vector] = []
    for k, (a, b) in enumerate(zip(waypoints, waypoints[1:])):
        t0 = time.time()
        leg, heading, cap = R.route_leg(a, b, prof, heading)
        path.extend(leg if not path else leg[1:])
        to = names[k + 1] if names else f"({b.x:.0f}, {b.y:.0f})"
        note = f", grade cap relaxed to {cap}" if cap != prof.grade_max else ""
        if note:
            RELAXED.append(f"{label} -> {to} at {cap}")
        print(f"  {label}: leg to {to} {len(leg)} cells, {time.time() - t0:.1f}s{note}")
    return path


def snap(ring: bpy.types.Object, points: list[Vector], lift: float) -> list[tuple[float, float, float]]:
    return [(p.x, p.y, ground(ring, p.x, p.y) + lift) for p in points]


def check_line(ring, name: str, pts, closed: bool, lift: float, max_grade: float, clearance: float, avoid_terraces: bool) -> dict:
    """Numbers for the report and hard failures for the rules: the line must
    stay out of water and (for the rail) terrace interiors, and must clear
    the ground between samples, not just at them."""
    seq = list(pts) + ([pts[0]] if closed else [])
    length, worst_grade, worst_clear = 0.0, 0.0, float("inf")
    for a, b in zip(seq, seq[1:]):
        run = math.hypot(b[0] - a[0], b[1] - a[1])
        length += run
        if run > 1e-6:
            worst_grade = max(worst_grade, abs(b[2] - a[2]) / run)
        for f in (0.25, 0.5, 0.75):
            x, y, z = (a[k] + (b[k] - a[k]) * f for k in range(3))
            worst_clear = min(worst_clear, z - ground(ring, x, y))
    wet = sum(1 for p in pts if R.in_water(p[0], p[1], p[2] - lift))
    inside = []
    if avoid_terraces:
        for slug in R.site_slugs():
            c, r = R.site_center(slug), R.site_radius(slug)
            dmin = min(math.hypot(p[0] - c.x, p[1] - c.y) for p in pts) / r
            if dmin < 0.97:
                inside.append(f"{slug} ({dmin:.2f}r)")
    print(f"{name}: {len(pts)} pts, {length:.0f} m, max grade {worst_grade:.3f}, least clearance {worst_clear:.2f} m, "
          f"{wet} wet, terraces entered: {inside or 'none'}")
    problems = []
    if wet:
        problems.append(f"{name} has {wet} points in water")
    if inside:
        problems.append(f"{name} enters {inside}")
    if worst_clear < clearance:
        problems.append(f"{name} clears the ground by only {worst_clear:.2f} m")
    if worst_grade > max_grade:
        problems.append(f"{name} has a {worst_grade:.3f} grade")
    return {"length": length, "grade": worst_grade, "clearance": worst_clear, "problems": problems}


def build_rail(w: World, ring: bpy.types.Object) -> dict:
    """The railway loop: hub station, every site's station in rail order,
    round the south of the hub pad and back into the station."""
    prof = R.rail_profile()
    waypoints = [R.station("hub")] + [R.station(s) for s in R.RAIL_ORDER] + HUB_APPROACH + [R.station("hub")]
    names = ["hub", *R.RAIL_ORDER, "approach", "approach", "hub"]
    loop = R.dedupe(route_loop(waypoints, prof, WEST, "rail", names))[:-1]
    # Start the loop at the point nearest the hub station so t = 0 is there.
    hub = R.station("hub")
    first = min(range(len(loop)), key=lambda i: (loop[i] - hub).length)
    loop = loop[first:] + loop[:first]
    points = R.resample(loop + [loop[0]], RAIL_STEP)
    if (points[-1] - points[0]).length < RAIL_STEP * 0.5:
        points = points[:-1]
    # Smooth the alignment without ever bending it onto steeper ground than
    # the router accepted, then give the track its own vertical profile:
    # never under the ground plus the lift, never steeper than RAIL_GRADE,
    # so a gully the line crosses is bridged instead of dipped into.
    points = R.relax(points, True, RAIL_RELAX_GRADE, prof.blocked_np, iterations=60)
    snapped = R.grade_limited_profile(snap(ring, points, RAIL_LIFT), True, RAIL_GRADE)
    stats = check_line(ring, "rail.path", snapped, True, RAIL_LIFT, RAIL_GRADE + 0.01, RAIL_CLEARANCE, True)
    polyline(w, "rail.path", snapped, cyclic=True)
    build_looks(w, snapped)
    stats["points"] = snapped
    return stats


def build_looks(w: World, points) -> None:
    """Look targets: the hub pinned at both ends, one per site that the
    exporter pins to the nearest rail point so the aim is exact abeam, and
    forward looks down the line between them (see LOOK_*)."""
    n = len(points)
    cum = [0.0]
    for a, b in zip(points, points[1:] + points[:1]):
        cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
    total = cum[-1]

    def at(s: float) -> Vector:
        s %= total
        i = max(0, min(n - 1, next(k for k in range(n) if cum[k + 1] >= s)))
        a, b = points[i], points[(i + 1) % n]
        f = (s - cum[i]) / max(cum[i + 1] - cum[i], 1e-9)
        return Vector((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f))

    def station_s(slug: str) -> float:
        c = R.site_center(slug)
        i = min(range(n), key=lambda k: (points[k][0] - c.x) ** 2 + (points[k][1] - c.y) ** 2)
        return cum[i]

    count = 0

    def look(position, t: float | None) -> None:
        nonlocal count
        obj = w.empty(f"rail.look.{count:02d}", w.rails, tuple(position), size=1.5)
        if t is not None:
            obj["t"] = t
        count += 1

    look((0.0, 0.0, 2.0), 0.0)
    stops = [0.0] + [station_s(slug) for slug in R.RAIL_ORDER] + [total]
    for k, slug in enumerate(R.RAIL_ORDER + [None]):
        s_a, s_b = stops[k], stops[k + 1]
        s = s_a + LOOK_DEPART
        while s <= s_b - LOOK_ARRIVE:
            look(at(s + LOOK_AHEAD) - Vector((0.0, 0.0, LOOK_DROP)), s / total)
            s += LOOK_SPACING
        if slug is not None:
            look(R.site_center(slug) + Vector((0.0, 0.0, 3.0)), None)
    look((0.0, 0.0, 2.0), 1.0)
    assert count <= 100, "rail.look.NN has two digits"


def build_trails(w: World, ring: bpy.types.Object) -> list[str]:
    """Four spokes from the hub pad edge to the gateway sites and one ring
    that visits every site in rail order and closes. Each is routed over
    the carved field, smoothed, resampled and snapped onto the mesh; the
    runtime paints them onto the terrain from ``meta.trails``."""
    prof = R.trail_profile()
    problems = []
    for slug in R.GATEWAYS:
        end = R.terrace_front(slug)
        start = end.normalized() * (HUB_PAD_RADIUS + 2.0)
        path = route_loop([start, end], prof, -1, f"trail.{slug}")
        points = R.relax(R.resample(R.dedupe(path), TRAIL_FINE), False, TRAIL_RELAX_GRADE, prof.blocked_np, iterations=60)
        problems += check_line(ring, f"trail.{slug} (fine)", snap(ring, points, TRAIL_LIFT), False, TRAIL_LIFT, TRAIL_GRADE, -math.inf, False)["problems"]
        snapped = snap(ring, R.resample(points, TRAIL_STEP), TRAIL_LIFT)
        polyline(w, f"trail.{slug}", snapped)
    fronts = [R.terrace_front(s) for s in R.RAIL_ORDER]
    loop = R.dedupe(route_loop(fronts + [fronts[0]], prof, -1, "trail.ring", [*R.RAIL_ORDER, R.RAIL_ORDER[0]]))[:-1]
    points = R.resample(loop + [loop[0]], TRAIL_FINE)[:-1]
    points = R.relax(points, True, TRAIL_RELAX_GRADE, prof.blocked_np, iterations=60)
    problems += check_line(ring, "trail.ring (fine)", snap(ring, points, TRAIL_LIFT), True, TRAIL_LIFT, TRAIL_GRADE, -math.inf, False)["problems"]
    snapped = snap(ring, R.resample(points + [points[0]], TRAIL_STEP)[:-1], TRAIL_LIFT)
    polyline(w, "trail.ring", snapped, cyclic=True)
    return problems


def build_review_cameras(w: World) -> None:
    """The overview, the spawn view toward Rainier, and one camera per site
    from the hub side, high enough to see the terrace, its banks and the
    landmark behind it."""
    w.camera("cam.review.overview", (0.0, -880.0, 640.0), (0.0, 40.0, 10.0), lens=30.0)
    rainier = R.peak_center(90.0, 350.0)
    w.camera("cam.review.hub", (0.0, -12.0, 4.0), (rainier.x, rainier.y, 90.0), lens=28.0)
    for slug in R.RAIL_ORDER:
        c = R.site_center(slug)
        r = R.site_radius(slug)
        eye = c + R.toward_hub(slug) * (3.2 * r) + Vector((0.0, 0.0, 1.3 * r + 6.0))
        w.camera(f"cam.review.site-{slug}", tuple(eye), (c.x, c.y, c.z + 2.0), lens=30.0)


def build() -> World:
    t0 = time.time()
    w = World()
    w.wipe_all()
    ring = build_range(w)
    print(f"range: {len(ring.data.polygons)} tris, {time.time() - t0:.1f}s")
    build_lakes(w)
    build_terraces(w)
    build_routes(w, ring, random.Random(R.SEED))
    stats = build_rail(w, ring)
    problems = stats["problems"] + build_trails(w, ring)
    build_review_cameras(w)
    w.rebuild_ground()
    bpy.context.scene.camera = bpy.data.objects["cam.review.overview"]
    print(f"01_range: built in {time.time() - t0:.1f}s")
    for slug in R.site_slugs():
        c = R.site_center(slug)
        print(f"  terrace.{slug:<20} ({c.x:7.1f}, {c.y:7.1f}) z {c.z:6.1f}  r {R.site_radius(slug):4.0f}")
    if RELAXED:
        print("  relaxed legs: " + "; ".join(RELAXED))
    w.problems = problems
    return w


if __name__ == "__main__":
    world = build()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
    # Saved first so a failing layout can still be inspected.
    if world.problems:
        raise RuntimeError("01_range: " + "; ".join(world.problems))
