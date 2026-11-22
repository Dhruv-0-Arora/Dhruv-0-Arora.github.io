+++
kind = "project"
title = "watchdog"
description = "watchdog is a network anomaly detector in C++ that learns normal traffic on the machine, at about 500k packets per second."
summary = "A network anomaly detector that lives on the machine and learns what normal looks like."
note = "~500k packets/s, 23 MB flat"
group = "speed"
featured = 5
order = 30
tech = ["C++", "libpcap", "CMake"]
role = "solo"
when = "September - October 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/watchdog"
+++
watchdog captures packet headers with libpcap and learns normal traffic online, with its own KitNET-style ensemble of autoencoders.
Threshold crossings fold into incidents.
`watchdog top` shows them in one line.
It runs unprivileged on macOS and Linux.

## Numbers

- About 500k packets per second, single-threaded, on Apple Silicon.
- Splitting forward and backprop cut model time from 2,680 to about 1,500 ns per packet.
- Memory stays flat near 23 MB across 300M replayed packets.
  The per-packet path allocates nothing.
- The saved model is about 10 KB.

## What is not proven

Detection is measured on synthetic captures only.
It raised 0 false positives on a 20M-packet benign soak, and caught a port scan and an exfiltration.
A replay of the public Kitsune dataset is still pending.

A long soak and a live install found real defects.
One was a training gate that would have deadlocked for 375 hours on a real network.
They are written up in the repo.
