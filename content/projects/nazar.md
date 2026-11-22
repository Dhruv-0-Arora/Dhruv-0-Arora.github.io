+++
kind = "project"
title = "Nazar"
description = "Nazar is an offline AI box that diagnoses why a system broke. It writes the fix and refuses to run it. 2nd of 40 teams."
summary = "An offline box that reads broken machines and writes the fix. It refuses to run it."
note = "2nd of 40 teams"
group = "judgment"
featured = 2
order = 10
tech = ["Python", "FastAPI", "Ollama", "networkx", "React"]
role = "team of 4"
when = "July 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/Nazar"
+++
You wheel a box into a hospital, a factory, or a ship.
It reads the broken machines, thinks about it, and tells you what went wrong and how to fix it.
It never touches the internet.

My team of 4 built it in one day at the Dell x NVIDIA AI Hackathon in Seattle, on the box it runs on.
We placed 2nd of 40.

The model is qwen3.5:122b, running locally on a Dell Pro Max with GB10.
The collector is about 430 lines of bash with no dependencies.

## The rule

Nazar writes the fix and refuses to run it.
An unattended offline box is exactly where you do not want an agent with a shell.

Every claim it makes is a footnote to something it read.
