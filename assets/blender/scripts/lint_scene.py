"""Scene lint for the Simulator world.

Asserts the authoring contract in ``assets/blender/contract.json``:
collection layout, object naming, material whitelist, required objects,
rail and zone metadata, and per-district / per-installation triangle budgets.

Usable three ways:

* inside Blender via the MCP: ``exec(open(path).read()); print(report())``
* headless: ``blender --background world.blend --python lint_scene.py``
  (exit code 1 on any error)
* imported by ``export_world.py``, which refuses to export a failing scene.

Only the standard library plus ``bpy`` are used.
"""

from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass, field

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
CONTRACT_PATH = os.path.join(HERE, "..", "contract.json")


def load_contract() -> dict:
    with open(CONTRACT_PATH, encoding="utf-8") as fh:
        return json.load(fh)


@dataclass
class Report:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    tris: dict[str, int] = field(default_factory=dict)
    installations: dict[str, int] = field(default_factory=dict)

    @property
    def ok(self) -> bool:
        return not self.errors

    def error(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)

    def text(self) -> str:
        lines = [f"lint: {'OK' if self.ok else 'FAIL'}"]
        for name, count in sorted(self.tris.items()):
            lines.append(f"  tris {name:<12} {count:>8}")
        lines.extend(f"  WARN {w}" for w in self.warnings)
        lines.extend(f"  ERROR {e}" for e in self.errors)
        return "\n".join(lines)

    def to_json(self) -> dict:
        return {
            "ok": self.ok,
            "errors": self.errors,
            "warnings": self.warnings,
            "tris": self.tris,
            "installations": self.installations,
        }


SLUG = r"[a-z0-9]+(?:-[a-z0-9]+)*"
DISTRICT_OBJECT = re.compile(rf"^(?P<district>{SLUG})\.(?P<installation>{SLUG})\.(?P<part>{SLUG})(?:\.{SLUG})*$")
COLLIDER_OBJECT = re.compile(rf"^col\.(?:ground|box\.{SLUG}(?:\.\d{{3}})?)$")
RAIL_PATH = re.compile(r"^rail\.path$")
RAIL_LOOK = re.compile(r"^rail\.look\.\d{2}$")
ZONE_OBJECT = re.compile(rf"^zone\.(?P<slug>{SLUG})$")


def material_pattern(contract: dict) -> re.Pattern[str]:
    mats = contract["materials"]
    tokens = "|".join(re.escape(t) for t in mats["tokens"])
    ramps = "|".join(
        rf"{re.escape(name)}\.[1-{steps}]" for name, steps in mats["ramps"].items()
    )
    grads = "|".join(re.escape(g) for g in mats["gradients"])
    return re.compile(rf"^(?:tok\.(?:{tokens})|ramp\.(?:{ramps})|grad\.(?:{grads}))$")


def triangle_count(obj: bpy.types.Object, depsgraph) -> int:
    """Triangles of the evaluated mesh (modifiers applied), as the exporter sees it."""
    if obj.type != "MESH":
        return 0
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        mesh.calc_loop_triangles()
        return len(mesh.loop_triangles)
    finally:
        evaluated.to_mesh_clear()


def collection_objects(collection: bpy.types.Collection):
    """All objects in a collection, recursively."""
    yield from collection.objects
    for child in collection.children:
        yield from collection_objects(child)


