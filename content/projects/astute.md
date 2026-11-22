+++
kind = "project"
title = "astute"
description = "astute is a second brain for the terminal, in Rust: a markdown vault as a knowledge graph, reindexed cold in about 230 ms."
summary = "A second brain in the terminal. Cold-start latency is the product."
note = "~230 ms cold reindex, 10k notes"
group = "speed"
featured = 4
order = 10
tech = ["Rust", "ratatui", "TOON", "criterion"]
role = "solo"
when = "July 2026 - present"
+++
Obsidian solves linking but burns power doing it. astute is the same idea for the terminal: a markdown vault with `[[wikilinks]]` as a knowledge graph, urgency-ranked todos, a graph view in braille, and a CLI an agent can drive end to end.

## Numbers

| Operation | Time |
|---|---|
| Cold full reindex, 10k notes and 80k links | ~230 ms |
| Warm command | ~40 ms |
| Index load | under 10 ms |
| TUI idle CPU | 0.0% |

## How

The index is one file of about 2 MB.
It holds a string arena and CSR adjacency in both directions.
It is checksummed with xxh3 and replaced atomically.
If it is corrupt, astute rebuilds it from the markdown without asking.

The graph layout is a cached build artifact, not a live simulation.
The event loop blocks on a channel, so idle CPU is zero.
