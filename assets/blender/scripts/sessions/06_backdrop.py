"""Session 06: the mountain backdrop, its climbing routes, lakes and trails.

Replaces ``World/Backdrop`` and every ``route.*`` and ``trail.*`` curve on
top of the earlier sessions:

    blender --background --python-exit-code 1 assets/blender/world.blend \
        --python assets/blender/scripts/sessions/06_backdrop.py -- \
        --save assets/blender/world.blend

One annular heightfield surrounds the 400 m plate: foothills at the plate's
edge rising to a Cascade skyline. The peaks are named after the ones that
frame the Pacific Northwest, with a Rainier-like volcano centered behind
the hub as seen from spawn and a flat-topped Adams to its west. The
volcanoes carry radial cleavers with glacier troughs between them, the
lesser ridges come from domain-warped ridged noise, and the whole range is
smooth-shaded so the runtime can light it per pixel.

The mesh is a single ``tok.rock`` surface. Snow, forest, scree and rock
detail are painted at runtime by the terrain shader from height, slope and
aspect (``src/simulator/world/terrain``), so the authored geometry only has
to get the shape right. Three routes, snapped onto the surface, are
exported for the runtime climbers.

Two lakes sit in the lowest saddles of the range, one each side of Rainier:
a basin is carved into the height field and a flat ``tok.water`` disc at the
water level is clipped by the terrain rising through it, which is what
draws the shoreline. A hiking trail leads to each lake from the foot of the
range, skirts the shore and drops over the saddle beyond. The trails are
routed by A* over the carved height field with a grade penalty, so they
follow the valley floors and switchback where the ground is steep; the
runtime paints them onto the terrain from ``meta.trails``.

Everything is seeded, so the range is the same on every run.
"""

from __future__ import annotations

import heapq
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector, noise

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from worldlib import HUB, World, purge_orphans, save, session_args  # noqa: E402

SEGMENTS = 720
RINGS = 96
INNER = 205.0
OUTER = 470.0
SEED = 6

# (slug, theta deg, rho, height, sigma along, sigma across, cleavers, flat cap)
# theta is measured counterclockwise from +x in the Blender frame; the spawn
# camera looks toward +y, so 90 degrees is straight ahead from the hub.
# ``cleavers`` is the number of radial ridges on a volcano, 0 for a ridge.
PEAKS = [
    ("rainier", 90.0, 350.0, 152.0, 74.0, 74.0, 9, None),
    ("adams", 160.0, 330.0, 118.0, 58.0, 58.0, 7, 108.0),
    ("baker", 30.0, 340.0, 126.0, 52.0, 52.0, 8, None),
    ("stuart", 120.0, 310.0, 96.0, 42.0, 34.0, 0, None),
    ("glacier-ridge", 235.0, 330.0, 86.0, 125.0, 36.0, 0, None),
    ("crest-east", -20.0, 320.0, 76.0, 125.0, 36.0, 0, None),
    ("twin-north", -125.0, 335.0, 88.0, 36.0, 36.0, 0, None),
    ("twin-south", -140.0, 325.0, 80.0, 36.0, 36.0, 0, None),
    ("filler-a", 60.0, 300.0, 50.0, 46.0, 30.0, 0, None),
    ("filler-b", 195.0, 300.0, 40.0, 46.0, 30.0, 0, None),
    ("filler-c", -60.0, 310.0, 55.0, 50.0, 30.0, 0, None),
    ("filler-d", -95.0, 300.0, 35.0, 46.0, 30.0, 0, None),
]
ROUTES = ["rainier", "adams", "baker"]

# (slug, theta deg, rho, basin radius): the two lowest saddles of the range,
# found by sampling the relief between the peaks. Mowich lies between Baker
# and Rainier's eastern skirt, Tipsoo between Stuart and Adams. Named after
# the lakes on Rainier's flanks.
LAKES = [
    ("mowich", 51.0, 328.0, 28.0),
    ("tipsoo", 137.0, 338.0, 24.0),
]
LAKE_DISC = 1.15  # water disc radius over the basin radius
LAKE_DEPTH = 2.5  # basin floor under the water level at the basin edge
LAKE_MARGIN = 4.0  # water level over the lowest ground found in the basin

