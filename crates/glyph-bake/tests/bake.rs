use std::path::Path;
use std::sync::OnceLock;

use glyph_bake::{Asset, COLS, FONT, START_PITCH, bake, decode, matrix, mesh};

fn input(path: &str) -> Vec<u8> {
    std::fs::read(Path::new(env!("CARGO_MANIFEST_DIR")).join(path)).unwrap()
}

fn mira() -> Vec<u8> {
    input("../../sim/public/models/dozer.mira")
}

fn asset() -> &'static Asset {
    static ASSET: OnceLock<Asset> = OnceLock::new();
    ASSET.get_or_init(|| bake(&mira(), FONT).unwrap())
}

#[test]
fn decodes_a_sane_mesh() {
    let mesh = mesh(&decode(&mira()).unwrap()).unwrap();
    assert!(!mesh.tris.is_empty());
    assert!(mesh.verts.iter().flatten().all(|c| c.is_finite()));
    assert!(
        mesh.tris
            .iter()
            .flat_map(|(t, _)| t)
            .all(|&i| (i as usize) < mesh.verts.len())
    );
    let mut roles: Vec<u8> = mesh.tris.iter().map(|&(_, r)| r).collect();
    roles.sort_unstable();
    roles.dedup();
    assert!(roles.contains(&0) && roles.contains(&1), "roles {roles:?}");
}

#[test]
fn gzipped_input_decodes_the_same() {
    use std::io::Write;
    let raw = mira();
    let mut gz = flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::default());
    gz.write_all(&raw).unwrap();
    let gz = gz.finish().unwrap();
    assert_eq!(decode(&gz).unwrap(), decode(&raw).unwrap());
}

#[test]
fn baking_is_deterministic() {
    let again = bake(&mira(), FONT).unwrap();
    assert_eq!(asset().bytes(), again.bytes());
}

#[test]
fn asset_round_trips_through_the_parser() {
    let a = asset();
    let parsed = glyph::Asset::parse(a.bytes()).unwrap();
    assert_eq!(parsed.header.cols, a.cols());
    assert_eq!(parsed.header.rows, a.rows());
    assert_eq!(
        parsed.header.start.map(f32::to_bits),
        a.start().map(f32::to_bits)
    );
    assert_eq!(a.cols(), COLS);
    assert!(a.rows() >= 3 && a.rows() <= glyph::MAX_ROWS);
    assert_eq!(parsed.verts().count(), usize::from(parsed.header.verts));
    assert_eq!(parsed.tris().count(), usize::from(parsed.header.tris));
    assert!(parsed.glyphs().any(|g| g.ch == b' '));
}

#[test]
fn first_frame_snapshot() {
    insta::assert_snapshot!(asset().first_frame());
}

fn plain(html: &str) -> String {
    let mut out = html.replace("</i>", "");
    for class in ["b", "g", "y", "o", "p"] {
        out = out.replace(&format!("<i class=\"{class}\">"), "");
    }
    out.replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&")
}

fn extent(asset: &Asset, yaw: f32) -> (f32, f32) {
    let parsed = glyph::Asset::parse(asset.bytes()).unwrap();
    let m = matrix(yaw, START_PITCH);
    let scale = parsed.header.scale;
    parsed.verts().fold((0.0f32, 0.0f32), |(wide, tall), vert| {
        let p = vert.map(f32::from);
        let across = (m[0] * p[0] + m[1] * p[1] + m[2] * p[2]) * scale;
        let up = (m[3] * p[0] + m[4] * p[1] + m[5] * p[2]) * scale;
        (wide.max(across.abs()), tall.max(up.abs()))
    })
}

fn turn() -> impl Iterator<Item = f32> {
    (0u16..720).map(|step| f32::from(step) / 2.0)
}

#[test]
fn never_clips_over_a_full_turn() {
    let asset = asset();
    let half_width = f32::from(asset.cols()) / 2.0 - 1.0;
    let half_height = f32::from(asset.rows()) - 2.0;
    for yaw in turn() {
        let (wide, tall) = extent(asset, yaw);
        assert!(wide <= half_width + 1e-3, "x {wide} at yaw {yaw}");
        assert!(tall <= half_height + 1e-3, "y {tall} at yaw {yaw}");
    }
    for step in 0u16..72 {
        let yaw = f32::from(step) * 5.0;
        let frame = plain(&asset.frame(&matrix(yaw, START_PITCH)));
        let rows: Vec<&str> = frame.split('\n').collect();
        assert_eq!(rows.len(), usize::from(asset.rows()));
        assert!(rows[0].is_empty(), "top row inked at yaw {yaw}");
        assert!(
            rows[rows.len() - 1].is_empty(),
            "bottom row inked at yaw {yaw}"
        );
        for row in rows {
            assert!(
                !row.starts_with(|c: char| c != ' '),
                "left column inked at yaw {yaw}"
            );
            assert!(
                row.len() < usize::from(asset.cols()),
                "right column inked at yaw {yaw}"
            );
        }
    }
}

#[test]
fn derived_rows_are_tight() {
    let asset = asset();
    let tallest = turn().map(|yaw| extent(asset, yaw).1).fold(0.0, f32::max);
    let fewer = f32::from(asset.rows() - 2) - 2.0;
    assert!(tallest > fewer, "{} rows would still fit", asset.rows() - 2);
}
