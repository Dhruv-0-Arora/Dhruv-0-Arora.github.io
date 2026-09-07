"""Shared authoring helpers for the world sessions.

Everything a session needs to add geometry that passes ``lint_scene.py``:
contract materials with preview colors, primitive factories that land in
the right collection, zone/collider helpers, review cameras, and the
layout constants every district agrees on.

Frame: Blender Z-up, meters. ``export_world.py`` converts to glTF Y-up.
"""

from __future__ import annotations

import json
import math
import os

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(HERE, "..", "contract.json")

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
    (-135.0, 125.0, 20.0),
    (-70.0, 186.0, 24.0),
    (0.0, 168.0, 22.0),
    (95.0, 135.0, 18.0),
    (155.0, 40.0, 18.0),
    (148.0, -85.0, 27.0),
    (70.0, -128.0, 15.0),
]

# (t along the loop, look-at point). t=None means "where the rail passes
# closest to the point", computed by export_world.py, so aims are exact
# when the camera is abeam of an installation. Only the hub pins t.
LOOKS = [
    (0.00, (0.0, 0.0, 2.0)),
    (None, (-130.0, 30.0, 8.0)),  # astute monument
    (None, (-140.0, -6.0, 2.0)),  # keyboard terrain
    (None, (-95.0, 60.0, 3.0)),  # bamboo grove
    (None, (-70.0, 140.0, 9.0)),  # redacted building
    (None, (110.0, 125.0, 10.0)),  # nazar graph
    (None, (110.0, 95.0, 1.0)),  # cypher hex field
    (None, (102.0, -82.0, 12.0)),  # orion gantry
    (None, (80.0, -60.0, 1.0)),  # frc field
    (1.00, (0.0, 0.0, 2.0)),
]

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
    "hub": 18.0,
}

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
    "tok.rock": "#807d78",
    "tok.snow": "#f2f4f7",
    "tok.forest": "#3d6b4d",
    "ramp.importance.1": "#6b7280",
    "ramp.importance.2": "#0076c5",
    "ramp.importance.3": "#0284c7",
    "ramp.importance.4": "#b75807",
    "ramp.importance.5": "#dd1a4c",
    "grad.dirnt": "#048359",
}


def load_contract() -> dict:
    with open(CONTRACT_PATH, encoding="utf-8") as fh:
        return json.load(fh)


# ---------------------------------------------------------------------------
# Materials
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


# ---------------------------------------------------------------------------
# World: collections plus factories that always land in the right one
# ---------------------------------------------------------------------------


def collection_objects(col: bpy.types.Collection):
    yield from col.objects
    for child in col.children:
        yield from collection_objects(child)