# (slug, start theta deg, end theta deg, end rho): each trail climbs from the
# foot of the range at ``start theta`` to the lake with the same slug, rounds
# the shore and drops over the saddle to (end theta, end rho).
TRAILS = [
    ("mowich", 70.0, 48.0, 392.0),
    ("tipsoo", 112.0, 134.0, 392.0),
]
TRAIL_CELL = 2.5
TRAIL_STEP = 2.0
TRAIL_LIFT = 0.25


def smoothstep(a: float, b: float, x: float) -> float:
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3.0 - 2.0 * t)


def fbm(x: float, y: float, octaves: int = 4) -> float:
    """Sum of noise octaves in roughly [-1, 1]."""
    total, amp, freq, norm = 0.0, 1.0, 1.0, 0.0
    for _ in range(octaves):
        total += amp * noise.noise(Vector((x * freq, y * freq, 0.37)))
        norm += amp
        amp *= 0.5
        freq *= 2.1
    return total / norm


def ridged(x: float, y: float, octaves: int = 4) -> float:
    """Ridged multifractal in [0, 1]: sharp crests instead of rolling bumps.
    Each octave is weighted by the one below it so crests stay clean. The
    crest is rounded over a few metres so the mesh can carry it without a
    staircase of alternating triangles along the arete."""
    total, amp, freq, norm, weight = 0.0, 1.0, 1.0, 0.0, 1.0
    for _ in range(octaves):
        v = noise.noise(Vector((x * freq, y * freq, 1.91)))
        n = 1.0 - math.sqrt(v * v + 0.012)
        n = n * n * weight
        weight = max(0.0, min(1.0, n * 2.0))
        total += amp * n
        norm += amp
        amp *= 0.5
        freq *= 2.0
    return total / norm


def warp(x: float, y: float) -> tuple[float, float]:
    """Domain warp so ridges and drainages bend instead of running straight."""
    wx = 26.0 * fbm(x * 0.0055 + 11.0, y * 0.0055 - 7.0, 3)
    wy = 26.0 * fbm(x * 0.0055 - 4.0, y * 0.0055 + 9.0, 3)
    return x + wx, y + wy


def r_inner(theta: float) -> float:
    """Distance from the origin to the square plate's edge in direction theta."""
    return INNER / max(abs(math.cos(theta)), abs(math.sin(theta)))


def peak_center(theta_deg: float, rho: float) -> Vector:
    a = math.radians(theta_deg)
    return Vector((rho * math.cos(a), rho * math.sin(a), 0.0))


def peak_q(p, x: float, y: float) -> float:
    """Normalized elliptical distance from the peak's summit, elongated tangentially."""
    _slug, theta, rho, _h, s_along, s_across, _cleavers, _cap = p
    c = peak_center(theta, rho)
    a = math.radians(theta)
    tx, ty = -math.sin(a), math.cos(a)
    nx, ny = math.cos(a), math.sin(a)
    dx, dy = x - c.x, y - c.y
    u = dx * tx + dy * ty
    v = dx * nx + dy * ny
    return math.sqrt((u / s_along) ** 2 + (v / s_across) ** 2)


def peak_profile(q: float, volcano: bool) -> float:
    """Peak profile in [0, 1]. Ridges are pointed cones with a gaussian
    skirt; volcanoes carry a broad rounded dome over steeper flanks."""
    if volcano:
        return math.exp(-0.55 * q**1.9)
    return math.exp(-0.6 * q**1.5)


def cleavers(p, x: float, y: float, q: float) -> float:
    """Radial ridge-and-trough pattern of a glaciated volcano, in (0, 1]:
    1 on a cleaver crest, lower in the glacier trough between two crests.
    Strongest on the mid flank, fading at the summit and the skirt."""
    _slug, theta, rho, _h, _s_along, _s_across, count, _cap = p
    if count == 0:
        return 1.0
    c = peak_center(theta, rho)
    phi = math.atan2(y - c.y, x - c.x)
    wobble = 1.6 * fbm(x * 0.02 + 3.0, y * 0.02 + 5.0, 2)
    crest = 0.5 + 0.5 * math.cos(count * phi + wobble)
    band = smoothstep(0.1, 0.55, q) * (1.0 - smoothstep(1.3, 2.4, q))
    return 1.0 - 0.24 * band * (1.0 - crest) ** 1.6


def peak_height(p, x: float, y: float) -> float:
    q = peak_q(p, x, y)
    h = p[3] * peak_profile(q, p[6] > 0) * cleavers(p, x, y, q)
    cap = p[7]
    if cap is not None and h > cap:
        # A rounded summit plateau rather than a razor-flat cut.
        h = cap + (h - cap) * 0.08
    return h


