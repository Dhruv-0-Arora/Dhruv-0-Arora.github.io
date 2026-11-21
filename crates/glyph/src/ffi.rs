#![allow(unsafe_code)]

use core::ptr::{addr_of, addr_of_mut};

use crate::{ASSET_CAP, Asset, Renderer};

static mut ASSET: [u8; ASSET_CAP] = [0; ASSET_CAP];
static mut LEN: usize = 0;
static mut RENDERER: Renderer = Renderer::new();

fn asset() -> Option<Asset<'static>> {
    // SAFETY: wasm32 is single threaded and nobody holds refs across calls
    let bytes = unsafe { (*addr_of!(ASSET)).get(..LEN)? };
    Asset::parse(bytes).ok()
}

#[unsafe(no_mangle)]
pub extern "C" fn asset_ptr() -> *mut u8 {
    addr_of_mut!(ASSET).cast()
}

#[unsafe(no_mangle)]
pub extern "C" fn asset_cap() -> usize {
    ASSET_CAP
}

#[unsafe(no_mangle)]
pub extern "C" fn load(len: usize) -> i32 {
    unsafe {
        LEN = if len <= ASSET_CAP { len } else { 0 };
    }
    if asset().is_some() {
        0
    } else {
        unsafe {
            LEN = 0;
        }
        1
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn render(
    m0: f32,
    m1: f32,
    m2: f32,
    m3: f32,
    m4: f32,
    m5: f32,
    m6: f32,
    m7: f32,
    m8: f32,
) -> usize {
    let Some(asset) = asset() else { return 0 };
    let renderer = unsafe { &mut *addr_of_mut!(RENDERER) };
    renderer
        .render(&asset, &[m0, m1, m2, m3, m4, m5, m6, m7, m8])
        .len()
}

#[unsafe(no_mangle)]
pub extern "C" fn output_ptr() -> *const u8 {
    let renderer = unsafe { &*addr_of!(RENDERER) };
    renderer.output().as_ptr()
}

#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}
