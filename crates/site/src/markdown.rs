use std::collections::BTreeSet;
use std::path::{Component, Path};

use pulldown_cmark::{CowStr, Event, HeadingLevel, LinkType, Options, Parser, Tag, TagEnd, html};

use crate::highlight::{Highlighter, escape};
use crate::problem::{Problem, line_of};

pub struct Context<'a> {
    pub source: &'a str,
    pub first_line: usize,
    pub static_dir: &'a Path,
    pub highlighter: &'a Highlighter,
    pub reserved_ids: &'a [&'a str],
}

fn options() -> Options {
    Options::ENABLE_TABLES | Options::ENABLE_STRIKETHROUGH
}

pub fn href_problem(href: &str) -> Option<&'static str> {
    let ok = (href.starts_with('/') && !href.starts_with("//"))
        || href.starts_with('#')
        || href.starts_with("https://")
        || href.starts_with("http://")
        || href.starts_with("mailto:");
    (!ok).then_some(
        "links must be site-absolute (/projects/x/), a #fragment, or an http(s):// or mailto: URL",
    )
}

pub fn slug(text: &str) -> String {
    let mut out = String::new();
    for c in text.chars().flat_map(char::to_lowercase) {
        if c.is_alphanumeric() {
            out.push(c);
        } else if (c.is_whitespace() || c == '-' || c == '_')
            && !out.is_empty()
            && !out.ends_with('-')
        {
            out.push('-');
        }
    }
    out.trim_end_matches('-').to_owned()
}

struct Ids(BTreeSet<String>);

impl Ids {
    fn claim(&mut self, base: &str) -> String {
        let mut id = base.to_owned();
        let mut n = 2;
        while self.0.contains(&id) {
            id = format!("{base}-{n}");
            n += 1;
        }
        self.0.insert(id.clone());
        id
    }
}

struct Renderer<'c, 'a> {
    cx: &'c Context<'c>,
    text: &'a str,
    out: Vec<Event<'a>>,
    problems: Vec<Problem>,
    ids: Ids,
    level: usize,
    link_depth: usize,
    code_depth: usize,
    pending: String,
}

