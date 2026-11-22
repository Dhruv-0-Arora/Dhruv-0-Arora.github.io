+++
kind = "project"
title = "monkeytype-tui"
description = "A terminal client for Monkeytype in Rust that submits runs to the live account. Built largely with AI assistance, in one day."
summary = "Monkeytype in the terminal. It submits runs to the live account."
note = "built with AI, in one day"
group = "speed"
order = 70
tech = ["Rust", "ratatui"]
role = "solo, AI-assisted"
when = "July 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/monkeytype-tui"
+++
I built this largely with AI assistance, in one day.

A terminal client for Monkeytype.
It signs in against Monkeytype's own Firebase, keeps credentials in the OS keyring, and submits runs to the live account.

Getting a run accepted was the hard part.
It meant porting npm's `object-hash` to Rust and matching the web frontend's exact rounding.
Generated conformance vectors check both.
