use std::fs;
use std::path::{Path, PathBuf};

use site::{Gate, Options};

struct Fixture {
    root: PathBuf,
}

fn fixtures() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures")
}

fn copy_dir(from: &Path, to: &Path) {
    fs::create_dir_all(to).unwrap();
    for entry in fs::read_dir(from).unwrap() {
        let entry = entry.unwrap();
        let target = to.join(entry.file_name());
        if entry.file_type().unwrap().is_dir() {
            copy_dir(&entry.path(), &target);
        } else {
            fs::copy(entry.path(), target).unwrap();
        }
    }
}

impl Fixture {
    fn new(name: &str) -> Self {
        let root = Path::new(env!("CARGO_TARGET_TMPDIR"))
            .join("site-fixtures")
            .join(name);
        if root.exists() {
            fs::remove_dir_all(&root).unwrap();
        }
        copy_dir(&fixtures().join("basic"), &root);
        Self { root }
    }

    fn write(&self, rel: &str, text: &str) -> &Self {
        let path = self.root.join(rel);
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, text).unwrap();
        self
    }

    fn append(&self, rel: &str, text: &str) -> &Self {
        let path = self.root.join(rel);
        let old = fs::read_to_string(&path).unwrap();
        fs::write(path, old + text).unwrap();
        self
    }

    fn options(&self) -> Options {
        Options::new(&self.root)
    }

    fn read(&self, rel: &str) -> String {
        fs::read_to_string(self.root.join("dist").join(rel)).unwrap()
    }

    fn errors(&self) -> Vec<String> {
        failures(&self.options())
    }
}

fn failures(options: &Options) -> Vec<String> {
    match site::build(options) {
        Ok(_) => panic!("expected the build to fail"),
        Err(problems) => problems.iter().map(ToString::to_string).collect(),
    }
}

fn has(errors: &[String], want: &str) {
    assert!(
        errors.iter().any(|e| e.contains(want)),
        "wanted {want:?} in {errors:#?}"
    );
}

#[test]
fn renders_every_page_kind() {
    let fixture = Fixture::new("snapshots");
    let summary = site::build(&fixture.options()).unwrap();
    assert_eq!(summary.pages, 9);
    assert_eq!(summary.gate, Gate::Skipped);
    for (name, rel) in [
        ("home", "index.html"),
        ("section", "projects/index.html"),
        ("project_first", "projects/alpha/index.html"),
        ("project_end_of_group", "projects/gamma/index.html"),
        ("project_second_group", "projects/delta/index.html"),
        ("project_last", "projects/beta/index.html"),
        ("page", "notes/index.html"),
        ("gallery", "gallery/index.html"),
        ("not_found", "404.html"),
        ("sitemap", "sitemap.xml"),
        ("llms", "llms.txt"),
    ] {
        insta::assert_snapshot!(name, fixture.read(rel));
    }
    assert_eq!(fixture.read("robots.txt"), "User-agent: *\n");
}

const FAKE_WASM: &[u8] = b"\0asm\x01\0\0\0fake";

fn fnv1a(bytes: &[u8]) -> String {
    let mut hash: u32 = 0x811c_9dc5;
    for &byte in bytes {
        hash ^= u32::from(byte);
        hash = hash.wrapping_mul(0x0100_0193);
    }
    format!("{hash:08x}")
}

fn dozer() -> Vec<u8> {
    fs::read(Path::new(env!("CARGO_MANIFEST_DIR")).join("../../sim/public/models/dozer.mira"))
        .unwrap()
}

fn with_corner(name: &str) -> Fixture {
    let fixture = Fixture::new(name);
    fixture.append(
        "content/site.toml",
        "\n[corner]\nmodel = \"models/dozer.mira\"\nhref = \"/sim/\"\n",
    );
    fs::create_dir_all(fixture.root.join("models")).unwrap();
    fs::write(fixture.root.join("models/dozer.mira"), dozer()).unwrap();
    fixture.write(
        "static/glyph.js",
        "document.querySelector(\".glyph pre\");\n",
    );
    fs::create_dir_all(fixture.root.join("target")).unwrap();
    fs::write(fixture.root.join("target/glyph.wasm"), FAKE_WASM).unwrap();
    fixture
}

