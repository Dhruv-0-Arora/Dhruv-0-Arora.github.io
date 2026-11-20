"""The range: pure geometry for the one terrain disc the world sits in.

Everything the world knows about the ground lives here: the peaks and their
relief, the lake basins, the alpine valley around the hub, and the flat
terraces every project site is cut into. It is importable inside Blender
without touching ``bpy`` (only ``mathutils`` and ``numpy``, both bundled),
so sessions, the exporter and ad-hoc probes all agree on one height field.

Frame: Blender Z-up, meters, hub at the origin, +y straight ahead from
spawn. theta is measured in degrees counterclockwise from +x, so 90 is
Rainier, dead ahead.

The layers of ``height(x, y)``, in order:

1. ``relief``: the mountain range modelled in the old backdrop session,
   unchanged except that it now rises from a circle (``INNER``) instead of
   the square plate's edge. Seeded peaks with elliptical profiles, radial
   cleavers on the volcanoes, domain-warped ridged noise for the crests.
2. ``valley``: a few metres of rolling meadow inside the ring and a gentle
   bowl rise toward the foothills, so the centre reads as an alpine valley.
3. ``terrace``: every site (and the hub pad) is flattened to its level
   inside its radius, with a near-flat bench (the apron) around it that
   carries the railway and the trails. Beyond the bench the ground is
   clamped between a fill bank falling away and a cut headwall rising
   behind, eased in over the first ``TERRACE_EASE`` metres so the edge
   rolls over, both steeper than the natural ground so they meet it within
   a few metres and the site reads as cut into the mountain, not laid on a
   pillow. Where the natural ground already lies inside that window nothing
   changes, so the clamp is continuous and its influence ends by itself.
4. ``basin``: the two lakes, carved last so water is always clear.

Everything is seeded and deterministic, so the range is identical on every
run. The mesh build samples ``height`` exactly at its vertices; the A*
routers read a cached 1.25 m raster interpolated from the same vertices
with the mesh's own triangulation, so the routes and the mesh agree.
"""

from __future__ import annotations

import heapq
import math
from functools import lru_cache

import numpy as np
from mathutils import Vector, noise

SEED = 6
OUTER = 470.0
# The foothills begin here; inside it is the valley floor.
INNER = 180.0
SEGMENTS = 720
# Radial spacing of the mesh rings: coarse across the valley, fine in the range.
RING_STEP_VALLEY = 7.0
RING_STEP_RANGE = 2.75

HUB = Vector((0.0, 0.0, 0.0))

# (slug, theta deg, rho, height, sigma along, sigma across, cleavers, flat cap)
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

# (slug, theta deg, rho, basin radius): the two lowest saddles of the range.
# Mowich lies between Baker and Rainier's eastern skirt, Tipsoo between
# Stuart and Adams. Named after the lakes on Rainier's flanks.
LAKES = [
    ("mowich", 51.0, 328.0, 28.0),
    ("tipsoo", 137.0, 338.0, 24.0),
]
LAKE_DISC = 1.15  # water disc radius over the basin radius
LAKE_DEPTH = 2.5  # basin floor under the water level at the basin edge
LAKE_MARGIN = 4.0  # water level over the lowest ground found in the basin

# Sites: (slug, landmark, kind, theta deg, rho of terrace centre, radius).
# kind is "pad" (the hub), "summit" (a plateau cut into a top), "shoulder"
# (a shelf on a big peak's hub-facing flank, summit behind it), "ridge"
# (a broad terrace on a long ridge) or "shore" (a lakeshore plot). For a
# shore site the landmark is the lake and rho is derived: the terrace sits
# on the hub-facing shore with its edge ``SHORE_GAP`` back from the water.
# Order is the rail order after the hub.
SITES = [
    ("stalk", "filler-b", "summit", 195.0, 300.0, 26.0),
    ("astute", "adams", "summit", 160.0, 330.0, 20.0),
    ("dirnt", "tipsoo", "shore", 137.0, None, 18.0),
    ("swiftlabs-platform", "stuart", "shoulder", 120.0, 275.0, 22.0),
    ("synthesis", "rainier", "shoulder", 90.0, 262.0, 24.0),
    ("wisconsin-racing", "filler-a", "summit", 62.0, 300.0, 22.0),
    ("orion", "mowich", "shore", 47.0, None, 24.0),
    ("agentic-cad-spike", "baker", "shoulder", 30.0, 265.0, 16.0),
    ("cypher", "crest-east", "ridge", -20.0, 285.0, 40.0),
    ("altigoz", "filler-c", "summit", -60.0, 310.0, 20.0),
    ("nazar", "filler-d", "summit", -95.0, 300.0, 20.0),
    # The twins stand on glacier-ridge's crest (175 m and 143 m, sheer on the
    # hub side), so a railway cannot reach their tops; the towers stand on
    # shelves at their feet with the summits rising behind.
    ("kerms", "twin-north", "shoulder", -125.0, 262.0, 14.0),
    ("imc-prosperity-4", "twin-south", "shoulder", -140.0, 262.0, 14.0),
]
HUB_SITE = ("hub", "valley", "pad", 0.0, 0.0, 45.0)
RAIL_ORDER = [s[0] for s in SITES]
# The four sites a trail spoke leaves the hub pad for, one per sector.
GATEWAYS = ["astute", "swiftlabs-platform", "synthesis", "cypher"]
HUB_STATION = Vector((0.0, -46.0, 0.0))

