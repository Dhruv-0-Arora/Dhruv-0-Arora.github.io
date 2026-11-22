+++
kind = "project"
title = "Cypher"
description = "Cypher finds conflict stories nobody is covering and maps them, merging duplicate reports. 3rd place at CascadiaJS 2026."
summary = "Finds conflict stories nobody is covering, and maps them."
note = "3rd place, CascadiaJS 2026"
group = "judgment"
order = 50
tech = ["Python", "FastAPI", "XGBoost", "PyTorch", "TypeScript", "React", "MapLibre"]
role = "my team"
when = "May - July 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/Cypher"
+++
If five people post about one explosion, a naive system draws five dots and makes everything look scarier than it is.

Cypher scrapes early on-the-ground reports, archives the raw payloads for audit, extracts structured events, merges duplicates, and draws a live risk map.
Reports within about 5 km and 6 hours become one event.
Confidence comes from corroboration.

It has to be readable by a scared civilian on a phone in daylight, not an analyst with three monitors.

## Models

- An XGBoost onset detector.
  AUC-PR 0.0256 against a base rate of 0.0099.
- A GRU continuation model over a 14-day sequence.
  AUC-PR 0.9906 against a base rate of 0.5906.

Features are leakage-aware.
Each source is delayed by its realistic publish lag.

My team placed 3rd at CascadiaJS 2026.