#[test]
fn corner_bakes_the_model_and_ships_its_files() {
    let fixture = with_corner("corner");
    site::build(&fixture.options()).unwrap();
    let asset = glyph_bake::bake(&dozer(), glyph_bake::FONT).unwrap();
    assert_eq!(
        fs::read(fixture.root.join("dist/dozer.glyph")).unwrap(),
        asset.bytes()
    );
    assert_eq!(
        fs::read(fixture.root.join("dist/glyph.wasm")).unwrap(),
        FAKE_WASM
    );
    let home = fixture.read("index.html");
    let opening = format!(
        "<header>\n<div class=\"glyph\"><a href=\"/sim/\" aria-label=\"Open the corner\"><pre aria-hidden=\"true\" style=\"--c:{};--r:{}\" data-wasm=\"/glyph.wasm?v={}\" data-asset=\"/dozer.glyph?v={}\">\n",
        asset.cols(),
        asset.rows(),
        fnv1a(FAKE_WASM),
        fnv1a(asset.bytes())
    );
    let markup = format!("{opening}{}</pre></a></div>\n<h1>", asset.first_frame());
    assert!(home.contains(&markup), "{home}");
    assert!(asset.first_frame().contains("<i class=\"b\">"));
    assert!(home.contains("<script src=\"/glyph.js?v="), "{home}");
    for other in [
        "notes/index.html",
        "gallery/index.html",
        "projects/index.html",
        "404.html",
    ] {
        let page = fixture.read(other);
        assert!(!page.contains("glyph"), "{other} mentions the glyph");
    }
}

#[test]
fn corner_needs_the_wasm_the_model_and_a_label() {
    let fixture = with_corner("corner-missing-wasm");
    fs::remove_file(fixture.root.join("target/glyph.wasm")).unwrap();
    has(
        &fixture.errors(),
        "target/glyph.wasm: is missing; the corner piece needs it, so run `just wasm`",
    );
    let fixture = with_corner("corner-missing-model");
    fs::remove_file(fixture.root.join("models/dozer.mira")).unwrap();
    has(
        &fixture.errors(),
        "content/site.toml: field `corner.model`: cannot read models/dozer.mira",
    );
    let fixture = with_corner("corner-label");
    fixture.write(
        "content/index.md",
        &fs::read_to_string(fixture.root.join("content/index.md"))
            .unwrap()
            .replace("corner_label = \"Open the corner\"\n", ""),
    );
    has(
        &fixture.errors(),
        "content/index.md: the corner piece is rendered; add `corner_label`",
    );
}

#[test]
fn corner_wasm_path_can_be_overridden() {
    let fixture = with_corner("corner-wasm-flag");
    fs::rename(
        fixture.root.join("target/glyph.wasm"),
        fixture.root.join("other.wasm"),
    )
    .unwrap();
    let mut options = fixture.options();
    options.wasm = fixture.root.join("other.wasm");
    site::build(&options).unwrap();
    assert_eq!(
        fs::read(fixture.root.join("dist/glyph.wasm")).unwrap(),
        FAKE_WASM
    );
}

#[test]
fn corner_files_collide_with_static() {
    let fixture = with_corner("corner-collide");
    fixture.write("static/dozer.glyph", "x");
    fixture.write("static/glyph.wasm", "x");
    let errors = fixture.errors();
    has(
        &errors,
        "static/dozer.glyph: collides with the generated dist/dozer.glyph",
    );
    has(
        &errors,
        "static/glyph.wasm: collides with the generated dist/glyph.wasm",
    );
}

#[test]
fn corner_budgets() {
    let fixture = with_corner("corner-budget");
    fs::write(
        fixture.root.join("target/glyph.wasm"),
        vec![0u8; 12 * 1024 + 1],
    )
    .unwrap();
    fixture.write("static/glyph.js", &"x".repeat(4 * 1024 + 1));
    let errors = fixture.errors();
    has(
        &errors,
        "dist/glyph.wasm: is 12289 bytes; the budget is 12288",
    );
    has(&errors, "dist/glyph.js: is 4097 bytes; the budget is 4096");
}

