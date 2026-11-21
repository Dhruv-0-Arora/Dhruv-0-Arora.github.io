pub const MAGIC: [u8; 4] = *b"GLYF";
pub const VERSION: u16 = 1;
pub const REGIONS: usize = 6;
pub const ROLES: usize = 6;
pub const MAX_COLS: u16 = 80;
pub const MAX_ROWS: u16 = 40;
pub const MAX_VERTS: u16 = 4096;
pub const MAX_TRIS: u16 = 4096;
pub const MAX_GLYPHS: u16 = 95;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    Length,
    Magic,
    Version,
    Limits,
    Index,
    Value,
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Header {
    pub cols: u16,
    pub rows: u16,
    pub verts: u16,
    pub tris: u16,
    pub glyphs: u16,
    pub fills: u16,
    pub scale: f32,
    pub start: [f32; 9],
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Triangle {
    pub v: [u16; 3],
    pub role: u8,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Glyph {
    pub ch: u8,
    pub shape: [u8; REGIONS],
}

const VERTEX_LEN: usize = 6;
const INDEX_LEN: usize = 6;
const GLYPH_LEN: usize = 1 + REGIONS;

impl Header {
    pub const LEN: usize = 4 + 2 * 7 + 4 + 9 * 4;

    #[must_use]
    pub fn encode(&self) -> [u8; Self::LEN] {
        let mut out = [0; Self::LEN];
        let mut w = Cursor::new(&mut out);
        w.put(&MAGIC);
        for v in [
            VERSION,
            self.cols,
            self.rows,
            self.verts,
            self.tris,
            self.glyphs,
            self.fills,
        ] {
            w.put(&v.to_le_bytes());
        }
        w.put(&self.scale.to_le_bytes());
        for m in self.start {
            w.put(&m.to_le_bytes());
        }
        out
    }

    pub fn decode(bytes: &[u8]) -> Result<Self, Error> {
        let head = bytes.get(..Self::LEN).ok_or(Error::Length)?;
        if head[..4] != MAGIC {
            return Err(Error::Magic);
        }
        let u = |i: usize| u16::from_le_bytes([head[4 + 2 * i], head[5 + 2 * i]]);
        let f = |i: usize| {
            let o = 18 + 4 * i;
            f32::from_le_bytes([head[o], head[o + 1], head[o + 2], head[o + 3]])
        };
        if u(0) != VERSION {
            return Err(Error::Version);
        }
        let header = Self {
            cols: u(1),
            rows: u(2),
            verts: u(3),
            tris: u(4),
            glyphs: u(5),
            fills: u(6),
            scale: f(0),
            start: [f(1), f(2), f(3), f(4), f(5), f(6), f(7), f(8), f(9)],
        };
        header.check()?;
        Ok(header)
    }

    fn check(&self) -> Result<(), Error> {
        let within = |v: u16, max: u16| (1..=max).contains(&v);
        if !(within(self.cols, MAX_COLS)
            && within(self.rows, MAX_ROWS)
            && within(self.verts, MAX_VERTS)
            && within(self.tris, MAX_TRIS)
            && within(self.glyphs, MAX_GLYPHS)
            && within(self.fills, self.glyphs))
        {
            return Err(Error::Limits);
        }
        if !(self.scale.is_finite() && self.scale > 0.0 && self.start.iter().all(|m| m.is_finite()))
        {
            return Err(Error::Value);
        }
        Ok(())
    }

    fn sections(&self) -> [usize; 5] {
        let verts = Self::LEN;
        let indices = verts + usize::from(self.verts) * VERTEX_LEN;
        let roles = indices + usize::from(self.tris) * INDEX_LEN;
        let glyphs = roles + usize::from(self.tris);
        let end = glyphs + usize::from(self.glyphs) * GLYPH_LEN;
        [verts, indices, roles, glyphs, end]
    }

    #[must_use]
    pub fn asset_len(&self) -> usize {
        self.sections()[4]
    }
}

pub fn encode(
    header: &Header,
    verts: &[[i16; 3]],
    tris: &[Triangle],
    glyphs: &[Glyph],
    out: &mut [u8],
) -> Result<(), Error> {
    header.check()?;
    if verts.len() != usize::from(header.verts)
        || tris.len() != usize::from(header.tris)
        || glyphs.len() != usize::from(header.glyphs)
        || out.len() != header.asset_len()
    {
        return Err(Error::Length);
    }
    let mut w = Cursor::new(out);
    w.put(&header.encode());
    for v in verts {
        for c in v {
            w.put(&c.to_le_bytes());
        }
    }
    for t in tris {
        for i in t.v {
            w.put(&i.to_le_bytes());
        }
    }
    for t in tris {
        w.put(&[t.role]);
    }
    for g in glyphs {
        w.put(&[g.ch]);
        w.put(&g.shape);
    }
    Asset::parse(w.buf).map(|_| ())
}

struct Cursor<'a> {
    buf: &'a mut [u8],
    pos: usize,
}

impl<'a> Cursor<'a> {
    fn new(buf: &'a mut [u8]) -> Self {
        Self { buf, pos: 0 }
    }

    fn put(&mut self, bytes: &[u8]) {
        self.buf[self.pos..self.pos + bytes.len()].copy_from_slice(bytes);
        self.pos += bytes.len();
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Asset<'a> {
    pub header: Header,
    verts: &'a [u8],
    indices: &'a [u8],
    roles: &'a [u8],
    glyphs: &'a [u8],
}

impl<'a> Asset<'a> {
    pub fn parse(bytes: &'a [u8]) -> Result<Self, Error> {
        let header = Header::decode(bytes)?;
        let [verts, indices, roles, glyphs, end] = header.sections();
        if bytes.len() != end {
            return Err(Error::Length);
        }
        let asset = Self {
            header,
            verts: &bytes[verts..indices],
            indices: &bytes[indices..roles],
            roles: &bytes[roles..glyphs],
            glyphs: &bytes[glyphs..end],
        };
        let n = header.verts;
        if !asset
            .indices
            .chunks_exact(2)
            .all(|c| u16::from_le_bytes([c[0], c[1]]) < n)
        {
            return Err(Error::Index);
        }
        if !asset.roles.iter().all(|&r| usize::from(r) < ROLES)
            || !asset
                .glyphs
                .chunks_exact(GLYPH_LEN)
                .all(|g| (b' '..=b'~').contains(&g[0]))
        {
            return Err(Error::Value);
        }
        Ok(asset)
    }

    pub fn verts(&self) -> impl Iterator<Item = [i16; 3]> + 'a {
        self.verts.chunks_exact(VERTEX_LEN).map(|c| {
            [
                i16::from_le_bytes([c[0], c[1]]),
                i16::from_le_bytes([c[2], c[3]]),
                i16::from_le_bytes([c[4], c[5]]),
            ]
        })
    }

    pub fn tris(&self) -> impl Iterator<Item = Triangle> + 'a {
        self.indices
            .chunks_exact(INDEX_LEN)
            .zip(self.roles)
            .map(|(c, &role)| Triangle {
                v: [
                    u16::from_le_bytes([c[0], c[1]]),
                    u16::from_le_bytes([c[2], c[3]]),
                    u16::from_le_bytes([c[4], c[5]]),
                ],
                role,
            })
    }

    pub fn glyphs(&self) -> impl Iterator<Item = Glyph> + 'a {
        self.glyphs.chunks_exact(GLYPH_LEN).map(|c| Glyph {
            ch: c[0],
            shape: [c[1], c[2], c[3], c[4], c[5], c[6]],
        })
    }
}