impl<'a> Renderer<'_, 'a> {
    fn problem(&mut self, offset: usize, message: impl Into<String>) {
        let line = self.cx.first_line + line_of(self.text, offset) - 1;
        self.problems
            .push(Problem::at(self.cx.source, line, message));
    }

    fn flush(&mut self) {
        if !self.pending.is_empty() {
            let html = self.cx.highlighter.html(&std::mem::take(&mut self.pending));
            self.out.push(Event::InlineHtml(html.into()));
        }
    }

    fn run(
        mut self,
        events: &mut impl Iterator<Item = (Event<'a>, std::ops::Range<usize>)>,
    ) -> Result<String, Vec<Problem>> {
        while let Some((event, range)) = events.next() {
            if !matches!(event, Event::Text(_)) {
                self.flush();
            }
            match event {
                Event::Text(text) if self.link_depth == 0 && self.code_depth == 0 => {
                    self.pending.push_str(&text);
                }
                Event::Html(_) | Event::InlineHtml(_) => {
                    self.problem(
                        range.start,
                        "raw HTML is not allowed in content; use Markdown",
                    );
                }
                Event::Start(Tag::Heading { level, .. }) => {
                    self.heading(level, range.start, events);
                }
                Event::Start(Tag::Image {
                    dest_url, title, ..
                }) => self.image(&dest_url, &title, range.start, events),
                Event::Start(Tag::Link {
                    link_type,
                    ref dest_url,
                    ..
                }) => {
                    if link_type != LinkType::Email
                        && let Some(message) = href_problem(dest_url)
                    {
                        self.problem(range.start, format!("link `{dest_url}`: {message}"));
                    }
                    self.link_depth += 1;
                    self.out.push(event);
                }
                Event::End(TagEnd::Link) => {
                    self.link_depth -= 1;
                    self.out.push(event);
                }
                Event::Start(Tag::Table(_)) => {
                    self.out.push(Event::Html("<div class=\"scroll\">".into()));
                    self.out.push(event);
                }
                Event::End(TagEnd::Table) => {
                    self.out.push(event);
                    self.out.push(Event::Html("</div>\n".into()));
                }
                Event::Start(Tag::CodeBlock(_)) => {
                    self.code_depth += 1;
                    self.out.push(event);
                }
                Event::End(TagEnd::CodeBlock) => {
                    self.code_depth -= 1;
                    self.out.push(event);
                }
                other => self.out.push(other),
            }
        }
        self.flush();
        if self.problems.is_empty() {
            let mut html = String::new();
            html::push_html(&mut html, self.out.into_iter());
            Ok(html)
        } else {
            Err(self.problems)
        }
    }

    fn heading(
        &mut self,
        level: HeadingLevel,
        offset: usize,
        events: &mut impl Iterator<Item = (Event<'a>, std::ops::Range<usize>)>,
    ) {
        let n = level as usize;
        let mut inner = Vec::new();
        let mut plain = String::new();
        for (event, range) in events.by_ref() {
            match event {
                Event::End(TagEnd::Heading(_)) => break,
                Event::Text(ref t) | Event::Code(ref t) => {
                    plain.push_str(t);
                    inner.push(event);
                }
                Event::Start(Tag::Link { .. } | Tag::Image { .. }) => {
                    self.problem(
                        range.start,
                        "headings link to themselves; move links and images out of the heading",
                    );
                }
                Event::End(TagEnd::Link | TagEnd::Image) => {}
                Event::Html(_) | Event::InlineHtml(_) => {
                    self.problem(
                        range.start,
                        "raw HTML is not allowed in content; use Markdown",
                    );
                }
                other => inner.push(other),
            }
        }
        if n == 1 {
            self.problem(
                offset,
                "the page title is the only h1; start body headings at ##",
            );
        } else if n > 3 {
            self.problem(
                offset,
                format!("h{n} is too deep; body headings are ## and ###"),
            );
        } else if n > self.level + 1 {
            self.problem(
                offset,
                format!(
                    "h{n} skips a level after h{}; use h{}",
                    self.level,
                    self.level + 1
                ),
            );
        }
        self.level = n;
        let base = slug(&plain);
        if base.is_empty() {
            self.problem(
                offset,
                "heading has no letters or digits to make an id from",
            );
            return;
        }
        let id = self.ids.claim(&base);
        let mut inner_html = String::new();
        html::push_html(&mut inner_html, inner.into_iter());
        self.out.push(Event::Html(
            format!("<h{n} id=\"{id}\"><a href=\"#{id}\">{inner_html}</a></h{n}>\n").into(),
        ));
    }

    fn image(
        &mut self,
        dest: &CowStr<'a>,
        title: &CowStr<'a>,
        offset: usize,
        events: &mut impl Iterator<Item = (Event<'a>, std::ops::Range<usize>)>,
    ) {
        let mut alt = String::new();
        let mut depth = 0;
        for (event, _) in events.by_ref() {
            match event {
                Event::End(TagEnd::Image) if depth == 0 => break,
                Event::Start(_) => depth += 1,
                Event::End(_) => depth -= 1,
                Event::Text(t) | Event::Code(t) => alt.push_str(&t),
                _ => {}
            }
        }
        if alt.trim().is_empty() {
            self.problem(
                offset,
                format!("image `{dest}` needs alt text: ![what it shows]({dest})"),
            );
        }
        let Some(rel) = dest.strip_prefix('/').filter(|_| !dest.starts_with("//")) else {
            self.problem(
                offset,
                format!("image `{dest}` must be a site-absolute path to a file in static/"),
            );
            return;
        };
        let path = self.cx.static_dir.join(rel);
        if Path::new(rel)
            .components()
            .any(|c| !matches!(c, Component::Normal(_)))
        {
            self.problem(
                offset,
                format!("image `{dest}` must not contain `..` or `.`"),
            );
            return;
        }
        if !path.is_file() {
            self.problem(
                offset,
                format!("image `{dest}` does not exist under static/"),
            );
            return;
        }
        let size = match imagesize::size(&path) {
            Ok(size) => size,
            Err(e) => {
                self.problem(offset, format!("image `{dest}`: cannot read its size: {e}"));
                return;
            }
        };
        let title = if title.is_empty() {
            String::new()
        } else {
            format!(" title=\"{}\"", escape(title))
        };
        self.out.push(Event::InlineHtml(
            format!(
                "<img src=\"{}\" alt=\"{}\" width=\"{}\" height=\"{}\"{title} loading=\"lazy\">",
                escape(dest),
                escape(&alt),
                size.width,
                size.height
            )
            .into(),
        ));
    }
}

pub fn render(text: &str, cx: &Context<'_>) -> Result<String, Vec<Problem>> {
    let mut ids = Ids(BTreeSet::new());
    for id in cx.reserved_ids {
        ids.0.insert((*id).to_owned());
    }
    let renderer = Renderer {
        cx,
        text,
        out: Vec::new(),
        problems: Vec::new(),
        ids,
        level: 1,
        link_depth: 0,
        code_depth: 0,
        pending: String::new(),
    };
    renderer.run(&mut Parser::new_ext(text, options()).into_offset_iter())
}

pub fn render_inline(text: &str, source: &str) -> Result<String, Problem> {
    let mut paragraphs = 0;
    for event in Parser::new_ext(text, options()) {
        let allowed = match &event {
            Event::Start(Tag::Paragraph) => {
                paragraphs += 1;
                true
            }
            Event::Start(Tag::Link {
                link_type,
                dest_url,
                ..
            }) => {
                if *link_type != LinkType::Email
                    && let Some(message) = href_problem(dest_url)
                {
                    return Err(Problem::new(
                        source,
                        format!("link `{dest_url}`: {message}"),
                    ));
                }
                true
            }
            Event::Start(Tag::Emphasis | Tag::Strong | Tag::Strikethrough)
            | Event::End(_)
            | Event::Text(_)
            | Event::Code(_)
            | Event::SoftBreak => true,
            _ => false,
        };
        if !allowed || paragraphs > 1 {
            return Err(Problem::new(
                source,
                "must be one line of inline Markdown: text, emphasis, code and links only",
            ));
        }
    }
    let mut out = String::new();
    html::push_html(&mut out, Parser::new_ext(text, options()));
    Ok(out)
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::{Context, render, render_inline, slug};
    use crate::highlight::Highlighter;

    fn static_dir() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/basic/static")
    }

    fn md(text: &str) -> Result<String, Vec<String>> {
        let highlighter = Highlighter::new(["Rust", "C++"], &[]);
        let dir = static_dir();
        let cx = Context {
            source: "content/x.md",
            first_line: 10,
            static_dir: &dir,
            highlighter: &highlighter,
            reserved_ids: &["main", "taken"],
        };
        render(text, &cx).map_err(|p| p.iter().map(ToString::to_string).collect())
    }

    fn fails(text: &str, want: &str) {
        let errors = md(text).expect_err(text);
        assert!(
            errors.iter().any(|e| e.contains(want)),
            "{text:?}: wanted {want:?} in {errors:?}"
        );
    }

    #[test]
    fn slugs() {
        let cases = [
            ("Signals", "signals"),
            ("Rules of the road", "rules-of-the-road"),
            ("  C++ & Rust!  ", "c-rust"),
            ("snake_case - dash", "snake-case-dash"),
            ("2026 plans", "2026-plans"),
            ("Ünïcode", "ünïcode"),
            ("!!!", ""),
        ];
        for (input, want) in cases {
            assert_eq!(slug(input), want, "{input}");
        }
    }

    #[test]
    fn headings_link_to_themselves() {
        let html = md("## Signals\n\ntext\n\n### Sub `code`\n\n## Signals\n").unwrap();
        assert!(
            html.contains("<h2 id=\"signals\"><a href=\"#signals\">Signals</a></h2>"),
            "{html}"
        );
        assert!(
            html.contains(
                "<h3 id=\"sub-code\"><a href=\"#sub-code\">Sub <code>code</code></a></h3>"
            ),
            "{html}"
        );
        assert!(html.contains("<h2 id=\"signals-2\">"), "{html}");
        let html = md("## Main\n\n## Taken\n").unwrap();
        assert!(
            html.contains("id=\"main-2\"") && html.contains("id=\"taken-2\""),
            "{html}"
        );
    }

    #[test]
    fn headings_are_never_highlighted() {
        let html = md("## Rust in 2026\n").unwrap();
        assert!(!html.contains("span"), "{html}");
    }

    #[test]
    fn heading_rules() {
        fails(
            "# Title\n",
            "content/x.md:10: the page title is the only h1",
        );
        fails(
            "text\n\n### Deep\n",
            "content/x.md:12: h3 skips a level after h1",
        );
        fails("## A\n\n#### B\n", "h4 is too deep");
        fails("## A [link](/x/)\n", "headings link to themselves");
        fails("## !!!\n", "no letters or digits");
    }

    #[test]
    fn raw_html_is_rejected() {
        fails("<div>x</div>\n", "raw HTML is not allowed");
        fails("a <b>bold</b> move\n", "raw HTML is not allowed");
        fails("<!-- note -->\n", "raw HTML is not allowed");
    }

    #[test]
    fn links_must_be_absolute() {
        fails(
            "[x](projects/kerms/)\n",
            "link `projects/kerms/`: links must be site-absolute",
        );
        fails("[x](//evil.example/)\n", "links must be site-absolute");
        let html =
            md("[a](/a/) [b](#b) [c](https://c.example/) [d](mailto:d@e.f) <g@h.i>\n").unwrap();
        assert!(html.contains("href=\"mailto:g@h.i\""), "{html}");
    }

    #[test]
    fn images_need_alt_and_a_real_file() {
        let html = md("![A dot](/dot.png \"Dot\")\n").unwrap();
        assert!(
            html.contains(
                "<img src=\"/dot.png\" alt=\"A dot\" width=\"3\" height=\"2\" title=\"Dot\" loading=\"lazy\">"
            ),
            "{html}"
        );
        fails("![](/dot.png)\n", "needs alt text");
        fails("![x](/missing.png)\n", "does not exist under static/");
        fails("![x](dot.png)\n", "must be a site-absolute path");
        fails(
            "![x](https://e.example/a.png)\n",
            "must be a site-absolute path",
        );
        fails("![x](/../Cargo.toml)\n", "must not contain");
    }

    #[test]
    fn highlights_prose_but_not_code_or_links() {
        let html = md(
            "Rust in 2026, `Rust 5`, [Rust 5](/x/), *5K* users.\n\n- 10k notes\n\n> 2nd place\n\n| a |\n|---|\n| 40 |\n\n```\nRust 5\n```\n",
        )
        .unwrap();
        let want = [
            "<p><span class=\"t\">Rust</span> in <span class=\"n\">2026</span>, <code>Rust 5</code>, <a href=\"/x/\">Rust 5</a>, <em><span class=\"n\">5K</span></em> users.</p>",
            "<li><span class=\"n\">10k</span> notes</li>",
            "<blockquote>\n<p><span class=\"n\">2nd</span> place</p>",
            "<td><span class=\"n\">40</span></td>",
            "<pre><code>Rust 5\n</code></pre>",
        ];
        for piece in want {
            assert!(html.contains(piece), "missing {piece:?} in {html}");
        }
    }

    #[test]
    fn joins_split_text_before_highlighting() {
        let html = md("C++ & 5 < 6\n").unwrap();
        assert_eq!(
            html,
            "<p><span class=\"t\">C++</span> &amp; <span class=\"n\">5</span> &lt; <span class=\"n\">6</span></p>\n"
        );
    }

    #[test]
    fn smart_punctuation_is_off() {
        let html = md("\"quoted\" -- it's\n").unwrap();
        assert_eq!(html, "<p>&quot;quoted&quot; -- it's</p>\n");
    }

    #[test]
    fn strikethrough_and_tables_are_on() {
        let html = md("~~gone~~\n\n| a | b |\n|---|---|\n| x | y |\n").unwrap();
        assert!(
            html.contains("<del>gone</del>")
                && html.contains("<div class=\"scroll\"><table>")
                && html.trim_end().ends_with("</table>\n</div>"),
            "{html}"
        );
    }

    #[test]
    fn inline_footer() {
        let html = render_inline(
            "Written in Rust. [Source](https://example.com/).",
            "content/site.toml",
        )
        .unwrap();
        assert_eq!(
            html,
            "<p>Written in Rust. <a href=\"https://example.com/\">Source</a>.</p>\n"
        );
        assert!(render_inline("one\n\ntwo", "s").is_err());
        assert!(render_inline("# no", "s").is_err());
        assert!(render_inline("a <b>c</b>", "s").is_err());
        assert!(
            render_inline("[x](rel/)", "s")
                .unwrap_err()
                .message
                .contains("site-absolute")
        );
    }
}