#[test]
fn without_a_corner_nothing_glyph_is_emitted() {
    let fixture = Fixture::new("no-corner");
    let mut options = fixture.options();
    options.wasm = fixture.root.join("does/not/exist.wasm");
    site::build(&options).unwrap();
    assert!(!fixture.root.join("dist/dozer.glyph").exists());
    assert!(!fixture.root.join("dist/glyph.wasm").exists());
    assert!(!fixture.read("index.html").contains("glyph"));
}

#[test]
fn llms_txt_goes_through_the_gates() {
    let fixture = Fixture::new("llms-gates");
    let site = fs::read_to_string(fixture.root.join("content/site.toml")).unwrap();
    fixture.write(
        "content/site.toml",
        &site
            .replace("text = \"example since 2019\"", "text = \"fine\"")
            .replace("label = \"code\"", "label = \"project bluebird\""),
    );
    let mut options = fixture.options();
    options.claims = Some(fixtures().join("claims.md"));
    let errors = failures(&options);
    has(&errors, "dist/llms.txt:");
}

#[test]
fn sim_survives_and_everything_else_is_cleaned() {
    let fixture = Fixture::new("sim");
    fixture.write("dist/sim/index.html", "simulator");
    fixture.write("dist/index.html", "old home");
    fixture.write("dist/sitemap.xml", "old sitemap");
    fixture.write("dist/stale/old.html", "old");
    fixture.write("dist/stale.txt", "old");
    site::build(&fixture.options()).unwrap();
    assert_eq!(fixture.read("sim/index.html"), "simulator");
    assert!(!fixture.root.join("dist/stale").exists());
    assert!(!fixture.root.join("dist/stale.txt").exists());
}

#[test]
fn a_failed_build_writes_nothing() {
    let fixture = Fixture::new("failed");
    fixture.write("dist/keep.txt", "previous good build");
    fixture.append("content/notes.md", "\n# Bad\n");
    fixture.errors();
    assert_eq!(fixture.read("keep.txt"), "previous good build");
}

#[test]
fn reports_every_problem_not_just_the_first() {
    let fixture = Fixture::new("many");
    fixture.append("content/notes.md", "\n# Bad\n");
    fixture.append("content/projects/beta.md", "<b>raw</b>\n");
    let errors = fixture.errors();
    has(
        &errors,
        "content/notes.md:24: the page title is the only h1",
    );
    has(
        &errors,
        "content/projects/beta.md:12: raw HTML is not allowed",
    );
}

#[test]
fn broken_internal_link() {
    let fixture = Fixture::new("link");
    fixture.append("content/notes.md", "\n[gone](/nowhere/)\n");
    has(
        &fixture.errors(),
        "dist/notes/index.html: href=\"/nowhere/\": no page has this route",
    );
}

#[test]
fn missing_fragment() {
    let fixture = Fixture::new("fragment");
    fixture.append("content/notes.md", "\n[gone](/projects/alpha/#nope)\n");
    has(
        &fixture.errors(),
        "href=\"/projects/alpha/#nope\": the target page has no id `nope`",
    );
}

#[test]
fn relative_link() {
    let fixture = Fixture::new("relative");
    fixture.append("content/notes.md", "\n[rel](alpha/)\n");
    has(
        &fixture.errors(),
        "content/notes.md:24: link `alpha/`: links must be site-absolute",
    );
}

#[test]
fn h1_in_body() {
    let fixture = Fixture::new("h1");
    fixture.append("content/notes.md", "\n# Second title\n");
    has(&fixture.errors(), "the page title is the only h1");
}

#[test]
fn skipped_heading_level() {
    let fixture = Fixture::new("skip");
    fixture.write("content/about.md", "+++\nkind = \"page\"\ntitle = \"About\"\ndescription = \"A page whose headings skip a level on purpose.\"\n+++\n### Too deep\n");
    has(
        &fixture.errors(),
        "content/about.md:6: h3 skips a level after h1; use h2",
    );
}

#[test]
fn duplicate_title() {
    let fixture = Fixture::new("title");
    fixture.write("content/about.md", "+++\nkind = \"page\"\ntitle = \"Notes\"\ndescription = \"Same title as the notes page, which must fail.\"\n+++\n");
    has(&fixture.errors(), "has the same <title> as");
}

#[test]
fn description_out_of_bounds() {
    let fixture = Fixture::new("description");
    fixture.write(
        "content/about.md",
        "+++\nkind = \"page\"\ntitle = \"About\"\ndescription = \"Too short.\"\n+++\n",
    );
    has(
        &fixture.errors(),
        "content/about.md: field `description` is 10 characters; it must be 40 to 160",
    );
}

