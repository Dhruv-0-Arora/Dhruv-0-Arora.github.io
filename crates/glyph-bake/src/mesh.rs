use std::collections::BTreeMap;
use std::io::Read;

use prost::Message;

use crate::Error;
use crate::mira::{Assembly, Node, Parts, Transform};

pub struct Mesh {
    pub verts: Vec<[f32; 3]>,
    pub tris: Vec<([u32; 3], u8)>,
}

pub fn decode(mira: &[u8]) -> Result<Assembly, Error> {
    let mut raw = Vec::new();
    let bytes = if mira.starts_with(&[0x1f, 0x8b]) {
        flate2::read::GzDecoder::new(mira)
            .read_to_end(&mut raw)
            .map_err(Error::Gzip)?;
        &raw[..]
    } else {
        mira
    };
    Assembly::decode(bytes).map_err(Error::Decode)
}

type Affine = [[f32; 4]; 3];

const IDENTITY: Affine = [
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [0.0, 0.0, 1.0, 0.0],
];

fn affine(transform: Option<&Transform>) -> Option<Affine> {
    let m = &transform?.spatial_matrix;
    (m.len() == 16).then(|| {
        let row = |i: usize| [m[i], m[i + 1], m[i + 2], m[i + 3]];
        [row(0), row(4), row(8)]
    })
}

fn compose(outer: &Affine, inner: &Affine) -> Affine {
    let mut out = [[0.0; 4]; 3];
    for (i, row) in out.iter_mut().enumerate() {
        for (j, v) in row.iter_mut().enumerate() {
            let shift = if j == 3 { outer[i][3] } else { 0.0 };
            *v = (0..3).map(|k| outer[i][k] * inner[k][j]).sum::<f32>() + shift;
        }
    }
    out
}

fn apply(m: &Affine, p: [f32; 3]) -> [f32; 3] {
    m.map(|r| r[0] * p[0] + r[1] * p[1] + r[2] * p[2] + r[3])
}

fn role(rgb: [i32; 3]) -> u8 {
    let [red, green, blue] = rgb.map(|c| f64::from(c.clamp(0, 255)) / 255.0);
    let max = red.max(green).max(blue);
    let spread = max - red.min(green).min(blue);
    if max < 0.15 || spread / max < 0.25 {
        return 0;
    }
    let hue = if (max - red).abs() < f64::EPSILON {
        60.0 * ((green - blue) / spread).rem_euclid(6.0)
    } else if (max - green).abs() < f64::EPSILON {
        60.0 * ((blue - red) / spread + 2.0)
    } else {
        60.0 * ((red - green) / spread + 4.0)
    };
    let palette = [(1, 220.0), (2, 120.0), (3, 55.0), (4, 28.0), (5, 280.0)];
    let mut best = (0, f64::INFINITY);
    for (role, centre) in palette {
        let distance = (hue - centre).abs().min(360.0 - (hue - centre).abs());
        if distance < best.1 {
            best = (role, distance);
        }
    }
    best.0
}

fn walk<'a>(node: &'a Node, parent: &Affine, parts: &Parts, out: &mut BTreeMap<&'a str, Affine>) {
    for child in &node.children {
        let Some(inst) = parts.part_instances.get(&child.value) else {
            continue;
        };
        if out.contains_key(child.value.as_str()) {
            continue;
        }
        let global = compose(parent, &affine(inst.transform.as_ref()).unwrap_or(IDENTITY));
        out.insert(&child.value, global);
        walk(child, &global, parts, out);
    }
}

pub fn mesh(assembly: &Assembly) -> Result<Mesh, Error> {
    let data = assembly
        .data
        .as_ref()
        .ok_or(Error::Mesh("no assembly data"))?;
    let parts = data.parts.as_ref().ok_or(Error::Mesh("no parts"))?;
    let roles: BTreeMap<&str, u8> = data
        .materials
        .iter()
        .flat_map(|m| &m.appearances)
        .map(|(id, a)| (id.as_str(), a.albedo.map_or(0, |c| role([c.r, c.g, c.b]))))
        .collect();

    let mut globals = BTreeMap::new();
    for root in assembly.design_hierarchy.iter().flat_map(|h| &h.nodes) {
        let Some(inst) = parts.part_instances.get(&root.value) else {
            continue;
        };
        let def = parts.part_definitions.get(&inst.part_definition_reference);
        let m = affine(inst.transform.as_ref())
            .or_else(|| affine(def.and_then(|d| d.base_transform.as_ref())))
            .unwrap_or(IDENTITY);
        globals.insert(root.value.as_str(), m);
        walk(root, &m, parts, &mut globals);
    }

    let mut out = Mesh {
        verts: Vec::new(),
        tris: Vec::new(),
    };
    for (id, inst) in &parts.part_instances {
        let (Some(def), Some(m)) = (
            parts.part_definitions.get(&inst.part_definition_reference),
            globals.get(id.as_str()),
        ) else {
            continue;
        };
        for body in &def.bodies {
            let Some(mesh) = body.triangle_mesh.as_ref().and_then(|t| t.mesh.as_ref()) else {
                continue;
            };
            let role = [&body.appearance_override, &inst.appearance]
                .into_iter()
                .find_map(|a| roles.get(a.as_str()).copied())
                .unwrap_or(0);
            let base = out.verts.len();
            let count = mesh.verts.len() / 3;
            out.verts.extend(
                mesh.verts
                    .chunks_exact(3)
                    .map(|v| apply(m, [v[0], v[1], v[2]])),
            );
            for tri in mesh.indices.chunks_exact(3) {
                let idx = [tri[0], tri[1], tri[2]].map(|i| {
                    usize::try_from(i)
                        .ok()
                        .filter(|&i| i < count)
                        .and_then(|i| u32::try_from(base + i).ok())
                });
                if let [Some(a), Some(b), Some(c)] = idx {
                    out.tris.push(([a, b, c], role));
                }
            }
        }
    }
    if out.tris.is_empty() {
        return Err(Error::Mesh("no triangles"));
    }
    Ok(out)
}
