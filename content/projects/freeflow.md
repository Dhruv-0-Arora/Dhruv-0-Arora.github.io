+++
kind = "project"
title = "FreeFlow for Linux"
nav = "freeflow"
description = "A Rust rewrite of the FreeFlow dictation app for Linux on Wayland, kept on a fork: 8 crates, PipeWire, evdev and Nix."
summary = "My Linux rewrite of FreeFlow, a dictation app. It lives on a fork."
note = "8 Rust crates"
group = "speed"
order = 40
tech = ["Rust", "PipeWire", "Wayland", "Nix", "whisper.cpp"]
role = "my fork of zachlatta/freeflow"
when = "September - October 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/freeflow"
+++
FreeFlow is Zach Latta's open source dictation app for macOS.
Hold a key, speak, and cleaned-up text is typed at the cursor.
I rewrote it for Linux on Wayland.
It is too different to send back, so it stays on my fork.
The Mac app there is his, unchanged.

8 crates, about 8,400 lines of Rust, 96 unit tests, and an end-to-end script that dictates a recorded WAV into a real focused window.

## The measured decision

A one-shot `claude -p` call cost 5.8 s per request, against 0.07 s of process startup.
The cost was session bootstrap, not the process.

A persistent session answers in 2.2 s the first time and 1.2 s after that.
A worker pool now warms up when the hotkey goes down, which hides the bootstrap under the time you spend speaking.
Each worker is recycled after one turn, so one dictation can never leak into the next.

## Linux problems

Hyprland swallows the press of a key that is bound on release.
So the release is read straight from evdev.
Audio comes in through PipeWire.
Text goes out through `wtype`, with a timeout.
