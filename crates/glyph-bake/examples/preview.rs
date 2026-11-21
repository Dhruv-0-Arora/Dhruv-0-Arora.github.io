use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let yaw = std::env::args()
        .nth(1)
        .map_or(Ok(glyph_bake::START_YAW), |a| a.parse::<f32>())?;
    let root = Path::new(env!("CARGO_MANIFEST_DIR"));
    let mira = std::fs::read(root.join("../../sim/public/models/dozer.mira"))?;
    let asset = glyph_bake::bake(&mira, glyph_bake::FONT)?;
    let html = asset.frame(&glyph_bake::matrix(yaw, glyph_bake::START_PITCH));
    let mut text = html.clone();
    for (class, ansi) in [("b", 34), ("g", 32), ("y", 33), ("o", 31), ("p", 35)] {
        text = text.replace(&format!("<i class=\"{class}\">"), &format!("\x1b[{ansi}m"));
    }
    let text = text
        .replace("</i>", "\x1b[0m")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&");
    println!("{text}");
    Ok(())
}
