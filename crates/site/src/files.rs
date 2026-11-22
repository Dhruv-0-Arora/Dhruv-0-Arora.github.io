use std::fs;
use std::io;
use std::path::{Path, PathBuf};

pub fn hidden_dir(name: &str) -> bool {
    name.starts_with('.')
}

pub fn junk_file(name: &str) -> bool {
    name.starts_with('.')
        || name.ends_with('~')
        || (name.len() > 1 && name.starts_with('#') && name.ends_with('#'))
}

pub fn walk(dir: &Path) -> io::Result<Vec<PathBuf>> {
    let mut out = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(dir) = stack.pop() {
        for entry in fs::read_dir(&dir)? {
            let path = entry?.path();
            let name = path
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .unwrap_or_default();
            if path.is_dir() {
                if !hidden_dir(&name) {
                    stack.push(path);
                }
            } else if !junk_file(&name) {
                out.push(path);
            }
        }
    }
    out.sort();
    Ok(out)
}

pub fn slash_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

pub fn display(root: &Path, path: &Path) -> String {
    slash_path(path.strip_prefix(root).unwrap_or(path))
}

#[cfg(test)]
mod tests {
    use super::{hidden_dir, junk_file};

    #[test]
    fn recognises_editor_and_os_junk() {
        for name in [
            ".DS_Store",
            ".index.md.swp",
            ".#index.md",
            "index.md~",
            "#index.md#",
            ".hidden",
        ] {
            assert!(junk_file(name), "{name}");
        }
        for name in ["index.md", "a#b.md", "#", "tilde~x.md", "resume.pdf"] {
            assert!(!junk_file(name), "{name}");
        }
        assert!(hidden_dir(".git"));
        assert!(!hidden_dir("photos"));
    }
}
