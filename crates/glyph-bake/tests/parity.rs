use std::path::Path;

use wasmi::{Engine, Instance, Linker, Memory, Module, Store};

struct Wasm {
    store: Store<()>,
    instance: Instance,
    memory: Memory,
}

impl Wasm {
    fn new() -> Self {
        let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../target/glyph.wasm");
        let bytes = std::fs::read(&path).unwrap_or_else(|_| {
            panic!(
                "{} is missing: run `just wasm` before the tests",
                path.display()
            )
        });
        let engine = Engine::default();
        let module = Module::new(&engine, &bytes[..]).unwrap();
        assert_eq!(
            module.imports().count(),
            0,
            "glyph.wasm must not import anything"
        );
        let mut store = Store::new(&engine, ());
        let instance = Linker::new(&engine)
            .instantiate_and_start(&mut store, &module)
            .unwrap();
        let memory = instance.get_memory(&store, "memory").unwrap();
        Self {
            store,
            instance,
            memory,
        }
    }

    fn call<P: wasmi::WasmParams, R: wasmi::WasmResults>(&mut self, name: &str, args: P) -> R {
        self.instance
            .get_typed_func::<P, R>(&self.store, name)
            .unwrap()
            .call(&mut self.store, args)
            .unwrap()
    }

    fn load(&mut self, asset: &[u8]) -> i32 {
        let ptr: u32 = self.call("asset_ptr", ());
        let cap: u32 = self.call("asset_cap", ());
        assert!(asset.len() <= cap as usize);
        self.memory
            .write(&mut self.store, ptr as usize, asset)
            .unwrap();
        self.call("load", (u32::try_from(asset.len()).unwrap(),))
    }

    fn render(&mut self, m: [f32; 9]) -> Vec<u8> {
        let len: u32 = self.call(
            "render",
            (m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]),
        );
        let ptr: u32 = self.call("output_ptr", ());
        let mut out = vec![0; len as usize];
        self.memory
            .read(&self.store, ptr as usize, &mut out)
            .unwrap();
        out
    }
}

fn input(path: &str) -> Vec<u8> {
    std::fs::read(Path::new(env!("CARGO_MANIFEST_DIR")).join(path)).unwrap()
}

#[test]
fn wasm_and_native_render_identical_bytes() {
    let asset = glyph_bake::bake(
        &input("../../sim/public/models/dozer.mira"),
        glyph_bake::FONT,
    )
    .unwrap();
    let mut wasm = Wasm::new();
    assert_eq!(wasm.load(asset.bytes()), 0);
    let mut matrices = vec![asset.start()];
    for yaw in [0.0, 37.0, 90.0, 181.3, 271.0, 333.3] {
        matrices.push(glyph_bake::matrix(yaw, glyph_bake::START_PITCH));
    }
    for m in matrices {
        let native = asset.frame(&m);
        assert!(!native.trim().is_empty());
        assert_eq!(
            String::from_utf8(wasm.render(m)).unwrap(),
            native,
            "matrix {m:?}"
        );
    }
}

#[test]
fn wasm_rejects_malformed_assets() {
    let mut wasm = Wasm::new();
    assert_ne!(wasm.load(b"not an asset"), 0);
    assert!(
        wasm.render([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0])
            .is_empty()
    );
    let cap: u32 = wasm.call("asset_cap", ());
    assert_ne!(wasm.call::<(u32,), i32>("load", (cap + 1,)), 0);
    assert_ne!(wasm.call::<(u32,), i32>("load", (u32::MAX,)), 0);
}