def relief(x: float, y: float, u: float) -> float:
    """Terrain height at (x, y) before the lake basins; u is the ring fraction
    from inner (0) to outer (1)."""
    edge = smoothstep(0.0, 0.3, u) * (1.0 - smoothstep(0.84, 1.0, u) * 0.85)
    xw, yw = warp(x, y)
    h = 3.0 * smoothstep(0.0, 0.25, u)
    dome = 0.0
    for p in PEAKS:
        h += peak_height(p, x, y)
        if p[6] > 0:
            # Glaciated volcano summits are smooth domes: the crest noise
            # below is held back there and the cleavers shape them instead.
            dome = max(dome, 1.0 - smoothstep(0.25, 1.1, peak_q(p, x, y)))
    # Crests and gullies scale with the terrain so foothills stay soft.
    crest = 0.34 * (ridged(xw * 0.0105, yw * 0.0105, 5) - 0.5) + 0.10 * fbm(xw * 0.04, yw * 0.04, 3)
    h *= 0.86 + crest * (1.0 - 0.8 * dome)
    h += 8.0 * fbm(xw * 0.018, yw * 0.018, 4) * smoothstep(0.05, 0.4, u)
    h += 3.0 * ridged(xw * 0.05, yw * 0.05, 3) * smoothstep(0.1, 0.5, u)
    return max(0.0, h * edge)


def ring_u(x: float, y: float) -> float:
    """Ring fraction of a point: 0 at the plate's edge, 1 at the outer rim."""
    ri = r_inner(math.atan2(y, x))
    return (math.hypot(x, y) - ri) / (OUTER - ri)


def relief_at(x: float, y: float) -> float:
    return relief(x, y, ring_u(x, y))


def lake_center(lake) -> Vector:
    return peak_center(lake[1], lake[2])


def lake_level(lake) -> float:
    """Water level: the lowest relief inside the basin plus a margin, so the
    basin floor is always carved, never filled."""
    c = lake_center(lake)
    radius = lake[3]
    lowest = relief_at(c.x, c.y)
    for i in range(24):
        a = i / 24 * math.tau
        lowest = min(lowest, relief_at(c.x + 0.8 * radius * math.cos(a), c.y + 0.8 * radius * math.sin(a)))
    return round(lowest + LAKE_MARGIN, 2)


LEVELS = {lake[0]: lake_level(lake) for lake in LAKES}


def lake_dn(lake, x: float, y: float) -> float | None:
    """Distance from the lake center over the basin radius, wobbled by a
    little noise so the shoreline is not a circle. None when far away."""
    c = lake_center(lake)
    d = math.hypot(x - c.x, y - c.y)
    if d > 2.5 * lake[3]:
        return None
    # The wobble only shrinks the basin, so the water disc always covers it.
    seed = 7.0 * LAKES.index(lake)
    wobble = 1.0 + 0.11 * (1.0 + fbm(x * 0.022 + seed, y * 0.022 - seed, 2))
    wobble += 0.04 * (1.0 + fbm(x * 0.07 - seed, y * 0.07 + seed, 2))
    return d * wobble / lake[3]


def basin(lake, x: float, y: float, h: float) -> float:
    """Carve one lake into the relief: a bowl under the water level inside
    the basin, a bank rising through the level just outside it (that is the
    shoreline), and a low moraine lip so nothing nearby sits under water,
    fading back into the natural ground beyond."""
    dn = lake_dn(lake, x, y)
    if dn is None:
        return h
    level = LEVELS[lake[0]]
    if dn < 1.0:
        return min(h, level - LAKE_DEPTH - 2.0 * (1.0 - dn * dn))
    floor = level - LAKE_DEPTH + (LAKE_DEPTH + 0.8) * smoothstep(1.0, LAKE_DISC, dn)
    floor += 0.5 * smoothstep(LAKE_DISC, 1.5, dn) * (1.0 - smoothstep(1.7, 2.3, dn))
    # The headwall on the uphill side may climb steeply, but not as a cliff.
    cap = level - LAKE_DEPTH + 18.0 * smoothstep(1.0, 1.25, dn) + 80.0 * smoothstep(1.25, 1.8, dn)
    weight = 1.0 - smoothstep(1.7, 2.4, dn)
    target = min(max(h, floor), cap)
    return h + (target - h) * weight


