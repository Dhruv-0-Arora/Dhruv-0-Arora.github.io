"""Shared authoring helpers for the world sessions.

Everything a session needs to add geometry that passes ``lint_scene.py``:
contract materials with preview colors, primitive factories that land in
the right collection, zone/collider helpers, review cameras, and
``World.place``, which moves an installation onto its terrace in the range
(``rangelib.py`` owns the ground and the site table).

Frame: Blender Z-up, meters. ``export_world.py`` converts to glTF Y-up.
"""

from __future__ import annotations

import json
import math
import os

import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(HERE, "..", "contract.json")

# ---------------------------------------------------------------------------
# Layout. The ground, the sites and their terraces live in ``rangelib``;
# the hub is the origin. Installations are authored at convenient local
# coordinates (the old plate layout) and moved onto their terrace with
# ``World.place``.
# ---------------------------------------------------------------------------

HUB = Vector((0.0, 0.0, 0.0))
HUB_PAD_RADIUS = 45.0

# Zones share their site's terrace radius (``rangelib.site_radius``), so
# the panel opens exactly where the installation is; the hub's is smaller
# than its pad so the guide closes once the visitor drives off the plaza.
ZONE_RADIUS_OVERRIDES = {"hub": 18.0}

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
    "tok.accent": "#2f7d4f",
    "tok.on-accent": "#f4faf6",
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
    "tok.water": "#4a8ea8",
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
        """Remove one district's meshes, its zones, its box colliders and its
        review cameras (``cam.review.<district>-*``)."""
        for obj in list(collection_objects(self.by_district[district])):
            bpy.data.objects.remove(obj, do_unlink=True)
        for obj in list(self.rails.objects):
            if any(obj.name == f"zone.{z}" for z in zones):
                bpy.data.objects.remove(obj, do_unlink=True)
        for obj in list(self.colliders.objects):
            if any(obj.name.startswith(f"col.box.{p}") for p in collider_prefixes):
                bpy.data.objects.remove(obj, do_unlink=True)
        for obj in list(self.review.objects):
            if obj.name.startswith(f"cam.review.{district}-"):
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
        """A box of ``size`` metres. The size is baked into the mesh rather
        than left as object scale, so a bevel is an absolute width on every
        edge (a bevel applied under a non-uniform scale stretches into a
        chamfer as long as the box's longest side) and joins and exports see
        plain unit-scale objects."""
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=center)
        obj = bpy.context.active_object
        obj.name = obj.data.name = name
        obj.data.transform(Matrix.Diagonal((size[0], size[1], size[2], 1.0)))
        obj.rotation_euler = (0.0, 0.0, yaw)
        if bevel > 0:
            mod = obj.modifiers.new("bevel", "BEVEL")
            mod.width = min(bevel, 0.45 * min(size))
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
        import rangelib

        radius = ZONE_RADIUS_OVERRIDES.get(slug, rangelib.site_radius(slug))
        return self.empty(f"zone.{slug}", self.rails, (location[0], location[1], 0.0), radius=radius)

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

    # -- placement ----------------------------------------------------------

    def place(self, prefix: str, slug: str, anchor, colliders=(), zones=(), yaw: float | None = None) -> Matrix:
        """Move one installation onto the terrace of site ``slug`` as a rigid body.

        District sessions keep building at their old plate coordinates (flat,
        z = 0 is the floor) and then call ``place`` once per installation:

            w.place("terminal.astute.", "astute", anchor=(ax, ay),
                    colliders=["astute"], zones=["astute"],
                    yaw=rangelib.site_yaw_to_hub("astute"))

        The transform is T = Translate(site_center(slug)) @ RotZ(yaw or 0)
        @ Translate(-anchor.x, -anchor.y, 0): the anchor lands on the terrace
        centre, local z = 0 lands on the terrace level, and the whole thing
        turns about the anchor. It is applied through ``matrix_world`` to
        every object whose name starts with ``prefix`` (children follow their
        parent, so only unparented matches move), every ``col.box.<p>...``
        empty for p in ``colliders`` and every ``zone.<z>`` for z in ``zones``.
        Box colliders are exported as world AABBs, so a yaw that is not a
        multiple of 90 degrees inflates them; keep that in mind for walls.
        ``rangelib.site_yaw_to_hub(slug)`` turns an installation's local -Y
        face toward the hub (the face the old spawn view saw). Returns T.
        """
        import rangelib

        # Transforms set since the last depsgraph update are not in
        # matrix_world yet; without this the newest primitive and every
        # collider empty would lose their scale and rotation.
        bpy.context.view_layer.update()
        center = rangelib.site_center(slug)
        T = (
            Matrix.Translation(center)
            @ Matrix.Rotation(0.0 if yaw is None else yaw, 4, "Z")
            @ Matrix.Translation((-anchor[0], -anchor[1], 0.0))
        )
        moved = []
        for obj in bpy.context.scene.objects:
            name = obj.name
            hit = name.startswith(prefix)
            hit = hit or any(name.startswith(f"col.box.{p}") for p in colliders)
            hit = hit or any(name == f"zone.{z}" for z in zones)
            if hit and (obj.parent is None or not obj.parent.name.startswith(prefix)):
                moved.append(obj)
        for obj in moved:
            obj.matrix_world = T @ obj.matrix_world
        bpy.context.view_layer.update()
        return T

    def place_site(self, prefix: str, slug: str, colliders=(), zones=(), anchor=(0.0, 0.0)) -> Matrix:
        """``place`` for the common case: an installation built around the
        origin with its front on local -Y, turned to face the hub."""
        import rangelib

        return self.place(prefix, slug, anchor, colliders=colliders, zones=zones, yaw=rangelib.site_yaw_to_hub(slug))

    def review_camera(self, name: str, T: Matrix, eye, target, lens: float = 35.0) -> bpy.types.Object:
        """A review camera authored in an installation's local frame (front
        at -Y), carried onto the terrace by the placement transform."""
        return self.camera(name, T @ Vector(eye), T @ Vector(target), lens=lens)

    # -- scene-wide rebuilds ------------------------------------------------

    def rebuild_ground(self) -> None:
        """col.ground = the flat hub pad (a disc of HUB_PAD_RADIUS at z = 0)
        joined with every drivable surface. The terrain itself is not in it:
        the runtime samples the range for everything else."""
        existing = bpy.data.objects.get("col.ground")
        if existing is not None:
            bpy.data.objects.remove(existing, do_unlink=True)
        bpy.ops.mesh.primitive_circle_add(vertices=64, radius=HUB_PAD_RADIUS, fill_type="NGON", location=(0, 0, 0))
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
