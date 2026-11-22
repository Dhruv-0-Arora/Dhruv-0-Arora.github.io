use std::collections::BTreeMap;

use maud::{DOCTYPE, Markup, PreEscaped, html};

use crate::content::{Content, Page};
use crate::highlight::Highlighter;
use crate::matter::{Gallery, Home, Kind, Matter, Project, Section, THUMB_PREFIX};

const THEME_BOOT: &str = r#"try{var d=document.documentElement,t=new URLSearchParams(location.search).get("theme");if(t!="light"&&t!="dark")t=localStorage.getItem("theme");if(t=="light"||t=="dark")d.dataset.theme=t}catch(e){}"#;

#[derive(Debug, Clone)]
pub struct Corner {
    pub frame_html: String,
    pub href: String,
    pub cols: u16,
    pub rows: u16,
    pub wasm: String,
    pub asset: String,
}

pub const GLYPH_ASSET: &str = "dozer.glyph";
pub const GLYPH_WASM: &str = "glyph.wasm";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Rendition {
    pub url: String,
    pub width: usize,
    pub height: usize,
}

pub fn page_scripts(kind: Kind, corner: bool) -> &'static [&'static str] {
    match kind {
        Kind::Gallery => &["gallery.js"],
        Kind::Home if corner => &["glyph.js"],
        _ => &[],
    }
}

pub struct Assets {
    pub versions: BTreeMap<String, String>,
}

impl Assets {
    fn href(&self, name: &str) -> String {
        let version = self.versions.get(name).map_or("00000000", String::as_str);
        format!("/{name}?v={version}")
    }
}

pub struct View<'a> {
    pub content: &'a Content,
    pub bodies: &'a [String],
    pub highlighter: &'a Highlighter,
    pub footer: &'a str,
    pub assets: &'a Assets,
    pub corner: Option<&'a Corner>,
    pub renditions: &'a BTreeMap<String, Vec<Rendition>>,
}

fn nl() -> PreEscaped<&'static str> {
    PreEscaped("\n")
}