TERRACE_CUT = 3.0  # terrace level under the natural ground at its centre
SHORE_FREEBOARD = 1.6  # shore terrace level over the water
SHORE_GAP = 4.0  # shore terrace edge back from the water disc
# Around every terrace runs a bench for the railway and the trails: flat
# (a slight fall away from the site so water would drain), at least
# APRON_MIN metres wide and never narrower than APRON_FRAC of the radius,
# which is where the rail's cheap band (1.02 to 1.35 radii) lies.
APRON_MIN = 8.0
APRON_FRAC = 0.35
APRON_SLOPE = 0.12
TERRACE_EASE = 2.0  # metres over which the bank eases from flat to full slope
G_FILL = 1.4  # fill slope falling away from the bench, rise over run
# The cut behind the edge is steeper than any natural flank (about 68
# degrees), so it is a short headwall, a few metres tall, and the ground
# keeps its own shape right behind it instead of being shaved smooth.
G_CUT = 2.5
G_GROW = 1.0  # both slopes steepen by this much per radius beyond the ease
BANK_SOFT = 2.0  # metres over which the clamp hands back to natural ground

RASTER_CELL = 1.25


# ---------------------------------------------------------------------------
# Noise
# ---------------------------------------------------------------------------


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


# ---------------------------------------------------------------------------
# Relief: the range
# ---------------------------------------------------------------------------


def polar_point(theta_deg: float, rho: float) -> Vector:
    a = math.radians(theta_deg)
    return Vector((rho * math.cos(a), rho * math.sin(a), 0.0))


# Kept under its old name: routes and lakes are placed by it.
peak_center = polar_point


def peak_q(p, x: float, y: float) -> float:
    """Normalized elliptical distance from the peak's summit, elongated tangentially."""
    _slug, theta, rho, _h, s_along, s_across, _cleavers, _cap = p
    c = polar_point(theta, rho)
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
    c = polar_point(theta, rho)
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


def ring_u(x: float, y: float) -> float:
    """Ring fraction of a point: 0 where the foothills begin, 1 at the rim.
    Negative inside the valley."""
    return (math.hypot(x, y) - INNER) / (OUTER - INNER)


def relief(x: float, y: float, u: float) -> float:
    """Height of the range at (x, y) before the valley, terraces and lakes;
    u is the ring fraction. Zero inside the valley."""
    if u <= 0.0:
        return 0.0
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


def valley(x: float, y: float, rho: float) -> float:
    """The valley floor: a few metres of rolling meadow around z = 0 that
    hands over to the range at the foothills, on a shallow bowl that rises
    toward the ring so the centre reads as a basin, not a plate."""
    roll = 2.2 * fbm(x * 0.011 + 31.0, y * 0.011 - 17.0, 3) + 0.6 * fbm(x * 0.045 - 9.0, y * 0.045 + 13.0, 2)
    roll *= 1.0 - smoothstep(INNER - 20.0, INNER + 70.0, rho)
    bowl = 5.0 * smoothstep(70.0, INNER + 30.0, rho)
    return roll + bowl


def natural(x: float, y: float) -> float:
    """The ground before any terrace or lake is cut into it."""
    return relief(x, y, ring_u(x, y)) + valley(x, y, math.hypot(x, y))


# ---------------------------------------------------------------------------
# Lakes
# ---------------------------------------------------------------------------


def lake(slug: str):
    return next(entry for entry in LAKES if entry[0] == slug)


def lake_center(entry) -> Vector:
    return polar_point(entry[1], entry[2])


@lru_cache(maxsize=None)
def lake_level(slug: str) -> float:
    """Water level: the lowest natural ground inside the basin plus a
    margin, so the basin floor is always carved, never filled."""
    entry = lake(slug)
    c = lake_center(entry)
    radius = entry[3]
    lowest = natural(c.x, c.y)
    for i in range(24):
        a = i / 24 * math.tau
        lowest = min(lowest, natural(c.x + 0.8 * radius * math.cos(a), c.y + 0.8 * radius * math.sin(a)))
    return round(lowest + LAKE_MARGIN, 2)


def lake_dn(entry, x: float, y: float) -> float | None:
    """Distance from the lake center over the basin radius, wobbled by a
    little noise so the shoreline is not a circle. None when far away."""
    c = lake_center(entry)
    d = math.hypot(x - c.x, y - c.y)
    if d > 2.5 * entry[3]:
        return None
    # The wobble only shrinks the basin, so the water disc always covers it.
    seed = 7.0 * LAKES.index(entry)
    wobble = 1.0 + 0.11 * (1.0 + fbm(x * 0.022 + seed, y * 0.022 - seed, 2))
    wobble += 0.04 * (1.0 + fbm(x * 0.07 - seed, y * 0.07 + seed, 2))
    return d * wobble / entry[3]


