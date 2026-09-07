"""Session 06: the mountain backdrop and its climbing routes.

Replaces ``World/Backdrop`` and every ``route.*`` curve on top of the earlier
sessions:

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

Everything is seeded, so the range is the same on every run.
"""

from __future__ import annotations

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


def height(x: float, y: float, u: float) -> float:
    """Terrain height at (x, y); u is the ring fraction from inner (0) to outer (1)."""
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


def wipe_routes(w: World) -> None:
    for obj in list(w.rails.objects):
        if obj.name.startswith("route."):
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
    w.rebuild_ground()
    w.camera("cam.review.backdrop-hub", (0.0, -60.0, 20.0), (0.0, 300.0, 90.0), lens=28.0)
    adams = peak_center(PEAKS[1][1], PEAKS[1][2])
    w.camera("cam.review.backdrop-adams", (0.0, 0.0, 30.0), (adams.x, adams.y, 80.0), lens=40.0)
    w.camera("cam.review.backdrop-overview", (0.0, -900.0, 520.0), (0.0, 0.0, 40.0), lens=30.0)
    return w


if __name__ == "__main__":
    main()
    args = session_args(sys.argv)
    if args["save"]:
        save(args["save"])
        print(f"saved {args['save']}")