def lint(scene: bpy.types.Scene | None = None, contract: dict | None = None) -> Report:
    scene = scene or bpy.context.scene
    contract = contract or load_contract()
    report = Report()
    cols = contract["collections"]
    budgets = contract["budgets"]["tris"]
    mat_ok = material_pattern(contract)
    depsgraph = bpy.context.evaluated_depsgraph_get()

    root = bpy.data.collections.get(cols["root"])
    if root is None or root.name not in scene.collection.children:
        report.error(f"missing root collection '{cols['root']}' linked to the scene")
        return report

    expected = dict(cols["districts"])
    expected["_colliders"] = cols["colliders"]
    expected["_rails"] = cols["rails"]
    found: dict[str, bpy.types.Collection] = {}
    for key, name in expected.items():
        col = root.children.get(name)
        if col is None:
            report.error(f"missing collection '{cols['root']}/{name}'")
        else:
            found[key] = col

    # Strays: anything not under World.
    placed = {o.name for o in collection_objects(root)}
    for obj in scene.objects:
        if obj.name not in placed and obj.type not in {"CAMERA", "LIGHT"}:
            report.error(f"object '{obj.name}' is not inside '{cols['root']}'")

    # Materials: whitelist by name, no textures.
    for obj in collection_objects(root):
        if obj.type != "MESH":
            continue
        if not obj.data.materials:
            report.error(f"'{obj.name}' has no material")
        for mat in obj.data.materials:
            if mat is None:
                report.error(f"'{obj.name}' has an empty material slot")
                continue
            if not mat_ok.match(mat.name):
                report.error(f"'{obj.name}' uses non-contract material '{mat.name}'")
            if mat.use_nodes and any(n.type == "TEX_IMAGE" for n in mat.node_tree.nodes):
                report.error(f"material '{mat.name}' uses an image texture")

    # Districts: naming, budgets.
    installations: dict[str, int] = {}
    for district, col_name in cols["districts"].items():
        col = found.get(district)
        if col is None:
            continue
        total = 0
        for obj in collection_objects(col):
            m = DISTRICT_OBJECT.match(obj.name)
            if not m:
                report.error(
                    f"'{obj.name}' in {col_name}: expected '<district>.<installation>.<part>[.<sub>...]'"
                )
                continue
            if m.group("district") != district:
                report.error(f"'{obj.name}' is in {col_name} but is prefixed '{m.group('district')}.'")
            tris = triangle_count(obj, depsgraph)
            total += tris
            key = f"{district}.{m.group('installation')}"
            installations[key] = installations.get(key, 0) + tris
        report.tris[district] = total
        cap = budgets["districts"].get(district)
        if cap is not None and total > cap:
            report.error(f"district '{district}' has {total} tris, budget {cap}")

    for key, tris in installations.items():
        name = key.split(".", 1)[1]
        cap = budgets["installations"].get(name, budgets["installationDefault"])
        if tris > cap:
            report.error(f"installation '{key}' has {tris} tris, budget {cap}")
    report.installations = installations

    authored = sum(report.tris.values())
    report.tris["authored"] = authored
    if authored > budgets["authoredTotal"]:
        report.error(f"authored total {authored} tris exceeds {budgets['authoredTotal']}")

    # Colliders.
    col = found.get("_colliders")
    if col is not None:
        for obj in collection_objects(col):
            if not COLLIDER_OBJECT.match(obj.name):
                report.error(f"'{obj.name}' in {cols['colliders']}: expected 'col.ground' or 'col.box.<slug>[.NNN]'")
            elif obj.name == "col.ground" and obj.type != "MESH":
                report.error("'col.ground' must be a MESH")
            elif obj.name != "col.ground" and obj.type not in {"MESH", "EMPTY"}:
                report.error(f"'{obj.name}' must be a MESH or EMPTY box")

    # Rails and zones.
    col = found.get("_rails")
    zones_found: set[str] = set()
    if col is not None:
        for obj in collection_objects(col):
            if RAIL_PATH.match(obj.name):
                if obj.type != "CURVE":
                    report.error("'rail.path' must be a CURVE")
                elif len(obj.data.splines) != 1:
                    report.error("'rail.path' must have exactly one spline")
            elif RAIL_LOOK.match(obj.name):
                t = obj.get("t")
                if not isinstance(t, (int, float)) or not 0.0 <= float(t) <= 1.0:
                    report.error(f"'{obj.name}' needs a custom property 't' in [0, 1]")
            elif ZONE_OBJECT.match(obj.name):
                slug = ZONE_OBJECT.match(obj.name).group("slug")
                zones_found.add(slug)
                if slug not in contract["zones"]:
                    report.error(f"'{obj.name}' is not a contract zone")
                radius = obj.get("radius")
                if not isinstance(radius, (int, float)) or float(radius) <= 0:
                    report.error(f"'{obj.name}' needs a custom property 'radius' > 0")
            else:
                report.error(f"'{obj.name}' in {cols['rails']}: expected 'rail.path', 'rail.look.NN' or 'zone.<slug>'")

    for name in contract["requiredObjects"]:
        if bpy.data.objects.get(name) is None:
            report.error(f"required object '{name}' is missing")
    for slug in contract["zones"]:
        if slug not in zones_found:
            report.error(f"zone 'zone.{slug}' is missing")

    return report


def report() -> str:
    """Convenience for the MCP loop: run and return the text report."""
    return lint().text()


if __name__ == "__main__":
    result = lint()
    print(result.text())
    if "--json" in sys.argv:
        print(json.dumps(result.to_json()))
    if not result.ok:
        sys.exit(1)
