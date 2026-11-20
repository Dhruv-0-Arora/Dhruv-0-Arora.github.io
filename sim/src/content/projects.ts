import type { Project } from "./types";

export const projects: Project[] = [
  {
    name: "Synthesis",
    slug: "synthesis",
    accent: "amber",
    tagline:
      "Open source robotics simulator for FIRST students, built at Autodesk.",
    description:
      "An open source robotics simulator for FIRST teams to import their real Fusion 360 assemblies and drive them under physics. I develop it as an Autodesk intern.",
    details: [
      "Simulates assemblies exported as Mirabuf, a Protobuf format containing the design and joint hierarchies, materials, and physical properties.",
      "Built with a C# simulation core, React and TypeScript front end, Three.js, and AWS hosting.",
      "User base grew from 5,000 to over 20,000 during my tenure.",
      "Conducted user research sessions with robotics teams and led the value proposition pitch to Autodesk executives.",
    ],
    tech: ["C#", "React", "TypeScript", "Three.js", "Protobuf"],
    repo: "https://github.com/Autodesk/synthesis",
    demo: "https://synthesis.autodesk.com",
    tier: "featured",
    highlight: "5K to 20K+ users",
  },
  {
    name: "astute",
    slug: "astute",
    accent: "green",
    tagline: "A terminal-native second brain that ranks what to do next.",
    description:
      "A terminal-native second brain with wikilinks, urgency-ranked todos, and an interactive graph view. Designed for speed: cold-start latency is the product, and the TUI idles at 0.0% CPU.",
    details: [
      "Ranks tasks by explainable urgency, factoring in effort, importance, and deadlines.",
      "Maintains a ~2 MB atomic index with CSR adjacency for instant lookups without re-reading the vault.",
      "Features a braille-rasterized graph TUI with a zero-CPU blocked event loop.",
      "Agent-native CLI emits TOON output for reliable end-to-end AI usage.",
      "Benchmarks on 10,000 notes: ~230 ms cold reindex, ~40 ms warm commands, under 10 ms index load.",
    ],
    tech: ["Rust", "ratatui", "TOON", "CSR index", "criterion"],
    tier: "featured",
    highlight: "230 ms cold reindex, 10k notes",
  },
  {
    name: "kerms",
    slug: "kerms",
    accent: "sky",
    tagline: "A signal model and maker-only trader for niche Kalshi markets.",
    description:
      "A signal model and maker-only trader for Kalshi markets. Scans live markets, prices them against calibrated external data, ranks trades by edge, and places orders from cron. Optimized for high per-trade win rate on small bets, not high returns.",
    details: [
      "Uses three signals: GFS weather ensembles, mechanical settlement favorites, and macro nowcast divergence.",
      "Trades maker-only to avoid taker fees, limits stakes to quarter-Kelly, and caps exposure per market.",
      "Runs every 30 minutes to cancel stale quotes, re-price positions, and execute take-profits.",
      "Collects historical weather ensemble data automatically to build a data flywheel for future models.",
    ],
    tech: ["Python", "Pandas", "Kalshi API", "cron", "backtesting"],
    tier: "featured",
    highlight: "quarter-Kelly, maker-only",
  },
  {
    name: "fegis",
    slug: "fegis",
    accent: "violet",
    tagline: "Chrome extension that redacts PII before it reaches AI chatbots.",
    description:
      "A Chrome extension that redacts PII before it reaches AI chatbots. My team built this at a hackathon, running ML engines entirely client-side so data never leaves the device.",
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
      "A clinical reasoning assistant built with Aditya Bankoti at a hackathon. Maps patient symptoms to potential diagnoses through an interactive graph visualization, driven entirely by an offline local model.",
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
    tagline:
      "Monkeytype in the terminal, submitting real runs to the live API. Built in a day largely with AI assistance.",
    tech: ["Rust", "ratatui", "AI-assisted"],
    repo: "https://github.com/Dhruv-0-Arora/monkeytype-tui",
    tier: "compact",
  },
  {
    name: "dirnt",
    slug: "dirnt",
    accent: "green",
    tagline:
      "Directory lister sorted by recency, tinted on a perceptual Oklab age gradient.",
    description:
      "Lists directories sorted by recency and tints each name on a perceptual Oklab age gradient, so live projects glow and stale ones fade.",
    details: [
      "Interpolates colors in Oklab on a log-scaled age for perceptually even gradients.",
      "Uses mtime for recency since APFS does not update atime on reads.",
      "Supports truecolor when available and degrades gracefully under NO_COLOR.",
    ],
    tech: ["Rust", "Oklab", "ANSI"],
    tier: "compact",
    highlight: "Oklab age gradient",
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
      "Accent-localization model that became a venture: $150K letter of intent, 1st globally at TiE Young Entrepreneurs.",
    tech: ["MFCCs", "audio ML", "MATLAB"],
    repo: "https://github.com/Dhruv-0-Arora/soundwave",
    tier: "compact",
  },
  {
    name: "Wisconsin Racing",
    slug: "wisconsin-racing",
    accent: "amber",
    tagline:
      "Battery management and ESP32 display drivers for a Formula SAE car.",
    description:
      "Embedded firmware for UW-Madison's Formula SAE car. I wrote the safety-critical battery management code that protects the high-voltage traction pack.",
    details: [
      "Implemented cell balancing, over-voltage, and under-voltage protection in C.",
      "Built an ESP32-S3 driver to parse ECU data for a 5-inch driver display.",
      "Replaced a Raspberry Pi display with a microcontroller to trade generality for lower latency and power.",
    ],
    tech: ["C", "ESP32-S3", "STM32", "CMake", "reflow"],
    tier: "compact",
    highlight: "battery safety firmware",
  },
  {
    name: "Nazar",
    slug: "nazar",
    accent: "violet",
    tagline:
      "An offline AI that works out why a machine broke, and refuses to run the fix.",
    description:
      "You wheel a box into a clinic, a factory, or a ship. It reads the broken machines, thinks about it, and tells you what went wrong. The bugs it hunts are the ones that make everything look healthy. My team built it in one day at the Dell x NVIDIA hackathon, placing 2nd of 40 teams.",
    details: [
      "Collects logs, configs, and network state using dependency-free bash scripts for offline machines.",
      "Assembles evidence into a BM25-indexed networkx graph, connecting symptoms to root causes.",
      "Runs a local qwen3.5:122b model through Ollama on a Dell Pro Max to explain its reasoning.",
      "Requires every claim to footnote a real line in a real file.",
    ],
    tech: ["Python", "FastAPI", "Ollama", "networkx", "BM25", "React", "Bash"],
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
      "A subscription-free raw photo editor for macOS. A project I work on with Aditya Bankoti, featuring a C++20 engine that drives a 27-node Metal compute graph. My commits focus on mask layers, the engine, and the app; the numbers describe the project, not my share of it.",
    details: [
      "Edits form a DAG, recalculating only downstream changes. The engine renders a 24 MP exposure change in ~8 ms.",
      "Implements published algorithms: fast guided filter, AgX display transform, and a-trous wavelet denoising.",
      "Supports linear, radial, brush, subject matte, luminance, and color range masks.",
      "Tested with 889 engine checks, 3,711 viewport checks, and real GPU renders to catch visual defects.",
      "Two shipped bugs proved that pure maths tests pass happily on code that renders garbage.",
    ],
    tech: ["C++20", "Metal", "Slang", "SwiftUI", "LibRaw"],
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
      "A live risk map that fuses conflict stories nobody is covering. If five people post about one explosion, a naive system draws five dots. My team's map merges them, raising confidence rather than lowering it. Readable by a scared civilian on a phone in daylight, not an analyst with three monitors.",
    details: [
      "Merges reports within 5 km and 6 hours into a single event to prevent duplicated panic.",
      "Scrapes news and social feeds, archiving raw payloads in Box to ensure traceability.",
      "Uses an XGBoost anomaly detector to predict onset and a GRU model to predict continuation.",
      "Publishes scores with skepticism attached, as the onset model's AUC-PR is barely better than guessing.",
    ],
    tech: ["Python", "XGBoost", "PyTorch", "FastAPI", "React", "MapLibre"],
    repo: "https://github.com/Dhruv-0-Arora/Cypher",
    tier: "featured",
    highlight: "my team, CascadiaJS 2026",
  },
  {
    name: "AltiGoz",
    slug: "altigoz",
    accent: "rose",
    tagline:
      "Pedestrian-safety routing for Seattle, read from 646 live traffic cameras.",
    description:
      "Pedestrian-safety routing for Seattle, evaluating risk from 646 live traffic cameras. A vision-language model turns live feeds into evidence-first safety assessments. My team built it in three days at NVIDIA Spark Hack.",
    details: [
      "I owned the OSINT layer and the DGX Spark inference endpoints.",
      "Maps cameras to street segments by bearing, establishing the geometry needed for routing.",
      "Ingests live HLS feeds to generate captions and score segment risk.",
    ],
    tech: ["Python", "VLM", "DGX Spark", "HLS", "geospatial"],
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
    description:
      "A market maker built for a two-week trading competition. Team DAAB (Dhruv Arora and Aditya Bankoti) wrote a simulated exchange and trading bots. The repo publishes our losing rounds with the postmortems attached.",
    details: [
      "Round 1 (+10,127): Traded a constant fair product and a linear drift product projected to the close.",
      "Round 2 (-667): A lagging estimator sits below a rising mid in steady state, so our asks got picked off all day.",
      "Round 3 (+114,664): Quoted deep in-the-money vouchers at parity and traded underlying mean-reversion via delta.",
      "Round 4 (-39,000 live): Learned that retunes looking good on historical data often succeed by removing risk control. These figures are test submissions reconstructed in the postmortem notebook, not a closing result.",
      "Final iteration blocks signals from pushing positions past 80% of the limit.",
    ],
    tech: ["Python", "Jupyter", "market making", "options"],
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
    description:
      "A feasibility prototype for chat-driven parametric 3D design and PCB routing. I built a boundary-representation kernel from scratch in Rust, allowing a local model to execute CAD operations.",
    details: [
      "Features my own B-rep kernel in Rust with deterministic replay and differential testing against OCCT.",
      "Uses a shared JSON schema to coordinate between an LLM planner and sandboxed code executors.",
      "Integrates a Node sidecar running tscircuit to autoroute schematics and validate via KiCad.",
      "Evaluates planner and executor success rates systematically, including tests without an LLM in the loop.",
    ],
    tech: ["Rust", "Python", "OCCT", "tscircuit", "React"],
    tier: "compact",
    highlight: "own B-rep kernel",
  },
  {
    name: "Government platform",
    slug: "swiftlabs-platform",
    accent: "sky",
    tagline:
      "I built and maintain a production platform for a US state government client.",
    description:
      "I built and maintain a production platform for a US state government client. A paid five-figure contract through SwiftLabs, managing direct client interfacing and production deployments.",
    details: [
      "Deployed to 2,000+ government-authorized users.",
      "Stack uses React, Express, Firebase, Tailwind CSS, Vite, and Vercel.",
    ],
    tech: ["React", "Express", "Firebase", "Tailwind CSS", "Vite", "Vercel"],
    tier: "compact",
    highlight: "2,000+ users",
  },
  {
    name: "stalk",
    slug: "stalk",
    accent: "green",
    tagline: "My own 3x6 ortholinear split keyboard, named for a bamboo stem.",
    description:
      "My own 3x6 ortholinear split keyboard, named for a bamboo stem. Built around a beige base and forest-green keycaps to match the palette of my directory lister, dirnt.",
    details: [
      "Uses a column-stagger-free ortholinear grid so fingers travel straight.",
      "Features a 3x6 matrix per hand, four thumb keys, and an outer modifier row.",
      "Sits on the seam between hobby and engineering as the most physical object I have designed.",
    ],
    tech: ["keyboard design", "PCB", "JavaScript"],
    tier: "compact",
    highlight: "my own keyboard",
  },
];

export const featuredProjects = projects.filter((p) => p.tier === "featured");
export const compactProjects = projects.filter((p) => p.tier === "compact");
