"""Fixed review-camera renders for visual checkpoints.

    render_reviews("/path/to/out")   # from the MCP, after loading this module
    blender --background world.blend --python review.py -- --out DIR

Renders every ``cam.review.*`` camera with Workbench (solid material colors,
studio light, cavity) so screenshots are deterministic and independent of
whatever the live viewport is doing.
"""

from __future__ import annotations

import argparse
import os
import sys

import bpy


def render_reviews(out_dir: str, width: int = 1600, height: int = 1000) -> list[str]:
    scene = bpy.context.scene
    os.makedirs(out_dir, exist_ok=True)
    previous = (scene.camera, scene.render.engine, scene.render.filepath)
    render = scene.render
    render.engine = "BLENDER_WORKBENCH"
    render.resolution_x, render.resolution_y = width, height
    render.resolution_percentage = 100
    render.image_settings.file_format = "PNG"
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.color_type = "MATERIAL"
    shading.show_cavity = True
    shading.show_shadows = False
    written = []
    cameras = sorted(
        (o for o in scene.objects if o.type == "CAMERA" and o.name.startswith("cam.review.")),
        key=lambda o: o.name,
    )
    for cam in cameras:
        scene.camera = cam
        path = os.path.join(out_dir, cam.name.split("cam.review.", 1)[1] + ".png")
        render.filepath = path
        bpy.ops.render.render(write_still=True)
        written.append(path)
    scene.camera, render.engine, render.filepath = previous
    return written


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    args = parser.parse_args(argv)
    for path in render_reviews(args.out):
        print("rendered", path)
