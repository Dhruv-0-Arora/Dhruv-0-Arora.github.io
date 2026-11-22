use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Problem {
    pub path: String,
    pub line: Option<usize>,
    pub message: String,
}

impl Problem {
    pub fn new(path: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            path: path.into(),
            line: None,
            message: message.into(),
        }
    }

    pub fn at(path: impl Into<String>, line: usize, message: impl Into<String>) -> Self {
        Self {
            path: path.into(),
            line: Some(line),
            message: message.into(),
        }
    }
}

impl fmt::Display for Problem {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.line {
            Some(line) => write!(f, "{}:{line}: {}", self.path, self.message),
            None => write!(f, "{}: {}", self.path, self.message),
        }
    }
}

pub fn line_of(text: &str, byte: usize) -> usize {
    text.get(..byte).unwrap_or(text).matches('\n').count() + 1
}