impl View<'_> {
    fn hl(&self, text: &str) -> PreEscaped<String> {
        PreEscaped(self.highlighter.html(text))
    }

    pub fn page(&self, index: usize) -> String {
        let page = &self.content.pages[index];
        let site = &self.content.site;
        let not_found = page.kind() == Kind::NotFound;
        let title = if index == self.content.home {
            site.title.clone()
        } else {
            format!("{} - {}", page.title(), site.title)
        };
        let description = page.matter.common().description;
        let url = format!("{}{}", site.url, page.route);
        let (prev, next) = self.neighbours(index);
        let markup = html! {
            (DOCTYPE) (nl())
            html lang="en" {
                (nl())
                head {
                    (nl())
                    meta charset="utf-8"; (nl())
                    meta name="viewport" content="width=device-width, initial-scale=1"; (nl())
                    title { (title) } (nl())
                    meta name="description" content=(description); (nl())
                    @if not_found {
                        meta name="robots" content="noindex"; (nl())
                    } @else {
                        link rel="canonical" href=(url); (nl())
                    }
                    meta name="color-scheme" content="light dark"; (nl())
                    meta property="og:title" content=(title); (nl())
                    meta property="og:description" content=(description); (nl())
                    meta property="og:type" content="website"; (nl())
                    @if !not_found {
                        meta property="og:url" content=(url); (nl())
                    }
                    meta property="og:image" content={ (site.url) "/og.png" }; (nl())
                    meta name="twitter:card" content="summary_large_image"; (nl())
                    link rel="icon" href="/favicon.svg" type="image/svg+xml"; (nl())
                    link rel="preload" href="/fonts/commit-mono-400.woff2" as="font" type="font/woff2" crossorigin; (nl())
                    link rel="stylesheet" href=(self.assets.href("style.css")); (nl())
                    @if let Some(prev) = prev {
                        link rel="prev" href=(self.content.pages[prev].route); (nl())
                    }
                    @if let Some(next) = next {
                        link rel="next" href=(self.content.pages[next].route); (nl())
                    }
                    script { (PreEscaped(THEME_BOOT)) } (nl())
                    script src=(self.assets.href("theme.js")) defer {} (nl())
                    @for name in page_scripts(page.kind(), self.corner.is_some()) {
                        script src=(self.assets.href(name)) defer {} (nl())
                    }
                }
                (nl())
                body {
                    (nl())
                    a.skip href="#main" { "Skip to content" } (nl())
                    div.frame {
                        (nl())
                        (self.nav(index)) (nl())
                        main #main {
                            (nl())
                            article {
                                (nl())
                                (self.article(index, prev, next))
                            }
                            (nl())
                            footer { (nl()) (PreEscaped(self.footer)) }
                            (nl())
                        }
                        (nl())
                    }
                    (nl())
                }
                (nl())
            }
            (nl())
        };
        markup.into_string()
    }

    fn neighbours(&self, index: usize) -> (Option<usize>, Option<usize>) {
        let page = &self.content.pages[index];
        let Some(parent) = page.parent.filter(|_| page.kind() == Kind::Project) else {
            return (None, None);
        };
        let siblings = &self.content.pages[parent].children;
        let Some(at) = siblings.iter().position(|&i| i == index) else {
            return (None, None);
        };
        let prev = at.checked_sub(1).map(|p| siblings[p]);
        (prev, siblings.get(at + 1).copied())
    }

    fn nav(&self, current: usize) -> Markup {
        let content = self.content;
        let current_page = &content.pages[current];
        let open = match current_page.kind() {
            Kind::Section => Some(current),
            Kind::Project => current_page.parent,
            _ => None,
        };
        let (root_class, root_link) = self.nav_item(content.home, current, &["root"]);
        html! {
            nav.tree aria-label="Site" {
                (nl())
                ul {
                    (nl())
                    li class=[root_class] {
                        (root_link)
                        @if !content.top.is_empty() {
                            (nl())
                            ul {
                                (nl())
                                @for &i in &content.top {
                                    @let is_open = open == Some(i);
                                    @let (class, link) = self.nav_item(i, current, if is_open { &["open"] } else { &[] });
                                    li class=[class] {
                                        (link)
                                        @if is_open {
                                            (self.nav_groups(i, current))
                                        }
                                    }
                                    (nl())
                                }
                            }
                            (nl())
                        }
                    }
                    (nl())
                }
                (nl())
                @if !content.site.links.is_empty() {
                    ul.out {
                        (nl())
                        @for link in &content.site.links {
                            li { a href=(link.href) { (link.title) } } (nl())
                        }
                    }
                    (nl())
                }
                button.theme type="button" hidden { "theme: auto" }
                (nl())
            }
        }
    }

    fn nav_item(&self, i: usize, current: usize, extra: &[&str]) -> (Option<String>, Markup) {
        let page = &self.content.pages[i];
        let here = i == current;
        let mut classes = extra.to_vec();
        if here {
            classes.push("here");
        }
        let class = (!classes.is_empty()).then(|| classes.join(" "));
        (
            class,
            html! { a href=(page.route) aria-current=[here.then_some("page")] { (page.nav_label()) } },
        )
    }

    fn nav_groups(&self, section_index: usize, current: usize) -> Markup {
        let pages = &self.content.pages;
        let section_page = &pages[section_index];
        let Matter::Section(section) = &section_page.matter else {
            return html! {};
        };
        let current_group = match &pages[current].matter {
            Matter::Project(p) if pages[current].parent == Some(section_index) => {
                Some(p.group.as_str())
            }
            _ => None,
        };
        let in_group = |child: usize, id: &str| matches!(&pages[child].matter, Matter::Project(p) if p.group == id);
        html! {
            (nl())
            ul {
                (nl())
                @for group in &section.groups {
                    @let is_open = current_group == Some(group.id.as_str());
                    li class=(if is_open { "g open" } else { "g" }) {
                        a href={ (section_page.route) "#" (group.id) } { (group.title.to_lowercase()) }
                        @if is_open {
                            (nl())
                            ul {
                                (nl())
                                @for &child in section_page.children.iter().filter(|&&c| in_group(c, &group.id)) {
                                    @let (class, link) = self.nav_item(child, current, &[]);
                                    li class=[class] { (link) } (nl())
                                }
                            }
                            (nl())
                        }
                    }
                    (nl())
                }
            }
            (nl())
        }
    }

    fn article(&self, index: usize, prev: Option<usize>, next: Option<usize>) -> Markup {
        let page = &self.content.pages[index];
        let body = &self.bodies[index];
        let prose = html! {
            @if !body.trim().is_empty() {
                div.prose { (nl()) (PreEscaped(body)) } (nl())
            }
        };
        match &page.matter {
            Matter::Home(home) => self.home(home, &prose),
            Matter::Section(section) => self.section(page, section, &prose),
            Matter::Project(project) => self.project(project, &prose, prev, next),
            Matter::Page(p) => html! {
                header {
                    (nl())
                    h1 { (p.title) } (nl())
                    @if let Some(lede) = &p.lede {
                        p.lede { (self.hl(lede)) } (nl())
                    }
                }
                (nl())
                (prose)
            },
            Matter::Gallery(gallery) => self.gallery(gallery, &prose),
            Matter::NotFound(p) => html! {
                header { (nl()) h1 { (p.title) } (nl()) }
                (nl())
                (prose)
            },
        }
    }

    fn index_row(&self, i: usize) -> Markup {
        let page = &self.content.pages[i];
        let Matter::Project(project) = &page.matter else {
            return html! {};
        };
        html! {
            li {
                a href=(page.route) { (page.nav_label()) }
                span { (self.hl(&project.summary)) }
                @if let Some(note) = &project.note {
                    span.c { (self.hl(note)) }
                }
            }
            (nl())
        }
    }

    fn home(&self, home: &Home, prose: &Markup) -> Markup {
        let content = self.content;
        let all = content
            .sections()
            .next()
            .map(|i| content.pages[i].route.as_str());
        html! {
            header {
                (nl())
                @if let Some(corner) = self.corner {
                    div.glyph {
                        a href=(corner.href) aria-label=[home.corner_label.as_deref()] {
                            pre aria-hidden="true" style={ "--c:" (corner.cols) ";--r:" (corner.rows) } data-wasm=(corner.wasm) data-asset=(corner.asset) {
                                (nl()) (PreEscaped(&corner.frame_html))
                            }
                        }
                    }
                    (nl())
                }
                h1 { (home.title) } (nl())
                p.lede { (self.hl(&home.lede)) } (nl())
            }
            (nl())
            (prose)
            h2 #selected { a href="#selected" { (home.selected) } } (nl())
            ul.index {
                (nl())
                @for i in content.featured() { (self.index_row(i)) }
            }
            (nl())
            @if let Some(all) = all {
                p { a href=(all) { (home.all) } } (nl())
            }
            h2 #elsewhere { a href="#elsewhere" { (home.elsewhere) } } (nl())
            ul.index {
                (nl())
                @for entry in &content.site.elsewhere {
                    li { a href=(entry.href) { (entry.label) } span { (self.hl(&entry.text)) } } (nl())
                }
            }
            (nl())
        }
    }

    fn section(&self, page: &Page, section: &Section, prose: &Markup) -> Markup {
        let pages = &self.content.pages;
        html! {
            header {
                (nl())
                h1 { (section.title) } (nl())
                p.lede { (self.hl(&section.lede)) } (nl())
            }
            (nl())
            @for group in &section.groups {
                h2 id=(group.id) { a href={ "#" (group.id) } { (group.title) } } (nl())
                p.c { (self.hl(&group.blurb)) } (nl())
                ul.index {
                    (nl())
                    @for &i in &page.children {
                        @if matches!(&pages[i].matter, Matter::Project(p) if p.group == group.id) {
                            (self.index_row(i))
                        }
                    }
                }
                (nl())
            }
            (prose)
        }
    }

    fn project(
        &self,
        project: &Project,
        prose: &Markup,
        prev: Option<usize>,
        next: Option<usize>,
    ) -> Markup {
        let pages = &self.content.pages;
        let section_title = prev
            .or(next)
            .and_then(|i| pages[i].parent)
            .map(|parent| pages[parent].title());
        html! {
            header {
                (nl())
                h1 { (project.title) } (nl())
                p.lede { (self.hl(&project.summary)) } (nl())
                dl.meta {
                    (nl())
                    dt { "tech" }
                    dd {
                        @for (k, tech) in project.tech.iter().enumerate() {
                            @if k > 0 { ", " }
                            span.t { (tech) }
                        }
                    }
                    (nl())
                    dt { "role" } dd { (project.role) } (nl())
                    dt { "when" } dd { (self.hl(&project.when)) } (nl())
                    @if !project.links.is_empty() {
                        dt { "links" }
                        dd {
                            @for link in &project.links {
                                a href=(link.href) { (link.label) }
                            }
                        }
                        (nl())
                    }
                }
                (nl())
            }
            (nl())
            (prose)
            @if prev.is_some() || next.is_some() {
                nav.pager aria-label=[section_title] {
                    (nl())
                    @if let Some(prev) = prev {
                        a rel="prev" href=(pages[prev].route) { (pages[prev].nav_label()) } (nl())
                    }
                    @if let Some(next) = next {
                        a rel="next" href=(pages[next].route) { (pages[next].nav_label()) } (nl())
                    }
                }
                (nl())
            }
        }
    }
}