#[test]
fn image_without_alt_or_file() {
    let fixture = Fixture::new("image");
    fixture.append(
        "content/notes.md",
        "\n![](/dot.png)\n\n![Gone](/gone.png)\n",
    );
    let errors = fixture.errors();
    has(
        &errors,
        "content/notes.md:24: image `/dot.png` needs alt text",
    );
    has(
        &errors,
        "content/notes.md:26: image `/gone.png` does not exist under static/",
    );
}

#[test]
fn em_dash_in_content_and_static() {
    let fixture = Fixture::new("emdash");
    fixture.append("content/notes.md", "\nOne \u{2014} two.\n");
    fixture.write("static/extra.txt", "fine\nnot \u{2014} fine\n");
    let errors = fixture.errors();
    has(&errors, "content/notes.md:24: contains an em dash");
    has(&errors, "dist/notes/index.html:");
    has(&errors, "static/extra.txt:2: contains an em dash");
}

#[test]
fn html_weight_budget() {
    let fixture = Fixture::new("weight");
    fixture.append("content/notes.md", &format!("\n{}\n", "word ".repeat(7000)));
    has(&fixture.errors(), "dist/notes/index.html: is ");
}

#[test]
fn asset_weight_budget() {
    let fixture = Fixture::new("asset-weight");
    fixture.write("static/theme.js", &"x".repeat(1025));
    has(
        &fixture.errors(),
        "dist/theme.js: is 1025 bytes; the budget is 1024",
    );
}

#[test]
fn static_collides_with_generated() {
    let fixture = Fixture::new("collide");
    fixture.write("static/sitemap.xml", "<urlset/>");
    fixture.write("static/notes/index.html", "<p>shadow</p>");
    let errors = fixture.errors();
    has(
        &errors,
        "static/sitemap.xml: collides with the generated dist/sitemap.xml",
    );
    has(
        &errors,
        "static/notes/index.html: collides with the generated dist/notes/index.html",
    );
}

#[test]
fn sim_is_off_limits() {
    let fixture = Fixture::new("sim-claim");
    fixture.write("content/sim.md", "+++\nkind = \"page\"\ntitle = \"Sim\"\ndescription = \"A page that tries to take the simulator route.\"\n+++\n");
    has(
        &fixture.errors(),
        "content/sim.md: the route /sim/ belongs to the simulator build",
    );
    let fixture = Fixture::new("sim-static");
    fixture.write("static/sim/index.html", "x");
    has(
        &fixture.errors(),
        "static/sim/index.html: /sim/ belongs to the simulator build",
    );
}

#[test]
fn front_matter_is_strict() {
    let fixture = Fixture::new("matter");
    fixture.write("content/projects/beta.md", "+++\nkind = \"project\"\ntitle = \"Beta\"\ndescription = \"Beta sits in the middle, so its pager has both sides.\"\nsummary = \"s\"\ngroup = \"nope\"\ntech = [\"Python\"]\nrole = \"r\"\nwhen = \"w\"\nflavour = \"x\"\n+++\n");
    has(
        &fixture.errors(),
        "content/projects/beta.md:10: unknown field `flavour`",
    );
    fixture.write("content/projects/beta.md", "+++\nkind = \"project\"\ntitle = \"Beta\"\ndescription = \"Beta sits in the middle, so its pager has both sides.\"\nsummary = \"s\"\ngroup = \"nope\"\ntech = [\"Python\"]\nrole = \"r\"\nwhen = \"w\"\n+++\n");
    let delta = fs::read_to_string(fixture.root.join("content/projects/delta.md")).unwrap();
    fixture.write(
        "content/projects/delta.md",
        &delta.replace("group = \"slow\"", "group = \"fast\""),
    );
    let errors = fixture.errors();
    has(
        &errors,
        "content/projects/beta.md: field `group`: `nope` is not a group of content/projects/index.md",
    );
    has(
        &errors,
        "content/projects/index.md: group `slow` has no projects",
    );
}

