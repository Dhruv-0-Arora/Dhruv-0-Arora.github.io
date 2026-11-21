use crate::format::{Asset, MAX_COLS, MAX_GLYPHS, MAX_ROWS, MAX_TRIS, MAX_VERTS, REGIONS, ROLES};

pub const SX: usize = 6;
pub const SY: usize = 9;
const RX: usize = SX / 2;
const RY: usize = SY / 3;
const SX_F: f32 = 6.0;
const HALF_SY_F: f32 = 4.5;
const REGION_F: f32 = 9.0;
const _: () = assert!(SX == 6 && SY == 9 && RX * RY == 9);
const COLS: usize = MAX_COLS as usize;
const ROWS: usize = MAX_ROWS as usize;
const VERTS: usize = MAX_VERTS as usize;
const TRIS: usize = MAX_TRIS as usize;
const GLYPHS: usize = MAX_GLYPHS as usize;
const BAND: usize = COLS * SX * (SY + 2);
const NONE: u16 = u16::MAX;
const OPEN: &[u8] = b"<i class=\"b\">";
const CLOSE: &[u8] = b"</i>";
const CLASSES: &[u8; ROLES - 1] = b"bgyop";
pub const OUT_CAP: usize = ROWS * (COLS * (OPEN.len() + 5 + CLOSE.len()) + 1);

pub(crate) const LIGHT: [f32; 3] = [-0.408_248_3, 0.816_496_6, 0.408_248_3];
const DARK: f32 = 0.1;
const BRIGHT: f32 = 0.5;
const LINE: f32 = 1.0;
const GAP: f32 = 0.6;
const CREASE: f32 = 0.7;
const FLAT: f32 = 0.3;

pub struct Renderer {
    cam: [[f32; 3]; VERTS],
    scr: [[f32; 2]; VERTS],
    normal: [[f32; 3]; TRIS],
    slope: [[f32; 2]; TRIS],
    shade: [f32; TRIS],
    tri_role: [u8; TRIS],
    span: [[i32; 2]; TRIS],
    depth: [f32; BAND],
    tri: [u16; BAND],
    cells: [[f32; REGIONS]; COLS],
    cell_role: [u8; COLS],
    glyphs: [[f32; REGIONS]; GLYPHS],
    chars: [u8; GLYPHS],
    glyphs_len: usize,
    fills: usize,
    row: [u8; COLS],
    out: [u8; OUT_CAP],
    len: usize,
}

impl Default for Renderer {
    fn default() -> Self {
        Self::new()
    }
}

const BLANK: Renderer = Renderer {
    cam: [[0.0; 3]; VERTS],
    scr: [[0.0; 2]; VERTS],
    normal: [[0.0; 3]; TRIS],
    slope: [[0.0; 2]; TRIS],
    shade: [0.0; TRIS],
    tri_role: [0; TRIS],
    span: [[0; 2]; TRIS],
    depth: [0.0; BAND],
    tri: [0; BAND],
    cells: [[0.0; REGIONS]; COLS],
    cell_role: [0; COLS],
    glyphs: [[0.0; REGIONS]; GLYPHS],
    chars: [0; GLYPHS],
    glyphs_len: 0,
    fills: 0,
    row: [0; COLS],
    out: [0; OUT_CAP],
    len: 0,
};

fn contrast(value: f32, reference: f32) -> f32 {
    if reference > 0.0 {
        let ratio = value / reference;
        reference * (ratio * ratio)
    } else {
        value
    }
}

