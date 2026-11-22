+++
kind = "project"
title = "Agentic CAD Spike"
nav = "agentic-cad-spike"
description = "A feasibility prototype for agentic CAD: describe a part in chat and it appears, on a B-rep geometry kernel written in Rust."
summary = "Describe a part in chat and it appears. It runs on a B-rep kernel I wrote."
note = "its own geometry kernel"
group = "physical"
order = 30
tech = ["Rust", "Python", "FastAPI", "React", "react-three-fiber"]
role = "solo"
when = "August 2026"
+++
A feasibility prototype for agentic CAD.
Parametric 3D sits on build123d and OCCT.
PCBs go through tscircuit.

A planner model and an executor model talk through a JSON plan schema.
The schema is the single source of truth, so a local model can take the executor seat.

## The kernel

The part I care about is the geometry.
I wrote a B-rep kernel in Rust from scratch that exposes the same operations as OCCT.
It is tested three ways:

- proptest invariants,
- differential testing against OCCT,
- deterministic replay.
