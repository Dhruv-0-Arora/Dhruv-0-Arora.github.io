use std::collections::{BTreeMap, BTreeSet};

use scraper::{Html, Selector};

use crate::content::RESERVED_ROUTE;
use crate::matter::DESCRIPTION_CHARS;
use crate::problem::Problem;

pub const EM_DASH: char = '\u{2014}';
pub const HTML_BUDGET: usize = 32 * 1024;
pub const BUDGETS: [(&str, usize); 6] = [
    ("style.css", 12 * 1024),
    ("theme.js", 1024),
    ("gallery.js", 512),
    ("glyph.js", 4 * 1024),
    ("glyph.wasm", 12 * 1024),
    ("dozer.glyph", 24 * 1024),
];

pub struct HtmlFile {
    pub display: String,
    pub route: Option<String>,
    pub html: String,
    pub not_found: bool,
}

pub struct Output {
    pub out_dir: String,
    pub pages: Vec<HtmlFile>,
    pub files: BTreeMap<String, usize>,
}

struct Parsed {
    ids: Vec<String>,
}

fn select(selector: &str) -> Selector {
    Selector::parse(selector).unwrap_or_else(|e| unreachable!("built-in selector {selector}: {e}"))
}

pub fn run(output: &Output) -> Vec<Problem> {
    let mut problems = Vec::new();
    let documents: Vec<Html> = output
        .pages
        .iter()
        .map(|p| Html::parse_document(&p.html))
        .collect();
    let id_selector = select("[id]");
    let parsed: Vec<Parsed> = documents
        .iter()
        .map(|doc| Parsed {
            ids: doc
                .select(&id_selector)
                .filter_map(|e| e.value().attr("id").map(str::to_owned))
                .collect(),
        })
        .collect();
    let mut by_route: BTreeMap<&str, usize> = BTreeMap::new();
    for (i, page) in output.pages.iter().enumerate() {
        if let Some(route) = &page.route {
            by_route.insert(route, i);
        }
    }
    let mut titles: BTreeMap<String, &str> = BTreeMap::new();
    for (i, (page, doc)) in output.pages.iter().zip(&documents).enumerate() {
        let mut seen = BTreeSet::new();
        for id in &parsed[i].ids {
            if !seen.insert(id) {
                problems.push(Problem::new(
                    &page.display,
                    format!("id `{id}` is used more than once"),
                ));
            }
        }
        check_links(output, page, doc, i, &by_route, &parsed, &mut problems);
        check_headings(page, doc, &mut problems);
        check_head(page, doc, &mut titles, &mut problems);
        check_images(page, doc, &mut problems);
        check_nav(page, doc, &mut problems);
        if page.html.len() > HTML_BUDGET {
            problems.push(Problem::new(
                &page.display,
                format!(
                    "is {} bytes; pages must stay within {HTML_BUDGET}",
                    page.html.len()
                ),
            ));
        }
        problems.extend(em_dashes(&page.display, &page.html));
    }
    for (name, budget) in BUDGETS {
        match output.files.get(name) {
            Some(&size) if size > budget => problems.push(Problem::new(
                format!("{}/{name}", output.out_dir),
                format!("is {size} bytes; the budget is {budget}"),
            )),
            _ => {}
        }
    }
    problems
}

pub fn em_dashes(display: &str, text: &str) -> Vec<Problem> {
    text.lines()
        .enumerate()
        .filter(|(_, line)| line.contains(EM_DASH))
        .map(|(n, _)| {
            Problem::at(
                display,
                n + 1,
                "contains an em dash (U+2014); use a plain dash",
            )
        })
        .collect()
}