def basin(entry, x: float, y: float, h: float) -> float:
    """Carve one lake into the ground: a bowl under the water level inside
    the basin, a bank rising through the level just outside it (that is the
    shoreline), and a low moraine lip so nothing nearby sits under water,
    fading back into the natural ground beyond."""
    dn = lake_dn(entry, x, y)
    if dn is None:
        return h
    level = lake_level(entry[0])
    if dn < 1.0:
        return min(h, level - LAKE_DEPTH - 2.0 * (1.0 - dn * dn))
    floor = level - LAKE_DEPTH + (LAKE_DEPTH + 0.8) * smoothstep(1.0, LAKE_DISC, dn)
    floor += 0.5 * smoothstep(LAKE_DISC, 1.5, dn) * (1.0 - smoothstep(1.7, 2.3, dn))
    # The headwall on the uphill side may climb steeply, but not as a cliff.
    cap = level - LAKE_DEPTH + 18.0 * smoothstep(1.0, 1.25, dn) + 80.0 * smoothstep(1.25, 1.8, dn)
    weight = 1.0 - smoothstep(1.7, 2.4, dn)
    target = min(max(h, floor), cap)
    return h + (target - h) * weight


def in_water(x: float, y: float, ground: float | None = None) -> bool:
    """Over open water: inside a lake's disc with the ground under the
    water level (the terrain rising through the disc is the shore)."""
    for entry in LAKES:
        c = lake_center(entry)
        if math.hypot(x - c.x, y - c.y) < entry[3] * LAKE_DISC:
            z = height(x, y) if ground is None else ground
            if z < lake_level(entry[0]):
                return True
    return False


# ---------------------------------------------------------------------------
# Sites and terraces
# ---------------------------------------------------------------------------


def site(slug: str):
    if slug == "hub":
        return HUB_SITE
    return next(entry for entry in SITES if entry[0] == slug)


def site_slugs() -> list[str]:
    return ["hub", *RAIL_ORDER]


def site_radius(slug: str) -> float:
    return site(slug)[5]


@lru_cache(maxsize=None)
def site_xy(slug: str) -> tuple[float, float]:
    """Terrace centre in the plane. Shore sites sit on the hub-facing shore
    of their lake, pulled back so the terrace edge clears the water."""
    _slug, landmark, kind, theta, rho, radius = site(slug)
    if kind == "pad":
        return (0.0, 0.0)
    if kind == "shore":
        # Where the bearing from the hub first meets the circle around the
        # lake at which the terrace edge clears the water by SHORE_GAP.
        entry = lake(landmark)
        c = lake_center(entry)
        reach = entry[3] * LAKE_DISC + radius + SHORE_GAP
        a = math.radians(theta)
        dx, dy = math.cos(a), math.sin(a)
        along = dx * c.x + dy * c.y
        off2 = c.length_squared - along * along
        t = along - math.sqrt(max(0.0, reach * reach - off2))
        return (t * dx, t * dy)
    p = polar_point(theta, rho)
    return (p.x, p.y)


@lru_cache(maxsize=None)
def terrace_level(slug: str) -> float:
    """Flat level of a terrace: the natural ground at its centre minus a
    small cut, rounded to half a metre. The hub pad is z = 0; a shore plot
    sits just above its lake so the water laps at its edge."""
    _slug, landmark, kind, _theta, _rho, _radius = site(slug)
    if kind == "pad":
        return 0.0
    if kind == "shore":
        return round((lake_level(landmark) + SHORE_FREEBOARD) * 2.0) / 2.0
    x, y = site_xy(slug)
    return round((natural(x, y) - TERRACE_CUT) * 2.0) / 2.0


def site_center(slug: str) -> Vector:
    """Terrace centre, z at the terrace level."""
    x, y = site_xy(slug)
    return Vector((x, y, terrace_level(slug)))


def toward_hub(slug: str) -> Vector:
    x, y = site_xy(slug)
    v = Vector((-x, -y, 0.0))
    return v.normalized() if v.length > 1e-6 else Vector((0.0, -1.0, 0.0))


def site_yaw_to_hub(slug: str) -> float:
    """Yaw (radians about +Z) that turns an installation's local -Y side to
    face the hub. Installations were authored on the plate to be seen from
    the hub looking +y, so their front faces -Y; pass this to
    ``World.place`` and the same front faces the valley and the rail."""
    d = toward_hub(slug)
    return math.atan2(d.y, d.x) + math.pi / 2.0


def station(slug: str) -> Vector:
    """Where the rail stops for a site: just outside its terrace edge on the
    hub side. z is left at 0; the router and the snap supply it."""
    if slug == "hub":
        return HUB_STATION.copy()
    x, y = site_xy(slug)
    return Vector((x, y, 0.0)) + toward_hub(slug) * (1.05 * site_radius(slug))


def terrace_front(slug: str) -> Vector:
    """The trail waypoint of a site: on the terrace, toward the hub."""
    x, y = site_xy(slug)
    return Vector((x, y, 0.0)) + toward_hub(slug) * (0.7 * site_radius(slug))