#[test]
fn file_layout_is_strict() {
    let fixture = Fixture::new("layout");
    fixture.write("content/notes/deep.md", "+++\nkind = \"project\"\ntitle = \"Deep\"\ndescription = \"A project with no section around it, which must fail.\"\nsummary = \"s\"\ngroup = \"g\"\ntech = [\"x\"]\nrole = \"r\"\nwhen = \"w\"\n+++\n");
    fixture.write("content/projects/index2.md", "+++\nkind = \"page\"\ntitle = \"Wrong\"\ndescription = \"A page placed where only projects may live.\"\n+++\n");
    fixture.write("content/pic.png", "x");
    let errors = fixture.errors();
    has(
        &errors,
        "content/notes/deep.md: projects live in a section; add content/notes/index.md",
    );
    has(
        &errors,
        "content/projects/index2.md: kind = \"page\" is not allowed at content/projects/index2.md",
    );
    has(
        &errors,
        "content/pic.png: only Markdown pages and site.toml belong in content/",
    );
}

#[test]
fn claims_gate_blocks_phrases_everywhere() {
    let fixture = Fixture::new("claims");
    fixture.append("content/notes.md", "\nWorked for ACME secret agency.\n");
    fixture.write(
        "static/extra.svg",
        "<svg><title>Project Bluebird</title></svg>\n",
    );
    let mut options = fixture.options();
    options.claims = Some(fixtures().join("claims.md"));
    let errors = failures(&options);
    has(&errors, "content/notes.md:24: contains a blocked phrase (");
    has(&errors, "dist/notes/index.html:");
    has(&errors, "static/extra.svg:1: contains a blocked phrase (");
    assert!(
        errors.iter().all(|e| !e.to_lowercase().contains("acme")),
        "the phrase itself must not be printed"
    );
}

#[test]
fn claims_gate_passes_and_reports_when_clean() {
    let fixture = Fixture::new("claims-clean");
    let mut options = fixture.options();
    options.claims = Some(fixtures().join("claims.md"));
    let summary = site::build(&options).unwrap();
    assert!(matches!(summary.gate, Gate::Checked { phrases: 3, .. }));
}

#[test]
fn claims_gate_finds_the_profile_link_by_default() {
    let fixture = Fixture::new("claims-default");
    fixture.write(
        "profile/claims.md",
        &fs::read_to_string(fixtures().join("claims.md")).unwrap(),
    );
    fixture.append("content/notes.md", "\nproject bluebird\n");
    has(&fixture.errors(), "profile/claims.md:7)");
}

#[test]
fn claims_gate_can_be_required() {
    let fixture = Fixture::new("claims-required");
    let mut options = fixture.options();
    options.require_claims = true;
    has(
        &failures(&options),
        "profile/claims.md: --require-claims is set but there is no claims file",
    );
}

#[test]
fn nav_lists_groups_and_opens_the_current_group() {
    let fixture = Fixture::new("nav-groups");
    site::build(&fixture.options()).unwrap();
    let delta = fixture.read("projects/delta/index.html");
    assert!(delta.contains("<li class=\"g\"><a href=\"/projects/#fast\">fast</a></li>\n<li class=\"g open\"><a href=\"/projects/#slow\">slow</a>\n<ul>\n<li class=\"here\"><a href=\"/projects/delta/\" aria-current=\"page\">delta</a></li>\n<li><a href=\"/projects/beta/\">beta</a></li>\n</ul>"), "{delta}");
    let section = fixture.read("projects/index.html");
    assert!(section.contains("<li class=\"open here\"><a href=\"/projects/\" aria-current=\"page\">work</a>\n<ul>\n<li class=\"g\"><a href=\"/projects/#fast\">fast</a></li>\n<li class=\"g\"><a href=\"/projects/#slow\">slow</a></li>\n</ul>"), "{section}");
    assert!(
        !section.contains("href=\"/projects/alpha/\">alpha</a></li>\n<li"),
        "no projects under a section page's groups"
    );
}

