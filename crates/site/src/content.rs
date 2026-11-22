use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};

use crate::files::{display, slash_path, walk};
use crate::matter::{self, Kind, Matter, Site};
use crate::problem::Problem;

pub const RESERVED_ROUTE: &str = "/sim/";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Placement {
    pub route: String,
    pub kind: Kind,
    pub parent: Option<String>,
}

pub fn place(rel: &str) -> Result<Placement, String> {
    let Some(stem) = rel.strip_suffix(".md") else {
        return Err(
            "only Markdown pages and site.toml belong in content/; put other files in static/"
                .into(),
        );
    };
    let parts: Vec<&str> = stem.split('/').collect();
    let placement = match parts.as_slice() {
        ["index"] => Placement {
            route: "/".into(),
            kind: Kind::Home,
            parent: None,
        },
        ["404"] => Placement {
            route: "/404.html".into(),
            kind: Kind::NotFound,
            parent: None,
        },
        [name] => Placement {
            route: format!("/{name}/"),
            kind: Kind::Page,
            parent: None,
        },
        [dir, "index"] => Placement {
            route: format!("/{dir}/"),
            kind: Kind::Section,
            parent: None,
        },
        [dir, name] => Placement {
            route: format!("/{dir}/{name}/"),
            kind: Kind::Project,
            parent: Some(format!("/{dir}/")),
        },
        _ => {
            return Err(
                "pages may be at most one directory deep (content/section/project.md)".into(),
            );
        }
    };
    for part in &parts {
        if !matter::is_slug(part) {
            return Err(format!(
                "`{part}` is not a valid route segment; use lowercase letters, digits and single dashes"
            ));
        }
    }
    if placement.route.starts_with(RESERVED_ROUTE) {
        return Err(format!(
            "the route {RESERVED_ROUTE} belongs to the simulator build"
        ));
    }
    Ok(placement)
}

#[derive(Debug, Clone)]
pub struct Page {
    pub source: String,
    pub route: String,
    pub matter: Matter,
    pub body: String,
    pub body_line: usize,
    pub parent: Option<usize>,
    pub children: Vec<usize>,
}

impl Page {
    pub fn title(&self) -> &str {
        self.matter.common().title
    }

    pub fn nav_label(&self) -> String {
        let common = self.matter.common();
        common
            .nav
            .map_or_else(|| common.title.to_lowercase(), str::to_owned)
    }

    pub fn kind(&self) -> Kind {
        self.matter.kind()
    }
}

#[derive(Debug, Clone)]
pub struct Content {
    pub site: Site,
    pub site_source: String,
    pub pages: Vec<Page>,
    pub home: usize,
    pub top: Vec<usize>,
}

impl Content {
    pub fn vocabulary(&self) -> Vec<String> {
        let mut names: Vec<String> = self
            .pages
            .iter()
            .filter_map(|page| match &page.matter {
                Matter::Project(p) => Some(p.tech.clone()),
                _ => None,
            })
            .flatten()
            .collect();
        names.extend(self.site.vocabulary.iter().cloned());
        names
    }

    pub fn nav_pages(&self) -> Vec<usize> {
        let mut out = vec![self.home];
        for &i in &self.top {
            out.push(i);
            out.extend(&self.pages[i].children);
        }
        out
    }

    pub fn sections(&self) -> impl Iterator<Item = usize> + '_ {
        self.top
            .iter()
            .copied()
            .filter(|&i| self.pages[i].kind() == Kind::Section)
    }

    pub fn featured(&self) -> Vec<usize> {
        let mut ranked: Vec<(i64, usize, usize)> = self
            .nav_pages()
            .into_iter()
            .enumerate()
            .filter_map(|(position, i)| match &self.pages[i].matter {
                Matter::Project(p) => p.featured.map(|rank| (rank, position, i)),
                _ => None,
            })
            .collect();
        ranked.sort_unstable();
        ranked.into_iter().map(|(_, _, i)| i).collect()
    }
}