def _smin(a: float, b: float, k: float) -> float:
    if k <= 1e-6:
        return min(a, b)
    h = max(k - abs(a - b), 0.0) / k
    return min(a, b) - h * h * k * 0.25


def _smax(a: float, b: float, k: float) -> float:
    return -_smin(-a, -b, k)


@lru_cache(maxsize=None)
def _terrace_table() -> tuple:
    return tuple((*site_xy(s), terrace_level(s), site_radius(s)) for s in site_slugs())


def terrace(cx: float, cy: float, level: float, radius: float, x: float, y: float, h: float) -> float:
    """Cut one terrace into the ground. Flat at ``level`` inside the radius
    and a bench falling at ``APRON_SLOPE`` across the apron; beyond it the
    ground is clamped between a fill bank falling away and a cut headwall
    rising behind, both eased in from zero over the first
    ``TERRACE_EASE`` metres so the edge rolls over instead of ending in a
    crease, and both steepening with distance so the clamp always meets the
    natural ground again. The soft clamp hands back over ``BANK_SOFT``
    metres; natural ground already inside the window is untouched."""
    d = math.hypot(x - cx, y - cy)
    s = d - radius
    if s <= 0.0:
        return level
    apron = max(APRON_MIN, APRON_FRAC * radius)
    if s <= apron:
        return level - APRON_SLOPE * s
    level -= APRON_SLOPE * apron
    s -= apron
    b = TERRACE_EASE
    ramp = s * s / (2.0 * b) if s < b else s - b * 0.5
    grow = max(0.0, s - b)
    ramp += G_GROW * grow * grow / (2.0 * radius)
    cap = level + G_CUT * ramp
    floor = level - G_FILL * ramp
    k = min(BANK_SOFT, 0.5 * (cap - floor))
    return _smin(_smax(h, floor, k), cap, k)


def height(x: float, y: float) -> float:
    """The finished ground: natural relief, terraces, then the lakes."""
    h = natural(x, y)
    for cx, cy, level, radius in _terrace_table():
        h = terrace(cx, cy, level, radius, x, y, h)
    for entry in LAKES:
        h = basin(entry, x, y, h)
    return h


height_at = height


# ---------------------------------------------------------------------------
# The polar grid the mesh is built on, and the raster the routers read
# ---------------------------------------------------------------------------


@lru_cache(maxsize=None)
def ring_radii() -> tuple[float, ...]:
    """Radius of every mesh ring from the centre (0) to the rim. Coarse
    across the valley, the old backdrop's density across the range, blended
    so the rings never jump in spacing."""
    radii = [0.0]
    r = 0.0
    while r < OUTER:
        step = RING_STEP_VALLEY + (RING_STEP_RANGE - RING_STEP_VALLEY) * smoothstep(INNER - 70.0, INNER - 10.0, r)
        r += step
        radii.append(r)
    scale = OUTER / radii[-1]
    return tuple(v * scale for v in radii)


@lru_cache(maxsize=None)
def polar_heights() -> np.ndarray:
    """Exact heights at every mesh vertex: shape (rings, SEGMENTS). Ring 0
    is the centre, repeated per segment."""
    noise.seed_set(SEED)
    radii = ring_radii()
    out = np.zeros((len(radii), SEGMENTS), dtype=np.float64)
    angles = [j / SEGMENTS * math.tau for j in range(SEGMENTS)]
    trig = [(math.cos(a), math.sin(a)) for a in angles]
    for i, r in enumerate(radii):
        if i == 0:
            out[0, :] = height(0.0, 0.0)
            continue
        row = out[i]
        for j, (c, s) in enumerate(trig):
            row[j] = height(r * c, r * s)
    return out


