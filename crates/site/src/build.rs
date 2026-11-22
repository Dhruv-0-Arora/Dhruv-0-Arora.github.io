use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use crate::content::{self, Content};
use crate::files::{display, slash_path, walk};
use crate::hash::fnv1a;
use crate::highlight::Highlighter;
use crate::markdown::{self, href_problem};
use crate::matter::{Kind, Matter, THUMB_PREFIX};
use crate::problem::Problem;
use crate::render::{
    Assets, Corner, GLYPH_ASSET, GLYPH_WASM, Rendition, View, llms, page_scripts, sitemap,
};

const KEEP: &str = "sim";

#[derive(Debug, Clone)]
pub struct Options {
    pub root: PathBuf,
    pub out: PathBuf,
    pub wasm: PathBuf,
}

impl Options {
    pub fn new(root: impl Into<PathBuf>) -> Self {
        let root = root.into();
        Self {
            out: root.join("dist"),
            wasm: root.join("target/glyph.wasm"),
            root,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Summary {
    pub pages: usize,
    pub static_files: usize,
}

struct Generated {
    pages: Files,
    extra: Files,
    binary: Binaries,
    static_files: Vec<(String, PathBuf)>,
}

pub fn build(options: &Options) -> Result<Summary, Vec<Problem>> {
    let generated = generate(options)?;
    write(options, &generated)?;
    Ok(Summary {
        pages: generated.pages.len(),
        static_files: generated.static_files.len(),
    })
}

fn generate(options: &Options) -> Result<Generated, Vec<Problem>> {
    let root = &options.root;
    let content = content::load(root)?;
    let mut problems = check_site(&content);
    let highlighter = Highlighter::new(content.vocabulary(), &content.site.vocabulary_skip);
    let static_dir = root.join("static");
    let footer = markdown::render_inline(&content.site.footer, &content.site_source)
        .unwrap_or_else(|p| {
            problems.push(p);
            String::new()
        });
    let bodies = render_bodies(&content, &static_dir, &highlighter, &mut problems);
    let statics = list_static(root, &static_dir, &mut problems);
    let renditions = discover_renditions(&content, &static_dir, &mut problems);
    let assets = assets(root, &content, &static_dir, &mut problems);
    let (corner, binary) = bake_corner(options, &content, &mut problems);
    if !problems.is_empty() {
        problems.sort();
        problems.dedup();
        return Err(problems);
    }
    let view = View {
        content: &content,
        bodies: &bodies,
        highlighter: &highlighter,
        footer: &footer,
        assets: &assets,
        corner: corner.as_ref(),
        renditions: &renditions,
    };
    let pages = render_pages(&view, &content);
    let extra = vec![
        ("sitemap.xml".to_owned(), sitemap(&content)),
        ("llms.txt".to_owned(), llms(&content)),
    ];
    let static_files = statics.into_iter().map(|s| (s.rel, s.path)).collect();
    Ok(Generated {
        pages,
        extra,
        binary,
        static_files,
    })
}

type Files = Vec<(String, String)>;
type Binaries = Vec<(String, Vec<u8>)>;

fn bake_corner(
    options: &Options,
    content: &Content,
    problems: &mut Vec<Problem>,
) -> (Option<Corner>, Binaries) {
    let Some(source) = &content.site.corner else {
        return (None, Vec::new());
    };
    let root = &options.root;
    let model = match fs::read(root.join(&source.model)) {
        Ok(bytes) => Some(bytes),
        Err(e) => {
            problems.push(Problem::new(
                &content.site_source,
                format!("field `corner.model`: cannot read {}: {e}", source.model),
            ));
            None
        }
    };
    let wasm = fs::read(&options.wasm).ok();
    if wasm.is_none() {
        problems.push(Problem::new(
            display(root, &options.wasm),
            "is missing; the corner piece needs it, so run `just wasm` (or pass --wasm <file>)",
        ));
    }
    let (Some(model), Some(wasm)) = (model, wasm) else {
        return (None, Vec::new());
    };
    let asset = match glyph_bake::bake(&model, glyph_bake::FONT) {
        Ok(asset) => asset,
        Err(e) => {
            problems.push(Problem::new(
                &content.site_source,
                format!("field `corner.model`: cannot bake {}: {e}", source.model),
            ));
            return (None, Vec::new());
        }
    };
    let corner = Corner {
        frame_html: asset.first_frame(),
        href: source.href.clone(),
        cols: asset.cols(),
        rows: asset.rows(),
        wasm: format!("/{GLYPH_WASM}?v={}", fnv1a(&wasm)),
        asset: format!("/{GLYPH_ASSET}?v={}", fnv1a(asset.bytes())),
    };
    let binary = vec![
        (GLYPH_ASSET.to_owned(), asset.bytes().to_vec()),
        (GLYPH_WASM.to_owned(), wasm),
    ];
    (Some(corner), binary)
}

fn assets(
    root: &Path,
    content: &Content,
    static_dir: &Path,
    problems: &mut Vec<Problem>,
) -> Assets {
    let mut needed: BTreeMap<&str, String> = BTreeMap::new();
    for name in ["style.css", "theme.js"] {
        needed.insert(name, "every page links it".into());
    }
    let corner = content.site.corner.is_some();
    for page in &content.pages {
        for name in page_scripts(page.kind(), corner) {
            needed
                .entry(name)
                .or_insert_with(|| format!("pages of kind `{}` load it", page.kind().name()));
        }
    }
    let mut versions = BTreeMap::new();
    for (name, why) in needed {
        let path = static_dir.join(name);
        match fs::read(&path) {
            Ok(bytes) => {
                versions.insert(name.to_owned(), fnv1a(&bytes));
            }
            Err(_) => problems.push(Problem::new(
                display(root, &path),
                format!("is missing; {why}"),
            )),
        }
    }
    Assets { versions }
}

fn discover_renditions(
    content: &Content,
    static_dir: &Path,
    problems: &mut Vec<Problem>,
) -> BTreeMap<String, Vec<Rendition>> {
    let dir = static_dir.join("photos/full");
    let mut names: Vec<String> = fs::read_dir(&dir)
        .map(|entries| {
            entries
                .filter_map(Result::ok)
                .filter_map(|e| e.file_name().into_string().ok())
                .collect()
        })
        .unwrap_or_default();
    names.sort();
    let mut found = BTreeMap::new();
    for page in &content.pages {
        let Matter::Gallery(gallery) = &page.matter else {
            continue;
        };
        for photo in &gallery.photos {
            let prefix = format!("{}-", photo.slug);
            let mut renditions = Vec::new();
            for name in &names {
                let is_rendition = name
                    .strip_prefix(&prefix)
                    .and_then(|rest| rest.strip_suffix(".webp"))
                    .is_some_and(|w| !w.is_empty() && w.bytes().all(|b| b.is_ascii_digit()));
                if !is_rendition {
                    continue;
                }
                match imagesize::size(dir.join(name)) {
                    Ok(size) => renditions.push(Rendition {
                        url: format!("/photos/full/{name}"),
                        width: size.width,
                        height: size.height,
                    }),
                    Err(e) => problems.push(Problem::new(
                        format!("static/photos/full/{name}"),
                        format!("cannot read its size: {e}"),
                    )),
                }
            }
            if renditions.is_empty() {
                problems.push(Problem::new(
                    &page.source,
                    format!(
                        "photo `{}` has no renditions; add static/photos/full/{}-<width>.webp",
                        photo.slug, photo.slug
                    ),
                ));
            }
            renditions.sort_by(|a, b| a.width.cmp(&b.width).then_with(|| a.url.cmp(&b.url)));
            found.insert(photo.slug.clone(), renditions);
        }
    }
    found
}

fn render_pages(view: &View<'_>, content: &Content) -> Files {
    let mut pages = Vec::new();
    for (i, page) in content.pages.iter().enumerate() {
        let rel = if page.kind() == Kind::NotFound {
            "404.html".to_owned()
        } else {
            format!("{}index.html", &page.route[1..])
        };
        pages.push((rel, view.page(i)));
    }
    pages
}

fn check_site(content: &Content) -> Vec<Problem> {
    let site = &content.site;
    let source = content.site_source.as_str();
    let mut problems = Vec::new();
    if !(site.url.starts_with("https://") || site.url.starts_with("http://"))
        || site.url.ends_with('/')
    {
        problems.push(Problem::new(
            source,
            "field `url` must be an http(s) URL without a trailing slash",
        ));
    }
    if site.title.trim().is_empty() {
        problems.push(Problem::new(source, "field `title` must not be empty"));
    }
    let hrefs = site
        .links
        .iter()
        .map(|l| ("links", &l.title, &l.href))
        .chain(
            site.elsewhere
                .iter()
                .map(|e| ("elsewhere", &e.label, &e.href)),
        );
    for (table, label, href) in hrefs {
        if label.trim().is_empty() {
            problems.push(Problem::new(
                source,
                format!("an entry in `{table}` has an empty label"),
            ));
        }
        if let Some(message) = href_problem(href) {
            problems.push(Problem::new(
                source,
                format!("`{table}` href `{href}`: {message}"),
            ));
        }
    }
    for page in &content.pages {
        if let Matter::Project(project) = &page.matter {
            for link in &project.links {
                if let Some(message) = href_problem(&link.href) {
                    problems.push(Problem::new(
                        &page.source,
                        format!("`links` href `{}`: {message}", link.href),
                    ));
                }
            }
        }
    }
    let home = &content.pages[content.home];
    if let Matter::Home(matter) = &home.matter {
        if content.featured().is_empty() {
            problems.push(Problem::new(
                &home.source,
                "no project has a `featured` rank, so the selected list would be empty",
            ));
        }
        if site.elsewhere.is_empty() {
            problems.push(Problem::new(
                source,
                "the home page lists `[[elsewhere]]` entries; add at least one",
            ));
        }
        if content.sections().next().is_none() {
            problems.push(Problem::new(
                &home.source,
                "field `all` links to the first section, but there is no section",
            ));
        }
        if let Some(corner) = &site.corner {
            if matter.corner_label.is_none() {
                problems.push(Problem::new(
                    &home.source,
                    "the corner piece is rendered; add `corner_label` for its link",
                ));
            }
            if let Some(message) = href_problem(&corner.href) {
                problems.push(Problem::new(
                    source,
                    format!("field `corner.href` `{}`: {message}", corner.href),
                ));
            }
        }
    }
    problems
}

fn render_bodies(
    content: &Content,
    static_dir: &Path,
    highlighter: &Highlighter,
    problems: &mut Vec<Problem>,
) -> Vec<String> {
    content
        .pages
        .iter()
        .map(|page| {
            let mut reserved: Vec<String> = vec!["main".into()];
            match &page.matter {
                Matter::Home(_) => reserved.extend(["selected".into(), "elsewhere".into()]),
                Matter::Section(section) => {
                    reserved.extend(section.groups.iter().map(|g| g.id.clone()));
                }
                Matter::Gallery(gallery) => {
                    reserved.push("photos".into());
                    for photo in &gallery.photos {
                        reserved.push(photo.slug.clone());
                        reserved.push(format!("{THUMB_PREFIX}{}", photo.slug));
                    }
                }
                _ => {}
            }
            let reserved: Vec<&str> = reserved.iter().map(String::as_str).collect();
            let cx = markdown::Context {
                source: &page.source,
                first_line: page.body_line,
                static_dir,
                highlighter,
                reserved_ids: &reserved,
            };
            markdown::render(&page.body, &cx).unwrap_or_else(|found| {
                problems.extend(found);
                String::new()
            })
        })
        .collect()
}

struct StaticFile {
    rel: String,
    path: PathBuf,
}

fn list_static(root: &Path, dir: &Path, problems: &mut Vec<Problem>) -> Vec<StaticFile> {
    let files = match walk(dir) {
        Ok(files) => files,
        Err(e) => {
            problems.push(Problem::new(
                display(root, dir),
                format!("cannot read: {e}"),
            ));
            return Vec::new();
        }
    };
    let mut out = Vec::new();
    for path in files {
        let rel = slash_path(path.strip_prefix(dir).unwrap_or(&path));
        let shown = display(root, &path);
        if rel == KEEP || rel.starts_with(&format!("{KEEP}/")) {
            problems.push(Problem::new(
                &shown,
                format!("/{KEEP}/ belongs to the simulator build; move this file"),
            ));
            continue;
        }
        out.push(StaticFile { rel, path });
    }
    out
}

fn write(options: &Options, generated: &Generated) -> Result<(), Vec<Problem>> {
    let out = &options.out;
    let fail = |path: &Path, e: std::io::Error| {
        vec![Problem::new(
            display(&options.root, path),
            format!("cannot write: {e}"),
        )]
    };
    guard_previous_build(options)?;
    let Some(name) = out.file_name() else {
        return Err(vec![Problem::new(
            display(&options.root, out),
            "--out must name a directory",
        )]);
    };
    let mut tmp_name = name.to_os_string();
    tmp_name.push(".tmp");
    let tmp = out.with_file_name(tmp_name);
    if tmp.is_dir() {
        fs::remove_dir_all(&tmp).map_err(|e| fail(&tmp, e))?;
    } else if tmp.exists() {
        fs::remove_file(&tmp).map_err(|e| fail(&tmp, e))?;
    }
    let put = |rel: &str, bytes: &[u8]| {
        let path = tmp.join(rel);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| fail(parent, e))?;
        }
        fs::write(&path, bytes).map_err(|e| fail(&path, e))
    };
    fs::create_dir_all(&tmp).map_err(|e| fail(&tmp, e))?;
    for (rel, source) in &generated.static_files {
        let bytes = fs::read(source).map_err(|e| fail(source, e))?;
        put(rel, &bytes)?;
    }
    for (rel, bytes) in &generated.binary {
        put(rel, bytes)?;
    }
    for (rel, text) in generated.pages.iter().chain(&generated.extra) {
        put(rel, text.as_bytes())?;
    }
    let sim = out.join(KEEP);
    if sim.exists() {
        fs::rename(&sim, tmp.join(KEEP)).map_err(|e| fail(&sim, e))?;
    }
    if out.exists() {
        fs::remove_dir_all(out).map_err(|e| fail(out, e))?;
    }
    fs::rename(&tmp, out).map_err(|e| fail(out, e))?;
    Ok(())
}

fn guard_previous_build(options: &Options) -> Result<(), Vec<Problem>> {
    let out = &options.out;
    if !out.exists() {
        return Ok(());
    }
    let refuse = |message: String| vec![Problem::new(display(&options.root, out), message)];
    let entries: Vec<fs::DirEntry> = fs::read_dir(out)
        .map_err(|e| refuse(format!("cannot read: {e}")))?
        .collect::<Result<_, _>>()
        .map_err(|e| refuse(format!("cannot read: {e}")))?;
    let only_sim = entries.iter().all(|e| e.file_name() == KEEP);
    let previous_build = out.join("index.html").is_file() && out.join("sitemap.xml").is_file();
    if only_sim || previous_build {
        Ok(())
    } else {
        Err(refuse(
            "refuses to clear a directory that is not a previous build (no index.html and sitemap.xml); pick an empty --out".into(),
        ))
    }
}
