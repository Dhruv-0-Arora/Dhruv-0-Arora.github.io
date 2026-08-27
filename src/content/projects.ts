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
    slug: "dirnt",
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
    slug: "wisconsin-racing",
    accent: "amber",
    tagline:
      "Battery management and ESP32 display drivers for a Formula SAE car.",
    tech: ["C", "ESP32", "Embedded"],
    tier: "compact",
  },
  {
    name: "Nazar",
    slug: "nazar",
    accent: "violet",
    tagline:
      "An offline AI that works out why a machine broke, and refuses to run the fix.",
    description:
      "My team built it in a day at the Dell x NVIDIA hackathon and placed 2nd of 40 teams. About 430 lines of dependency-free bash collect evidence from the sick machine, a two-layer graph walks from symptom to cause, and a local model writes a report where every claim footnotes a real line in a real file. It writes the fix and never runs it.",
    tech: ["Python", "FastAPI", "Ollama", "networkx", "React"],
    repo: "https://github.com/Dhruv-0-Arora/Nazar",
    tier: "featured",
    highlight: "2nd of 40 teams",
  },
  {
    name: "Orion",
    slug: "orion",
    accent: "rose",
    tagline:
      "A raw photo editor I contribute to. 24 MP re-renders in about 8 ms.",
    description:
      "A C++20 engine drives a 27-node Metal compute graph, so moving a slider recomputes only what sits downstream. Every non-trivial filter cites a published paper. Orion is a project I work on with Aditya Bankoti; the numbers describe the project, not my share of it.",
    tech: ["C++20", "Metal", "Slang", "SwiftUI"],
    repo: "https://github.com/Nano-AI/Orion",
    demo: "https://nano-ai.github.io/Orion/",
    tier: "featured",
    highlight: "24 MP raw in ~8 ms",
  },
  {
    name: "Cypher",
    slug: "cypher",
    accent: "sky",
    tagline:
      "Conflict reports fused onto one live risk map, where corroboration raises confidence.",
    description:
      "My team's entry at CascadiaJS 2026, where it placed 3rd. It scrapes early on-the-ground reports, archives the raw payloads before anything touches them, and merges reports within about 5 km and 6 hours into one event. Five posts about one explosion become one brighter dot, not five scary ones.",
    tech: ["Python", "XGBoost", "PyTorch", "React", "MapLibre"],
    repo: "https://github.com/Dhruv-0-Arora/Cypher",
    tier: "featured",
    highlight: "3rd, CascadiaJS 2026",
  },
  {
    name: "AltiGoz",
    slug: "altigoz",
    accent: "rose",
    tagline:
      "Pedestrian-safety routing for Seattle, read from 646 live traffic cameras.",
    tech: ["Python", "VLM", "DGX Spark", "geospatial"],
    repo: "https://github.com/BerkM125/AltiGoz",
    tier: "compact",
    highlight: "646 cameras",
  },
  {
    name: "IMC Prosperity 4",
    slug: "imc-prosperity-4",
    accent: "amber",
    tagline:
      "A market maker for a two-week trading competition, with the losing rounds published.",
    tech: ["Python", "market making", "options"],
    repo: "https://github.com/Dhruv-0-Arora/imc-prosperity-4",
    tier: "compact",
    highlight: "+114,664 in round 3",
  },
  {
    name: "Agentic CAD Spike",
    slug: "agentic-cad-spike",
    accent: "sky",
    tagline:
      "Describe a part in chat and it appears, on a B-rep kernel I wrote in Rust.",
    tech: ["Rust", "Python", "OCCT", "React"],
    tier: "compact",
    highlight: "own B-rep kernel",
  },
  {
    name: "Government platform",
    slug: "swiftlabs-platform",
    accent: "sky",
    tagline:
      "I built and maintain a production platform for a US state government client.",
    tech: ["React", "Express", "Firebase", "Tailwind CSS", "Vite", "Vercel"],
    tier: "compact",
    highlight: "2,000+ users",
  },
  {
    name: "stalk",
    slug: "stalk",
    accent: "green",
    tagline: "My own 3x6 ortholinear split keyboard, named for a bamboo stem.",
    tech: ["keyboard design", "PCB"],
    tier: "compact",
  },
];

export const featuredProjects = projects.filter((p) => p.tier === "featured");
export const compactProjects = projects.filter((p) => p.tier === "compact");