def sample_polar(xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    """Height of the mesh surface at (x, y): the polar vertex grid
    interpolated the way the mesh triangulates it. Each quad is split along
    the diagonal with the smaller height difference (see ``build_range`` in
    the range session), and the point is interpolated linearly over the
    triangle it lands in, so the routers and the smoother see the same
    stairs of planar triangles the Dozer drives on, not a bilinear surface
    that is up to a quarter of the quad's twist off it."""
    grid = polar_heights()
    radii = np.asarray(ring_radii())
    rho = np.hypot(xs, ys)
    theta = np.mod(np.arctan2(ys, xs), math.tau) / math.tau * SEGMENTS
    rho = np.clip(rho, 0.0, radii[-1] - 1e-6)
    i0 = np.clip(np.searchsorted(radii, rho, side="right") - 1, 0, len(radii) - 2)
    fr = (rho - radii[i0]) / (radii[i0 + 1] - radii[i0])
    j0 = np.floor(theta).astype(np.int64) % SEGMENTS
    j1 = (j0 + 1) % SEGMENTS
    ft = theta - np.floor(theta)
    h00, h01 = grid[i0, j0], grid[i0, j1]
    h10, h11 = grid[i0 + 1, j0], grid[i0 + 1, j1]
    # Corners as the mesh names them: a = (i, j), b = (i, j1), c = (i+1, j1),
    # d = (i+1, j). Split a-c when |a - c| <= |b - d|, else b-d.
    split_ac = np.abs(h00 - h11) <= np.abs(h01 - h10)
    lower_ac = h00 + fr * (h10 - h00) + ft * (h11 - h10)  # triangle a, d, c (ft <= fr)
    upper_ac = h00 + ft * (h01 - h00) + fr * (h11 - h01)  # triangle a, c, b
    lower_bd = h00 + fr * (h10 - h00) + ft * (h01 - h00)  # triangle a, d, b (fr + ft <= 1)
    upper_bd = h11 + (1.0 - fr) * (h01 - h11) + (1.0 - ft) * (h10 - h11)  # triangle d, c, b
    on_ac = np.where(ft <= fr, lower_ac, upper_ac)
    on_bd = np.where(fr + ft <= 1.0, lower_bd, upper_bd)
    return np.where(split_ac, on_ac, on_bd)


class Raster:
    """A square grid of heights over the disc, ``RASTER_CELL`` apart, with
    the per-cell masks the routers need. Index (i, j) is x, y."""

    def __init__(self) -> None:
        self.cell = RASTER_CELL
        self.n = int(math.ceil(2 * OUTER / self.cell)) + 1
        self.origin = -OUTER
        coords = self.origin + np.arange(self.n) * self.cell
        xs, ys = np.meshgrid(coords, coords, indexing="ij")
        self.xs, self.ys = xs, ys
        self.rho = np.hypot(xs, ys)
        self.h = sample_polar(xs.ravel(), ys.ravel()).reshape(xs.shape)
        # Lakes: cells inside the wobbled shoreline, plus a margin.
        self.lake_dn = np.full(xs.shape, np.inf)
        for entry in LAKES:
            c = lake_center(entry)
            reach = 2.5 * entry[3]
            i_lo, i_hi = self.index(c.x - reach), self.index(c.x + reach)
            j_lo, j_hi = self.index(c.y - reach), self.index(c.y + reach)
            for i in range(i_lo, i_hi + 1):
                for j in range(j_lo, j_hi + 1):
                    dn = lake_dn(entry, float(xs[i, j]), float(ys[i, j]))
                    if dn is not None:
                        self.lake_dn[i, j] = min(self.lake_dn[i, j], dn)
        # Distance to each terrace over its radius, minimum over sites.
        self.terrace_dn = np.full(xs.shape, np.inf)
        self.terrace_slug = np.full(xs.shape, -1, dtype=np.int64)
        for k, (cx, cy, _level, radius) in enumerate(_terrace_table()):
            dn = np.hypot(xs - cx, ys - cy) / radius
            closer = dn < self.terrace_dn
            self.terrace_dn = np.where(closer, dn, self.terrace_dn)
            self.terrace_slug = np.where(closer, k, self.terrace_slug)
        self.h_list = self.h.tolist()

    def index(self, v: float) -> int:
        return max(0, min(self.n - 1, int(round((v - self.origin) / self.cell))))

    def cell_of(self, p: Vector) -> tuple[int, int]:
        return (self.index(p.x), self.index(p.y))

    def point(self, i: int, j: int) -> Vector:
        return Vector((self.origin + i * self.cell, self.origin + j * self.cell, 0.0))


@lru_cache(maxsize=None)
def raster() -> Raster:
    return Raster()


# ---------------------------------------------------------------------------
# Routing: A* over the raster, then smoothing
# ---------------------------------------------------------------------------

STEPS = [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1),
         (2, 1), (1, 2), (-1, 2), (-2, 1), (-2, -1), (-1, -2), (1, -2), (2, -1)]
STEP_DIRS = [Vector((di, dj, 0.0)).normalized() for di, dj in STEPS]


class Profile:
    """How a router values the ground. ``stride`` is in raster cells;
    ``factor`` and ``blocked`` are full-raster arrays; ``grade_k`` weights the
    squared grade, ``grade_max`` is a hard cap, ``turn_k`` weights turning,
    ``max_turn`` is the largest single turn in degrees and ``cooldown`` the
    number of straight steps required between turns (it sets a minimum
    curve radius). ``relax`` lists the grade caps a failing leg is retried
    with before giving up, so one sheer landmark does not sink the loop."""

    def __init__(self, factor, blocked, stride=1, grade_k=16.0, grade_max=0.5, turn_k=8.0,
                 max_turn=180.0, cooldown=0, margin=50.0, heuristic=0.65, relax=(), mid_grade=None):
        self.factor = factor.tolist()
        self.blocked = blocked.tolist()
        self.blocked_np = np.asarray(blocked, dtype=bool)
        self.stride = stride
        self.grade_k = grade_k
        self.grade_max = grade_max
        self.turn_k = turn_k
        self.cos_max_turn = math.cos(math.radians(max_turn)) - 1e-6
        self.cooldown = cooldown
        self.margin = margin
        self.heuristic = heuristic
        self.relax = tuple(relax)
        # With a stride, the grade over each half step is checked against
        # this instead of ``grade_max``: a railway's own profile absorbs a
        # short steep bit, so only a cliff needs refusing there.
        self.mid_grade = mid_grade


