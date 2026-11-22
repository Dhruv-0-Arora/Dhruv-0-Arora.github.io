+++
kind = "project"
title = "Asclepion"
description = "Asclepion turns a physician's brief notes into a symptom-to-diagnosis graph and itemized billing, fully offline."
summary = "A clinical notes assistant that runs fully offline."
note = "0 cloud calls"
group = "judgment"
order = 60
tech = ["React", "TypeScript", "PyTorch", "FastAPI", "Ollama", "Sigma.js"]
role = "built with Aditya Bankoti"
when = "February 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/Asclepion"
+++
A physician types brief notes.
Asclepion builds an interactive graph from symptoms to diagnoses, and generates itemized billing.

All 3 services run locally.
MedGemma and Mistral Nemo run through Ollama.
A BERT model we trained scores how relevant each item is to a diagnosis, from 1 to 10.

It makes 0 cloud calls.
Built with Aditya Bankoti for the MadData hackathon.
