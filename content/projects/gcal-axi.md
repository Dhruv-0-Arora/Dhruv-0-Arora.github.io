+++
kind = "project"
title = "gcal-axi"
description = "gcal-axi is a Google Calendar CLI in Rust built for agents to drive, with output that costs about 40% fewer tokens than JSON."
summary = "Google Calendar from the command line, built for agents to drive."
note = "~40% fewer tokens than JSON"
group = "speed"
order = 20
tech = ["Rust", "TOON", "OAuth"]
role = "solo"
when = "July 2026"
+++
A Google Calendar CLI built to the [axi](https://axi.md) spec, so an agent can read and write a calendar with no human in the loop.

- Output is TOON, which costs about 40% fewer tokens than JSON.
- 17 commands.
  16 event fields can be picked with `--fields`.
- Exit code 0 covers success, empty results and idempotent no-ops.
  1 is an operation failure.
  2 is a usage error.
- Dates take ISO 8601, and also `now`, `tomorrow`, `+3d` and `next friday`.

## gcal-tui

Its sibling is a read-only week view.
The first frame paints in about 20 ms, from an on-disk cache, while a background thread refreshes from the API.
You never wait on the network to see something true.

Both share one OAuth token file.
One credential, two interfaces: one for agents, one for eyes.
