"""Headless export of the Simulator world.

    blender --background assets/blender/world.blend \
        --python assets/blender/scripts/export_world.py -- --out <dir>

Writes to ``<dir>``:

* ``<district>.glb`` for every district in the contract (Y-up, materials by name,
  no textures, modifiers applied). ``shared.glb`` also carries ``col.ground``.
* ``meta.json``: the rail polyline, look targets, zones, climbing routes and
  box colliders, converted to the same Y-up frame as the glbs, plus the
  drivable bounds (the AABB of ``col.ground``).
* ``lint.json``: the lint report, including per-district triangle counts.

Refuses to export a scene that fails ``lint_scene.py``.
The glbs written here are raw; ``scripts/build-world.ts`` optimizes them.
"""

from __future__ import annotations

import argparse
import json
import math
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


def nearest_t(points: list[list[float]], closed: bool, p: list[float]) -> float:
    """Arc-length fraction of the polyline point closest to ``p`` (Y-up frame)."""
    pts = points + [points[0]] if closed else points
    cum = [0.0]
    for a, b in zip(pts, pts[1:]):
        cum.append(cum[-1] + math.dist(a, b))
    total = cum[-1] or 1.0
    best, best_d = 0.0, float("inf")
    for i, (a, b) in enumerate(zip(pts, pts[1:])):
        ab = [b[k] - a[k] for k in range(3)]
        ab2 = sum(v * v for v in ab)
        f = 0.0 if ab2 == 0 else max(0.0, min(1.0, sum((p[k] - a[k]) * ab[k] for k in range(3)) / ab2))
        q = [a[k] + ab[k] * f for k in range(3)]
        d = math.dist(p, q)
        if d < best_d:
            best_d = d
            best = (cum[i] + (cum[i + 1] - cum[i]) * f) / total
    return best


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
    points = rail_points(rail)
    closed = bool(rail.data.splines[0].use_cyclic_u)
    looks = []
    zones = []
    routes = []
    for obj in lint_scene.collection_objects(rails):
        if lint_scene.RAIL_LOOK.match(obj.name):
            position = yup(obj.matrix_world.translation)
            t = obj.get("t")
            looks.append({"t": float(t) if t is not None else round(nearest_t(points, closed, position), 4), "position": position})
        elif lint_scene.ZONE_OBJECT.match(obj.name):
            zones.append(
                {
                    "slug": obj.name.split(".", 1)[1],
                    "position": yup(obj.matrix_world.translation),
                    "radius": float(obj["radius"]),
                }
            )
        elif lint_scene.ROUTE_OBJECT.match(obj.name):
            routes.append({"slug": obj.name.split(".", 1)[1], "points": rail_points(obj)})
    looks.sort(key=lambda l: l["t"])
    zones.sort(key=lambda z: z["slug"])
    routes.sort(key=lambda r: r["slug"])

    boxes = []
    for obj in lint_scene.collection_objects(colliders):
        if obj.name == "col.ground":
            continue
        lo, hi = world_aabb(obj)
        boxes.append({"name": obj.name, "min": lo, "max": hi})
    boxes.sort(key=lambda b: b["name"])

    # Bounds are the drivable world, not the visible one: the Dozer is clamped
    # to them, and backdrop geometry far beyond the plate must not widen them.
    lo, hi = world_aabb(bpy.data.objects["col.ground"])

    return {
        "version": contract["version"],
        "rail": {"points": points, "closed": closed},
        "looks": looks,
        "zones": zones,
        "routes": routes,
        "colliders": boxes,
        "bounds": {"min": lo, "max": hi},
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
    print(
        f"meta: {len(meta['rail']['points'])} rail points, {len(meta['looks'])} looks, "
        f"{len(meta['zones'])} zones, {len(meta['routes'])} routes, {len(meta['colliders'])} colliders"
    )


if __name__ == "__main__":
    main()
