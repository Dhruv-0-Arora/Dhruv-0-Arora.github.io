"""Session 01: greybox blockout of the whole world.

Idempotent: wipes every object in the scene and rebuilds from scratch, so it
can be re-run in the live Blender through the MCP or headlessly:

    blender --background --python-exit-code 1 \
        --python assets/blender/scripts/sessions/01_greybox.py -- \
        --save assets/blender/world.blend

Every mesh is a primitive with a contract material. Detail passes (M3)
replace installations one district at a time; this file stays the record of
the layout decisions: district centers, road graph, rail loop, zones.

Frame: Blender Z-up, meters. ``export_world.py`` converts to glTF Y-up.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import random
import sys

import bpy
from mathutils import Vector

# ---------------------------------------------------------------------------
# Layout (Blender x, y). Hub at the origin; districts on a rough ring.
# ---------------------------------------------------------------------------

HUB = Vector((0.0, 0.0, 0.0))
CENTERS = {
    "terminal": Vector((-130.0, 20.0, 0.0)),
    "redacted": Vector((-70.0, 140.0, 0.0)),
    "evidence": Vector((110.0, 110.0, 0.0)),
    "fabrication": Vector((110.0, -100.0, 0.0)),
}

# Closed rail loop: hub -> terminal -> redacted -> evidence -> fabrication -> hub.
RAIL = [
    (0.0, -40.0, 12.0),
    (-70.0, -30.0, 14.0),
    (-130.0, -25.0, 16.0),
    (-165.0, 60.0, 18.0),
    (-115.0, 140.0, 20.0),
    (0.0, 155.0, 22.0),
    (95.0, 135.0, 18.0),
    (155.0, 40.0, 16.0),
    (145.0, -85.0, 14.0),
    (70.0, -125.0, 12.0),
]

# (t along the loop, look-at point). Sorted by t. Installations are placed so
# the camera is roughly abeam of them at these fractions.
LOOKS = [
    (0.00, (0.0, 0.0, 2.0)),
    (0.14, (-130.0, 30.0, 8.0)),  # astute monument
    (0.22, (-150.0, -5.0, 2.0)),  # keyboard terrain
    (0.40, (-70.0, 140.0, 9.0)),  # redacted building
    (0.55, (110.0, 125.0, 10.0)),  # nazar graph
    (0.62, (110.0, 95.0, 1.0)),  # cypher hex field
    (0.78, (110.0, -85.0, 12.0)),  # orion gantry
    (0.88, (110.0, -120.0, 1.0)),  # frc field
    (1.00, (0.0, 0.0, 2.0)),
]

# Zone slug -> (position, radius). Positions are refined below once the
# installations exist; radii are the proximity trigger distance.
ZONE_RADII = {
    "astute": 22.0,
    "stalk": 26.0,
    "dirnt": 18.0,
    "cypher": 40.0,
    "altigoz": 20.0,
    "nazar": 20.0,
    "kerms": 14.0,
    "imc-prosperity-4": 14.0,
    "wisconsin-racing": 22.0,
    "orion": 28.0,
    "agentic-cad-spike": 14.0,
    "synthesis": 20.0,
    "swiftlabs-platform": 30.0,
}

HERE = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(HERE, "..", "..", "contract.json")

# Light-theme token values from src/index.css, only for viewport preview.
# The runtime retints from CSS custom properties; the glb color is a fallback.
PREVIEW = {
    "tok.bg": "#fafaf8",
    "tok.surface": "#ffffff",
    "tok.surface-2": "#f1efea",
    "tok.border": "#e4e2dd",
    "tok.text": "#1a1d21",
    "tok.muted": "#545d6b",
    "tok.faint": "#6b7280",
    "tok.accent": "#e05e0b",
    "tok.on-accent": "#16181c",
    "tok.hue-green": "#048359",
    "tok.hue-sky": "#0076c5",
    "tok.hue-violet": "#8747f2",
    "tok.hue-rose": "#dd1a4c",
    "tok.hue-amber": "#b75807",
    "tok.hue-green-vivid": "#059669",
    "tok.hue-sky-vivid": "#0284c7",
    "tok.hue-violet-vivid": "#7c3aed",
    "tok.hue-rose-vivid": "#e11d48",
    "tok.hue-amber-vivid": "#d97706",
    "ramp.importance.1": "#6b7280",
    "ramp.importance.2": "#0076c5",
    "ramp.importance.3": "#0284c7",
    "ramp.importance.4": "#b75807",
    "ramp.importance.5": "#dd1a4c",
    "grad.dirnt": "#048359",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgb(value: str) -> tuple[float, float, float]:
    v = value.lstrip("#")
    return tuple(srgb_to_linear(int(v[i : i + 2], 16) / 255.0) for i in (0, 2, 4))


def material(name: str) -> bpy.types.Material:
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
    rgb = hex_rgb(PREVIEW[name])
    mat.diffuse_color = (*rgb, 1.0)
    mat.roughness = 0.85
    tree = getattr(mat, "node_tree", None)
    if tree is not None:
        bsdf = next((n for n in tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf is not None:
            bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.85
    return mat


class World:
    """Collections plus mesh factories that always land in the right one."""

    def __init__(self, contract: dict) -> None:
        self.contract = contract
        cols = contract["collections"]
        scene = bpy.context.scene
        self.root = self._collection(cols["root"], scene.collection)
        self.by_district = {
            d: self._collection(name, self.root) for d, name in cols["districts"].items()
        }
        self.colliders = self._collection(cols["colliders"], self.root)
        self.rails = self._collection(cols["rails"], self.root)
        self.review = self._collection("Review", scene.collection)
        self.drivable: list[bpy.types.Object] = []

    @staticmethod
    def _collection(name: str, parent: bpy.types.Collection) -> bpy.types.Collection:
        col = bpy.data.collections.get(name)
        if col is None:
            col = bpy.data.collections.new(name)
        if col.name not in parent.children:
            parent.children.link(col)
        return col

    def wipe(self) -> None:
        """This file owns the whole scene: drop every object, then orphans."""
        for obj in list(bpy.context.scene.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        stray = bpy.data.collections.get("Collection")
        if stray is not None and not stray.objects and not stray.children:
            bpy.data.collections.remove(stray)
        for block in (bpy.data.meshes, bpy.data.curves, bpy.data.cameras):
            for datum in list(block):
                if datum.users == 0:
                    block.remove(datum)

    def _all_objects(self, col: bpy.types.Collection):
        yield from col.objects
        for child in col.children:
            yield from self._all_objects(child)

    # -- primitives ---------------------------------------------------------

    def _add(self, obj: bpy.types.Object, col: bpy.types.Collection) -> bpy.types.Object:
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        col.objects.link(obj)
        return obj

    def box(self, name, col, center, size, mat, yaw=0.0, drivable=False):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.scale = size
        obj.rotation_euler = (0.0, 0.0, yaw)
        obj.data.materials.append(material(mat))
        self._add(obj, col)
        if drivable:
            self.drivable.append(obj)
        return obj

    def cylinder(self, name, col, center, radius, height, mat, verts=16, drivable=False):
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=verts, radius=radius, depth=height, location=center
        )
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.data.materials.append(material(mat))
        self._add(obj, col)
        if drivable:
            self.drivable.append(obj)
        return obj

    def sphere(self, name, col, center, radius, mat):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.data.materials.append(material(mat))
        return self._add(obj, col)

    def plane(self, name, col, center, size, mat, drivable=False):
        bpy.ops.mesh.primitive_plane_add(size=1.0, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.scale = (size[0], size[1], 1.0)
        obj.data.materials.append(material(mat))
        self._add(obj, col)
        if drivable:
            self.drivable.append(obj)
        return obj

    def empty(self, name, col, location, size=1.0, **props):
        obj = bpy.data.objects.new(name, None)
        obj.location = location
        obj.empty_display_type = "CUBE"
        obj.empty_display_size = size
        for k, v in props.items():
            obj[k] = v
        col.objects.link(obj)
        return obj

    def collider_box(self, name: str, center, size) -> bpy.types.Object:
        """An empty whose world AABB is exactly ``size`` (display size 0.5 x scale)."""
        obj = self.empty(f"col.box.{name}", self.colliders, center, size=0.5)
        obj.scale = size
        return obj

    def camera(self, name: str, location, target, lens=32.0) -> bpy.types.Object:
        data = bpy.data.cameras.new(name)
        data.lens = lens
        data.clip_end = 2000.0
        cam = bpy.data.objects.new(name, data)
        cam.location = location
        direction = Vector(target) - Vector(location)
        cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        self.review.objects.link(cam)
        return cam


# ---------------------------------------------------------------------------
# Districts
# ---------------------------------------------------------------------------


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
        length = d.length
        mid = HUB + d * 0.5
        w.box(
            f"shared.road.{district}",
            col,
            (mid.x, mid.y, 0.05),
            (length, 8.0, 0.1),
            "tok.surface-2",
            yaw=math.atan2(d.y, d.x),
            drivable=True,
        )


def build_terminal(w: World) -> None:
    col = w.by_district["terminal"]
    c = CENTERS["terminal"]
    rng = random.Random(1)

    # astute monument: braille node cloud over a plinth, importance ramp.
    ax, ay = c.x, c.y + 10.0
    w.cylinder("terminal.astute.base", col, (ax, ay, 0.4), 12.0, 0.8, "tok.surface", verts=24, drivable=True)
    w.cylinder("terminal.astute.mast", col, (ax, ay, 9.0), 0.4, 18.0, "tok.border", verts=8)
    for i in range(40):
        importance = 1 + min(4, int(rng.expovariate(1.2)))
        r = rng.uniform(1.5, 9.0)
        a = rng.uniform(0, math.tau)
        z = 3.0 + rng.uniform(0, 14.0)
        w.box(
            f"terminal.astute.node.{i:03d}",
            col,
            (ax + r * math.cos(a), ay + r * math.sin(a), z),
            (0.8, 0.8, 0.8),
            f"ramp.importance.{importance}",
        )
    w.collider_box("astute", (ax, ay, 0.4), (24.0, 24.0, 0.8))

    # stalk keyboard as terrain: two 3x6 halves plus thumb keys.
    for side, sx in (("left", c.x - 24.0), ("right", c.x + 4.0)):
        base_c = (sx, c.y - 26.0, 0.6)
        w.box(f"terminal.keyboard.{side}", col, base_c, (22.0, 14.0, 1.2), "tok.surface-2", yaw=0.12 if side == "left" else -0.12)
        w.collider_box(f"keyboard-{side}", base_c, (22.0, 14.0, 1.2))
        for row in range(3):
            for k in range(6):
                w.box(
                    f"terminal.keyboard.key.{side[0]}{row}{k}",
                    col,
                    (sx - 8.0 + k * 3.2, c.y - 21.0 - row * 3.4, 1.7),
                    (2.6, 2.6, 1.0),
                    "tok.hue-green",
                )
        for k in range(2):
            w.box(
                f"terminal.keyboard.thumb.{side[0]}{k}",
                col,
                (sx + 2.0 + k * 3.4, c.y - 33.5, 1.7),
                (2.6, 3.2, 1.0),
                "tok.hue-green-vivid",
            )

    # dirnt bamboo grove: instanced at runtime; greybox marks the plot.
    gx, gy = c.x - 40.0, c.y + 34.0
    w.cylinder("terminal.bamboo.plot", col, (gx, gy, 0.15), 14.0, 0.3, "tok.surface-2", verts=24, drivable=True)
    for i in range(12):
        a = i / 12 * math.tau
        w.cylinder(
            f"terminal.bamboo.stalk.{i:03d}",
            col,
            (gx + 9.0 * math.cos(a), gy + 9.0 * math.sin(a), 4.0),
            0.25,
            8.0,
            "grad.dirnt",
            verts=6,
        )

    w.empty("zone.astute", w.rails, (ax, ay, 0.0), radius=ZONE_RADII["astute"])
    w.empty("zone.stalk", w.rails, (c.x - 10.0, c.y - 26.0, 0.0), radius=ZONE_RADII["stalk"])
    w.empty("zone.dirnt", w.rails, (gx, gy, 0.0), radius=ZONE_RADII["dirnt"])


def build_evidence(w: World) -> None:
    col = w.by_district["evidence"]
    c = CENTERS["evidence"]
    rng = random.Random(2)

    # cypher: the whole district floor is the hex field (instanced at runtime).
    w.box("evidence.cypher.ground", col, (c.x, c.y, 0.1), (150.0, 150.0, 0.2), "tok.surface-2", drivable=True)
    for i in range(7):
        a = i / 7 * math.tau
        w.cylinder(
            f"evidence.cypher.hex.{i:03d}",
            col,
            (c.x + 22.0 * math.cos(a), c.y - 15.0 + 22.0 * math.sin(a), 0.35),
            6.0,
            0.3,
            "tok.hue-green" if i % 3 else "tok.hue-rose",
            verts=6,
        )

    # altigoz: camera frustum poles sweeping bearings.
    px, py = c.x - 50.0, c.y - 40.0
    w.box("evidence.altigoz.plaque", col, (px, py - 12.0, 1.0), (10.0, 0.6, 2.0), "tok.text")
    for i in range(8):
        x = px - 14.0 + (i % 4) * 9.0
        y = py + (i // 4) * 10.0
        w.cylinder(f"evidence.altigoz.pole.{i:03d}", col, (x, y, 4.0), 0.3, 8.0, "tok.border", verts=8)
        w.box(f"evidence.altigoz.cone.{i:03d}", col, (x + 2.5, y, 8.0), (5.0, 1.6, 0.4), "tok.hue-sky", yaw=rng.uniform(0, math.tau))

    # nazar: suspended evidence graph between two pylons.
    nx, ny = c.x, c.y + 25.0
    for sx in (-18.0, 18.0):
        w.box(f"evidence.nazar.pylon.{'w' if sx < 0 else 'e'}", col, (nx + sx, ny, 9.0), (1.6, 1.6, 18.0), "tok.text")
        w.collider_box(f"nazar-{'w' if sx < 0 else 'e'}", (nx + sx, ny, 9.0), (1.6, 1.6, 18.0))
    w.box("evidence.nazar.beam", col, (nx, ny, 18.0), (38.0, 0.8, 0.8), "tok.text")
    for i in range(14):
        w.sphere(
            f"evidence.nazar.node.{i:03d}",
            col,
            (nx + rng.uniform(-15.0, 15.0), ny + rng.uniform(-4.0, 4.0), rng.uniform(6.0, 15.0)),
            0.9,
            "tok.hue-violet" if i % 2 else "tok.hue-violet-vivid",
        )
    # The dangling edge: a strut that ends in nothing.
    w.box("evidence.nazar.dangling", col, (nx + 12.0, ny + 6.0, 5.0), (0.3, 0.3, 6.0), "tok.accent")

    # kerms and IMC candlestick towers (instanced at runtime; plinths here).
    for name, x in (("kerms", c.x + 45.0), ("imc", c.x + 45.0 + 26.0)):
        w.box(f"evidence.{name}.base", col, (x, c.y - 45.0, 0.5), (18.0, 12.0, 1.0), "tok.surface", drivable=True)
        w.collider_box(name, (x, c.y - 45.0, 0.5), (18.0, 12.0, 1.0))
        for i in range(6):
            up = rng.random() > 0.4
            h = rng.uniform(2.0, 9.0)
            w.box(
                f"evidence.{name}.candle.{i:03d}",
                col,
                (x - 7.0 + i * 2.8, c.y - 45.0, 1.0 + h / 2),
                (1.6, 1.6, h),
                "tok.hue-green" if up else "tok.hue-rose",
            )

    w.empty("zone.cypher", w.rails, (c.x, c.y - 15.0, 0.0), radius=ZONE_RADII["cypher"])
    w.empty("zone.altigoz", w.rails, (px, py + 5.0, 0.0), radius=ZONE_RADII["altigoz"])
    w.empty("zone.nazar", w.rails, (nx, ny, 0.0), radius=ZONE_RADII["nazar"])
    w.empty("zone.kerms", w.rails, (c.x + 45.0, c.y - 45.0, 0.0), radius=ZONE_RADII["kerms"])
    w.empty("zone.imc-prosperity-4", w.rails, (c.x + 71.0, c.y - 45.0, 0.0), radius=ZONE_RADII["imc-prosperity-4"])


def build_fabrication(w: World) -> None:
    col = w.by_district["fabrication"]
    c = CENTERS["fabrication"]
    rng = random.Random(3)

    # PCB ground with copper traces as roads.
    w.box("fabrication.pcb.ground", col, (c.x, c.y, 0.1), (130.0, 130.0, 0.2), "tok.surface-2", drivable=True)
    for i in range(6):
        horizontal = i % 2 == 0
        off = -40.0 + i * 16.0
        w.box(
            f"fabrication.pcb.trace.{i:03d}",
            col,
            (c.x + (0.0 if horizontal else off), c.y + (off if horizontal else 0.0), 0.25),
            (110.0 if horizontal else 2.0, 2.0 if horizontal else 110.0, 0.1),
            "tok.hue-amber",
        )

    # Battery cell stack with two threshold planes (Wisconsin Racing).
    bx, by = c.x - 40.0, c.y - 30.0
    for i in range(10):
        w.cylinder(f"fabrication.battery.cell.{i:03d}", col, (bx, by, 1.2 + i * 2.4), 4.0, 2.2, "tok.surface", verts=20)
    w.collider_box("battery", (bx, by, 12.0), (8.0, 8.0, 24.0))
    w.box("fabrication.battery.plane.high", col, (bx, by, 21.0), (12.0, 12.0, 0.15), "tok.hue-rose")
    w.box("fabrication.battery.plane.low", col, (bx, by, 5.0), (12.0, 12.0, 0.15), "tok.hue-amber")

    # Orion DAG as an aerial gantry: 27 nodes on a 3x3x3 lattice, 4 pylons.
    ox, oy = c.x + 5.0, c.y + 15.0
    for sx in (-22.0, 22.0):
        for sy in (-14.0, 14.0):
            w.box(f"fabrication.orion.pylon.{'w' if sx < 0 else 'e'}{'s' if sy < 0 else 'n'}", col, (ox + sx, oy + sy, 8.0), (1.2, 1.2, 16.0), "tok.text")
            w.collider_box(f"orion-{'w' if sx < 0 else 'e'}{'s' if sy < 0 else 'n'}", (ox + sx, oy + sy, 8.0), (1.2, 1.2, 16.0))
    w.box("fabrication.orion.deck", col, (ox, oy, 16.0), (46.0, 30.0, 0.4), "tok.border")
    for i in range(27):
        x, y, z = i % 3, (i // 3) % 3, i // 9
        w.box(
            f"fabrication.orion.node.{i:03d}",
            col,
            (ox - 16.0 + x * 16.0, oy - 10.0 + y * 10.0, 18.0 + z * 4.0),
            (2.0, 2.0, 2.0),
            "tok.hue-sky" if rng.random() > 0.3 else "tok.hue-sky-vivid",
        )

    # B-rep kernel: solid with its wireframe cage.
    rx, ry = c.x + 45.0, c.y - 40.0
    w.box("fabrication.brep.solid", col, (rx, ry, 5.0), (10.0, 10.0, 10.0), "tok.surface")
    w.collider_box("brep", (rx, ry, 5.0), (10.0, 10.0, 10.0))
    for i, (dx, dy) in enumerate(((-1, -1), (1, -1), (1, 1), (-1, 1))):
        w.box(f"fabrication.brep.edge.{i:03d}", col, (rx + dx * 5.2, ry + dy * 5.2, 5.0), (0.3, 0.3, 10.6), "tok.hue-violet")

    # FRC field (Synthesis): real scale, 16.5 x 8.2 m, low walls. The Dozer's home.
    fx, fy = c.x - 30.0, c.y + 40.0
    w.box("fabrication.frc.field", col, (fx, fy, 0.3), (16.5, 8.2, 0.2), "tok.surface", drivable=True)
    for name, (dx, dy, sx, sy) in {
        "n": (0.0, 4.2, 16.9, 0.2),
        "s": (0.0, -4.2, 16.9, 0.2),
        "e": (8.35, 0.0, 0.2, 8.6),
        "w": (-8.35, 0.0, 0.2, 8.6),
    }.items():
        w.box(f"fabrication.frc.wall.{name}", col, (fx + dx, fy + dy, 0.7), (sx, sy, 0.6), "tok.accent")
        w.collider_box(f"frc-{name}", (fx + dx, fy + dy, 0.7), (sx, sy, 0.6))

    w.empty("zone.wisconsin-racing", w.rails, (bx, by, 0.0), radius=ZONE_RADII["wisconsin-racing"])
    w.empty("zone.orion", w.rails, (ox, oy, 0.0), radius=ZONE_RADII["orion"])
    w.empty("zone.agentic-cad-spike", w.rails, (rx, ry, 0.0), radius=ZONE_RADII["agentic-cad-spike"])
    w.empty("zone.synthesis", w.rails, (fx, fy, 0.0), radius=ZONE_RADII["synthesis"])


def build_redacted(w: World) -> None:
    col = w.by_district["redacted"]
    c = CENTERS["redacted"]
    # One sealed block. on-accent is near-black in both themes.
    w.box("redacted.building.block", col, (c.x, c.y, 9.0), (30.0, 30.0, 18.0), "tok.on-accent")
    w.box("redacted.building.plinth", col, (c.x, c.y, 0.25), (40.0, 40.0, 0.5), "tok.surface-2", drivable=True)
    w.collider_box("redacted", (c.x, c.y, 9.0), (30.0, 30.0, 18.0))
    w.empty("zone.swiftlabs-platform", w.rails, (c.x, c.y, 0.0), radius=ZONE_RADII["swiftlabs-platform"])


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
        w.empty(f"rail.look.{i:02d}", w.rails, target, size=1.5, t=t)


def build_colliders(w: World) -> None:
    """col.ground = the ground plane joined with every drivable top surface."""
    size = w.contract["world"]["sizeMeters"]
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = ground.data.name = "col.ground"
    ground.data.materials.append(material("tok.bg"))
    w._add(ground, w.colliders)

    copies = []
    for src in w.drivable:
        dup = src.copy()
        dup.data = src.data.copy()
        w.colliders.objects.link(dup)
        copies.append(dup)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in [ground, *copies]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = ground
    bpy.ops.object.join()
    ground.name = ground.data.name = "col.ground"
    ground.hide_render = True


def build_review_cameras(w: World) -> None:
    w.camera("cam.review.overview", (0.0, -420.0, 300.0), (0.0, 20.0, 0.0), lens=28.0)
    w.camera("cam.review.hub", (40.0, -70.0, 30.0), (0.0, 0.0, 2.0), lens=35.0)
    for district, center in CENTERS.items():
        offset = Vector((60.0, -90.0, 55.0))
        w.camera(f"cam.review.{district}", tuple(center + offset), (center.x, center.y, 4.0), lens=32.0)


def build() -> None:
    with open(CONTRACT_PATH, encoding="utf-8") as fh:
        contract = json.load(fh)
    w = World(contract)
    w.wipe()
    build_shared(w)
    build_terminal(w)
    build_evidence(w)
    build_fabrication(w)
    build_redacted(w)
    build_rails(w)
    build_colliders(w)
    build_review_cameras(w)
    bpy.context.scene.camera = bpy.data.objects["cam.review.overview"]
    bpy.ops.object.select_all(action="DESELECT")


def save(path: str) -> None:
    bpy.data.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(path), compress=True)


if __name__ == "__main__":
    build()
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--save")
    args = parser.parse_args(argv)
    if args.save:
        save(args.save)
        print(f"saved {args.save}")
