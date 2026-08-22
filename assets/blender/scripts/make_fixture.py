"""Builds the smallest scene that satisfies the world contract.

    blender --background --python make_fixture.py -- --out fixture.blend

Used by the pipeline test (`scripts/build-world.test.ts`) so the export,
optimize and budget stages are exercised end to end without the real
`world.blend`. Also a worked example of the naming and metadata contract.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    return parser.parse_args(argv)


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name: str, rgb: tuple[float, float, float]) -> bpy.types.Material:
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
        mat.diffuse_color = (*rgb, 1.0)
    return mat


def link(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    collection.objects.link(obj)


def cube(name: str, location, size, mat: bpy.types.Material, collection) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    link(obj, collection)
    return obj


def empty(name: str, location, collection, **props) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    obj.location = location
    obj.empty_display_size = 1.0
    for key, value in props.items():
        obj[key] = value
    collection.objects.link(obj)
    return obj


def build(contract: dict) -> None:
    reset_scene()
    scene = bpy.context.scene
    cols = contract["collections"]
    root = bpy.data.collections.new(cols["root"])
    scene.collection.children.link(root)
    sub = {}
    for key in list(cols["districts"].values()) + [cols["colliders"], cols["rails"]]:
        sub[key] = bpy.data.collections.new(key)
        root.children.link(sub[key])

    surface = material("tok.surface", (0.9, 0.9, 0.9))
    accent = material("tok.accent", (0.9, 0.4, 0.1))
    bg = material("tok.bg", (0.98, 0.98, 0.97))
    ramp3 = material("ramp.importance.3", (0.0, 0.7, 0.8))

    # One plinth per district, spread along +X so bounds are non-trivial.
    for i, (district, col_name) in enumerate(cols["districts"].items()):
        x = (i - 2) * 60.0
        cube(f"{district}.plinth.base", (x, 0.0, 1.0), (10.0, 10.0, 2.0), surface, sub[col_name])
        cube(f"{district}.plinth.trim", (x, 0.0, 2.5), (11.0, 11.0, 0.5), accent, sub[col_name])
        if district == "terminal":
            cube("terminal.astute.node.001", (x, 6.0, 4.0), (1.0, 1.0, 1.0), ramp3, sub[col_name])

    # Ground collider: a large plane.
    bpy.ops.mesh.primitive_plane_add(size=400.0, location=(0.0, 0.0, 0.0))
    ground = bpy.context.active_object
    ground.name = "col.ground"
    ground.data.materials.append(bg)
    link(ground, sub[cols["colliders"]])
    empty("col.box.plinth", (0.0, 0.0, 1.0), sub[cols["colliders"]]).empty_display_size = 6.0

    # Rail: a Bezier arc over the plinths, with two look targets.
    curve = bpy.data.curves.new("rail.path", type="CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 16
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(2)
    for point, (x, y, z) in zip(spline.bezier_points, [(-150.0, -40.0, 12.0), (0.0, -60.0, 15.0), (150.0, -40.0, 12.0)]):
        point.co = (x, y, z)
        point.handle_left_type = point.handle_right_type = "AUTO"
    rail = bpy.data.objects.new("rail.path", curve)
    sub[cols["rails"]].objects.link(rail)
    empty("rail.look.00", (-120.0, 0.0, 2.0), sub[cols["rails"]], t=0.0)
    empty("rail.look.01", (120.0, 0.0, 2.0), sub[cols["rails"]], t=1.0)

    for i, slug in enumerate(contract["zones"]):
        empty(f"zone.{slug}", (-150.0 + i * 25.0, 20.0, 0.0), sub[cols["rails"]], radius=10.0)


def main() -> None:
    args = parse_args()
    with open(os.path.join(HERE, "..", "contract.json"), encoding="utf-8") as fh:
        contract = json.load(fh)
    build(contract)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.out))
    print(f"fixture saved to {args.out}")


if __name__ == "__main__":
    main()