impl View<'_> {
    fn photo_img(&self, slug: &str, alt: &str, sizes: &str) -> Markup {
        let Some(renditions) = self.renditions.get(slug).filter(|r| !r.is_empty()) else {
            return html! {};
        };
        let smallest = &renditions[0];
        let largest = &renditions[renditions.len() - 1];
        let srcset = renditions
            .iter()
            .map(|r| format!("{} {}w", r.url, r.width))
            .collect::<Vec<_>>()
            .join(", ");
        html! {
            img src=(smallest.url) srcset=(srcset) sizes=(sizes) alt=(alt) width=(largest.width) height=(largest.height) loading="lazy";
        }
    }

    fn gallery(&self, gallery: &Gallery, prose: &Markup) -> Markup {
        let photos = &gallery.photos;
        let count = photos.len();
        html! {
            header {
                (nl())
                h1 { (gallery.title) } (nl())
                @if let Some(lede) = &gallery.lede {
                    p.lede { (self.hl(lede)) } (nl())
                }
            }
            (nl())
            (prose)
            ul.photos #photos {
                (nl())
                @for photo in photos {
                    li id={ (THUMB_PREFIX) (photo.slug) } {
                        a href={ "#" (photo.slug) } { (self.photo_img(&photo.slug, &photo.alt, "(max-width: 36rem) 100vw, 24rem")) }
                        span.c { (self.hl(&photo.place)) }
                    }
                    (nl())
                }
            }
            (nl())
            @for (k, photo) in photos.iter().enumerate() {
                @let prev = &photos[(k + count - 1) % count];
                @let next = &photos[(k + 1) % count];
                figure.shot id=(photo.slug) {
                    (self.photo_img(&photo.slug, &photo.alt, "100vw"))
                    figcaption {
                        span.c { (self.hl(&photo.place)) }
                        a rel="prev" href={ "#" (prev.slug) } { "prev" }
                        a rel="next" href={ "#" (next.slug) } { "next" }
                        a.x href={ "#" (THUMB_PREFIX) (photo.slug) } { "close" }
                    }
                }
                (nl())
            }
        }
    }
}