def height(x: float, y: float, u: float) -> float:
    """Terrain height at (x, y) with the lake basins carved in."""
    h = relief(x, y, u)
    for lake in LAKES:
        h = basin(lake, x, y, h)
    return h


def height_at(x: float, y: float) -> float:
    return height(x, y, ring_u(x, y))


def build_range(w: World) -> bpy.types.Object:
    col = w.by_district["backdrop"]
    bm = bmesh.new()
    grid: list[list[bmesh.types.BMVert]] = []
    for i in range(RINGS + 1):
        u = i / RINGS
        ring = []
        for j in range(SEGMENTS):
            theta = j / SEGMENTS * math.tau
            r = r_inner(theta) + (OUTER - r_inner(theta)) * u
            x, y = r * math.cos(theta), r * math.sin(theta)
            ring.append(bm.verts.new((x, y, height(x, y, u))))
        grid.append(ring)
    bm.verts.ensure_lookup_table()
    for i in range(RINGS):
        for j in range(SEGMENTS):
            a = grid[i][j]
            b = grid[i][(j + 1) % SEGMENTS]
            c = grid[i + 1][(j + 1) % SEGMENTS]
            d = grid[i + 1][j]
            # Each quad splits along the diagonal with the smaller height
            # difference, so a crest or gully that crosses the grid keeps a
            # clean edge instead of a staircase of alternating triangles.
            # Wound so the normals point up; three.js culls back faces.
            if abs(a.co.z - c.co.z) <= abs(b.co.z - d.co.z):
                tris = ((a, d, c), (a, c, b))
            else:
                tris = ((a, d, b), (d, c, b))
            for tri in tris:
                face = bm.faces.new(tri)
                face.smooth = True
    mesh = bpy.data.meshes.new("backdrop.range.ring")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new("backdrop.range.ring", mesh)
    w._add(obj, col, "tok.rock", False)
    return obj


def build_routes(w: World, ring: bpy.types.Object, rng: random.Random) -> None:
    """Switchbacking routes from the hub-facing foot of a peak to its summit,
    snapped onto the finished mesh so the climbers walk on the surface."""
    bpy.context.view_layer.update()
    for p in PEAKS:
        slug, theta, rho, _h, s_along, _s_across, _cleavers, _cap = p
        if slug not in ROUTES:
            continue
        summit = peak_center(theta, rho)
        toward_hub = (HUB - summit).normalized()
        side = Vector((-toward_hub.y, toward_hub.x, 0.0))
        foot = summit + toward_hub * (2.1 * s_along)
        n = 40
        points = []
        phase = rng.uniform(0.0, math.tau)
        for k in range(n):
            s = k / (n - 1)
            base = foot.lerp(summit, s)
            wobble = 14.0 * math.sin(s * math.tau * 1.5 + phase) * (1.0 - s)
            pos = base + side * wobble
            hit, loc, _normal, _index = ring.ray_cast(Vector((pos.x, pos.y, 600.0)), Vector((0.0, 0.0, -1.0)))
            z = loc.z if hit else height(pos.x, pos.y, 0.5)
            points.append((pos.x, pos.y, z + 0.6))
        curve = bpy.data.curves.new(f"route.{slug}", type="CURVE")
        curve.dimensions = "3D"
        spline = curve.splines.new("POLY")
        spline.points.add(len(points) - 1)
        for point, (x, y, z) in zip(spline.points, points):
            point.co = (x, y, z, 1.0)
        obj = bpy.data.objects.new(f"route.{slug}", curve)
        w.rails.objects.link(obj)


def build_lakes(w: World) -> None:
    """A flat disc at each water level; the terrain rising through it draws
    the shore. Exported as ``backdrop.lake.<slug>`` so the runtime finds the
    center, level and radius in meta."""
    col = w.by_district["backdrop"]
    for lake in LAKES:
        c = lake_center(lake)
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, cap_ends=True, radius=lake[3] * LAKE_DISC, segments=64)
        for face in bm.faces:
            face.smooth = True
        mesh = bpy.data.meshes.new(f"backdrop.lake.{lake[0]}")
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(f"backdrop.lake.{lake[0]}", mesh)
        obj.location = (c.x, c.y, LEVELS[lake[0]])
        w._add(obj, col, "tok.water", False)


def trail_blocked(x: float, y: float) -> bool:
    if ring_u(x, y) < 0.005:
        return True
    return any((dn := lake_dn(lake, x, y)) is not None and dn < 1.28 for lake in LAKES)


