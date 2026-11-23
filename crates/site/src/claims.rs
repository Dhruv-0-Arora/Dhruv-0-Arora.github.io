use scraper::Html;

use crate::problem::Problem;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Phrase {
    pub line: usize,
    pub text: String,
}

pub fn blocklist(display: &str, text: &str) -> Result<Vec<Phrase>, Problem> {
    let mut lines = text.lines().enumerate();
    if !lines.any(|(_, line)| line.trim_end() == "```blocklist") {
        return Err(Problem::new(display, "has no ```blocklist fenced block"));
    }
    let mut phrases = Vec::new();
    for (n, line) in lines {
        if line.trim_end() == "```" {
            return Ok(phrases);
        }
        let phrase = normalize(line).0.trim().to_owned();
        if !phrase.is_empty() {
            phrases.push(Phrase {
                line: n + 1,
                text: phrase,
            });
        }
    }
    Err(Problem::new(
        display,
        "the ```blocklist block is never closed",
    ))
}

fn normalize(text: &str) -> (String, Vec<usize>) {
    let mut out = String::with_capacity(text.len());
    let mut lines = Vec::with_capacity(text.len());
    let mut line = 1;
    let mut in_space = false;
    for c in text.chars() {
        if c.is_whitespace() {
            if !in_space {
                out.push(' ');
                lines.push(line);
                in_space = true;
            }
            if c == '\n' {
                line += 1;
            }
            continue;
        }
        in_space = false;
        for lower in c.to_lowercase() {
            out.push(lower);
            lines.extend(std::iter::repeat_n(line, lower.len_utf8()));
        }
    }
    (out, lines)
}

fn blocked(claims: &str, phrase: &Phrase) -> String {
    format!("contains a blocked phrase ({claims}:{})", phrase.line)
}

pub fn scan(claims: &str, phrases: &[Phrase], display: &str, text: &str) -> Vec<Problem> {
    let (normalized, lines) = normalize(text);
    let mut problems = Vec::new();
    for phrase in phrases {
        for (at, _) in normalized.match_indices(&phrase.text) {
            problems.push(Problem::at(display, lines[at], blocked(claims, phrase)));
        }
    }
    problems
}

pub fn scan_page(claims: &str, phrases: &[Phrase], display: &str, html: &str) -> Vec<Problem> {
    let mut problems = scan(claims, phrases, display, html);
    let text: String = Html::parse_document(html).root_element().text().collect();
    let (normalized, _) = normalize(&text);
    for phrase in phrases {
        let raw_hit = problems
            .iter()
            .any(|p| p.message == blocked(claims, phrase));
        if !raw_hit && normalized.contains(&phrase.text) {
            problems.push(Problem::new(
                display,
                format!("page text {}", blocked(claims, phrase)),
            ));
        }
    }
    problems
}

#[cfg(test)]
mod tests {
    use super::{Phrase, blocklist, scan, scan_page};

    const FIXTURE: &str = "# Claims\n\nNever say these.\n\n```blocklist\nSecret   Client\n\n  forbidden word  \nrank 2nd place\n```\n\n```blocklist\nignored\n```\n";

    fn found(problems: &[crate::problem::Problem]) -> Vec<String> {
        problems.iter().map(ToString::to_string).collect()
    }

    #[test]
    fn reads_the_first_blocklist_block_normalised() {
        let phrases = blocklist("claims.md", FIXTURE).unwrap();
        assert_eq!(
            phrases,
            vec![
                Phrase {
                    line: 6,
                    text: "secret client".into()
                },
                Phrase {
                    line: 8,
                    text: "forbidden word".into()
                },
                Phrase {
                    line: 9,
                    text: "rank 2nd place".into()
                },
            ]
        );
    }

    #[test]
    fn rejects_files_without_a_block() {
        assert!(
            blocklist("c", "no block\n```text\nx\n```\n")
                .unwrap_err()
                .message
                .contains("no ```blocklist")
        );
        assert!(
            blocklist("c", "```blocklist\nx\n")
                .unwrap_err()
                .message
                .contains("never closed")
        );
    }

    #[test]
    fn matches_case_insensitively_with_lines() {
        let phrases = blocklist("claims.md", FIXTURE).unwrap();
        let problems = scan(
            "claims.md",
            &phrases,
            "content/a.md",
            "fine\nfor the SECRET client today\nA Forbidden Word.\n",
        );
        assert_eq!(
            found(&problems),
            vec![
                "content/a.md:2: contains a blocked phrase (claims.md:6)",
                "content/a.md:3: contains a blocked phrase (claims.md:8)",
            ]
        );
    }

    #[test]
    fn matches_across_line_breaks_and_doubled_spaces() {
        let phrases = blocklist("claims.md", FIXTURE).unwrap();
        let problems = scan(
            "claims.md",
            &phrases,
            "content/a.md",
            "one\nthe secret\n   client\nand forbidden  \t word\n",
        );
        assert_eq!(
            found(&problems),
            vec![
                "content/a.md:2: contains a blocked phrase (claims.md:6)",
                "content/a.md:4: contains a blocked phrase (claims.md:8)",
            ]
        );
    }

    #[test]
    fn matches_page_text_through_markup() {
        let phrases = blocklist("claims.md", FIXTURE).unwrap();
        let html = "<html><body><p>We rank <span class=\"n\">2nd</span>\n place &amp; more</p></body></html>";
        assert_eq!(
            found(&scan_page("claims.md", &phrases, "dist/a.html", html)),
            vec!["dist/a.html: page text contains a blocked phrase (claims.md:9)"]
        );
    }

    #[test]
    fn matches_attributes_in_raw_html_once() {
        let phrases = blocklist("claims.md", FIXTURE).unwrap();
        let html = "<html><body>\n<img alt=\"A Secret Client\" src=\"/x.png\"></body></html>";
        assert_eq!(
            found(&scan_page("claims.md", &phrases, "dist/a.html", html)),
            vec!["dist/a.html:2: contains a blocked phrase (claims.md:6)"]
        );
    }
}