fn dot(a: [f32; 3], b: [f32; 3]) -> f32 {
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

fn edge(from: [f32; 2], to: [f32; 2], point: [f32; 2]) -> f32 {
    (to[0] - from[0]) * (point[1] - from[1]) - (to[1] - from[1]) * (point[0] - from[0])
}

#[expect(clippy::cast_possible_truncation)]
fn floor(value: f32) -> i32 {
    libm::floorf(value) as i32
}

fn index(value: i32) -> usize {
    usize::try_from(value).unwrap_or(0)
}

fn centre(value: i32) -> f32 {
    f32::from(i16::try_from(value).unwrap_or(0)) + 0.5
}

impl Renderer {
    #[must_use]
    pub const fn new() -> Self {
        BLANK
    }

    #[must_use]
    pub fn output(&self) -> &[u8] {
        &self.out[..self.len]
    }

    pub fn render(&mut self, asset: &Asset, m: &[f32; 9]) -> &[u8] {
        let cols = usize::from(asset.header.cols);
        let rows = usize::from(asset.header.rows);
        self.transform(asset, m);
        self.prepare(asset);
        for (i, g) in asset.glyphs().enumerate() {
            self.chars[i] = g.ch;
            self.glyphs[i] = g.shape.map(|s| f32::from(s) / 255.0);
        }
        self.glyphs_len = usize::from(asset.header.glyphs);
        self.fills = usize::from(asset.header.fills);
        self.len = 0;
        for band in 0..rows {
            self.raster(asset, band, cols);
            self.reduce(cols);
            if band > 0 {
                self.put(b"\n");
            }
            self.emit_row(cols);
        }
        self.output()
    }

    fn transform(&mut self, asset: &Asset, m: &[f32; 9]) {
        let scale = asset.header.scale;
        let half = f32::from(asset.header.cols) * 0.5;
        let top = f32::from(asset.header.rows);
        for (i, v) in asset.verts().enumerate() {
            let p = v.map(f32::from);
            let cam = [
                dot([m[0], m[1], m[2]], p) * scale,
                dot([m[3], m[4], m[5]], p) * scale,
                dot([m[6], m[7], m[8]], p) * scale,
            ];
            self.cam[i] = cam;
            self.scr[i] = [(half + cam[0]) * SX_F, (top - cam[1]) * HALF_SY_F];
        }
    }

    fn prepare(&mut self, asset: &Asset) {
        for (i, t) in asset.tris().enumerate() {
            let [a, b, c] = t.v.map(|v| self.cam[usize::from(v)]);
            let ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            let ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            let mut normal = [
                ab[1] * ac[2] - ab[2] * ac[1],
                ab[2] * ac[0] - ab[0] * ac[2],
                ab[0] * ac[1] - ab[1] * ac[0],
            ];
            if normal[2] < 0.0 {
                normal = normal.map(|v| -v);
            }
            let len = libm::sqrtf(dot(normal, normal));
            let normal = if len > 0.0 {
                normal.map(|v| v / len)
            } else {
                [0.0; 3]
            };
            self.normal[i] = normal;
            self.shade[i] = DARK + (BRIGHT - DARK) * dot(normal, LIGHT).max(0.0);
            self.tri_role[i] = t.role;
            let [sa, sb, sc] = t.v.map(|v| self.scr[usize::from(v)]);
            let det = edge(sa, sb, sc);
            self.slope[i] = if det == 0.0 {
                [0.0; 2]
            } else {
                [
                    (ab[2] * (sc[1] - sa[1]) - ac[2] * (sb[1] - sa[1])) / det,
                    (ac[2] * (sb[0] - sa[0]) - ab[2] * (sc[0] - sa[0])) / det,
                ]
            };
            let lo = sa[1].min(sb[1]).min(sc[1]);
            let hi = sa[1].max(sb[1]).max(sc[1]);
            self.span[i] = [-floor(0.5 - lo), floor(hi - 0.5)];
        }
    }

    fn raster(&mut self, asset: &Asset, band: usize, cols: usize) {
        let width = cols * SX;
        let last = i32::try_from(width).unwrap_or(0) - 1;
        let first_row = i32::try_from(band * SY).unwrap_or(0) - 1;
        let last_row = first_row + i32::try_from(SY).unwrap_or(0) + 1;
        let n = width * (SY + 2);
        self.depth[..n].fill(f32::NEG_INFINITY);
        self.tri[..n].fill(NONE);
        for (id, tri) in (0u16..).zip(asset.tris()) {
            let t = usize::from(id);
            let [lo, hi] = self.span[t];
            let (j0, j1) = (lo.max(first_row), hi.min(last_row));
            if j0 > j1 {
                continue;
            }
            let [pa, pb, pc] = tri.v.map(|v| self.scr[usize::from(v)]);
            let [za, zb, zc] = tri.v.map(|v| self.cam[usize::from(v)][2]);
            let mut area = edge(pa, pb, pc);
            if area == 0.0 || area.is_nan() {
                continue;
            }
            let sign = if area < 0.0 { -1.0 } else { 1.0 };
            area *= sign;
            let i0 = (-floor(0.5 - pa[0].min(pb[0]).min(pc[0]))).max(0);
            let i1 = floor(pa[0].max(pb[0]).max(pc[0]) - 0.5).min(last);
            for row in j0..=j1 {
                let py = centre(row);
                let base = index(row - first_row) * width;
                for col in i0..=i1 {
                    let p = [centre(col), py];
                    let wa = edge(pb, pc, p) * sign;
                    let wb = edge(pc, pa, p) * sign;
                    let wc = edge(pa, pb, p) * sign;
                    if wa < 0.0 || wb < 0.0 || wc < 0.0 {
                        continue;
                    }
                    let z = (wa * za + wb * zb + wc * zc) / area;
                    let at = base + index(col);
                    if z > self.depth[at] {
                        self.depth[at] = z;
                        self.tri[at] = id;
                    }
                }
            }
        }
    }

    fn sample(&self, k: usize, x: usize, width: usize) -> f32 {
        let t = self.tri[k];
        if t == NONE {
            return 0.0;
        }
        let z = self.depth[k];
        let normal = self.normal[usize::from(t)];
        let [dx, dy] = self.slope[usize::from(t)];
        let ahead = [z + dx, z + dy, z - dx, z - dy];
        let around = [
            (x + 1 < width).then(|| k + 1),
            Some(k + width),
            (x > 0).then(|| k - 1),
            Some(k - width),
        ];
        for (dir, neighbour) in around.into_iter().enumerate() {
            let Some(nb) = neighbour else { return LINE };
            let other = self.tri[nb];
            if other == NONE {
                return LINE;
            }
            if other != t {
                if ahead[dir] - self.depth[nb] > GAP {
                    return LINE;
                }
                if dir < 2 && dot(normal, self.normal[usize::from(other)]) < CREASE {
                    return LINE;
                }
            }
        }
        self.shade[usize::from(t)]
    }

    fn reduce(&mut self, cols: usize) {
        let width = cols * SX;
        for col in 0..cols {
            let mut regions = [0.0; REGIONS];
            let mut counts = [0u16; ROLES];
            for (r, slot) in regions.iter_mut().enumerate() {
                let (rx, ry) = (r % 2, r / 2);
                let mut sum = 0.0;
                for sy in 0..RY {
                    for sx in 0..RX {
                        let x = col * SX + rx * RX + sx;
                        let k = (1 + ry * RY + sy) * width + x;
                        sum += self.sample(k, x, width);
                        let t = self.tri[k];
                        if t != NONE {
                            counts[usize::from(self.tri_role[usize::from(t)])] += 1;
                        }
                    }
                }
                *slot = sum / REGION_F;
            }
            let mut best = (0u8, 0u16);
            for (role, count) in (0u8..).zip(counts) {
                if count > best.1 {
                    best = (role, count);
                }
            }
            self.cells[col] = regions;
            self.cell_role[col] = best.0;
        }
    }

    fn cell(&self, col: usize) -> u8 {
        let regions = self.cells[col];
        let top = regions.iter().fold(0.0f32, |acc, &v| acc.max(v));
        let shape = regions.map(|v| contrast(v, top));
        let low = shape.iter().fold(top, |acc, &v| acc.min(v));
        let flat = top - low <= FLAT * top;
        let tone = shape.iter().sum::<f32>();
        let candidates = if flat { self.fills } else { self.glyphs_len };
        let mut best = (0, f32::INFINITY);
        for (g, glyph) in self.glyphs[..candidates].iter().enumerate() {
            let distance = if flat {
                let diff = tone - glyph.iter().sum::<f32>();
                diff * diff
            } else {
                shape
                    .iter()
                    .zip(glyph)
                    .map(|(v, s)| (v - s) * (v - s))
                    .sum::<f32>()
            };
            if distance < best.1 {
                best = (g, distance);
            }
        }
        self.chars[best.0]
    }

    fn emit_row(&mut self, cols: usize) {
        for col in 0..cols {
            self.row[col] = self.cell(col);
        }
        let end = self.row[..cols]
            .iter()
            .rposition(|&ch| ch != b' ')
            .map_or(0, |p| p + 1);
        let mut open = 0u8;
        for col in 0..end {
            let ch = self.row[col];
            if ch != b' ' {
                let role = self.cell_role[col];
                if role != open {
                    if open != 0 {
                        self.put(CLOSE);
                    }
                    if role != 0 {
                        let mut tag = [0u8; OPEN.len()];
                        tag.copy_from_slice(OPEN);
                        tag[OPEN.len() - 3] = CLASSES[usize::from(role) - 1];
                        self.put(&tag);
                    }
                    open = role;
                }
            }
            match ch {
                b'&' => self.put(b"&amp;"),
                b'<' => self.put(b"&lt;"),
                b'>' => self.put(b"&gt;"),
                _ => self.put(&[ch]),
            }
        }
        if open != 0 {
            self.put(CLOSE);
        }
    }

    fn put(&mut self, bytes: &[u8]) {
        let end = self.len + bytes.len();
        if let Some(dst) = self.out.get_mut(self.len..end) {
            dst.copy_from_slice(bytes);
            self.len = end;
        }
    }
}
