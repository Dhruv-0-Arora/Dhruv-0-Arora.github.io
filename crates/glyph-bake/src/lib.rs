use std::fmt;

mod font;
mod mesh;
pub mod mira;

pub use font::{EXCLUDED, FILLS};
pub use mesh::{Mesh, decode, mesh};

pub const FONT: &[u8] = include_bytes!("../assets/commit-mono-400.ttf");
pub const COLS: u16 = 64;
pub const START_YAW: f32 = 40.0;
pub const START_PITCH: f32 = 18.0;
const MARGIN: f32 = 1.0;

#[derive(Debug)]
pub enum Error {
    Gzip(std::io::Error),
    Decode(prost::DecodeError),
    Font(&'static str),
    Mesh(&'static str),
    Format(glyph::Error),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Gzip(e) => write!(f, "gunzip: {e}"),
            Self::Decode(e) => write!(f, "mirabuf: {e}"),
            Self::Font(e) => write!(f, "font: {e}"),
            Self::Mesh(e) => write!(f, "mesh: {e}"),
            Self::Format(e) => write!(f, "asset: {e:?}"),
        }
    }
}

impl std::error::Error for Error {}

pub struct Asset {
    bytes: Vec<u8>,
    cols: u16,
    rows: u16,
    start: [f32; 9],
}

impl Asset {
    #[must_use]
    pub fn bytes(&self) -> &[u8] {
        &self.bytes
    }

    #[must_use]
    pub fn cols(&self) -> u16 {
        self.cols
    }

    #[must_use]
    pub fn rows(&self) -> u16 {
        self.rows
    }

    #[must_use]
    pub fn start(&self) -> [f32; 9] {
        self.start
    }

    #[must_use]
    pub fn first_frame(&self) -> String {
        self.frame(&self.start)
    }

    #[must_use]
    pub fn frame(&self, m: &[f32; 9]) -> String {
        glyph::Asset::parse(&self.bytes)
            .map(|asset| {
                let mut renderer = Box::new(glyph::Renderer::new());
                String::from_utf8_lossy(renderer.render(&asset, m)).into_owned()
            })
            .unwrap_or_default()
    }
}

#[must_use]
pub fn matrix(yaw_deg: f32, pitch_deg: f32) -> [f32; 9] {
    let (sy, cy) = yaw_deg.to_radians().sin_cos();
    let (sp, cp) = pitch_deg.to_radians().sin_cos();
    [cy, 0.0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy]
}

fn footprint_centre(verts: &[[f32; 3]], lo: [f32; 2], hi: [f32; 2]) -> [f32; 2] {
    let reach = |c: [f32; 2]| {
        verts
            .iter()
            .map(|v| (v[0] - c[0]).hypot(v[2] - c[1]))
            .fold(0.0, f32::max)
    };
    let mut centre = [lo[0].midpoint(hi[0]), lo[1].midpoint(hi[1])];
    let mut span = [(hi[0] - lo[0]) / 2.0, (hi[1] - lo[1]) / 2.0];
    for _ in 0..16 {
        let mut best = (reach(centre), centre);
        for i in -8i8..=8 {
            for j in -8i8..=8 {
                let candidate = [
                    centre[0] + span[0] * f32::from(i) / 8.0,
                    centre[1] + span[1] * f32::from(j) / 8.0,
                ];
                let r = reach(candidate);
                if r < best.0 {
                    best = (r, candidate);
                }
            }
        }
        centre = best.1;
        span = span.map(|s| s / 4.0);
    }
    centre
}

fn envelope(verts: &[[f32; 3]], pitch: f32) -> (f32, f32, f32) {
    let (sin, cos) = pitch.to_radians().sin_cos();
    let mut wide: f32 = 0.0;
    let mut top = f32::NEG_INFINITY;
    let mut bottom = f32::INFINITY;
    for [x, y, z] in verts {
        let radius = x.hypot(*z);
        wide = wide.max(radius);
        top = top.max(y * cos + radius * sin.abs());
        bottom = bottom.min(y * cos - radius * sin.abs());
    }
    (wide, top, bottom)
}

#[expect(clippy::cast_possible_truncation)]
fn quantize(value: f32) -> i16 {
    value.round() as i16
}

pub fn bake(mira: &[u8], font_ttf: &[u8]) -> Result<Asset, Error> {
    let mesh = mesh(&decode(mira)?)?;
    let mut lo = [f32::INFINITY; 3];
    let mut hi = [f32::NEG_INFINITY; 3];
    for v in &mesh.verts {
        for k in 0..3 {
            lo[k] = lo[k].min(v[k]);
            hi[k] = hi[k].max(v[k]);
        }
    }
    let [cx, cz] = footprint_centre(&mesh.verts, [lo[0], lo[2]], [hi[0], hi[2]]);
    let centre = [cx, lo[1].midpoint(hi[1]), cz];
    let mut verts: Vec<[f32; 3]> = mesh
        .verts
        .iter()
        .map(|v| std::array::from_fn(|k| v[k] - centre[k]))
        .collect();
    let (_, top, bottom) = envelope(&verts, START_PITCH);
    let lift = (top + bottom) / (2.0 * START_PITCH.to_radians().cos());
    for v in &mut verts {
        v[1] -= lift;
    }
    let reach = verts
        .iter()
        .flatten()
        .fold(0.0f32, |acc, &v| acc.max(v.abs()));
    if !(reach.is_finite() && reach > 0.0) {
        return Err(Error::Mesh("degenerate bounds"));
    }
    let quant = f32::from(i16::MAX) / reach;
    let qverts: Vec<[i16; 3]> = verts
        .iter()
        .map(|v| v.map(|c| quantize(c * quant)))
        .collect();

    let grid: Vec<[f32; 3]> = qverts.iter().map(|v| v.map(f32::from)).collect();
    let (wide, top, bottom) = envelope(&grid, START_PITCH);
    let scale = (f32::from(COLS) / 2.0 - MARGIN) / wide;
    let half = top.max(-bottom) * scale;
    let mut rows: u16 = 1;
    while f32::from(rows) < half + 2.0 * MARGIN {
        rows += 1;
        if rows > glyph::MAX_ROWS {
            return Err(Error::Mesh("too many rows"));
        }
    }

    let mut tris = Vec::with_capacity(mesh.tris.len());
    for &(tri, role) in &mesh.tris {
        let mut v = [0u16; 3];
        for (slot, i) in v.iter_mut().zip(tri) {
            *slot = u16::try_from(i).map_err(|_| Error::Mesh("too many vertices"))?;
        }
        let [a, b, c] = v.map(|i| qverts[usize::from(i)]);
        if a != b && b != c && a != c {
            tris.push(glyph::Triangle { v, role });
        }
    }
    let glyphs = font::table(font_ttf)?;
    let start = matrix(START_YAW, START_PITCH);
    let count = |n: usize, what| u16::try_from(n).map_err(|_| Error::Mesh(what));
    let header = glyph::Header {
        cols: COLS,
        rows,
        verts: count(qverts.len(), "too many vertices")?,
        tris: count(tris.len(), "too many triangles")?,
        glyphs: count(glyphs.len(), "too many glyphs")?,
        fills: count(FILLS.len(), "too many fills")?,
        scale,
        start,
    };
    let mut bytes = vec![0; header.asset_len()];
    glyph::encode(&header, &qverts, &tris, &glyphs, &mut bytes).map_err(Error::Format)?;
    Ok(Asset {
        bytes,
        cols: COLS,
        rows,
        start,
    })
}