def astar(start: Vector, goal: Vector, prof: Profile, heading: int = -1) -> tuple[list[Vector], int]:
    """Least-cost path over the raster. A step costs its length times the
    ground factor and a grade penalty, plus a penalty for turning, so the
    path threads the valleys and crosses steep ground in long traverses
    joined by real switchbacks instead of a sawtooth. ``heading`` is the step
    index the path arrives with, so consecutive legs join smoothly; the path
    and its final heading are returned. The start and goal cells are always
    enterable, whatever the masks say."""
    ras = raster()
    st = prof.stride
    H = ras.h_list
    F = prof.factor
    B = prof.blocked
    cell = ras.cell
    lo_i = ras.index(min(start.x, goal.x) - prof.margin)
    hi_i = ras.index(max(start.x, goal.x) + prof.margin)
    lo_j = ras.index(min(start.y, goal.y) - prof.margin)
    hi_j = ras.index(max(start.y, goal.y) + prof.margin)
    s = ras.cell_of(start)
    g = ras.cell_of(goal)
    # Snap the start onto the stride lattice through the goal so the goal is
    # reachable exactly.
    s = (g[0] + round((s[0] - g[0]) / st) * st, g[1] + round((s[1] - g[1]) / st) * st)
    gx, gy = g[0] * cell, g[1] * cell
    steps = [(di * st, dj * st) for di, dj in STEPS]
    lengths = [math.hypot(di, dj) * cell for di, dj in steps]
    dots = [[STEP_DIRS[a].dot(STEP_DIRS[b]) for b in range(16)] for a in range(16)]
    cool = prof.cooldown
    start_state = (s[0], s[1], heading, cool)
    best = {start_state: 0.0}
    came: dict = {}
    frontier = [(0.0, start_state)]
    done = None
    hk = prof.heuristic
    while frontier:
        f, state = heapq.heappop(frontier)
        ci, cj, d, c = state
        if (ci, cj) == g:
            done = state
            break
        base = best[state]
        if f > base + hk * math.hypot(ci * cell - gx, cj * cell - gy) + 1e-6:
            continue
        cz = H[ci][cj]
        for k in range(16):
            turn = 0.0
            if d >= 0 and k != d:
                dot = dots[d][k]
                if dot < prof.cos_max_turn or c < cool:
                    continue
                turn = prof.turn_k * (1.0 - dot)
            di, dj = steps[k]
            ni, nj = ci + di, cj + dj
            if not (lo_i <= ni <= hi_i and lo_j <= nj <= hi_j):
                continue
            is_goal = (ni, nj) == g
            if B[ni][nj] and not is_goal:
                continue
            mi, mj = ci + di // 2 if st > 1 else ni, cj + dj // 2 if st > 1 else nj
            if st > 1 and B[mi][mj] and not is_goal and (mi, mj) != (ci, cj):
                continue
            length = lengths[k]
            nz = H[ni][nj]
            grade = abs(nz - cz) / length
            if grade > prof.grade_max:
                continue
            if st > 1:
                mz = H[mi][mj]
                mid = max(abs(mz - cz), abs(nz - mz)) / (length * 0.5)
                if mid > (prof.grade_max if prof.mid_grade is None else prof.mid_grade):
                    continue
            cost = length * (1.0 + prof.grade_k * grade * grade) * 0.5 * (F[ci][cj] + F[ni][nj]) + turn
            nc = 0 if (d >= 0 and k != d) else min(cool, c + 1)
            key = (ni, nj, k, nc)
            tentative = base + cost
            if tentative < best.get(key, float("inf")):
                best[key] = tentative
                came[key] = state
                heapq.heappush(frontier, (tentative + hk * math.hypot(ni * cell - gx, nj * cell - gy), key))
    if done is None:
        raise RuntimeError(f"route: no path from {tuple(round(v, 1) for v in start)} to {tuple(round(v, 1) for v in goal)}")
    path = [done]
    while path[-1] in came:
        path.append(came[path[-1]])
    path.reverse()
    return [ras.point(i, j) for i, j, _d, _c in path], done[2]


def route_leg(start: Vector, goal: Vector, prof: Profile, heading: int = -1) -> tuple[list[Vector], int, float]:
    """``astar`` at the profile's grade cap, then at each ``relax`` cap in
    turn. Returns the path, the final heading and the cap that worked."""
    caps = (prof.grade_max, *prof.relax)
    base = prof.grade_max
    try:
        for cap in caps:
            prof.grade_max = cap
            try:
                path, heading = astar(start, goal, prof, heading)
                return path, heading, cap
            except RuntimeError:
                if cap == caps[-1]:
                    raise
    finally:
        prof.grade_max = base
    raise AssertionError("unreachable")


def hairpins(points: list[Vector], closed: bool, angle: float = 110.0) -> list[int]:
    """Indices of the vertices where the path turns by more than ``angle``
    degrees: switchback tips."""
    out = []
    n = len(points)
    limit = math.cos(math.radians(angle))
    for i in range(n if closed else n - 1):
        if not closed and i == 0:
            continue
        a, b, c = points[i - 1], points[i], points[(i + 1) % n]
        u, v = b - a, c - b
        if u.length > 1e-6 and v.length > 1e-6 and u.normalized().dot(v.normalized()) < limit:
            out.append(i)
    return out