pub fn llms(content: &Content) -> String {
    let site = &content.site;
    let absolute = |href: &str| {
        if href.starts_with('/') && !href.starts_with("//") {
            format!("{}{href}", site.url)
        } else {
            href.to_owned()
        }
    };
    let home = content.pages[content.home].matter.common().description;
    let pages = content.nav_pages().into_iter().map(|i| {
        let page = &content.pages[i];
        format!(
            "- [{}]({}): {}",
            page.title(),
            absolute(&page.route),
            page.matter.common().description
        )
    });
    let links = site
        .links
        .iter()
        .map(|l| (&l.title, &l.href))
        .chain(site.elsewhere.iter().map(|e| (&e.label, &e.href)))
        .map(|(label, href)| format!("- [{label}]({})", absolute(href)));
    format!(
        "# {}\n\n> {home}\n\n## Pages\n\n{}\n\n## Links\n\n{}\n",
        site.title,
        pages.collect::<Vec<_>>().join("\n"),
        links.collect::<Vec<_>>().join("\n")
    )
}

pub fn sitemap(content: &Content) -> String {
    let mut out = String::from(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n",
    );
    for i in content.nav_pages() {
        let loc =
            crate::highlight::escape(&format!("{}{}", content.site.url, content.pages[i].route));
        out.push_str("<url><loc>");
        out.push_str(&loc);
        out.push_str("</loc></url>\n");
    }
    out.push_str("</urlset>\n");
    out
}

#[cfg(test)]
mod tests {
    use super::page_scripts;
    use crate::matter::Kind;

    #[test]
    fn scripts_per_kind() {
        assert_eq!(page_scripts(Kind::Gallery, false), ["gallery.js"]);
        assert_eq!(page_scripts(Kind::Home, true), ["glyph.js"]);
        assert!(page_scripts(Kind::Home, false).is_empty());
        assert!(page_scripts(Kind::Page, true).is_empty());
    }
}
