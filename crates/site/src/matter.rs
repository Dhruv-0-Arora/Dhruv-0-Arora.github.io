use serde::Deserialize;
use serde::de::DeserializeOwned;

use crate::problem::{Problem, line_of};

pub const DESCRIPTION_CHARS: std::ops::RangeInclusive<usize> = 40..=160;

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Site {
    pub title: String,
    pub url: String,
    pub footer: String,
    #[serde(default)]
    pub vocabulary: Vec<String>,
    #[serde(default)]
    pub vocabulary_skip: Vec<String>,
    #[serde(default)]
    pub links: Vec<Link>,
    #[serde(default)]
    pub elsewhere: Vec<Elsewhere>,
    pub corner: Option<CornerSource>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CornerSource {
    pub model: String,
    pub href: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Link {
    pub title: String,
    pub href: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Elsewhere {
    pub label: String,
    pub href: String,
    pub text: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Home {
    #[serde(rename = "kind")]
    _kind: String,
    pub title: String,
    pub description: String,
    pub nav: Option<String>,
    pub order: Option<i64>,
    pub lede: String,
    pub selected: String,
    pub all: String,
    pub elsewhere: String,
    pub corner_label: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Section {
    #[serde(rename = "kind")]
    _kind: String,
    pub title: String,
    pub description: String,
    pub nav: Option<String>,
    pub order: Option<i64>,
    pub lede: String,
    pub groups: Vec<Group>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Group {
    pub id: String,
    pub title: String,
    pub blurb: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Project {
    #[serde(rename = "kind")]
    _kind: String,
    pub title: String,
    pub description: String,
    pub nav: Option<String>,
    pub order: Option<i64>,
    pub summary: String,
    pub note: Option<String>,
    pub group: String,
    pub featured: Option<i64>,
    pub tech: Vec<String>,
    pub role: String,
    pub when: String,
    #[serde(default)]
    pub links: Vec<ProjectLink>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ProjectLink {
    pub label: String,
    pub href: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Page {
    #[serde(rename = "kind")]
    _kind: String,
    pub title: String,
    pub description: String,
    pub nav: Option<String>,
    pub order: Option<i64>,
    pub lede: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Gallery {
    #[serde(rename = "kind")]
    _kind: String,
    pub title: String,
    pub description: String,
    pub nav: Option<String>,
    pub order: Option<i64>,
    pub lede: Option<String>,
    pub photos: Vec<Photo>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Photo {
    pub slug: String,
    pub alt: String,
    pub place: String,
}

pub const RESERVED_PHOTO_SLUGS: [&str; 2] = ["main", "photos"];
pub const THUMB_PREFIX: &str = "t-";

#[derive(Debug, Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NotFound {
    #[serde(rename = "kind")]
    _kind: String,
    pub title: String,
    pub description: String,
    pub nav: Option<String>,
    pub order: Option<i64>,
}

#[derive(Debug, Clone)]
pub enum Matter {
    Home(Home),
    Section(Section),
    Project(Project),
    Page(Page),
    Gallery(Gallery),
    NotFound(NotFound),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    Home,
    Section,
    Project,
    Page,
    Gallery,
    NotFound,
}

impl Kind {
    pub fn name(self) -> &'static str {
        match self {
            Kind::Home => "home",
            Kind::Section => "section",
            Kind::Project => "project",
            Kind::Page => "page",
            Kind::Gallery => "gallery",
            Kind::NotFound => "notfound",
        }
    }
}

pub struct Common<'a> {
    pub title: &'a str,
    pub description: &'a str,
    pub nav: Option<&'a str>,
    pub order: Option<i64>,
}

impl Matter {
    pub fn kind(&self) -> Kind {
        match self {
            Matter::Home(_) => Kind::Home,
            Matter::Section(_) => Kind::Section,
            Matter::Project(_) => Kind::Project,
            Matter::Page(_) => Kind::Page,
            Matter::Gallery(_) => Kind::Gallery,
            Matter::NotFound(_) => Kind::NotFound,
        }
    }

    pub fn common(&self) -> Common<'_> {
        macro_rules! common {
            ($m:expr) => {
                Common {
                    title: &$m.title,
                    description: &$m.description,
                    nav: $m.nav.as_deref(),
                    order: $m.order,
                }
            };
        }
        match self {
            Matter::Home(m) => common!(m),
            Matter::Section(m) => common!(m),
            Matter::Project(m) => common!(m),
            Matter::Page(m) => common!(m),
            Matter::Gallery(m) => common!(m),
            Matter::NotFound(m) => common!(m),
        }
    }
}

pub struct Source {
    pub matter: Matter,
    pub body: String,
    pub body_line: usize,
}

pub fn split(path: &str, text: &str) -> Result<(String, String, usize), Problem> {
    let text = text.strip_prefix('\u{feff}').unwrap_or(text);
    let Some(rest) = text
        .strip_prefix("+++\n")
        .or_else(|| text.strip_prefix("+++\r\n"))
    else {
        return Err(Problem::at(
            path,
            1,
            "a page must start with a `+++` line that opens its TOML front matter",
        ));
    };
    let mut offset = 0;
    for line in rest.split_inclusive('\n') {
        if line.trim_end_matches(['\r', '\n']) == "+++" {
            let matter = rest[..offset].to_owned();
            let body = rest[offset + line.len()..].to_owned();
            let body_line = line_of(rest, offset) + 2;
            return Ok((matter, body, body_line));
        }
        offset += line.len();
    }
    Err(Problem::new(
        path,
        "front matter is never closed; add a `+++` line after it",
    ))
}

pub fn parse_page(path: &str, text: &str) -> Result<Source, Vec<Problem>> {
    let (matter, body, body_line) = split(path, text).map_err(|p| vec![p])?;
    let kind = parse_kind(path, &matter)?;
    let parsed = match kind {
        Kind::Home => parse_toml(path, &matter, 2).map(Matter::Home),
        Kind::Section => parse_toml(path, &matter, 2).map(Matter::Section),
        Kind::Project => parse_toml(path, &matter, 2).map(Matter::Project),
        Kind::Page => parse_toml(path, &matter, 2).map(Matter::Page),
        Kind::Gallery => parse_toml(path, &matter, 2).map(Matter::Gallery),
        Kind::NotFound => parse_toml(path, &matter, 2).map(Matter::NotFound),
    }
    .map_err(|p| vec![p])?;
    let mut problems = validate(path, &parsed);
    if problems.is_empty() {
        Ok(Source {
            matter: parsed,
            body,
            body_line,
        })
    } else {
        problems.sort();
        Err(problems)
    }
}

fn parse_kind(path: &str, matter: &str) -> Result<Kind, Vec<Problem>> {
    #[derive(Deserialize)]
    struct KindOnly {
        kind: Option<toml::Value>,
    }
    let only: KindOnly = parse_toml(path, matter, 2).map_err(|p| vec![p])?;
    let kinds = ["home", "section", "project", "page", "gallery", "notfound"];
    match only.kind {
        None => Err(vec![Problem::new(
            path,
            format!(
                "front matter is missing `kind`; set it to one of {}",
                kinds.join(", ")
            ),
        )]),
        Some(toml::Value::String(kind)) => match kind.as_str() {
            "home" => Ok(Kind::Home),
            "section" => Ok(Kind::Section),
            "project" => Ok(Kind::Project),
            "page" => Ok(Kind::Page),
            "gallery" => Ok(Kind::Gallery),
            "notfound" => Ok(Kind::NotFound),
            other => Err(vec![Problem::new(
                path,
                format!(
                    "front matter field `kind`: unknown kind `{other}`; use one of {}",
                    kinds.join(", ")
                ),
            )]),
        },
        Some(_) => Err(vec![Problem::new(
            path,
            "front matter field `kind` must be a string",
        )]),
    }
}

pub fn parse_toml<T: DeserializeOwned>(
    path: &str,
    text: &str,
    first_line: usize,
) -> Result<T, Problem> {
    toml::from_str(text).map_err(|error| {
        let message = error.message().trim().to_owned();
        let Some(span) = error.span().filter(|span| span.start < text.len()) else {
            return Problem::new(path, message);
        };
        let line = line_of(text, span.start);
        let source_line = text.lines().nth(line - 1).unwrap_or("");
        let field = key_of(source_line, span.start - line_start(text, span.start));
        let line = line + first_line - 1;
        match field {
            Some(field) if !message.contains(&format!("`{field}`")) => {
                Problem::at(path, line, format!("field `{field}`: {message}"))
            }
            _ => Problem::at(path, line, message),
        }
    })
}

fn line_start(text: &str, byte: usize) -> usize {
    text[..byte].rfind('\n').map_or(0, |i| i + 1)
}

fn key_of(line: &str, column: usize) -> Option<&str> {
    let (key, _) = line.split_once('=')?;
    if column <= key.len() {
        return None;
    }
    let key = key.trim().trim_matches('"');
    (!key.is_empty() && !key.starts_with('[')).then_some(key)
}

fn validate(path: &str, matter: &Matter) -> Vec<Problem> {
    let mut problems = Vec::new();
    let common = matter.common();
    let mut need = |field: &str, value: &str| {
        if value.trim().is_empty() {
            problems.push(Problem::new(
                path,
                format!("field `{field}` must not be empty"),
            ));
        }
    };
    need("title", common.title);
    if let Some(nav) = common.nav {
        need("nav", nav);
    }
    match matter {
        Matter::Home(m) => {
            need("lede", &m.lede);
            need("selected", &m.selected);
            need("all", &m.all);
            need("elsewhere", &m.elsewhere);
            if let Some(label) = &m.corner_label {
                need("corner_label", label);
            }
        }
        Matter::Section(m) => {
            need("lede", &m.lede);
            for group in &m.groups {
                need("groups.title", &group.title);
                need("groups.blurb", &group.blurb);
            }
        }
        Matter::Project(m) => {
            need("summary", &m.summary);
            need("role", &m.role);
            need("when", &m.when);
            if let Some(note) = &m.note {
                need("note", note);
            }
            for tech in &m.tech {
                need("tech", tech);
            }
            for link in &m.links {
                need("links.label", &link.label);
                need("links.href", &link.href);
            }
        }
        Matter::Page(m) => {
            if let Some(lede) = &m.lede {
                need("lede", lede);
            }
        }
        Matter::Gallery(m) => {
            if let Some(lede) = &m.lede {
                need("lede", lede);
            }
            for photo in &m.photos {
                need("photos.alt", &photo.alt);
                need("photos.place", &photo.place);
            }
        }
        Matter::NotFound(_) => {}
    }
    if let Matter::Project(m) = matter
        && m.tech.is_empty()
    {
        problems.push(Problem::new(
            path,
            "field `tech` must list at least one entry",
        ));
    }
    if let Matter::Section(m) = matter {
        problems.extend(validate_groups(path, &m.groups));
    }
    if let Matter::Gallery(m) = matter {
        problems.extend(validate_photos(path, &m.photos));
    }
    let chars = common.description.chars().count();
    if !DESCRIPTION_CHARS.contains(&chars) {
        problems.push(Problem::new(
            path,
            format!(
                "field `description` is {chars} characters; it must be {} to {}",
                DESCRIPTION_CHARS.start(),
                DESCRIPTION_CHARS.end()
            ),
        ));
    }
    problems
}

fn validate_groups(path: &str, groups: &[Group]) -> Vec<Problem> {
    let mut problems = Vec::new();
    if groups.is_empty() {
        problems.push(Problem::new(
            path,
            "a section needs at least one `[[groups]]` entry",
        ));
    }
    let mut seen = std::collections::BTreeSet::new();
    for group in groups {
        if !is_slug(&group.id) {
            problems.push(Problem::new(
                path,
                format!(
                    "group id `{}` must be lowercase letters, digits and single dashes",
                    group.id
                ),
            ));
        }
        if !seen.insert(group.id.as_str()) {
            problems.push(Problem::new(
                path,
                format!("group id `{}` is declared twice", group.id),
            ));
        }
    }
    problems
}

fn validate_photos(path: &str, photos: &[Photo]) -> Vec<Problem> {
    let mut problems = Vec::new();
    if photos.is_empty() {
        problems.push(Problem::new(
            path,
            "a gallery needs at least one `[[photos]]` entry",
        ));
    }
    let mut seen = std::collections::BTreeSet::new();
    for photo in photos {
        let slug = photo.slug.as_str();
        if !is_slug(slug) {
            problems.push(Problem::new(
                path,
                format!("photo slug `{slug}` must be lowercase letters, digits and single dashes"),
            ));
        } else if RESERVED_PHOTO_SLUGS.contains(&slug) || slug.starts_with(THUMB_PREFIX) {
            problems.push(Problem::new(
                path,
                format!("photo slug `{slug}` is reserved; it may not be main, photos or start with {THUMB_PREFIX}"),
            ));
        }
        if !seen.insert(slug) {
            problems.push(Problem::new(
                path,
                format!("photo slug `{slug}` is used twice"),
            ));
        }
    }
    problems
}

pub fn is_slug(s: &str) -> bool {
    !s.is_empty()
        && !s.starts_with('-')
        && !s.ends_with('-')
        && !s.contains("--")
        && s.bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
}

#[cfg(test)]
mod tests {
    use super::{Matter, parse_page, split};

    const DESC: &str = "A description that is comfortably longer than forty characters.";

    fn page(matter: &str) -> String {
        format!("+++\n{matter}\ndescription = \"{DESC}\"\n+++\nBody\n")
    }

    fn errors(text: &str) -> Vec<String> {
        match parse_page("content/x.md", text) {
            Ok(_) => Vec::new(),
            Err(problems) => problems.iter().map(ToString::to_string).collect(),
        }
    }

    #[test]
    fn splits_front_matter_and_counts_body_lines() {
        let (matter, body, line) = split("p", "+++\na = 1\nb = 2\n+++\nhello\n").unwrap();
        assert_eq!(matter, "a = 1\nb = 2\n");
        assert_eq!(body, "hello\n");
        assert_eq!(line, 5);
    }

    #[test]
    fn requires_an_opening_and_closing_fence() {
        assert!(
            split("p", "title = 1\n")
                .unwrap_err()
                .message
                .contains("must start")
        );
        assert!(
            split("p", "+++\ntitle = 1\n")
                .unwrap_err()
                .message
                .contains("never closed")
        );
    }

    #[test]
    fn parses_every_kind() {
        let cases = [
            "kind = \"page\"\ntitle = \"About\"",
            "kind = \"notfound\"\ntitle = \"Not found\"",
            "kind = \"home\"\ntitle = \"H\"\nlede = \"l\"\nselected = \"s\"\nall = \"a\"\nelsewhere = \"e\"",
            "kind = \"project\"\ntitle = \"p\"\nsummary = \"s\"\ngroup = \"g\"\ntech = [\"Rust\"]\nrole = \"r\"\nwhen = \"2026\"",
        ];
        for case in cases {
            assert!(
                parse_page("p", &page(case)).is_ok(),
                "{case}: {:?}",
                errors(&page(case))
            );
        }
        let section = format!(
            "+++\nkind = \"section\"\ntitle = \"S\"\ndescription = \"{DESC}\"\nlede = \"l\"\n[[groups]]\nid = \"g\"\ntitle = \"G\"\nblurb = \"b\"\n+++\n"
        );
        let parsed = parse_page("p", &section).unwrap();
        assert!(matches!(parsed.matter, Matter::Section(s) if s.groups.len() == 1));
    }

    #[test]
    fn reports_field_errors_with_file_and_field() {
        let cases = [
            ("title = \"x\"", "missing `kind`"),
            ("kind = \"blog\"\ntitle = \"x\"", "unknown kind `blog`"),
            ("kind = 3\ntitle = \"x\"", "`kind` must be a string"),
            ("kind = \"page\"", "missing field `title`"),
            (
                "kind = \"page\"\ntitle = \"x\"\ncolour = \"red\"",
                "unknown field `colour`",
            ),
            (
                "kind = \"page\"\ntitle = \"x\"\norder = \"first\"",
                "content/x.md:4: field `order`: invalid type",
            ),
            (
                "kind = \"page\"\ntitle = 7",
                "content/x.md:3: field `title`: invalid type",
            ),
            (
                "kind = \"page\"\ntitle = \"\"",
                "field `title` must not be empty",
            ),
            (
                "kind = \"project\"\ntitle = \"p\"\nsummary = \"s\"\ngroup = \"g\"\ntech = []\nrole = \"r\"\nwhen = \"w\"",
                "field `tech` must list at least one entry",
            ),
            (
                "kind = \"project\"\ntitle = \"p\"\nsummary = \"s\"\ngroup = \"g\"\nrole = \"r\"\nwhen = \"w\"",
                "missing field `tech`",
            ),
            (
                "kind = \"project\"\ntitle = \"p\"\nsummary = \"s\"\ngroup = \"g\"\ntech = [\"a\"]\nrole = \"r\"\nwhen = \"w\"\nfeatured = \"yes\"",
                "field `featured`: invalid type",
            ),
        ];
        for (matter, want) in cases {
            let got = errors(&page(matter));
            assert!(
                got.iter()
                    .any(|e| e.contains(want) && e.starts_with("content/x.md")),
                "{matter:?}: wanted {want:?}, got {got:?}"
            );
        }
    }

    #[test]
    fn enforces_description_length() {
        let short = "+++\nkind = \"page\"\ntitle = \"x\"\ndescription = \"too short\"\n+++\n";
        assert!(errors(short)[0].contains("`description` is 9 characters; it must be 40 to 160"));
        let long = format!(
            "+++\nkind = \"page\"\ntitle = \"x\"\ndescription = \"{}\"\n+++\n",
            "a".repeat(161)
        );
        assert!(errors(&long)[0].contains("161 characters"));
    }

    #[test]
    fn checks_group_ids() {
        let text = format!(
            "+++\nkind = \"section\"\ntitle = \"S\"\ndescription = \"{DESC}\"\nlede = \"l\"\n[[groups]]\nid = \"Bad Id\"\ntitle = \"G\"\nblurb = \"b\"\n[[groups]]\nid = \"Bad Id\"\ntitle = \"G\"\nblurb = \"b\"\n+++\n"
        );
        let got = errors(&text);
        assert!(
            got.iter().any(|e| e.contains("must be lowercase")),
            "{got:?}"
        );
        assert!(got.iter().any(|e| e.contains("declared twice")), "{got:?}");
    }
}
