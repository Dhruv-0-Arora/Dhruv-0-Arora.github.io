+++
kind = "project"
title = "go-backtester"
description = "A backtesting engine in Go for IMC Prosperity, a port of a Rust backtester with output held byte-compatible against it."
summary = "A backtesting engine in Go, byte-compatible with the Rust one it ports."
group = "speed"
order = 60
tech = ["Go", "Python"]
role = "solo"
when = "April 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/go-backtester"
+++
It replays historical order book data through a Python trader and writes metrics, submission logs and CSVs.
I built it for [IMC Prosperity](/projects/imc-prosperity-4/).

A port of an existing Rust backtester.
Its output is byte-compatible with the Rust reference, so diffs stay clean.

- No CGO and no FFI.
  The Python trader runs in a long-lived subprocess and speaks newline-delimited JSON over stdin and stdout.
  A strategy that crashes takes down only its own worker.
- Prices are `int64`.
- Rounding uses `math.RoundToEven`, to match Rust's `f64::round_ties_even`.