class World:
    def __init__(self, contract: dict | None = None) -> None:
        self.contract = contract or load_contract()
        cols = self.contract["collections"]
        scene = bpy.context.scene
        self.root = self._collection(cols["root"], scene.collection)
        self.by_district = {
            d: self._collection(name, self.root) for d, name in cols["districts"].items()
        }
        self.colliders = self._collection(cols["colliders"], self.root)
        self.rails = self._collection(cols["rails"], self.root)
        self.review = self._collection("Review", scene.collection)

    @staticmethod
    def _collection(name: str, parent: bpy.types.Collection) -> bpy.types.Collection:
        col = bpy.data.collections.get(name)
        if col is None:
            col = bpy.data.collections.new(name)
        if col.name not in parent.children:
            parent.children.link(col)
        return col

    # -- lifecycle ----------------------------------------------------------

    def wipe_all(self) -> None:
        """A full rebuild owns the whole scene: drop every object, then orphans."""
        for obj in list(bpy.context.scene.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        stray = bpy.data.collections.get("Collection")
        if stray is not None and not stray.objects and not stray.children:
            bpy.data.collections.remove(stray)
        purge_orphans()

    def wipe_district(self, district: str, zones: list[str], collider_prefixes: list[str]) -> None:
        """Remove one district's meshes, its zones, and its box colliders."""
        for obj in list(collection_objects(self.by_district[district])):
            bpy.data.objects.remove(obj, do_unlink=True)
        for obj in list(self.rails.objects):
            if any(obj.name == f"zone.{z}" for z in zones):
                bpy.data.objects.remove(obj, do_unlink=True)
        for obj in list(self.colliders.objects):
            if any(obj.name.startswith(f"col.box.{p}") for p in collider_prefixes):
                bpy.data.objects.remove(obj, do_unlink=True)
        purge_orphans()

    # -- primitives ---------------------------------------------------------

    def _add(self, obj: bpy.types.Object, col: bpy.types.Collection, mat: str, drivable: bool) -> bpy.types.Object:
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        col.objects.link(obj)
        if obj.type == "MESH":
            obj.data.materials.clear()
            obj.data.materials.append(material(mat))
        if drivable:
            obj["drivable"] = True
        return obj

    def box(self, name, col, center, size, mat, yaw=0.0, drivable=False, bevel=0.0):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.scale = size
        obj.rotation_euler = (0.0, 0.0, yaw)
        if bevel > 0:
            # Bevel in object space before scale, so pass width relative to the
            # smallest side; the exporter applies modifiers.
            mod = obj.modifiers.new("bevel", "BEVEL")
            mod.width = bevel / max(min(size), 1e-6)
            mod.segments = 1
            mod.limit_method = "NONE"
        return self._add(obj, col, mat, drivable)

    def cylinder(self, name, col, center, radius, height, mat, verts=16, drivable=False, yaw=0.0):
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=height, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.rotation_euler = (0.0, 0.0, yaw)
        return self._add(obj, col, mat, drivable)

    def strut(self, name, col, a, b, radius, mat, verts=6):
        """A thin cylinder from point a to point b."""
        a, b = Vector(a), Vector(b)
        d = b - a
        length = d.length
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=length, location=(a + b) * 0.5)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
        return self._add(obj, col, mat, False)

    def sphere(self, name, col, center, radius, mat, subdivisions=1):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        return self._add(obj, col, mat, False)

    def plane(self, name, col, center, size, mat, drivable=False):
        bpy.ops.mesh.primitive_plane_add(size=1.0, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.scale = (size[0], size[1], 1.0)
        return self._add(obj, col, mat, drivable)

    def torus(self, name, col, center, major, minor, mat, major_segments=32, minor_segments=8):
        bpy.ops.mesh.primitive_torus_add(location=center, major_radius=major, minor_radius=minor, major_segments=major_segments, minor_segments=minor_segments)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        return self._add(obj, col, mat, False)

    def empty(self, name, col, location, size=1.0, **props):
        obj = bpy.data.objects.new(name, None)
        obj.location = location
        obj.empty_display_type = "CUBE"
        obj.empty_display_size = size
        for k, v in props.items():
            obj[k] = v
        col.objects.link(obj)
        return obj

    def zone(self, slug: str, location) -> bpy.types.Object:
        return self.empty(f"zone.{slug}", self.rails, (location[0], location[1], 0.0), radius=ZONE_RADII[slug])

    def collider_box(self, name: str, center, size) -> bpy.types.Object:
        """An empty whose world AABB is exactly ``size`` (display size 0.5 x scale)."""
        obj = self.empty(f"col.box.{name}", self.colliders, center, size=0.5)
        obj.scale = size
        return obj

    def camera(self, name: str, location, target, lens=32.0) -> bpy.types.Object:
        existing = bpy.data.objects.get(name)
        if existing is not None:
            bpy.data.objects.remove(existing, do_unlink=True)
        data = bpy.data.cameras.new(name)
        data.lens = lens
        data.clip_end = 2000.0
        cam = bpy.data.objects.new(name, data)
        cam.location = location
        direction = Vector(target) - Vector(location)
        cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        self.review.objects.link(cam)
        return cam

    # -- scene-wide rebuilds ------------------------------------------------

    def rebuild_ground(self) -> None:
        """col.ground = the ground plane joined with every drivable surface."""
        existing = bpy.data.objects.get("col.ground")
        if existing is not None:
            bpy.data.objects.remove(existing, do_unlink=True)
        size = self.contract["world"]["sizeMeters"]
        bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
        ground = bpy.context.active_object
        ground.name = ground.data.name = "col.ground"
        self._add(ground, self.colliders, "tok.bg", False)

        depsgraph = bpy.context.evaluated_depsgraph_get()
        copies = []
        for district_col in self.by_district.values():
            for src in collection_objects(district_col):
                if src.type != "MESH" or not src.get("drivable"):
                    continue
                # Bake modifiers so bevels survive the join.
                mesh = bpy.data.meshes.new_from_object(src.evaluated_get(depsgraph))
                dup = bpy.data.objects.new(f"{src.name}.col", mesh)
                dup.matrix_world = src.matrix_world.copy()
                self.colliders.objects.link(dup)
                copies.append(dup)
        bpy.ops.object.select_all(action="DESELECT")
        for obj in [ground, *copies]:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = ground
        if copies:
            bpy.ops.object.join()
        ground.name = ground.data.name = "col.ground"
        ground.hide_render = True
        bpy.ops.object.select_all(action="DESELECT")


def purge_orphans() -> None:
    bpy.data.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)


def save(path: str) -> None:
    purge_orphans()
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(path), compress=True)


def session_args(argv: list[str]) -> dict:
    """Parses ``-- --save PATH`` from Blender's argv."""
    rest = argv[argv.index("--") + 1 :] if "--" in argv else []
    out = {"save": None}
    for i, a in enumerate(rest):
        if a == "--save" and i + 1 < len(rest):
            out["save"] = rest[i + 1]
    return out


def polar(center, radius: float, angle: float, z: float = 0.0) -> tuple[float, float, float]:
    return (center[0] + radius * math.cos(angle), center[1] + radius * math.sin(angle), z)
