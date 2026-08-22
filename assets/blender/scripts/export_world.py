"""Headless export of the Simulator world.

    blender --background assets/blender/world.blend \
        --python assets/blender/scripts/export_world.py -- --out <dir>

Writes to ``<dir>``:

* ``<district>.glb`` for every district in the contract (Y-up, materials by name,
  no textures, modifiers applied). ``shared.glb`` also carries ``col.ground``.
* ``meta.json``: the rail polyline, look targets, zones and box colliders,
  converted to the same Y-up frame as the glbs.
* ``lint.json``: the lint report, including per-district triangle counts.

Refuses to export a scene that fails ``lint_scene.py``.
The glbs written here are raw; ``scripts/build-world.ts`` optimizes them.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import lint_scene  # noqa: E402

EXPORT_COLLECTION = "_export"


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser(description="Export the Simulator world")
    parser.add_argument("--out", required=True, help="output directory")
    return parser.parse_args(argv)


def yup(v: Vector) -> list[float]:
    """Blender Z-up to glTF Y-up, matching ``export_yup=True``."""
    return [round(v.x, 4), round(v.z, 4), round(-v.y, 4)]


def export_glb(objects: list[bpy.types.Object], filepath: str) -> None:
    """Export exactly ``objects`` by linking them into a temporary collection."""
    scene = bpy.context.scene
    temp = bpy.data.collections.get(EXPORT_COLLECTION)
    if temp is not None:
        bpy.data.collections.remove(temp)
    temp = bpy.data.collections.new(EXPORT_COLLECTION)
    scene.collection.children.link(temp)
    try:
        for obj in objects:
            temp.objects.link(obj)
        bpy.ops.export_scene.gltf(
            filepath=filepath,
            export_format="GLB",
            collection=EXPORT_COLLECTION,
            use_visible=False,
            use_renderable=False,
            export_apply=True,
            export_yup=True,
            export_extras=True,
            export_materials="EXPORT",
            export_image_format="NONE",
            export_texcoords=False,
            export_normals=True,
            export_tangents=False,
            export_animations=False,
            export_skins=False,
            export_morph=False,
            export_cameras=False,
            export_lights=False,
            export_hierarchy_full_collections=False,
        )
    finally:
        bpy.data.collections.remove(temp)


def rail_points(obj: bpy.types.Object) -> list[list[float]]:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        # Curve-to-mesh yields the polyline in spline order.
        return [yup(obj.matrix_world @ v.co) for v in mesh.vertices]
    finally:
        evaluated.to_mesh_clear()


def world_aabb(obj: bpy.types.Object) -> tuple[list[float], list[float]]:
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    if obj.type == "EMPTY":
        # Empties have a unit bound box scaled by empty_display_size.
        s = obj.empty_display_size
        corners = [
            obj.matrix_world @ Vector((x * s, y * s, z * s))
            for x in (-1, 1)
            for y in (-1, 1)
            for z in (-1, 1)
        ]
    pts = [yup(c) for c in corners]
    lo = [min(p[i] for p in pts) for i in range(3)]
    hi = [max(p[i] for p in pts) for i in range(3)]
    return lo, hi


def build_meta(contract: dict) -> dict:
    cols = contract["collections"]
    root = bpy.data.collections[cols["root"]]
    rails = root.children[cols["rails"]]
    colliders = root.children[cols["colliders"]]

    rail = bpy.data.objects["rail.path"]
    looks = []
    zones = []
    for obj in lint_scene.collection_objects(rails):
        if lint_scene.RAIL_LOOK.match(obj.name):
            looks.append({"t": float(obj["t"]), "position": yup(obj.matrix_world.translation)})
        elif lint_scene.ZONE_OBJECT.match(obj.name):
            zones.append(
                {
                    "slug": obj.name.split(".", 1)[1],
                    "position": yup(obj.matrix_world.translation),
                    "radius": float(obj["radius"]),
                }
            )
    looks.sort(key=lambda l: l["t"])
    zones.sort(key=lambda z: z["slug"])

    boxes = []
    for obj in lint_scene.collection_objects(colliders):
        if obj.name == "col.ground":
            continue
        lo, hi = world_aabb(obj)
        boxes.append({"name": obj.name, "min": lo, "max": hi})
    boxes.sort(key=lambda b: b["name"])

    lo, hi = None, None
    for district in cols["districts"].values():
        for obj in lint_scene.collection_objects(root.children[district]):
            if obj.type != "MESH":
                continue
            a, b = world_aabb(obj)
            lo = a if lo is None else [min(x, y) for x, y in zip(lo, a)]
            hi = b if hi is None else [max(x, y) for x, y in zip(hi, b)]

    return {
        "version": contract["version"],
        "rail": {"points": rail_points(rail), "closed": bool(rail.data.splines[0].use_cyclic_u)},
        "looks": looks,
        "zones": zones,
        "colliders": boxes,
        "bounds": {"min": lo or [0, 0, 0], "max": hi or [0, 0, 0]},
    }


def main() -> None:
    args = parse_args()
    os.makedirs(args.out, exist_ok=True)
    contract = lint_scene.load_contract()

    report = lint_scene.lint(contract=contract)
    print(report.text())
    with open(os.path.join(args.out, "lint.json"), "w", encoding="utf-8") as fh:
        json.dump(report.to_json(), fh, indent=2)
    if not report.ok:
        print("export_world: refusing to export a scene that fails lint", file=sys.stderr)
        sys.exit(1)

    cols = contract["collections"]
    root = bpy.data.collections[cols["root"]]
    for district, col_name in cols["districts"].items():
        objects = [o for o in lint_scene.collection_objects(root.children[col_name]) if o.type == "MESH"]
        if district == "shared":
            objects.append(bpy.data.objects["col.ground"])
        path = os.path.join(args.out, f"{district}.glb")
        export_glb(objects, path)
        print(f"exported {district}: {len(objects)} objects -> {path}")

    meta = build_meta(contract)
    with open(os.path.join(args.out, "meta.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh, separators=(",", ":"))
    print(f"meta: {len(meta['rail']['points'])} rail points, {len(meta['looks'])} looks, {len(meta['zones'])} zones, {len(meta['colliders'])} colliders")


if __name__ == "__main__":
    main()
