use std::fs;
use std::path::{Component, Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use notify::{RecursiveMode, Watcher};
use tiny_http::{Header, Request, Response, Server};

use crate::build::{Options, Summary, build};
use crate::files::{hidden_dir, junk_file};
use crate::matter::{Site, parse_toml};
use crate::problem::Problem;

#[derive(Debug, Clone, Default)]
struct Watch {
    trees: Vec<PathBuf>,
    files: Vec<PathBuf>,
}

impl Watch {
    fn new(options: &Options) -> Self {
        let root = &options.root;
        let trees = ["content", "static"]
            .iter()
            .filter_map(|dir| fs::canonicalize(root.join(dir)).ok())
            .collect();
        let corner = fs::read_to_string(root.join("content/site.toml"))
            .ok()
            .and_then(|text| parse_toml::<Site>("content/site.toml", &text, 1).ok())
            .and_then(|site| site.corner);
        let mut wanted = vec![
            options
                .claims
                .clone()
                .unwrap_or_else(|| root.join("profile/claims.md")),
        ];
        if let Some(corner) = corner {
            wanted.push(root.join(corner.model));
            wanted.push(options.wasm.clone());
        }
        let files = wanted.iter().filter_map(|path| anchor(path)).collect();
        Self { trees, files }
    }

    fn dirs(&self) -> Vec<(PathBuf, RecursiveMode)> {
        let mut dirs: Vec<(PathBuf, RecursiveMode)> = self
            .trees
            .iter()
            .map(|t| (t.clone(), RecursiveMode::Recursive))
            .collect();
        for file in &self.files {
            if let Some(parent) = file.parent()
                && !dirs.iter().any(|(d, _)| d == parent)
            {
                dirs.push((parent.to_path_buf(), RecursiveMode::NonRecursive));
            }
        }
        dirs
    }

    fn relevant(&self, paths: &[PathBuf]) -> bool {
        paths.iter().any(|path| {
            self.files.contains(path)
                || self.trees.iter().any(|tree| {
                    path.strip_prefix(tree)
                        .is_ok_and(|rel| !rel.as_os_str().is_empty() && !is_junk(rel))
                })
        })
    }
}

fn anchor(path: &Path) -> Option<PathBuf> {
    let parent = match path.parent() {
        Some(p) if !p.as_os_str().is_empty() => p,
        _ => Path::new("."),
    };
    Some(fs::canonicalize(parent).ok()?.join(path.file_name()?))
}

fn is_junk(rel: &Path) -> bool {
    let names: Vec<String> = rel
        .components()
        .map(|c| c.as_os_str().to_string_lossy().into_owned())
        .collect();
    let Some((last, dirs)) = names.split_last() else {
        return false;
    };
    junk_file(last) || dirs.iter().any(|d| hidden_dir(d))
}

pub fn serve(
    options: &Options,
    port: u16,
    report: impl Fn(&Result<Summary, Vec<Problem>>) + Send + 'static,
) -> Result<(), String> {
    let generation = Arc::new(AtomicU64::new(0));
    let first = build(options);
    report(&first);
    let server = Server::http(("127.0.0.1", port))
        .map_err(|e| format!("cannot listen on port {port}: {e}"))?;
    println!(
        "serving {} on http://localhost:{port}/",
        options.out.display()
    );

    let (tx, rx) = mpsc::channel();
    let watch = Watch::new(options);
    let dirs = watch.dirs();
    let mut watcher = notify::recommended_watcher(move |event: notify::Result<notify::Event>| {
        if let Ok(event) = event
            && !event.kind.is_access()
            && watch.relevant(&event.paths)
        {
            let _ = tx.send(());
        }
    })
    .map_err(|e| format!("cannot watch files: {e}"))?;
    for (dir, mode) in dirs {
        watcher
            .watch(&dir, mode)
            .map_err(|e| format!("cannot watch {}: {e}", dir.display()))?;
    }
    let rebuild_options = options.clone();
    let rebuild_generation = Arc::clone(&generation);
    thread::spawn(move || {
        let _watcher = watcher;
        while rx.recv().is_ok() {
            while rx.recv_timeout(Duration::from_millis(80)).is_ok() {}
            let result = build(&rebuild_options);
            if result.is_ok() {
                rebuild_generation.fetch_add(1, Ordering::SeqCst);
            }
            report(&result);
        }
    });

    for request in server.incoming_requests() {
        let generation = generation.load(Ordering::SeqCst);
        if let Err(e) = respond(&options.out, request, generation) {
            eprintln!("serve: {e}");
        }
    }
    Ok(())
}

fn respond(out: &Path, request: Request, generation: u64) -> std::io::Result<()> {
    let url = request
        .url()
        .split(['?', '#'])
        .next()
        .unwrap_or("/")
        .to_owned();
    if url == "/__build" {
        return request.respond(with_type(
            Response::from_string(generation.to_string()),
            "text/plain; charset=utf-8",
        ));
    }
    let Some(path) = local_path(out, &url) else {
        return request.respond(Response::from_string("bad path").with_status_code(400));
    };
    if path.is_dir() {
        if url.ends_with('/') {
            return send_file(request, &path.join("index.html"), 200, out);
        }
        let location = Header::from_bytes("Location", format!("{url}/"))
            .map_err(|()| std::io::Error::other("bad header"))?;
        return request.respond(Response::empty(301).with_header(location));
    }
    send_file(request, &path, 200, out)
}

fn send_file(request: Request, path: &Path, status: u16, out: &Path) -> std::io::Result<()> {
    match fs::read(path) {
        Ok(bytes) => request.respond(with_type(
            Response::from_data(bytes).with_status_code(status),
            content_type(path),
        )),
        Err(_) if status == 200 => send_file(request, &out.join("404.html"), 404, out),
        Err(_) => request.respond(Response::from_string("not found").with_status_code(404)),
    }
}

fn with_type<R: std::io::Read>(response: Response<R>, kind: &str) -> Response<R> {
    match Header::from_bytes("Content-Type", kind) {
        Ok(header) => response.with_header(header),
        Err(()) => response,
    }
}

fn local_path(out: &Path, url: &str) -> Option<PathBuf> {
    let decoded = percent_decode(url)?;
    let rel = Path::new(decoded.trim_start_matches('/'));
    rel.components()
        .all(|c| matches!(c, Component::Normal(_)))
        .then(|| out.join(rel))
}

fn percent_decode(text: &str) -> Option<String> {
    let bytes = text.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' {
            let hex = text.get(i + 1..i + 3)?;
            out.push(u8::from_str_radix(hex, 16).ok()?);
            i += 3;
        } else {
            out.push(bytes[i]);
            i += 1;
        }
    }
    String::from_utf8(out).ok()
}

