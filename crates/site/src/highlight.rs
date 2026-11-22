use std::collections::BTreeSet;

const UNITS: [&str; 12] = [
    "ms", "st", "nd", "rd", "th", "k", "K", "M", "B", "%", "x", "s",
];

#[derive(Debug, Clone, Default)]
pub struct Highlighter {
    names: Vec<String>,
}

impl Highlighter {
    pub fn new<I, S>(names: I, skip: &[String]) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        let unique: BTreeSet<String> = names
            .into_iter()
            .map(Into::into)
            .filter(|name| !name.is_empty() && !skip.contains(name))
            .collect();
        let mut names: Vec<String> = unique.into_iter().collect();
        names.sort_by(|a, b| b.len().cmp(&a.len()).then_with(|| a.cmp(b)));
        Self { names }
    }

    pub fn html(&self, text: &str) -> String {
        let mut out = String::with_capacity(text.len());
        let mut plain_start = 0;
        let mut number_end = None;
        let mut i = 0;
        while i < text.len() {
            let token = self
                .name_at(text, i)
                .map(|end| (end, "t"))
                .or_else(|| number_at(text, i, number_end).map(|end| (end, "n")));
            if let Some((end, class)) = token {
                out.push_str(&escape(&text[plain_start..i]));
                out.push_str("<span class=\"");
                out.push_str(class);
                out.push_str("\">");
                out.push_str(&escape(&text[i..end]));
                out.push_str("</span>");
                if class == "n" {
                    number_end = Some(end);
                }
                plain_start = end;
                i = end;
            } else {
                i += text[i..].chars().next().map_or(1, char::len_utf8);
            }
        }
        out.push_str(&escape(&text[plain_start..]));
        out
    }

    fn name_at(&self, text: &str, i: usize) -> Option<usize> {
        if before(text, i).is_some_and(char::is_alphanumeric) {
            return None;
        }
        let rest = &text[i..];
        self.names
            .iter()
            .find(|name| {
                rest.starts_with(name.as_str())
                    && !after(text, i + name.len()).is_some_and(char::is_alphanumeric)
            })
            .map(|name| i + name.len())
    }
}

pub fn escape(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    for c in text.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            _ => out.push(c),
        }
    }
    out
}

fn before(text: &str, i: usize) -> Option<char> {
    text[..i].chars().next_back()
}

fn after(text: &str, i: usize) -> Option<char> {
    text[i..].chars().next()
}

fn opens_token(c: Option<char>) -> bool {
    c.is_none_or(|c| c.is_whitespace() || matches!(c, '(' | '[' | '/'))
}

fn starts_number(text: &str, i: usize, number_end: Option<usize>) -> bool {
    match before(text, i) {
        Some('-') => number_end == Some(i - 1) || opens_token(before(text, i - 1)),
        other => opens_token(other),
    }
}

fn number_at(text: &str, i: usize, number_end: Option<usize>) -> Option<usize> {
    let bytes = text.as_bytes();
    let signed = matches!(bytes[i], b'+' | b'-' | b'<' | b'>')
        && before(text, i).is_none_or(|c| c.is_whitespace() || c == '(');
    let prefixed = signed || matches!(bytes[i], b'~' | b'$');
    let digits_start = i + usize::from(prefixed);
    if !bytes.get(digits_start).is_some_and(u8::is_ascii_digit)
        || !(signed || starts_number(text, i, number_end))
    {
        return None;
    }
    if !prefixed {
        for shape in ["dddd-dd-dd", "dddd-dd"] {
            let end = i + shape.len();
            if matches_shape(bytes, i, shape) && ends_token(text, end) {
                return Some(end);
            }
        }
    }
    let mut j = digits_run(bytes, digits_start);
    if j - digits_start <= 3 {
        while bytes.get(j) == Some(&b',') && digits_run(bytes, j + 1) == j + 4 {
            j += 4;
        }
    }
    if bytes.get(j) == Some(&b'.') && bytes.get(j + 1).is_some_and(u8::is_ascii_digit) {
        j = digits_run(bytes, j + 1);
    }
    if let Some(unit) = UNITS.iter().find(|unit| text[j..].starts_with(*unit)) {
        j += unit.len();
    }
    if bytes.get(j) == Some(&b'+') {
        j += 1;
    }
    ends_token(text, j).then_some(j)
}