#[test]
fn siblings_sort_by_group_then_order_and_the_pager_crosses_groups() {
    let fixture = Fixture::new("order");
    site::build(&fixture.options()).unwrap();
    let gamma = fixture.read("projects/gamma/index.html");
    assert!(
        gamma.contains("<a rel=\"prev\" href=\"/projects/alpha/\">alpha</a>"),
        "{gamma}"
    );
    assert!(
        gamma.contains("<a rel=\"next\" href=\"/projects/delta/\">delta</a>"),
        "{gamma}"
    );
    let sitemap = fixture.read("sitemap.xml");
    let order: Vec<&str> = ["alpha", "gamma", "delta", "beta"]
        .into_iter()
        .filter(|name| sitemap.contains(&format!("/projects/{name}/")))
        .collect();
    let positions: Vec<usize> = order
        .iter()
        .map(|name| sitemap.find(&format!("/projects/{name}/")).unwrap())
        .collect();
    assert!(positions.windows(2).all(|w| w[0] < w[1]), "{sitemap}");
}

#[test]
fn featured_is_a_rank_with_ties_in_nav_order() {
    let fixture = Fixture::new("featured");
    site::build(&fixture.options()).unwrap();
    let home = fixture.read("index.html");
    let at = |name: &str| {
        home.find(&format!("<li><a href=\"/projects/{name}/\">"))
            .unwrap()
    };
    assert!(
        at("gamma") < at("alpha") && at("alpha") < at("delta"),
        "{home}"
    );
    assert!(!home.contains("<li><a href=\"/projects/beta/\">"), "{home}");
}

#[test]
fn refuses_to_clear_a_directory_that_is_not_a_build() {
    let fixture = Fixture::new("guard");
    fixture.write("dist/precious.txt", "keep me");
    has(
        &fixture.errors(),
        "dist: refuses to clear a directory that is not a previous build",
    );
    assert_eq!(fixture.read("precious.txt"), "keep me");
    let fixture = Fixture::new("guard-sim-only");
    fixture.write("dist/sim/index.html", "simulator");
    site::build(&fixture.options()).unwrap();
    assert_eq!(fixture.read("sim/index.html"), "simulator");
}

#[test]
fn gallery_photos_are_validated() {
    let fixture = Fixture::new("gallery-bad");
    let source = fs::read_to_string(fixture.root.join("content/gallery.md")).unwrap();
    fixture.write(
        "content/gallery.md",
        &source
            .replace("slug = \"cat\"", "slug = \"t-cat\"")
            .replace("alt = \"A pond at dusk\"", "alt = \"\"")
            .replace("+++\n## Notes", "[[photos]]\nslug = \"pond\"\nalt = \"again\"\nplace = \"x\"\n\n[[photos]]\nslug = \"ghost\"\nalt = \"g\"\nplace = \"x\"\n+++\n## Notes"),
    );
    let errors = fixture.errors();
    has(
        &errors,
        "content/gallery.md: photo slug `t-cat` is reserved",
    );
    has(
        &errors,
        "content/gallery.md: field `photos.alt` must not be empty",
    );
    has(
        &errors,
        "content/gallery.md: photo slug `pond` is used twice",
    );
}

#[test]
fn gallery_photo_needs_a_rendition() {
    let fixture = Fixture::new("gallery-missing");
    let source = fs::read_to_string(fixture.root.join("content/gallery.md")).unwrap();
    fixture.write(
        "content/gallery.md",
        &source.replace(
            "+++\n## Notes",
            "[[photos]]\nslug = \"ghost\"\nalt = \"g\"\nplace = \"x\"\n+++\n## Notes",
        ),
    );
    has(
        &fixture.errors(),
        "content/gallery.md: photo `ghost` has no renditions; add static/photos/full/ghost-<width>.webp",
    );
}

#[test]
fn gallery_renditions_sort_by_real_width_and_ignore_other_files() {
    let fixture = Fixture::new("gallery-renditions");
    site::build(&fixture.options()).unwrap();
    let page = fixture.read("gallery/index.html");
    assert!(page.contains("<img src=\"/photos/full/pond-40.webp\" srcset=\"/photos/full/pond-40.webp 40w, /photos/full/pond-80.webp 80w, /photos/full/pond-120.webp 120w\" sizes=\"(max-width: 36rem) 100vw, 24rem\" alt=\"A pond at dusk\" width=\"120\" height=\"90\""), "{page}");
    assert!(!page.contains("pond-big"), "{page}");
    assert!(page.contains("<a rel=\"prev\" href=\"#cat\">prev</a><a rel=\"next\" href=\"#cat\">next</a><a class=\"x\" href=\"#t-pond\">close</a>"), "{page}");
}