def smooth(points: list[Vector], passes: int = 3, closed: bool = False, keep: float = 110.0) -> list[Vector]:
    """Chaikin smoothing that keeps switchback tips: the path is split at
    every turn sharper than ``keep`` degrees and each piece is smoothed with
    its ends fixed. Cutting the corner of a hairpin would drive the line
    straight up the fall line between the two legs."""
    tips = hairpins(points, closed, keep)
    if not tips:
        return chaikin(points, passes, closed)
    if closed:
        # Rotate so the loop starts on a tip, then treat it as open.
        k = tips[0]
        ring = points[k:] + points[:k] + [points[k]]
        out = smooth(ring, passes, False, keep)
        return out[:-1]
    out: list[Vector] = []
    cuts = [0, *tips, len(points) - 1]
    for a, b in zip(cuts, cuts[1:]):
        piece = chaikin(points[a : b + 1], passes) if b - a > 1 else points[a : b + 1]
        out.extend(piece if not out else piece[1:])
    return out


def relax(points: list[Vector], closed: bool, grade_max: float, blocked=None,
          iterations: int = 40, lam: float = 0.5, repair_step: float = 0.35) -> list[Vector]:
    """Grade-constrained Laplacian smoothing of a dense polyline.

    Corner cutting moves every point across the slope by a fraction of a
    cell, which on a 60 degree flank turns a traverse the router graded at
    0.45 into a 1.7 step; Chaikin cannot know about the ground. Here each
    point is pulled toward the midpoint of its neighbours only if both of
    its segments, measured on the mesh surface at the new position, stay
    under ``grade_max`` and the new cell is not ``blocked``. A segment that
    already breaks the cap (the router's steps hide steepness inside them)
    may still be moved when the move makes its worst grade smaller, and if
    the pull toward the midpoint does not, a short step along the ground's
    gradient toward the neighbour's height is tried instead, so the line
    heals itself onto the contour. Points move in two interleaved halves so
    a checked segment never has both ends move at once. Ends of an open
    line are fixed."""
    ras = raster()
    P = np.array([[p.x, p.y] for p in points], dtype=np.float64)
    n = len(P)
    if n < 3:
        return list(points)
    z = sample_polar(P[:, 0], P[:, 1])
    eps = 0.25

    def clear(Q: np.ndarray) -> np.ndarray:
        if blocked is None:
            return np.ones(len(Q), dtype=bool)
        # All four cells around the new point must be clear, so a blocked
        # disc is never entered by rounding to the far cell.
        u = (Q[:, 0] - ras.origin) / ras.cell
        v = (Q[:, 1] - ras.origin) / ras.cell
        ok = np.ones(len(Q), dtype=bool)
        for ci, cj in ((np.floor(u), np.floor(v)), (np.floor(u), np.ceil(v)), (np.ceil(u), np.floor(v)), (np.ceil(u), np.ceil(v))):
            ci = np.clip(ci, 0, ras.n - 1).astype(np.int64)
            cj = np.clip(cj, 0, ras.n - 1).astype(np.int64)
            ok &= ~blocked[ci, cj]
        return ok

    def grades(Q: np.ndarray, zq: np.ndarray, prev, nxt, zp, zn):
        g1 = np.abs(zq - zp) / np.maximum(np.hypot(*(Q - prev).T), 1e-6)
        g2 = np.abs(zq - zn) / np.maximum(np.hypot(*(Q - nxt).T), 1e-6)
        return np.maximum(g1, g2)

    for _ in range(iterations):
        for parity in (0, 1):
            idx = np.arange(parity, n, 2)
            if not closed:
                idx = idx[(idx > 0) & (idx < n - 1)]
            if idx.size == 0:
                continue
            prev, nxt = P[(idx - 1) % n], P[(idx + 1) % n]
            zp, zn = z[(idx - 1) % n], z[(idx + 1) % n]
            cur = grades(P[idx], z[idx], prev, nxt, zp, zn)
            # Candidate 1: toward the neighbours' midpoint.
            Q = P[idx] + lam * ((prev + nxt) * 0.5 - P[idx])
            zq = sample_polar(Q[:, 0], Q[:, 1])
            g = grades(Q, zq, prev, nxt, zp, zn)
            ok = ((g <= grade_max) | (g < cur - 1e-3)) & clear(Q)
            # Candidate 2, where 1 failed on a segment already over the cap:
            # step along the ground gradient toward the steeper neighbour's
            # height, which shortens the height difference without moving far.
            need = ~ok & (cur > grade_max)
            if need.any():
                k = idx[need]
                Pk = P[k]
                gx = (sample_polar(Pk[:, 0] + eps, Pk[:, 1]) - sample_polar(Pk[:, 0] - eps, Pk[:, 1])) / (2 * eps)
                gy = (sample_polar(Pk[:, 0], Pk[:, 1] + eps) - sample_polar(Pk[:, 0], Pk[:, 1] - eps)) / (2 * eps)
                norm = np.maximum(np.hypot(gx, gy), 1e-6)
                d1 = np.abs(z[k] - zp[need])
                d2 = np.abs(z[k] - zn[need])
                target = np.where(d1 >= d2, zp[need], zn[need])
                sign = np.where(z[k] > target, -1.0, 1.0)
                Q2 = Pk + (sign * repair_step / norm)[:, None] * np.stack([gx, gy], axis=1)
                zq2 = sample_polar(Q2[:, 0], Q2[:, 1])
                g2 = grades(Q2, zq2, prev[need], nxt[need], zp[need], zn[need])
                ok2 = (g2 < cur[need] - 1e-3) & clear(Q2)
                sel = np.flatnonzero(need)[ok2]
                Q[sel] = Q2[ok2]
                zq[sel] = zq2[ok2]
                ok[sel] = True
            P[idx[ok]] = Q[ok]
            z[idx[ok]] = zq[ok]
    return [Vector((float(x), float(y), 0.0)) for x, y in P]