fn digits_run(bytes: &[u8], from: usize) -> usize {
    from + bytes[from.min(bytes.len())..]
        .iter()
        .take_while(|b| b.is_ascii_digit())
        .count()
}

fn matches_shape(bytes: &[u8], at: usize, shape: &str) -> bool {
    shape.bytes().enumerate().all(|(k, s)| {
        bytes.get(at + k).is_some_and(|&b| {
            if s == b'd' {
                b.is_ascii_digit()
            } else {
                b == s
            }
        })
    })
}

fn ends_token(text: &str, end: usize) -> bool {
    let bytes = text.as_bytes();
    match after(text, end) {
        Some(c) if c.is_alphanumeric() => false,
        Some('.' | ',') => !bytes.get(end + 1).is_some_and(u8::is_ascii_digit),
        _ => true,
    }
}

#[cfg(test)]
mod tests {
    use super::{Highlighter, escape};

    fn n(s: &str) -> String {
        format!("<span class=\"n\">{s}</span>")
    }

    fn t(s: &str) -> String {
        format!("<span class=\"t\">{s}</span>")
    }

    fn plain() -> Highlighter {
        Highlighter::new(Vec::<String>::new(), &[])
    }

    #[test]
    fn marks_numbers() {
        let cases = [
            "5K",
            "20K+",
            "2,000+",
            "230",
            "10k",
            "0.0%",
            "~40",
            "2nd",
            "2026",
            "2024-06",
            "2026-10-28",
            "$5",
            "1st",
            "3rd",
            "4th",
            "10x",
            "12ms",
            "3s",
            "1.5M",
            "2B",
            "1,234,567.89",
        ];
        for case in cases {
            assert_eq!(plain().html(case), n(case), "{case}");
        }
    }

    #[test]
    fn leaves_non_numbers_alone() {
        let cases = [
            "3D",
            "H1",
            "V8",
            "C++20",
            "qwen3.5",
            "x86",
            "i5-12600K",
            "1.2.3",
            "1,00",
            "5sec",
            "0x1F",
            "abc123",
            "v2",
            "5%a",
            "~",
            "$",
            "-",
            "12.",
        ];
        for case in cases {
            let got = plain().html(case);
            if case == "12." {
                assert_eq!(got, format!("{}.", n("12")));
            } else {
                assert!(!got.contains("class=\"n\""), "{case} gave {got}");
            }
        }
    }

    #[test]
    fn numbers_in_context() {
        let cases = [
            (
                "5K to 20K+ users",
                format!("{} to {} users", n("5K"), n("20K+")),
            ),
            (
                "230 ms cold reindex",
                format!("{} ms cold reindex", n("230")),
            ),
            ("(40 teams)", format!("({} teams)", n("40"))),
            ("[3]", format!("[{}]", n("3"))),
            ("1/2", format!("{}/{}", n("1"), n("2"))),
            ("2024-2026", format!("{}-{}", n("2024"), n("2026"))),
            ("-40", n("-40")),
            ("from 3 -5", format!("from {} {}", n("3"), n("-5"))),
            ("+114,664 stars", format!("{} stars", n("+114,664"))),
            ("down -667", format!("down {}", n("-667"))),
            ("<10 ms", format!("{} ms", n("&lt;10"))),
            ("uptime >99%", format!("uptime {}", n("&gt;99%"))),
            ("(+5)", format!("({})", n("+5"))),
            ("(-2.5x)", format!("({})", n("-2.5x"))),
            (
                "an 8-crate workspace",
                format!("an {}-crate workspace", n("8")),
            ),
            ("re-run 3", format!("re-run {}", n("3"))),
            ("C++20 and a+5", "C++20 and a+5".to_owned()),
            ("x<10", "x&lt;10".to_owned()),
            ("[-5]", format!("[-{}]", n("5"))),
            ("-- 5", format!("-- {}", n("5"))),
            ("+ 5", format!("+ {}", n("5"))),
            ("++5", "++5".to_owned()),
            ("end at 5.", format!("end at {}.", n("5"))),
            ("10, 20", format!("{}, {}", n("10"), n("20"))),
            ("a-5", "a-5".to_owned()),
            ("x5", "x5".to_owned()),
            ("is 2nd of 40", format!("is {} of {}", n("2nd"), n("40"))),
            ("on 2024-06.", format!("on {}.", n("2024-06"))),
        ];
        for (input, want) in cases {
            assert_eq!(plain().html(input), want, "{input}");
        }
    }