fn check_links(
    output: &Output,
    page: &HtmlFile,
    doc: &Html,
    index: usize,
    by_route: &BTreeMap<&str, usize>,
    parsed: &[Parsed],
    problems: &mut Vec<Problem>,
) {
    for element in doc.select(&select("[href], [src], [srcset]")) {
        let value = element.value();
        let targets = ["href", "src"]
            .into_iter()
            .filter_map(|attr| value.attr(attr).map(|t| (attr, t)))
            .chain(value.attr("srcset").into_iter().flat_map(|set| {
                set.split(',')
                    .filter_map(|candidate| candidate.split_whitespace().next())
                    .map(|url| ("srcset", url))
            }));
        for (attr, target) in targets {
            if let Err(message) = resolve(output, target, index, by_route, parsed) {
                problems.push(Problem::new(
                    &page.display,
                    format!("{attr}=\"{target}\": {message}"),
                ));
            }
        }
    }
}

fn resolve(
    output: &Output,
    target: &str,
    current: usize,
    by_route: &BTreeMap<&str, usize>,
    parsed: &[Parsed],
) -> Result<(), String> {
    let has_scheme = target.split_once(':').is_some_and(|(scheme, _)| {
        !scheme.is_empty()
            && scheme
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || "+-.".contains(c))
    });
    if has_scheme || target.starts_with("//") {
        return Ok(());
    }
    if !target.starts_with('/') && !target.starts_with('#') {
        return Err("relative links are not allowed; write a site-absolute path".into());
    }
    let (before, fragment) = match target.split_once('#') {
        Some((before, fragment)) => (before, Some(fragment)),
        None => (target, None),
    };
    let path = before.split_once('?').map_or(before, |(path, _)| path);
    if path.starts_with(RESERVED_ROUTE) {
        return Ok(());
    }
    let page = if path.is_empty() {
        Some(current)
    } else if path.ends_with('/') {
        Some(*by_route.get(path).ok_or("no page has this route")?)
    } else if output.files.contains_key(&path[1..]) {
        None
    } else {
        return Err("no page or file here (page routes end with /)".into());
    };
    match (fragment, page) {
        (None, _) => Ok(()),
        (Some(""), _) => Err("empty fragment".into()),
        (Some(_), None) => Err("fragments only work on pages".into()),
        (Some(fragment), Some(page)) if parsed[page].ids.iter().any(|id| id == fragment) => Ok(()),
        (Some(fragment), Some(_)) => Err(format!("the target page has no id `{fragment}`")),
    }
}

fn check_headings(page: &HtmlFile, doc: &Html, problems: &mut Vec<Problem>) {
    let mut h1 = 0;
    let mut previous = 0;
    for heading in doc.select(&select("h1, h2, h3, h4, h5, h6")) {
        let name = heading.value().name();
        let level = usize::from(name.as_bytes()[1] - b'0');
        if level == 1 {
            h1 += 1;
        }
        if level > previous + 1 {
            problems.push(Problem::new(
                &page.display,
                format!("<{name}> skips a level after h{previous}"),
            ));
        }
        previous = level;
    }
    if h1 != 1 {
        problems.push(Problem::new(
            &page.display,
            format!("has {h1} h1 elements; it needs exactly one"),
        ));
    }
}

fn check_head<'a>(
    page: &'a HtmlFile,
    doc: &Html,
    titles: &mut BTreeMap<String, &'a str>,
    problems: &mut Vec<Problem>,
) {
    let title: Vec<String> = doc
        .select(&select("head > title"))
        .map(|t| t.text().collect::<String>())
        .collect();
    match title.as_slice() {
        [title] if !title.trim().is_empty() => {
            if let Some(other) = titles.insert(title.clone(), &page.display) {
                problems.push(Problem::new(
                    &page.display,
                    format!("has the same <title> as {other}"),
                ));
            }
        }
        _ => problems.push(Problem::new(
            &page.display,
            "needs exactly one non-empty <title>",
        )),
    }
    let descriptions: Vec<&str> = doc
        .select(&select("meta[name=\"description\"]"))
        .filter_map(|m| m.value().attr("content"))
        .collect();
    match descriptions.as_slice() {
        [description] => {
            let chars = description.chars().count();
            if !DESCRIPTION_CHARS.contains(&chars) {
                problems.push(Problem::new(
                    &page.display,
                    format!(
                        "meta description is {chars} characters; it must be {} to {}",
                        DESCRIPTION_CHARS.start(),
                        DESCRIPTION_CHARS.end()
                    ),
                ));
            }
        }
        _ => problems.push(Problem::new(
            &page.display,
            "needs exactly one meta description",
        )),
    }
}

