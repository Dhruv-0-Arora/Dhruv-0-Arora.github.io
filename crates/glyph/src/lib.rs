#![no_std]

// native cdylib needs std for panic handler
#[cfg(not(target_arch = "wasm32"))]
extern crate std;

#[cfg(target_arch = "wasm32")]
mod ffi;
mod format;
mod render;

pub use format::{
    Asset, Error, Glyph, Header, MAGIC, MAX_COLS, MAX_GLYPHS, MAX_ROWS, MAX_TRIS, MAX_VERTS,
    REGIONS, ROLES, Triangle, VERSION, encode,
};
pub use render::{OUT_CAP, Renderer, SX, SY};

pub const ASSET_CAP: usize = 1 << 16;

#[cfg(test)]
mod tests;
