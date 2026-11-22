+++
kind = "project"
title = "SHA256 timing side channels"
nav = "sha256-timing"
description = "Self-directed research in progress on whether constant-time SHA256 implementations still leak through CPU port contention."
summary = "Self-directed research in progress. Do constant-time SHA256 implementations still leak?"
note = "a draft"
group = "physical"
order = 60
tech = ["C", "Python", "perf"]
role = "solo"
when = "March 2026 - present"
+++
Earlier timing attacks go after naive implementations, through the cache.
This looks at the careful ones: constant-time, cache-miss-resistant code like OpenSSL and libsodium.

The channel is CPU port contention on hyperthreaded cores.
An attacker thread sits on the sibling hyperthread and measures contention.
A classifier then tries to tell classes of input message apart from the traces.

It is a draft I am writing.
Nothing has been submitted anywhere.