fn check_images(page: &HtmlFile, doc: &Html, problems: &mut Vec<Problem>) {
    for img in doc.select(&select("img")) {
        let src = img.value().attr("src").unwrap_or("");
        for attr in ["alt", "width", "height"] {
            if img.value().attr(attr).is_none_or(|v| v.trim().is_empty()) {
                problems.push(Problem::new(
                    &page.display,
                    format!("<img src=\"{src}\"> is missing {attr}"),
                ));
            }
        }
    }
}

fn check_nav(page: &HtmlFile, doc: &Html, problems: &mut Vec<Problem>) {
    let current = doc
        .select(&select("nav.tree [aria-current=\"page\"]"))
        .count();
    let want = usize::from(!page.not_found);
    if current != want {
        problems.push(Problem::new(
            &page.display,
            format!("the site nav marks {current} current links; it must mark {want}"),
        ));
    }
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::{HtmlFile, Output, run};

    const DESC: &str = "A description that is comfortably longer than forty characters.";

    fn doc(title: &str, body: &str) -> String {
        format!(
            "<!DOCTYPE html><html><head><title>{title}</title><meta name=\"description\" content=\"{DESC}\"></head><body><nav class=\"tree\"><a href=\"/\" aria-current=\"page\">home</a></nav><h1>T</h1>{body}</body></html>"
        )
    }

    fn output(pages: Vec<(&str, String)>) -> Output {
        let mut files = BTreeMap::new();
        files.insert("style.css".to_owned(), 100);
        files.insert("theme.js".to_owned(), 100);
        files.insert("dot.png".to_owned(), 100);
        Output {
            out_dir: "dist".into(),
            pages: pages
                .into_iter()
                .map(|(route, html)| HtmlFile {
                    display: format!("dist{route}index.html"),
                    route: Some(route.to_owned()),
                    html,
                    not_found: false,
                })
                .collect(),
            files,
        }
    }

    fn problems(out: &Output) -> Vec<String> {
        run(out).iter().map(ToString::to_string).collect()
    }

    fn only(body: &str) -> Vec<String> {
        problems(&output(vec![("/", doc("Home", body))]))
    }

    fn has(found: &[String], want: &str) {
        assert!(
            found.iter().any(|p| p.contains(want)),
            "wanted {want:?} in {found:?}"
        );
    }

    #[test]
    fn clean_output_passes() {
        let body = "<h2 id=\"a\">A</h2><a href=\"#a\">a</a><a href=\"/x/#b\">b</a><a href=\"/style.css?v=1\">s</a><a href=\"/sim/anything\">sim</a><a href=\"https://e.example/\">e</a><a href=\"mailto:a@b.c\">m</a><img src=\"/dot.png\" alt=\"d\" width=\"1\" height=\"1\">";
        let x = doc("X", "<p id=\"b\">b</p>");
        assert_eq!(
            problems(&output(vec![("/", doc("Home", body)), ("/x/", x)])),
            Vec::<String>::new()
        );
    }

    #[test]
    fn links_must_resolve() {
        let found = only(
            "<a href=\"/nope/\">a</a><a href=\"/nope.png\">b</a><a href=\"rel/\">c</a><a href=\"#missing\">d</a><a href=\"#\">e</a><a href=\"/dot.png#x\">f</a><a href=\"/x\">g</a>",
        );
        has(
            &found,
            "dist/index.html: href=\"/nope/\": no page has this route",
        );
        has(&found, "href=\"/nope.png\": no page or file here");
        has(&found, "href=\"rel/\": relative links are not allowed");
        has(
            &found,
            "href=\"#missing\": the target page has no id `missing`",
        );
        has(&found, "href=\"#\": empty fragment");
        has(&found, "href=\"/dot.png#x\": fragments only work on pages");
        has(&found, "href=\"/x\": no page or file here");
    }

    #[test]
    fn srcset_candidates_are_checked() {
        let found = only(
            "<img src=\"/dot.png\" srcset=\"/dot.png 1w, /gone-2.webp 2w,/gone-3.webp\" alt=\"a\" width=\"1\" height=\"1\">",
        );
        has(&found, "srcset=\"/gone-2.webp\": no page or file here");
        has(&found, "srcset=\"/gone-3.webp\": no page or file here");
        assert!(
            !found.iter().any(|p| p.contains("srcset=\"/dot.png\"")),
            "{found:?}"
        );
    }

    #[test]
    fn src_attributes_are_checked_too() {
        has(
            &only("<script src=\"/gone.js\"></script>"),
            "src=\"/gone.js\": no page or file here",
        );
    }

    #[test]
    fn one_h1_and_no_skipped_levels() {
        has(&only("<h1>Again</h1>"), "has 2 h1 elements");
        has(&only("<h3>Deep</h3>"), "<h3> skips a level after h1");
        let found = problems(&output(vec![("/", "<html><head><title>a</title><meta name=\"description\" content=\"x\"></head><body></body></html>".into())]));
        has(&found, "has 0 h1 elements");
    }

    #[test]
    fn titles_are_unique_and_descriptions_bounded() {
        let found = problems(&output(vec![
            ("/", doc("Same", "")),
            ("/x/", doc("Same", "")),
        ]));
        has(
            &found,
            "dist/x/index.html: has the same <title> as dist/index.html",
        );
        let short = "<html><head><title>a</title><meta name=\"description\" content=\"short\"></head><body><nav class=\"tree\"><a href=\"/\" aria-current=\"page\">h</a></nav><h1>a</h1></body></html>";
        has(
            &problems(&output(vec![("/", short.into())])),
            "meta description is 5 characters",
        );
        let none = "<html><head><title>a</title></head><body><nav class=\"tree\"><a href=\"/\" aria-current=\"page\">h</a></nav><h1>a</h1></body></html>";
        has(
            &problems(&output(vec![("/", none.into())])),
            "needs exactly one meta description",
        );
    }

    #[test]
    fn images_need_alt_and_size() {
        let found = only("<img src=\"/dot.png\" alt=\"\">");
        has(&found, "<img src=\"/dot.png\"> is missing alt");
        has(&found, "is missing width");
        has(&found, "is missing height");
    }

    #[test]
    fn em_dash_is_reported_with_its_line() {
        has(
            &only("<p>a\nb \u{2014} c</p>"),
            "dist/index.html:2: contains an em dash",
        );
    }

    #[test]
    fn weight_budgets() {
        has(
            &only(&"x".repeat(33 * 1024)),
            "bytes; pages must stay within 32768",
        );
        let mut out = output(vec![("/", doc("Home", ""))]);
        out.files.insert("style.css".into(), 13 * 1024);
        out.files.insert("gallery.js".into(), 513);
        let found = problems(&out);
        has(
            &found,
            "dist/style.css: is 13312 bytes; the budget is 12288",
        );
        has(&found, "dist/gallery.js: is 513 bytes; the budget is 512");
    }

    #[test]
    fn nav_marks_exactly_one_current_link() {
        let two = doc(
            "Home",
            "<nav class=\"tree\"><a href=\"/\" aria-current=\"page\">again</a></nav>",
        );
        has(
            &problems(&output(vec![("/", two)])),
            "marks 2 current links; it must mark 1",
        );
        let mut out = output(vec![("/", doc("Home", ""))]);
        out.pages[0].not_found = true;
        has(&problems(&out), "marks 1 current links; it must mark 0");
    }

    #[test]
    fn duplicate_ids() {
        has(
            &only("<p id=\"a\"></p><p id=\"a\"></p>"),
            "id `a` is used more than once",
        );
    }
}