def step_factor(x: float, y: float) -> float:
    """Cost multiplier of the ground itself: cheaper along a shore so the
    trail hugs it, dearer along the plate's edge so it climbs away from
    the foot instead of skimming it, and a little noise everywhere so a
    flat valley floor gives a wandering path instead of a surveyor's line."""
    factor = 1.0 + 0.7 * (0.5 + 0.5 * fbm(x * 0.05 + 2.0, y * 0.05 - 1.0, 2))
    factor += 3.0 * (1.0 - smoothstep(0.0, 0.12, ring_u(x, y)))
    for lake in LAKES:
        dn = lake_dn(lake, x, y)
        if dn is not None and dn < 1.6:
            return 0.65 * factor
    return factor


STEPS = [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1),
         (2, 1), (1, 2), (-1, 2), (-2, 1), (-2, -1), (-1, -2), (1, -2), (2, -1)]
STEP_DIRS = [Vector((di, dj, 0.0)).normalized() for di, dj in STEPS]


def astar(start: Vector, goal: Vector, origin: Vector, size: tuple[int, int], cells: dict, heading: int = -1) -> tuple[list[Vector], int]:
    """Least-cost path on a grid over the carved relief. A step costs its
    length times a grade penalty plus a penalty for turning, so the path
    threads the valley floor and crosses steep ground in long traverses
    joined by real switchbacks instead of a sawtooth. ``heading`` is the
    step index the path arrives with, so consecutive legs join smoothly;
    the path and its final heading are returned."""

    def cell(v: Vector) -> tuple[int, int]:
        return (round((v.x - origin.x) / TRAIL_CELL), round((v.y - origin.y) / TRAIL_CELL))

    def sample(i: int, j: int):
        key = (i, j)
        if key not in cells:
            x, y = origin.x + i * TRAIL_CELL, origin.y + j * TRAIL_CELL
            cells[key] = (x, y, height_at(x, y), trail_blocked(x, y), step_factor(x, y))
        return cells[key]

    s, g = cell(start), cell(goal)
    gx, gy = origin.x + g[0] * TRAIL_CELL, origin.y + g[1] * TRAIL_CELL
    best = {(s, heading): 0.0}
    came: dict = {}
    frontier = [(0.0, s, heading)]
    done = None
    while frontier:
        f, cur, d = heapq.heappop(frontier)
        if cur == g:
            done = (cur, d)
            break
        cx, cy, cz, _blocked, _bonus = sample(*cur)
        if f > best[(cur, d)] + 0.65 * math.hypot(cx - gx, cy - gy) + 1e-6:
            continue
        for k, (di, dj) in enumerate(STEPS):
            nxt = (cur[0] + di, cur[1] + dj)
            if not (0 <= nxt[0] < size[0] and 0 <= nxt[1] < size[1]):
                continue
            nx, ny, nz, blocked, bonus = sample(*nxt)
            if blocked and nxt != g:
                continue
            length = math.hypot(nx - cx, ny - cy)
            grade = abs(nz - cz) / length
            cost = length * (1.0 + 16.0 * grade * grade) * bonus
            if grade > 0.5:
                cost *= 6.0
            if d >= 0:
                cost += 8.0 * (1.0 - STEP_DIRS[d].dot(STEP_DIRS[k]))
            tentative = best[(cur, d)] + cost
            key = (nxt, k)
            if tentative < best.get(key, float("inf")):
                best[key] = tentative
                came[key] = (cur, d)
                heapq.heappush(frontier, (tentative + 0.65 * math.hypot(nx - gx, ny - gy), nxt, k))
    if done is None:
        raise RuntimeError(f"trail: no path from {tuple(start)} to {tuple(goal)}")
    path = [done]
    while path[-1] != (s, heading):
        path.append(came[path[-1]])
    path.reverse()
    return [Vector((origin.x + i * TRAIL_CELL, origin.y + j * TRAIL_CELL, 0.0)) for (i, j), _d in path], done[1]


def chaikin(points: list[Vector], passes: int = 3) -> list[Vector]:
    for _ in range(passes):
        out = [points[0]]
        for a, b in zip(points, points[1:]):
            out.append(a.lerp(b, 0.25))
            out.append(a.lerp(b, 0.75))
        out.append(points[-1])
        points = out
    return points


