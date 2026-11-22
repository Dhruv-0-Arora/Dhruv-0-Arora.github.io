+++
kind = "project"
title = "Orion"
description = "Orion is a GPU-accelerated raw photo editor for macOS that Dhruv Arora contributes to: mask layers, engine and app work."
summary = "A raw photo editor for macOS that I contribute to."
note = "24 MP raw in ~8 ms"
group = "physical"
order = 20
tech = ["C++", "Metal", "SwiftUI"]
role = "contributor"
when = "July 2026 - present"

[[links]]
label = "repo"
href = "https://github.com/Nano-AI/Orion"
+++
I help build Orion.
It is a project I work on with Aditya Bankoti, and most of the commits are his.
Mine are feature work: mask layers, the engine, and the app.

It is a raw photo editor with no subscription.
A C++20 engine drives a Metal compute graph.
A SwiftUI shell shows the output texture with no readback.

The numbers below describe the project, not my share of it.

- A 24 MP Sony raw re-renders in about 8 ms on an M4, inside a 16 ms budget.
- 27 pipeline nodes.
- 4,600+ GPU-validated checks.

Every filter cites the paper it comes from.
The ones that cannot are listed in `UNSOURCED.md`.