#[test]
fn body_headings_avoid_photo_ids() {
    let fixture = Fixture::new("gallery-ids");
    fixture.append("content/gallery.md", "\n## Cat\n\n## Photos\n");
    site::build(&fixture.options()).unwrap();
    let page = fixture.read("gallery/index.html");
    assert!(
        page.contains("<h2 id=\"cat-2\">") && page.contains("<h2 id=\"photos-2\">"),
        "{page}"
    );
}

#[test]
fn kind_scripts_load_only_where_needed_and_must_exist() {
    let fixture = Fixture::new("scripts");
    site::build(&fixture.options()).unwrap();
    assert!(
        fixture
            .read("gallery/index.html")
            .contains("<script src=\"/theme.js?v=")
    );
    assert!(
        fixture
            .read("gallery/index.html")
            .contains("\n<script src=\"/gallery.js?v=")
    );
    assert!(!fixture.read("notes/index.html").contains("gallery.js"));
    fs::remove_file(fixture.root.join("static/gallery.js")).unwrap();
    has(
        &fixture.errors(),
        "static/gallery.js: is missing; pages of kind `gallery` load it",
    );
}

#[test]
fn gallery_script_budget() {
    let fixture = Fixture::new("gallery-budget");
    fixture.write("static/gallery.js", &"x".repeat(513));
    has(
        &fixture.errors(),
        "dist/gallery.js: is 513 bytes; the budget is 512",
    );
}

#[test]
fn claims_gate_sees_through_line_breaks_markup_and_attributes() {
    let fixture = Fixture::new("claims-hard");
    fixture.append(
        "content/notes.md",
        "\nWe won 2nd\nplace once.\n\nOn the Project\n  Bluebird team.\n\n![project bluebird](/dot.png)\n",
    );
    let mut options = fixture.options();
    options.claims = Some(fixtures().join("claims.md"));
    let errors = failures(&options);
    has(&errors, "content/notes.md:24: contains a blocked phrase (");
    has(&errors, "content/notes.md:27: contains a blocked phrase (");
    has(&errors, "content/notes.md:30: contains a blocked phrase (");
    has(
        &errors,
        "dist/notes/index.html: page text contains a blocked phrase (",
    );
    let page_text: Vec<&String> = errors
        .iter()
        .filter(|e| e.starts_with("dist/notes/index.html: page text"))
        .collect();
    assert!(
        page_text.len() == 1 && page_text[0].ends_with("claims.md:8)"),
        "{errors:#?}"
    );
    assert!(
        errors
            .iter()
            .any(|e| e.starts_with("dist/notes/index.html:")
                && !e.contains("page text")
                && e.ends_with("claims.md:7)")),
        "{errors:#?}"
    );
}

fn tree(root: &Path) -> Vec<(String, Vec<u8>)> {
    let mut out = Vec::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        for entry in fs::read_dir(&dir).unwrap() {
            let path = entry.unwrap().path();
            if path.is_dir() {
                stack.push(path);
            } else {
                let rel = path.strip_prefix(root).unwrap().display().to_string();
                out.push((rel, fs::read(&path).unwrap()));
            }
        }
    }
    out.sort();
    out
}

#[cfg(unix)]
#[test]
fn a_failed_write_leaves_the_previous_build_untouched() {
    use std::os::unix::fs::PermissionsExt;
    let fixture = Fixture::new("write-fails");
    fixture.write("dist/sim/index.html", "simulator");
    site::build(&fixture.options()).unwrap();
    let before = tree(&fixture.root.join("dist"));
    fixture.append(
        "content/notes.md",
        "\nA new line that would change the page.\n",
    );
    let locked = fixture.root.join("static/locked.bin");
    fs::write(&locked, b"x").unwrap();
    fs::set_permissions(&locked, fs::Permissions::from_mode(0o000)).unwrap();
    has(&fixture.errors(), "static/locked.bin: cannot write");
    assert_eq!(tree(&fixture.root.join("dist")), before);
    fs::set_permissions(&locked, fs::Permissions::from_mode(0o644)).unwrap();
    site::build(&fixture.options()).unwrap();
    assert!(fixture.read("notes/index.html").contains("A new line"));
    assert_eq!(fixture.read("sim/index.html"), "simulator");
    assert!(!fixture.root.join("dist.tmp").exists());
}

