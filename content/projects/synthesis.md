+++
kind = "project"
title = "Synthesis"
description = "Synthesis is Autodesk's open source robotics simulator for FIRST teams. Users grew from 5K to 20K+ over three summers."
summary = "Autodesk's open source robotics simulator for FIRST teams."
note = "5K to 20K+ users"
group = "physical"
featured = 1
order = 10
tech = ["C#", "React", "TypeScript", "Three.js", "Protobuf"]
role = "Autodesk intern"
when = "June 2024 - August 2026"

[[links]]
label = "repo"
href = "https://github.com/Autodesk/synthesis"

[[links]]
label = "live"
href = "https://synthesis.autodesk.com"
+++
FIRST teams import their real Fusion 360 assembly and drive it under physics, before the robot exists.
It runs in the browser.

I worked on it for three summers as an Autodesk intern.
The first time I was one of 2 paid high school interns.
I developed it and marketed it.
Users grew from 5K to 20K+ in that time.

- Ran user research sessions with FIRST robotics teams.
- Built and led a team pitch to an Autodesk EVP and the executive team.
- Did some of the physics system work.
  I want to do more of it.

## On this site

The robot in the corner of the [home page](/) is a real Synthesis export.
Rust decodes the Mirabuf file when the site is built, and a small rasterizer draws it in text.

[The simulator](/sim/) lets you drive it.