def resample(points: list[Vector], step: float) -> list[Vector]:
    out = [points[0]]
    carry = 0.0
    for a, b in zip(points, points[1:]):
        seg = (b - a).length
        if seg == 0:
            continue
        t = (step - carry) / seg
        while t <= 1.0:
            out.append(a.lerp(b, t))
            t += step / seg
        carry = (1.0 - (t - step / seg)) * seg
    if (out[-1] - points[-1]).length > step * 0.5:
        out.append(points[-1])
    return out


def build_trails(w: World, ring: bpy.types.Object) -> None:
    """Route each trail from the foot of the range over the saddle beyond
    its lake, smooth it, and snap it onto the finished mesh. The water is
    impassable and the shore is cheap, so the path rounds the lake along
    the bank on whichever side the ground favours."""
    bpy.context.view_layer.update()
    for slug, start_theta, end_theta, end_rho in TRAILS:
        lake = next(l for l in LAKES if l[0] == slug)
        c = lake_center(lake)
        a = math.radians(start_theta)
        foot = Vector((math.cos(a), math.sin(a), 0.0)) * (r_inner(a) + 6.0)
        end = peak_center(end_theta, end_rho)
        waypoints = [foot, end]
        lo = Vector((min(p.x for p in waypoints) - 50.0, min(p.y for p in waypoints) - 50.0, 0.0))
        hi = Vector((max(p.x for p in waypoints) + 50.0, max(p.y for p in waypoints) + 50.0, 0.0))
        size = (int((hi.x - lo.x) / TRAIL_CELL) + 1, int((hi.y - lo.y) / TRAIL_CELL) + 1)
        cells: dict = {}
        path: list[Vector] = []
        heading = -1
        for p, q in zip(waypoints, waypoints[1:]):
            leg, heading = astar(p, q, lo, size, cells, heading)
            path.extend(leg if not path else leg[1:])
        points = resample(chaikin(path), TRAIL_STEP)
        snapped = []
        for p in points:
            hit, loc, _normal, _index = ring.ray_cast(Vector((p.x, p.y, 600.0)), Vector((0.0, 0.0, -1.0)))
            z = loc.z if hit else height_at(p.x, p.y)
            snapped.append((p.x, p.y, z + TRAIL_LIFT))
        curve = bpy.data.curves.new(f"trail.{slug}", type="CURVE")
        curve.dimensions = "3D"
        spline = curve.splines.new("POLY")
        spline.points.add(len(snapped) - 1)
        for point, (x, y, z) in zip(spline.points, snapped):
            point.co = (x, y, z, 1.0)
        obj = bpy.data.objects.new(f"trail.{slug}", curve)
        w.rails.objects.link(obj)
        print(f"trail.{slug}: {len(snapped)} points, {len(cells)} cells searched")


def wipe_routes(w: World) -> None:
    for obj in list(w.rails.objects):
        if obj.name.startswith(("route.", "trail.")):
            bpy.data.objects.remove(obj, do_unlink=True)
    purge_orphans()


def main() -> World:
    w = World()
    rng = random.Random(SEED)
    noise.seed_set(SEED)
    w.wipe_district("backdrop", [], [])
    wipe_routes(w)
    ring = build_range(w)
    build_routes(w, ring, rng)
    build_lakes(w)
    build_trails(w, ring)
    w.rebuild_ground()
    w.camera("cam.review.backdrop-hub", (0.0, -60.0, 20.0), (0.0, 300.0, 90.0), lens=28.0)
    adams = peak_center(PEAKS[1][1], PEAKS[1][2])
    w.camera("cam.review.backdrop-adams", (0.0, 0.0, 30.0), (adams.x, adams.y, 80.0), lens=40.0)
    w.camera("cam.review.backdrop-overview", (0.0, -900.0, 520.0), (0.0, 0.0, 40.0), lens=30.0)
    for lake in LAKES:
        c = lake_center(lake)
        level = LEVELS[lake[0]]
        toward_hub = (HUB - c).normalized()
        eye = c + toward_hub * 150.0
        w.camera(f"cam.review.backdrop-lake-{lake[0]}", (eye.x, eye.y, level + 45.0), (c.x, c.y, level), lens=45.0)
        w.camera(f"cam.review.backdrop-lake-{lake[0]}-top", (c.x, c.y + 0.01, level + 260.0), (c.x, c.y, level), lens=35.0)
    return w


if __name__ == "__main__":
    main()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