def grade_limited_profile(points, closed: bool, grade_max: float) -> list[tuple[float, float, float]]:
    """A railway's vertical alignment: the lowest profile that is never
    under the given z at any point and never steeper than ``grade_max``
    between neighbours. Where the ground drops faster than the cap the
    track stays up and comes down at the cap, a short trestle; where it
    rises faster the track was routed elsewhere. Two passes each way round
    a closed loop settle the wrap."""
    z = [p[2] for p in points]
    n = len(z)
    d = [math.hypot(points[(i + 1) % n][0] - points[i][0], points[(i + 1) % n][1] - points[i][1]) for i in range(n)]
    rounds = 2 if closed else 1
    for _ in range(rounds):
        rng = range(1, n) if not closed else range(n)
        for i in rng:
            j = (i - 1) % n
            z[i] = max(z[i], z[j] - grade_max * d[j])
        rng = range(n - 2, -1, -1) if not closed else range(n - 1, -1, -1)
        for i in rng:
            j = (i + 1) % n
            z[i] = max(z[i], z[j] - grade_max * d[i])
    return [(p[0], p[1], zi) for p, zi in zip(points, z)]


def chaikin(points: list[Vector], passes: int = 3, closed: bool = False) -> list[Vector]:
    """Corner cutting. Open polylines keep their end points; closed ones are
    treated as a loop."""
    for _ in range(passes):
        out = [] if closed else [points[0]]
        pairs = zip(points, points[1:] + points[:1]) if closed else zip(points, points[1:])
        for a, b in pairs:
            out.append(a.lerp(b, 0.25))
            out.append(a.lerp(b, 0.75))
        if not closed:
            out.append(points[-1])
        points = out
    return points


def resample(points: list[Vector], step: float) -> list[Vector]:
    """Evenly spaced points along an open polyline, ends kept."""
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


def dedupe(points: list[Vector]) -> list[Vector]:
    out = [points[0]]
    for p in points[1:]:
        if (p - out[-1]).length > 1e-6:
            out.append(p)
    return out


# ---------------------------------------------------------------------------
# Router profiles
# ---------------------------------------------------------------------------


def rail_profile() -> Profile:
    """The railway: terraces (the installations fill them), water and the
    rim are off limits; the band just outside each terrace edge is cheap so
    the line skirts the installation; the grade penalty is strong (the
    cheapest climb is about 14 percent) with a hard cap at 0.4, and turning
    is dear so curves are long and the line does not trace every gully."""
    ras = raster()
    blocked = (ras.terrace_dn < 1.0) | (ras.lake_dn < 1.35) | (ras.rho > OUTER - 14.0)
    factor = np.ones(ras.h.shape)
    factor = np.where((ras.terrace_dn > 1.02) & (ras.terrace_dn < 1.35), 0.6, factor)
    return Profile(factor, blocked, stride=2, grade_k=50.0, grade_max=0.4, turn_k=30.0,
                   max_turn=46.0, cooldown=0, margin=110.0, heuristic=0.6, relax=(0.45, 0.5), mid_grade=0.9)


def trail_profile() -> Profile:
    """Hiking trails: water and the rim are off limits, terraces are fine
    (they are flat), shores are cheap so a trail hugs them, and a little
    noise everywhere makes a flat valley floor give a wandering path
    instead of a surveyor's line. Graded for the Dozer: capped at 0.4 so the
    smoothed line, checked at 0.6 on the mesh, keeps a margin under the
    0.7 the tracks hold."""
    ras = raster()
    blocked = (ras.lake_dn < 1.28) | (ras.rho > OUTER - 12.0)
    wander = np.vectorize(lambda x, y: fbm(x * 0.05 + 2.0, y * 0.05 - 1.0, 2))(ras.xs, ras.ys)
    factor = 1.0 + 0.7 * (0.5 + 0.5 * wander)
    factor = np.where(ras.lake_dn < 1.6, 0.65 * factor, factor)
    return Profile(factor, blocked, stride=1, grade_k=16.0, grade_max=0.4, turn_k=10.0,
                   max_turn=180.0, cooldown=0, margin=60.0, heuristic=0.65, relax=(0.45, 0.5))