#[test]
fn a_file_where_the_build_needs_a_directory_is_reported_before_writing() {
    let fixture = Fixture::new("file-dir");
    site::build(&fixture.options()).unwrap();
    let before = tree(&fixture.root.join("dist"));
    fixture.write("static/notes", "a file named like a page");
    fixture.write("static/llms.txt/inner.txt", "a directory named like a file");
    let errors = fixture.errors();
    has(
        &errors,
        "static/notes: is a file where the build writes the directory dist/notes/",
    );
    has(
        &errors,
        "static/llms.txt/: is a directory where the build writes the file dist/llms.txt",
    );
    assert_eq!(tree(&fixture.root.join("dist")), before);
}

#[test]
fn editor_and_os_junk_is_ignored_in_both_trees() {
    let fixture = Fixture::new("junk");
    for junk in [
        "content/.notes.md.swp",
        "content/notes.md~",
        "content/#notes.md#",
        "content/.git/HEAD",
        "content/projects/.DS_Store",
        "static/.DS_Store",
        "static/photos/.cache/x.png",
        "static/style.css~",
    ] {
        fixture.write(junk, "not markdown, not front matter");
    }
    site::build(&fixture.options()).unwrap();
    let published: Vec<String> = tree(&fixture.root.join("dist"))
        .into_iter()
        .map(|(rel, _)| rel)
        .collect();
    assert!(
        published.contains(&"style.css".to_owned()),
        "{published:#?}"
    );
    assert!(
        published
            .iter()
            .all(|rel| !rel.starts_with('.') && !rel.contains("/.") && !rel.ends_with('~')),
        "{published:#?}"
    );
}

fn vetted_entry(file: &str, hash: &str) -> String {
    format!("\n[[vetted]]\nfile = \"{file}\"\nhash = \"{hash}\"\n")
}

#[test]
fn vetted_pdfs_pass() {
    let fixture = Fixture::new("vetted-ok");
    fixture.write("static/docs/cv.PDF", "%PDF-1.7 fixture");
    fixture.append(
        "content/site.toml",
        &vetted_entry("docs/cv.PDF", &fnv1a(b"%PDF-1.7 fixture")),
    );
    site::build(&fixture.options()).unwrap();
    assert_eq!(fixture.read("docs/cv.PDF"), "%PDF-1.7 fixture");
}

#[test]
fn unvetted_pdf_prints_the_hash_to_paste() {
    let fixture = Fixture::new("vetted-missing");
    fixture.write("static/cv.pdf", "%PDF-1.7 fixture");
    has(
        &fixture.errors(),
        &format!(
            "static/cv.pdf: the claims gate cannot read PDFs; check its text against the claims list by hand, then add `[[vetted]]` with `file = \"cv.pdf\"` and `hash = \"{}\"` to content/site.toml",
            fnv1a(b"%PDF-1.7 fixture")
        ),
    );
}

#[test]
fn changed_pdf_prints_its_new_hash() {
    let fixture = Fixture::new("vetted-changed");
    fixture.write("static/cv.pdf", "%PDF-1.7 edited");
    fixture.append("content/site.toml", &vetted_entry("cv.pdf", "00000000"));
    has(
        &fixture.errors(),
        &format!(
            "static/cv.pdf: changed since it was vetted (hash is now \"{}\", content/site.toml says \"00000000\")",
            fnv1a(b"%PDF-1.7 edited")
        ),
    );
}

#[test]
fn vetted_entries_must_name_one_existing_file() {
    let fixture = Fixture::new("vetted-entries");
    let hash = fnv1a(b"%PDF-1.7 fixture");
    fixture.write("static/cv.pdf", "%PDF-1.7 fixture");
    fixture.append("content/site.toml", &vetted_entry("cv.pdf", &hash));
    fixture.append("content/site.toml", &vetted_entry("cv.pdf", &hash));
    fixture.append("content/site.toml", &vetted_entry("gone.pdf", &hash));
    let errors = fixture.errors();
    has(
        &errors,
        "content/site.toml: [[vetted]] lists \"cv.pdf\" more than once",
    );
    has(
        &errors,
        "content/site.toml: [[vetted]] file \"gone.pdf\" does not exist under static/",
    );
}