    #[test]
    fn marks_tech_names() {
        let h = Highlighter::new(
            [
                "Rust",
                "C++",
                "C#",
                "Node.js",
                ".NET",
                "Kalshi API",
                "Kalshi",
                "Go",
                "cron",
                "R",
            ],
            &[],
        );
        let cases = [
            ("Rust", t("Rust")),
            ("Rusty", "Rusty".to_owned()),
            ("TrustRust", "TrustRust".to_owned()),
            ("in Rust.", format!("in {}.", t("Rust"))),
            ("C++ and C#", format!("{} and {}", t("C++"), t("C#"))),
            ("C++20", "C++20".to_owned()),
            ("Node.js tools", format!("{} tools", t("Node.js"))),
            ("on .NET", format!("on {}", t(".NET"))),
            ("x.NET", "x.NET".to_owned()),
            (
                "the Kalshi API docs",
                format!("the {} docs", t("Kalshi API")),
            ),
            ("Kalshi markets", format!("{} markets", t("Kalshi"))),
            ("Google", "Google".to_owned()),
            ("Go, R", format!("{}, {}", t("Go"), t("R"))),
            ("rust", "rust".to_owned()),
            ("from cron", format!("from {}", t("cron"))),
        ];
        for (input, want) in cases {
            assert_eq!(h.html(input), want, "{input}");
        }
    }

    #[test]
    fn names_win_over_numbers_and_never_nest() {
        let h = Highlighter::new(["5G", "Python 3", "2nd Brain"], &[]);
        assert_eq!(h.html("5G and 5"), format!("{} and {}", t("5G"), n("5")));
        assert_eq!(h.html("Python 3.12"), format!("{}.12", t("Python 3")));
        assert_eq!(h.html("my 2nd Brain"), format!("my {}", t("2nd Brain")));
    }

    #[test]
    fn skip_list_removes_names() {
        let h = Highlighter::new(["Go", "C", "Rust"], &["Go".to_owned(), "C".to_owned()]);
        assert_eq!(h.html("Go C Rust"), format!("Go C {}", t("Rust")));
    }

    #[test]
    fn escapes_everything_else() {
        let h = Highlighter::new(["AT&T", "<T>"], &[]);
        assert_eq!(h.html("a < b & c"), "a &lt; b &amp; c");
        assert_eq!(
            h.html("AT&T has 5"),
            format!("{} has {}", t("AT&amp;T"), n("5"))
        );
        assert_eq!(
            h.html("<T> 5>"),
            format!("{} {}&gt;", t("&lt;T&gt;"), n("5"))
        );
        assert_eq!(h.html("\"5\""), "&quot;5&quot;");
        assert_eq!(h.html("<script>"), "&lt;script&gt;");
    }

    #[test]
    fn handles_unicode_around_tokens() {
        assert_eq!(plain().html("é5"), "é5");
        assert_eq!(plain().html("5é"), "5é");
        assert_eq!(plain().html("→ 5 ←"), format!("→ {} ←", n("5")));
    }

    #[test]
    fn escape_is_plain() {
        assert_eq!(escape("a&b<c>\"d'"), "a&amp;b&lt;c&gt;&quot;d'");
    }
}