pub fn load(root: &Path) -> Result<Content, Vec<Problem>> {
    let dir = root.join("content");
    let files = walk(&dir).map_err(|e| {
        vec![Problem::new(
            display(root, &dir),
            format!("cannot read: {e}"),
        )]
    })?;
    let mut problems = Vec::new();
    let site_source = display(root, &dir.join("site.toml"));
    let content_dir = display(root, &dir);
    let (site, mut pages, parents) = read_sources(root, &dir, &files, &mut problems);
    let Some(site) = site else {
        problems.push(Problem::new(
            &site_source,
            "missing; the site needs content/site.toml",
        ));
        return Err(problems);
    };
    let find = |kind: Kind| pages.iter().position(|p| p.kind() == kind);
    let home = find(Kind::Home);
    if home.is_none() {
        problems.push(Problem::new(
            format!("{content_dir}/index.md"),
            "missing; the site needs a home page with kind = \"home\"",
        ));
    }
    if find(Kind::NotFound).is_none() {
        problems.push(Problem::new(
            format!("{content_dir}/404.md"),
            "missing; the site needs a not-found page with kind = \"notfound\"",
        ));
    }
    link_tree(&mut pages, &parents, &content_dir, &mut problems);
    check_groups(&pages, &mut problems);
    let Some(home) = home.filter(|_| problems.is_empty()) else {
        problems.sort();
        return Err(problems);
    };
    let mut top: Vec<usize> = (0..pages.len())
        .filter(|&i| matches!(pages[i].kind(), Kind::Page | Kind::Section | Kind::Gallery))
        .collect();
    sort_siblings(&pages, &mut top, |_| 0);
    for i in 0..pages.len() {
        let mut children = std::mem::take(&mut pages[i].children);
        if let Matter::Section(section) = &pages[i].matter {
            let group_rank = |child: usize| match &pages[child].matter {
                Matter::Project(p) => section
                    .groups
                    .iter()
                    .position(|g| g.id == p.group)
                    .unwrap_or(usize::MAX),
                _ => usize::MAX,
            };
            sort_siblings(&pages, &mut children, group_rank);
        }
        pages[i].children = children;
    }
    Ok(Content {
        site,
        site_source,
        pages,
        home,
        top,
    })
}

fn read_sources(
    root: &Path,
    dir: &Path,
    files: &[PathBuf],
    problems: &mut Vec<Problem>,
) -> (Option<Site>, Vec<Page>, Vec<Option<String>>) {
    let mut site = None;
    let mut pages = Vec::new();
    let mut parents = Vec::new();
    for file in files {
        let source = display(root, file);
        let rel = slash_path(file.strip_prefix(dir).unwrap_or(file));
        let text = match fs::read_to_string(file) {
            Ok(text) => text,
            Err(e) => {
                problems.push(Problem::new(&source, format!("cannot read: {e}")));
                continue;
            }
        };
        if rel == "site.toml" {
            match matter::parse_toml::<Site>(&source, &text, 1) {
                Ok(parsed) => site = Some(parsed),
                Err(p) => problems.push(p),
            }
            continue;
        }
        let placement = match place(&rel) {
            Ok(placement) => placement,
            Err(message) => {
                problems.push(Problem::new(&source, message));
                continue;
            }
        };
        let parsed = match matter::parse_page(&source, &text) {
            Ok(parsed) => parsed,
            Err(found) => {
                problems.extend(found);
                continue;
            }
        };
        if !fits(parsed.matter.kind(), placement.kind) {
            problems.push(Problem::new(
                &source,
                kind_mismatch(&rel, parsed.matter.kind(), placement.kind),
            ));
            continue;
        }
        parents.push(placement.parent);
        pages.push(Page {
            source,
            route: placement.route,
            matter: parsed.matter,
            body: parsed.body,
            body_line: parsed.body_line,
            parent: None,
            children: Vec::new(),
        });
    }
    (site, pages, parents)
}

fn link_tree(
    pages: &mut [Page],
    parents: &[Option<String>],
    content_dir: &str,
    problems: &mut Vec<Problem>,
) {
    let mut by_route: BTreeMap<String, usize> = BTreeMap::new();
    for (i, page) in pages.iter().enumerate() {
        if let Some(&other) = by_route.get(&page.route) {
            problems.push(Problem::new(
                &page.source,
                format!(
                    "claims the route {} already taken by {}",
                    page.route, pages[other].source
                ),
            ));
        } else {
            by_route.insert(page.route.clone(), i);
        }
    }
    for (i, parent_route) in parents.iter().enumerate() {
        let Some(parent_route) = parent_route else {
            continue;
        };
        if let Some(&parent) = by_route.get(parent_route)
            && pages[parent].kind() == Kind::Section
        {
            pages[i].parent = Some(parent);
            pages[parent].children.push(i);
        } else {
            problems.push(Problem::new(
                &pages[i].source,
                format!("projects live in a section; add {content_dir}{parent_route}index.md with kind = \"section\""),
            ));
        }
    }
}

