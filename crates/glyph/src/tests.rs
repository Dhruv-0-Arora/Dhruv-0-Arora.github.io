use std::string::String;
use std::vec::Vec;
use std::{boxed::Box, vec};

use crate::render::LIGHT;
use crate::{Asset, Error, Glyph, Header, Renderer, Triangle, encode};

const IDENTITY: [f32; 9] = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0];

struct Scene {
    cols: u16,
    rows: u16,
    verts: Vec<[i16; 3]>,
    tris: Vec<Triangle>,
}

fn glyph(ch: u8, shape: [u8; 6]) -> Glyph {
    Glyph { ch, shape }
}

fn table() -> (Vec<Glyph>, u16) {
    let glyphs = vec![
        glyph(b' ', [0; 6]),
        glyph(b':', [41; 6]),
        glyph(b'*', [67; 6]),
        glyph(b'#', [153; 6]),
        glyph(b'[', [255, 0, 255, 0, 255, 0]),
        glyph(b']', [0, 255, 0, 255, 0, 255]),
        glyph(b'_', [0, 0, 0, 0, 155, 155]),
    ];
    (glyphs, 4)
}

impl Scene {
    fn new(cols: u16, rows: u16) -> Self {
        Self {
            cols,
            rows,
            verts: Vec::new(),
            tris: Vec::new(),
        }
    }

    fn point(&self, col: i16, row: i16, z: i16) -> [i16; 3] {
        let cols = i16::try_from(self.cols).unwrap();
        let rows = i16::try_from(self.rows).unwrap();
        [(col - cols * 5) * 100, (rows * 10 - row * 2) * 100, z]
    }

    fn tri(&mut self, pts: [[i16; 3]; 3], role: u8) {
        let base = u16::try_from(self.verts.len()).unwrap();
        self.verts.extend(pts);
        self.tris.push(Triangle {
            v: [base, base + 1, base + 2],
            role,
        });
    }

    fn rect(&mut self, cols: [i16; 2], rows: [i16; 2], depth: impl Fn(i16, i16) -> i16, role: u8) {
        let corner = |col: i16, row: i16| {
            let [x, y, _] = self.point(col, row, 0);
            [x, y, depth(x, y)]
        };
        let quad = [
            corner(cols[0], rows[0]),
            corner(cols[1], rows[0]),
            corner(cols[1], rows[1]),
            corner(cols[0], rows[1]),
        ];
        self.tri([quad[0], quad[1], quad[2]], role);
        self.tri([quad[0], quad[2], quad[3]], role);
    }

    fn bytes(&self, glyphs: &[Glyph], fills: u16) -> Vec<u8> {
        let header = Header {
            cols: self.cols,
            rows: self.rows,
            verts: u16::try_from(self.verts.len()).unwrap(),
            tris: u16::try_from(self.tris.len()).unwrap(),
            glyphs: u16::try_from(glyphs.len()).unwrap(),
            fills,
            scale: 0.001,
            start: IDENTITY,
        };
        let mut out = vec![0; header.asset_len()];
        encode(&header, &self.verts, &self.tris, glyphs, &mut out).unwrap();
        out
    }

    fn html_with(&self, glyphs: &[Glyph], fills: u16) -> String {
        let bytes = self.bytes(glyphs, fills);
        let asset = Asset::parse(&bytes).unwrap();
        let mut r = Box::new(Renderer::new());
        String::from_utf8(r.render(&asset, &IDENTITY).to_vec()).unwrap()
    }

    fn html(&self) -> String {
        let (glyphs, fills) = table();
        self.html_with(&glyphs, fills)
    }

    fn grid(&self) -> Vec<Vec<u8>> {
        text(&self.html())
            .split('\n')
            .map(|l| {
                let mut row = l.as_bytes().to_vec();
                row.resize(usize::from(self.cols), b' ');
                row
            })
            .collect()
    }
}

fn text(html: &str) -> String {
    let mut out = String::new();
    let mut rest = html;
    while let Some(c) = rest.chars().next() {
        if let Some(r) = rest.strip_prefix("</i>") {
            rest = r;
        } else if rest.starts_with("<i class=\"") {
            rest = &rest[13..];
        } else if let Some(r) = rest.strip_prefix("&amp;") {
            out.push('&');
            rest = r;
        } else if let Some(r) = rest.strip_prefix("&lt;") {
            out.push('<');
            rest = r;
        } else if let Some(r) = rest.strip_prefix("&gt;") {
            out.push('>');
            rest = r;
        } else {
            out.push(c);
            rest = &rest[c.len_utf8()..];
        }
    }
    out
}

fn flat(_: i16, _: i16) -> i16 {
    0
}

#[test]
fn single_triangle_covers_expected_cells() {
    let mut s = Scene::new(8, 3);
    let pts = [s.point(0, 0, 0), s.point(40, 0, 0), s.point(0, 30, 0)];
    s.tri(pts, 0);
    let g = s.grid();
    assert_eq!(g.len(), 3);
    for (r, c) in [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (2, 0)] {
        assert_ne!(g[r][c], b' ', "cell {r},{c} should be inked");
    }
    for (r, c) in [(0, 5), (1, 4), (2, 3), (2, 7), (1, 7)] {
        assert_eq!(g[r][c], b' ', "cell {r},{c} should be empty");
    }
}

#[test]
fn nearer_geometry_wins_in_either_order() {
    for (near, far, class) in [(1, 2, "\"b\""), (2, 1, "\"g\"")] {
        for flip in [false, true] {
            let mut s = Scene::new(6, 2);
            let layers = if flip {
                [(far, -500), (near, 500)]
            } else {
                [(near, 500), (far, -500)]
            };
            for (role, z) in layers {
                s.rect([0, 60], [0, 20], |_, _| z, role);
            }
            let html = s.html();
            assert!(html.contains(class), "{html}");
            assert_eq!(html.matches("<i class=").count(), 2, "{html}");
        }
    }
}

