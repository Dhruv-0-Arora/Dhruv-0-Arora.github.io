+++
kind = "project"
title = "dirnt"
description = "dirnt lists directories newest first and tints each name by age, on a green to bamboo gradient interpolated in Oklab."
summary = "Lists directories newest first, each name tinted by its age."
note = "Oklab, not RGB"
group = "speed"
order = 50
tech = ["Rust", "Oklab", "ANSI"]
role = "solo"
when = "July 2026"
+++
`eza` cannot colour a directory by its name, and its age gradient only tints the date column.

dirnt lists directories newest first and tints each name from forest green to bamboo by age.
The gradient is interpolated in Oklab, not RGB, so it looks even.

macOS APFS does not update atime, so mtime stands in for it.
The README says so.
