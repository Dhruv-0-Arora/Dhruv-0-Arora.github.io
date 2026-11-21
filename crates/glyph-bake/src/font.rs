use glyph::{Glyph, REGIONS};

use crate::Error;

const PX: f32 = 100.0;
const CELL_W: f32 = 60.0;
const CELL_H: f32 = 120.0;
pub const FILLS: &[u8] = b" .:-=+*#";
pub const EXCLUDED: &[u8] = b"!?$%&@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

fn small(n: impl TryInto<i16>) -> Result<f32, Error> {
    n.try_into()
        .map(f32::from)
        .map_err(|_| Error::Font("glyph metrics out of range"))
}

pub fn table(ttf: &[u8]) -> Result<Vec<Glyph>, Error> {
    let font =
        fontdue::Font::from_bytes(ttf, fontdue::FontSettings::default()).map_err(Error::Font)?;
    let line = font
        .horizontal_line_metrics(PX)
        .ok_or(Error::Font("no horizontal metrics"))?;
    let baseline = (CELL_H - (line.ascent - line.descent)) / 2.0 + line.ascent;
    let rest = (b' '..=b'~').filter(|c| !FILLS.contains(c) && !EXCLUDED.contains(c));
    let mut raw: Vec<(u8, [u64; REGIONS])> = Vec::new();
    for ch in FILLS.iter().copied().chain(rest) {
        let (m, bitmap) = font.rasterize(char::from(ch), PX);
        let left = small(m.xmin)?;
        let top = baseline - small(m.ymin)? - small(m.height)?;
        let mut cover = [0u64; REGIONS];
        for (k, &alpha) in bitmap.iter().enumerate() {
            let x = left + small(k % m.width.max(1))? + 0.5;
            let y = top + small(k / m.width.max(1))? + 0.5;
            if (0.0..CELL_W).contains(&x) && (0.0..CELL_H).contains(&y) {
                let row = usize::from(y >= CELL_H / 3.0) + usize::from(y >= CELL_H * 2.0 / 3.0);
                cover[row * 2 + usize::from(x >= CELL_W / 2.0)] += u64::from(alpha);
            }
        }
        raw.push((ch, cover));
    }
    let mut peak = [0u64; REGIONS];
    for (_, cover) in &raw {
        for (p, c) in peak.iter_mut().zip(cover) {
            *p = (*p).max(*c);
        }
    }
    raw.into_iter()
        .map(|(ch, cover)| {
            let mut shape = [0u8; REGIONS];
            for ((s, c), p) in shape.iter_mut().zip(cover).zip(peak) {
                if p > 0 {
                    *s = u8::try_from((c * 510 + p) / (2 * p))
                        .map_err(|_| Error::Font("shape out of range"))?;
                }
            }
            Ok(Glyph { ch, shape })
        })
        .collect()
}