#[test]
fn bright_cell_is_dense_and_empty_cell_is_space() {
    let [lx, ly, lz] = LIGHT;
    assert!((ly + 2.0 * lx).abs() < 1e-6 && (lz + lx).abs() < 1e-6);
    let mut lit = Scene::new(6, 3);
    lit.rect([0, 60], [0, 30], |x, y| x - 2 * y, 0);
    let mut dim = Scene::new(6, 3);
    dim.rect([0, 60], [0, 30], flat, 0);
    let (lit, dim) = (lit.grid(), dim.grid());
    assert_eq!(lit[1][2], b'#');
    assert_ne!(dim[1][2], b'#');
    assert_ne!(dim[1][2], b' ');

    let mut empty = Scene::new(6, 3);
    empty.rect([0, 10], [0, 10], flat, 0);
    let g = empty.grid();
    assert_eq!(g[2][4], b' ');
    assert!(g.iter().flatten().filter(|&&c| c != b' ').count() <= 1);
}

#[test]
fn half_covered_cell_leans_to_its_half() {
    let mut left = Scene::new(5, 3);
    left.rect([20, 25], [0, 30], flat, 0);
    assert_eq!(left.grid()[1][2], b'[');
    let mut right = Scene::new(5, 3);
    right.rect([25, 30], [0, 30], flat, 0);
    assert_eq!(right.grid()[1][2], b']');
    let mut bottom = Scene::new(5, 3);
    bottom.rect([0, 50], [17, 30], flat, 0);
    assert_eq!(bottom.grid()[1][2], b'_');
}

#[test]
fn output_escapes_and_encodes_runs() {
    let glyphs = vec![
        glyph(b' ', [0; 6]),
        glyph(b'&', [120; 6]),
        glyph(b'<', [255, 0, 255, 0, 255, 0]),
        glyph(b'>', [0, 255, 0, 255, 0, 255]),
    ];
    let mut s = Scene::new(8, 2);
    s.rect([0, 40], [0, 20], flat, 1);
    s.rect([40, 80], [0, 10], flat, 0);
    s.rect([55, 60], [10, 20], flat, 0);
    s.rect([70, 75], [10, 20], flat, 0);
    let html = s.html_with(&glyphs, 2);
    let rows: Vec<&str> = html.split('\n').collect();
    assert_eq!(rows.len(), 2);
    assert!(!html.ends_with('\n'));
    for row in &rows {
        assert!(!row.ends_with(' '));
        assert_eq!(
            row.matches("<i class=\"b\">").count(),
            row.matches("</i>").count()
        );
        assert!(!row.contains("</i><i"));
    }
    assert!(rows[0].starts_with("<i class=\"b\">"));
    let (blue, plain) = rows[0].split_once("</i>").unwrap();
    assert!(!plain.contains('<') && !plain.is_empty());
    let shown = text(&html);
    assert!(shown.contains('&') && shown.contains('<') && shown.contains('>'));
    let bare = String::from(blue.trim_start_matches("<i class=\"b\">")) + plain + rows[1];
    let bare = bare.replace("</i>", "").replace("<i class=\"b\">", "");
    for (i, ch) in bare.char_indices() {
        assert!(ch != '<' && ch != '>');
        if ch == '&' {
            let tail = &bare[i..];
            assert!(
                tail.starts_with("&amp;") || tail.starts_with("&lt;") || tail.starts_with("&gt;")
            );
        }
    }
    assert_eq!(rows[1].trim_end().len(), rows[1].len());
}

#[test]
fn parse_rejects_malformed_assets() {
    let mut s = Scene::new(4, 2);
    s.rect([0, 40], [0, 20], flat, 1);
    let (glyphs, fills) = table();
    let good = s.bytes(&glyphs, fills);
    assert!(Asset::parse(&good).is_ok());
    assert_eq!(
        Asset::parse(&good[..good.len() - 1]).unwrap_err(),
        Error::Length
    );
    assert_eq!(Asset::parse(&good[..10]).unwrap_err(), Error::Length);
    let mut bad = good.clone();
    bad[0] = b'X';
    assert_eq!(Asset::parse(&bad).unwrap_err(), Error::Magic);
    let mut bad = good.clone();
    bad[4] = 9;
    assert_eq!(Asset::parse(&bad).unwrap_err(), Error::Version);
    let mut bad = good.clone();
    let tri = Header::LEN + s.verts.len() * 6;
    bad[tri] = 0xff;
    bad[tri + 1] = 0x7f;
    assert_eq!(Asset::parse(&bad).unwrap_err(), Error::Index);
    let mut bad = good.clone();
    bad[6] = 0;
    bad[7] = 0;
    assert_eq!(Asset::parse(&bad).unwrap_err(), Error::Limits);
    let mut bad = good;
    bad[18..22].copy_from_slice(&f32::NAN.to_le_bytes());
    assert_eq!(Asset::parse(&bad).unwrap_err(), Error::Value);
}

#[test]
fn non_finite_matrix_renders_without_panicking() {
    let mut s = Scene::new(4, 2);
    s.rect([0, 40], [0, 20], flat, 1);
    let (glyphs, fills) = table();
    let bytes = s.bytes(&glyphs, fills);
    let asset = Asset::parse(&bytes).unwrap();
    let mut r = Box::new(Renderer::new());
    for m in [[f32::NAN; 9], [f32::INFINITY; 9], [1e30; 9]] {
        let _ = r.render(&asset, &m);
    }
}
