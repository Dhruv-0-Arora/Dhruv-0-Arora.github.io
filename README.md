# darora1.me

Plain HTML, generated with Rust.

```sh
nix develop      # or direnv allow
just serve       # http://localhost:4000
just check       # lint, tests, build, HTML validation
```

- `content/` - Markdown with TOML front matter.
- `crates/site` - the generator. Fails the build on broken links, missing alt text, or oversized pages.
- `crates/glyph` - the robot in the corner. A `no_std` rasterizer that draws a CAD file in text: native first frame, then WASM.
- `sim/` - the old 3D version, React and three.js. Served at `/sim/`.