fn fits(found: Kind, slot: Kind) -> bool {
    found == slot || (found == Kind::Gallery && slot == Kind::Page)
}

fn kind_mismatch(rel: &str, found: Kind, expected: Kind) -> String {
    let hint = match found {
        Kind::Home => "the home page is content/index.md",
        Kind::NotFound => "the not-found page is content/404.md",
        Kind::Section => "sections live at content/<name>/index.md",
        Kind::Project => "projects live at content/<section>/<name>.md",
        Kind::Page | Kind::Gallery => "pages and galleries live at content/<name>.md",
    };
    format!(
        "kind = \"{}\" is not allowed at content/{rel}, which must be kind = \"{}\"; {hint}",
        found.name(),
        expected.name()
    )
}

fn check_groups(pages: &[Page], problems: &mut Vec<Problem>) {
    for page in pages {
        let Matter::Section(section) = &page.matter else {
            continue;
        };
        let ids: BTreeSet<&str> = section.groups.iter().map(|g| g.id.as_str()).collect();
        let mut used = BTreeSet::new();
        for &child in &page.children {
            if let Matter::Project(project) = &pages[child].matter {
                if ids.contains(project.group.as_str()) {
                    used.insert(project.group.as_str());
                } else {
                    problems.push(Problem::new(
                        &pages[child].source,
                        format!(
                            "field `group`: `{}` is not a group of {}; use one of {}",
                            project.group,
                            page.source,
                            section
                                .groups
                                .iter()
                                .map(|g| g.id.as_str())
                                .collect::<Vec<_>>()
                                .join(", ")
                        ),
                    ));
                }
            }
        }
        for group in &section.groups {
            if !used.contains(group.id.as_str()) {
                problems.push(Problem::new(
                    &page.source,
                    format!("group `{}` has no projects; remove it or add a project with group = \"{}\"", group.id, group.id),
                ));
            }
        }
    }
}

fn sort_siblings(pages: &[Page], list: &mut [usize], group_rank: impl Fn(usize) -> usize) {
    list.sort_by(|&a, &b| {
        let key = |i: usize| {
            let common = pages[i].matter.common();
            (
                group_rank(i),
                common.order.is_none(),
                common.order,
                common.title.to_owned(),
            )
        };
        key(a).cmp(&key(b))
    });
}

#[cfg(test)]
mod tests {
    use super::{Placement, place};
    use crate::matter::Kind;

    fn ok(rel: &str, route: &str, kind: Kind) {
        let placement = place(rel).unwrap_or_else(|e| panic!("{rel}: {e}"));
        assert_eq!(
            (placement.route.as_str(), placement.kind),
            (route, kind),
            "{rel}"
        );
    }

    #[test]
    fn routes_files() {
        ok("index.md", "/", Kind::Home);
        ok("404.md", "/404.html", Kind::NotFound);
        ok("about.md", "/about/", Kind::Page);
        ok("projects/index.md", "/projects/", Kind::Section);
        ok("projects/kerms.md", "/projects/kerms/", Kind::Project);
        ok("projects/404.md", "/projects/404/", Kind::Project);
        assert_eq!(
            place("projects/kerms.md").unwrap(),
            Placement {
                route: "/projects/kerms/".into(),
                kind: Kind::Project,
                parent: Some("/projects/".into())
            }
        );
    }

    #[test]
    fn rejects_bad_placements() {
        let cases = [
            ("a/b/c.md", "at most one directory deep"),
            ("photo.png", "only Markdown"),
            ("About.md", "not a valid route segment"),
            ("my page.md", "not a valid route segment"),
            ("sim.md", "belongs to the simulator"),
            ("sim/index.md", "belongs to the simulator"),
            ("sim/x.md", "belongs to the simulator"),
        ];
        for (rel, want) in cases {
            let err = place(rel).unwrap_err();
            assert!(err.contains(want), "{rel}: {err}");
        }
    }
}