fn content_type(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()).unwrap_or("") {
        "html" => "text/html; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "json" => "application/json",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "woff2" => "font/woff2",
        "pdf" => "application/pdf",
        "txt" => "text/plain; charset=utf-8",
        "xml" => "application/xml",
        "wasm" => "application/wasm",
        _ => "application/octet-stream",
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use std::path::PathBuf;

    use notify::RecursiveMode;

    use super::{Watch, local_path, percent_decode};

    fn watch() -> Watch {
        Watch {
            trees: vec![
                PathBuf::from("/site/content"),
                PathBuf::from("/site/static"),
            ],
            files: vec![
                PathBuf::from("/site/target/glyph.wasm"),
                PathBuf::from("/site/sim/public/models/dozer.mira"),
                PathBuf::from("/profile/claims.md"),
            ],
        }
    }

    #[test]
    fn watches_sources_and_the_files_the_build_reads() {
        let w = watch();
        for path in [
            "/site/content/index.md",
            "/site/content/projects/kerms.md",
            "/site/static/style.css",
            "/site/target/glyph.wasm",
            "/site/sim/public/models/dozer.mira",
            "/profile/claims.md",
        ] {
            assert!(w.relevant(&[PathBuf::from(path)]), "{path}");
        }
    }

    #[test]
    fn ignores_junk_and_neighbours() {
        let w = watch();
        for path in [
            "/site/content/.index.md.swp",
            "/site/content/index.md~",
            "/site/content/#index.md#",
            "/site/content/4913",
            "/site/static/.DS_Store",
            "/site/static/.git/HEAD",
            "/site/target/debug/site",
            "/site/target/glyph.wasm.tmp",
            "/profile/notes.md",
            "/site/content",
            "/elsewhere/content/index.md",
        ] {
            let relevant = w.relevant(&[PathBuf::from(path)]);
            assert_eq!(relevant, path == "/site/content/4913", "{path}");
        }
    }

    #[test]
    fn watches_each_extra_parent_once_and_flat() {
        let dirs = watch().dirs();
        assert_eq!(dirs.len(), 5);
        assert!(dirs.contains(&(PathBuf::from("/site/content"), RecursiveMode::Recursive)));
        assert!(dirs.contains(&(PathBuf::from("/site/target"), RecursiveMode::NonRecursive)));
        assert!(dirs.contains(&(PathBuf::from("/profile"), RecursiveMode::NonRecursive)));
    }

    #[test]
    fn maps_urls_inside_the_output() {
        let out = Path::new("/srv/dist");
        assert_eq!(
            local_path(out, "/projects/kerms/").unwrap(),
            Path::new("/srv/dist/projects/kerms")
        );
        assert_eq!(
            local_path(out, "/a%20b.txt").unwrap(),
            Path::new("/srv/dist/a b.txt")
        );
        assert!(local_path(out, "/../etc/passwd").is_none());
        assert!(local_path(out, "/%2e%2e/etc").is_none());
        assert_eq!(percent_decode("%zz"), None);
    }
}
