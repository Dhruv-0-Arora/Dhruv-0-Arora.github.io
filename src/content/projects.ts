import type { Project } from "./types";

export const projects: Project[] = [
  {
    name: "Synthesis",
    slug: "synthesis",
    accent: "amber",
    tagline:
      "Open source robotics simulator for FIRST students, built at Autodesk.",
    description:
      "Autodesk's simulator lets a FIRST team import its real Fusion 360 assembly and drive it under physics before the physical robot exists. I develop and market it as an Autodesk intern, across three summers, and built and led the pitch of its core value proposition to an Autodesk EVP and the executive team.",
    details: [
      "Assemblies leave Fusion as Mirabuf, a Protobuf format carrying the design hierarchy, joint hierarchy, materials and physical properties. The Dozer on the pad here is a real .mira, gunzipped and decoded in the browser.",
      "C# simulation core, a React and TypeScript front end rendered with Three.js, Python and Docker tooling, AWS hosting.",
      "The user base grew from 5,000 to 20,000+ during my tenure.",
      "I ran user research sessions with robotics teams as developer and head marketing intern, one of two paid high school interns selected.",
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
      "Markdown files with wikilinks, urgency-ranked todos, an interactive graph view, and a CLI that AI agents can drive end to end. Tools like Obsidian solve linking but burn power doing it, so the design goals are inverted: cold-start latency is the product, the TUI idles at 0.0% CPU, and no command ever re-reads the whole vault. Rust, sole author, 114 commits.",
    details: [
      "Urgency by slack. Every todo carries an effort bucket (15m to 1w), an importance from 1 to 5 and an optional due date; astute next ranks by an explainable score, so a one-week task due in three days is already overdue.",
      "A real index, not a scan: one ~2 MB file holding a string arena and CSR adjacency in both directions, xxh3-checksummed and atomically replaced. Any corruption triggers a silent rebuild, so the markdown stays the only source of truth.",
      "A braille-rasterized graph TUI. Color is the importance gradient, horizontal position is a now/later axis, and the layout is a cached build artifact with a display-time remap, so due dates track daily without a relayout. The event loop blocks on a channel, which is why idle CPU is zero.",
      "Agent-native: every read and write emits TOON per the axi conventions, with structured errors, idempotent mutations, definitive empty states and help lines that teach the next command. A shipped skill file covers the whole surface.",
      "Measured on 10,000 notes with 80,000 links, criterion-benchmarked: cold reindex ~230 ms, warm command ~40 ms, index load under 10 ms, full layout ~1 s once.",
      "Workspace split: astute-core (parsing, index, urgency, layout, no terminal deps) and astute (CLI and TUI). find pipes into real fzf and opens hits in $EDITOR.",
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
      "Scans live Kalshi markets, prices them against calibrated external data (weather model ensembles, macro nowcasts, base rates), ranks trades by edge, and can place and babysit maker orders from cron. The stated objective is a high per-trade win rate on small bets, not high returns, and every rule below follows from that.",
    details: [
      "Three signals. Weather: the GFS ensemble distribution for daily-high series versus the market price, fat-tail widened, next-day markets only, 8 points of net edge required. Favorites: mechanically settled markets at 70 to 95 cents closing within 24 hours, played from the maker side. Macro: day-before-FOMC consensus checks and Cleveland Fed CPI nowcast divergence.",
      "Every edge is net of Kalshi maker fees. Orders are post_only limit orders, so the exchange rejects a crossing order rather than paying taker fees. Stakes are quarter-Kelly, fair values are shrunk 50% toward the market mid, and a per-market cap (34% of budget by default) means one wrong market cannot take the bankroll.",
      "kerms manage runs every 30 minutes: cancels unfilled buys older than 6 hours (stale quotes are adverse-selection bait), re-prices positions with the unblended model, sells on take-profit or salvage, holds everything else to settlement. cancel-all is the kill switch.",
      "A data flywheel forced by an external constraint: Open-Meteo deletes ensemble members after about three days, so each scan freezes all 31 member maxes, the NWS forecast and every bucket's prices per station-day. Settlement labels the rows automatically.",
      "The planned pooled distributional GBM trains at roughly 1,000 settled station-days and only earns bankroll once its Brier beats the market's over two weeks of settled recommendations.",
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
    tagline:
      "Monkeytype in the terminal, submitting real runs to the live API. Built in a day, largely with AI assistance.",
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
      "Lists the directories in a folder most-recently-modified first and tints each name on a forest-green to bamboo to near-white gradient by age, so live projects glow and stale ones fade. It exists because eza cannot color a directory by name and its age scale only tints the date column, so coloring names in the grid means emitting the ANSI yourself, which is all this tool does.",
    details: [
      "Interpolation happens in Oklab, not RGB, on a log-scaled age, so the gradient is perceptually even across hours and months.",
      "Recency is mtime, and the README says why: APFS does not update atime on reads, so last-accessed is unavailable. A true frecency database would need a chpwd hook and is out of scope on purpose.",
      "Truecolor when COLORTERM says so, nearest xterm-256 otherwise, plain names when piped or under NO_COLOR. Loose files pass through to eza.",
      "Five small modules (scan, color, grid, files, main) on two dependencies, terminal_size and unicode-width; everything else is std.",
      "The same bamboo palette is on the keyboard I designed, stalk, two doors down.",
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
      "Embedded firmware for UW-Madison's Formula SAE car, a one-third-scale formula racecar built by students. The firmware I wrote for the team is the only safety-critical code in this world: cell balancing and voltage protection on a high-voltage traction pack is what stops a lithium pack from failing dangerously, with no undo and no hotfix at speed.",
    details: [
      "Battery management in C: cell balancing plus over-voltage and under-voltage protection for the traction pack.",
      "A GPIO driver for the ESP32-S3 that talks to the car's ECU and translates its data for a 5-inch driver display.",
      "The steering wheel previously ran on a Raspberry Pi, a whole operating system for a display. Moving to a microcontroller traded generality for latency and power.",
      "Toolchain: STM32 IDE, CMake, and reflow soldering on the boards I program.",
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
      "You wheel a box into a clinic, a factory or a ship; it reads the broken machines, works the case, and writes a report where every claim footnotes a real line in a real file. No cloud, no data leaving the building. My team of four built it in one day at the Dell x NVIDIA hackathon in Seattle, on the box it runs on, and placed 2nd of 40 teams.",
    details: [
      "Collect: about 430 lines of dependency-free bash pack up logs, configs, processes, network state and on-machine docs, because the sick machine may not have Python or internet.",
      "Carry: the bundle arrives over the network, a plain ethernet cable, or a USB stick, and all three drop an identical package. On the cable route, plugging it in is the entire user interaction.",
      "Understand: chunks are BM25-indexed and assembled into a two-layer networkx graph, hard evidence below and the model's reasoning on top. Text search finds the symptom; the graph walks to the cause, which often shares zero words with the search. A config pointing at a machine that appears nowhere is flagged as a dangling edge.",
      "Diagnose: a local qwen3.5:122b through Ollama on a Dell Pro Max with GB10 and 120 GB of unified memory works the case in rounds. Every evidence ID is shaped machine:path:Lstart-Lend and is used identically by search, graph, footnotes and UI clicks.",
      "The test patient is a fabricated clinic across two laptops with six faults on a difficulty ladder and a 13-document knowledge base split so the explaining document lives on the opposite machine from the fault. Red herrings include a complete connection pool with three real bugs behind a flag that is never true; diagnosing one scores zero.",
      "The eval harness grades N trials against 13 criteria, 8 required and 5 bonus; blaming the firewall is an automatic zero. PolyForm Noncommercial license.",
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
      "A subscription-free raw editor for macOS: a C++20 engine drives a 27-node Metal compute graph and a SwiftUI shell displays the output texture with no readback. Orion is a project I work on with Aditya Bankoti; my commits are in the mask layers, the engine and the app, and every number here describes the project, not my share of it.",
    details: [
      "Edits form a DAG, not a chain, so moving a slider recomputes only what sits downstream. On an M4 a 24 MP Sony ARW re-renders an exposure change in about 8 ms against a 16 ms budget, at full resolution with no preview proxy, about 4 GiB of intermediates.",
      "Pipeline: decode, linearize with white balance and white clip, RCD demosaic, highlight reconstruction, four-scale wavelet denoise, lens corrections, sharpen, camera matrix, guided filter, tone and color, three-way grade, AgX display transform, crop. Everything between the camera matrix and the display transform is scene-linear and unbounded.",
      "Algorithms are cited, not invented: fast guided filter (He and Sun), AgX (Sobotka), Fritsch-Carlson monotone cubic tone curves, a-trous wavelet denoising (Starck) with a per-frame Poisson-Gaussian noise fit (Foi), ASC CDL v1.2 grading, lensfun corrections from a 2,600-lens database. Anything unsourced is listed as such.",
      "Six mask kinds: linear, radial, brush, subject matte, luminance range and color range, combined as a list and feathered onto the photograph's own edges.",
      "889 engine checks and 3,711 viewport checks, 42 recorded repro scenarios, real GPU renders in the suite, because pure maths tests pass happily on code that renders garbage. One shipped defect is disclosed: a 24 MP frame will not open on an 8 GB Mac.",
      "Shaders are authored in Slang so a Vulkan or D3D backend stays reachable. Apache-2.0, chosen for the explicit patent grant.",
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
      "Finds the conflict stories nobody is covering and puts them on a map. My team's entry at CascadiaJS 2026, hosted by AWS, Box and Apify, where it placed 3rd. It scrapes early on-the-ground reports, archives the raw payloads before anything touches them, extracts structured events, fuses duplicates and renders a live risk map readable by a scared civilian on a phone in daylight.",
    details: [
      "The counting problem: if five people post about one explosion, a naive system draws five dots. Reports within about 5 km and 6 hours merge into one event, and merging raises confidence rather than lowering it. Low-confidence dots render faded.",
      "Apify scrapes news, X and Telegram; raw payloads land in Box first, so every claim on the map traces to the exact article. Box AI and Gemini fill a structured form per incident.",
      "Two models routed by state. Onset, an XGBoost anomaly detector against each hex's own baseline, asks whether a quiet place is about to start. Continuation, a small GRU over a 14-day sequence, asks whether an active one is about to get worse. One combined model was tried first and was worse at both.",
      "The scores are published with the skepticism attached: onset 0.0256 AUC-PR against a 0.0099 base rate, barely better than guessing; continuation 0.9906 against 0.5906, good enough to want leakage ruled out first.",
      "Training and live scoring share one feature-engineering path, and each source is delayed by its realistic publish lag (news +1 day, event data +3 days) so the model cannot peek.",
      "Map of ~36 km2 hexagons colored green to red with event dots on top: Vite, React 19 and MapLibre in front; Python, FastAPI, XGBoost and PyTorch behind; a TypeScript and Fastify fusion service beside it.",
    ],
    tech: ["Python", "XGBoost", "PyTorch", "FastAPI", "React", "MapLibre"],
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
    description:
      "Live pedestrian-safety routing built on the City of Seattle's 646 public traffic cameras. A vision-language model on an NVIDIA DGX Spark turns live feeds into evidence-first safety assessments, each tied to the frame it came from. My team of four built it in three days at NVIDIA Spark Hack: Seattle, in the See track.",
    details: [
      "The unglamorous part is the good part: a camera-to-street-segment index built by bearing. A camera is a point with a direction and a street is a segment; knowing which camera actually looks at which stretch of road is pure geometry, and it makes everything else possible.",
      "Live HLS feed discovery and media ingest feed the VLM captioning and a risk model that scores segments for routing.",
      "My part was the OSINT layer and the Spark inference endpoints; teammates owned the map front end and harness, the VLM, and media ingest.",
      "Hardware: one DGX Spark with the GB10, running inference locally for the whole demo.",
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
      "Everything team DAAB, Aditya Bankoti and me, wrote for rounds 1 through 4 of IMC Prosperity: three days of order-book data per round, a Trader class, and a simulated exchange full of bots. At heart a market maker, plus whatever each round's new products demanded. The repo publishes the losses with the diagnosis attached.",
    details: [
      "Round 1, +10,127: a constant fair on a product pinned at 10,000 and a linear drift fair on one rising 1,000 a day, projected forward to the close rather than to now, because what matters over thousands of ticks is the price when you unwind.",
      "Round 2, -667: rewritten as mean reversion on an EMA fair, justified by a tick-level autocorrelation of -0.51. Wrong horizon: a lagging estimator sits below a rising mid, so the asks got picked off all day. Reverted, and about +7.9k with market access.",
      "Round 3, +114,664: deep in-the-money vouchers quoted at parity, a quadratic IV smile refit from live mids every tick, and the underlying's mean-reversion signal projected onto every strike through delta. Six strikes at 300 lots each is over 1,500 deltas of the same trade.",
      "Round 4: counterparty IDs were exposed, and regressing each name's direction against forward mid moves was worth +53k on historical data and -39k on the live tape. The tape ran 1,000 ticks a day where the data ran 10,000, so a 5% half-life EMA became a 52% one. Those four figures are test submissions reconstructed in the postmortem notebook, not a closing result.",
      "The lesson written down: every retune that looked good on the dataset got there by removing risk control. What shipped detects day length at runtime, caps the counterparty signal to zero, and blocks any signal from pushing a position past 80% of the limit.",
      "Figures are competition scores, not dollars.",
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
      "A feasibility prototype for agentic CAD: chat-driven parametric 3D design on build123d and OCCT, PCB design through tscircuit, and a swappable planner and executor contract designed so a local model can take the executor seat. It is a spike and calls itself one, with a written verdict in its report. Sole author, a piece of the domain I intern in, built from scratch.",
    details: [
      "My own boundary-representation kernel in Rust, exposing the same op vocabulary as OCCT and selected per session with CAD_BACKEND=occt or rust. Validated by proptest invariants, differential testing against OCCT with a measured parity percentage, and deterministic replay.",
      "One JSON schema is the single source of truth between planner and executor. The planner emits schema-constrained Plan JSON; two executors run it, mode A as sandboxed codegen and mode B as constrained MCP tools.",
      "Python 3.12 and FastAPI compute server over a WebSocket protocol carrying JSON text events plus binary geometry frames, per-face tessellation, STL, STEP and GLB export.",
      "A Node and Hono sidecar wraps tscircuit to run TSX into circuit JSON and autoroute it, with KiCad and Gerber exporters and ERC and DRC validation through a real KiCad 9 install.",
      "Evals are first-class: planner evals over 10 prompts, executor evals over saved plans for both mech modes and the PCB pipeline, replay evals with five repeats for a success rate without an LLM in the loop, and a live qwen3:8b A/B for the local-executor question.",
      "Vite and React 19 client with a chat panel, a react-three-fiber viewport and tscircuit schematic and PCB viewers.",
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
      "A paid five-figure contract through SwiftLabs, where I am a partner. I interface with the client directly and own the platform in production. The client stays unnamed here by decision, not by accident.",
    details: [
      "Deployed to 2,000+ government-authorized users.",
      "React and Vite in front, Express and Firebase behind, Tailwind CSS for the interface, Vercel for deploys, Biome for the lint gate.",
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
      "A custom ortholinear split keyboard I designed: a 3x6 matrix per hand, four thumb keys (two 1.5u, two 1u), and an outer row for modifiers. The name is botany, a stalk being the stem of a plant, specifically bamboo, and the board is built around that palette: a beige base with green keycaps.",
    details: [
      "Column-stagger-free ortholinear grid, so every finger travels straight up and down its own column.",
      "The same forest-green to bamboo palette runs through dirnt, the directory lister across the road, without either being designed for the other.",
      "The most physical object in this world, and the one that sits on the seam between hobby and engineering.",
    ],
    tech: ["keyboard design", "PCB", "JavaScript"],
    tier: "compact",
    highlight: "my own keyboard",
  },
];

export const featuredProjects = projects.filter((p) => p.tier === "featured");
export const compactProjects = projects.filter((p) => p.tier === "compact");
