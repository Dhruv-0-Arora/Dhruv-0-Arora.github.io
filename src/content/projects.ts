import type { Project } from "./types";

export const projects: Project[] = [
  {
    name: "Synthesis",
    slug: "synthesis",
    accent: "amber",
    tagline:
      "Open source robotics simulator for FIRST students, built at Autodesk.",
    description:
      "A web-based simulator that lets FIRST robotics teams import their Fusion CAD designs as Mirabuf files and drive them in a physics simulation before the real robot exists. I develop and market it as an Autodesk software engineering intern, and presented its core value proposition to Autodesk's EVP and executive team.",
    tech: ["C#", "React", "TypeScript", "Three.js", "Protobuf"],
    repo: "https://github.com/Autodesk/synthesis",
    demo: "https://synthesis.autodesk.com",
    tier: "featured",
    highlight: "5K+ users",
  },
  {
    name: "astute",
    slug: "astute",
    accent: "green",
    tagline: "A terminal-native second brain that ranks what to do next.",
    description:
      "Rust CLI for instant todo capture with effort, importance, and due-date metadata. Ranks tasks by slack (remaining time vs effort), renders a wikilink knowledge graph in an interactive TUI explorer, and speaks TOON - a token-efficient output format designed for LLM agents.",
    tech: ["Rust", "TUI", "Knowledge graphs"],
    repo: "https://github.com/Dhruv-0-Arora/astute",
    tier: "featured",
    highlight: "0% idle CPU, ms cold start",
  },
  {
    name: "kerms",
    slug: "kerms",
    accent: "sky",
    tagline: "Prediction-market trading system for Kalshi.",
    description:
      "Scans live Kalshi markets against weather ensembles, macro nowcasts, and behavioral base rates. Sizes positions with quarter-Kelly staking, places post-only limit orders ranked by edge and confidence, and babysits them with cron-safe order management plus a leak-free backtesting engine.",
    tech: ["Python", "Pandas", "Backtesting"],
    repo: "https://github.com/Dhruv-0-Arora/kerms",
    tier: "featured",
    highlight: "3 signal engines",
  },
  {
    name: "fegis",
    slug: "fegis",
    accent: "violet",
    tagline: "Chrome extension that redacts PII before it reaches AI chatbots.",
    description:
      "MV3 extension with regex and ML engines detecting 12 PII types across ChatGPT, Claude, Gemini, and more. Scans PDFs, DOCX, and images client-side with Tesseract.js OCR in offscreen documents - nothing ever leaves the device. Built at a hackathon.",
    tech: ["TypeScript", "TensorFlow.js", "Chrome MV3", "Tesseract.js"],
    repo: "https://github.com/Dhruv-0-Arora/fegis",
    demo: "https://fegis.vercel.app",
    tier: "featured",
    highlight: "12 PII types, fully local",
  },
  {
    name: "Asclepion",
    slug: "asclepion",
    accent: "rose",
    tagline: "Clinical reasoning assistant powered by a local LLM.",
    description:
      "Maps patient symptoms to potential diagnoses through an interactive graph visualization, driven entirely by a local model. A PyTorch BERT model trained on medical billing data scores diagnosis-to-item relevance and generates itemized bills from raw patient notes. Built at a hackathon.",
    tech: ["React", "TypeScript", "PyTorch", "Ollama", "Sigma.js"],
    repo: "https://github.com/Dhruv-0-Arora/Asclepion",
    tier: "featured",
    highlight: "runs fully offline",
  },
  {
    name: "gcal-axi",
    accent: "sky",
    tagline:
      "Google Calendar CLI with token-efficient TOON output for LLM agents.",
    tech: ["CLI", "TOON", "Google Calendar API"],
    repo: "https://github.com/Dhruv-0-Arora/gcal-axi",
    tier: "compact",
  },
  {
    name: "monkeytype-tui",
    accent: "amber",
    tagline: "Monkeytype typing practice, rebuilt for the terminal in ratatui.",
    tech: ["Rust", "ratatui"],
    repo: "https://github.com/Dhruv-0-Arora/monkeytype-tui",
    tier: "compact",
  },
  {
    name: "dirnt",
    accent: "green",
    tagline:
      "Directory lister sorted by recency, tinted on a perceptual Oklab age gradient.",
    tech: ["Rust", "Oklab"],
    repo: "https://github.com/Dhruv-0-Arora/dirnt",
    tier: "compact",
  },
  {
    name: "GitHub CLI Reviews Tool",
    accent: "violet",
    tagline:
      "gh extension listing PRs that want your review, ranked by urgency.",
    tech: ["Rust", "GraphQL", "gh extension"],
    repo: "https://github.com/Dhruv-0-Arora",
    tier: "compact",
  },
  {
    name: "obsidian-agile",
    accent: "rose",
    tagline: "Fork of obsidian-kanban with agile-focused board workflows.",
    tech: ["TypeScript", "Obsidian"],
    repo: "https://github.com/Dhruv-0-Arora/obsidian-agile",
    tier: "compact",
  },
  {
    name: "obsidian-firestorage",
    accent: "sky",
    tagline: "Encrypted cloud sync plugin for Obsidian vaults.",
    tech: ["TypeScript", "Obsidian", "Firebase"],
    repo: "https://github.com/Dhruv-0-Arora/obsidian-firestorage",
    tier: "compact",
  },
  {
    name: "Soundwave",
    accent: "green",
    tagline:
      "TensorFlow accent-localization model - $150K letter of intent, 1st globally at TiE YE.",
    tech: ["TensorFlow", "MFCCs", "MATLAB"],
    repo: "https://github.com/Dhruv-0-Arora/soundwave",
    tier: "compact",
  },
  {
    name: "Wisconsin Racing",
    accent: "amber",
    tagline:
      "Battery management and ESP32 display drivers for a Formula SAE car.",
    tech: ["C", "ESP32", "Embedded"],
    tier: "compact",
  },
];

export const featuredProjects = projects.filter((p) => p.tier === "featured");
export const compactProjects = projects.filter((p) => p.tier === "compact");
