+++
kind = "project"
title = "AltiGoz"
description = "AltiGoz routes pedestrians through Seattle using the city's 646 live traffic cameras and a vision model on a DGX Spark."
summary = "Pedestrian safety routing for Seattle, from 646 live traffic cameras."
note = "built in 3 days"
group = "judgment"
order = 70
tech = ["Python", "VLM", "DGX Spark", "HLS"]
role = "team of 4"
when = "August 2026"

[[links]]
label = "repo"
href = "https://github.com/BerkM125/AltiGoz"
+++
Seattle publishes 646 traffic cameras.
AltiGoz routes pedestrians by what those cameras see right now.

A vision-language model on an NVIDIA DGX Spark turns the live feeds into safety assessments.
Each one is tied to its evidence.
An index maps every camera to a street segment by its bearing.

My team of 4 built it in 3 days at NVIDIA Spark Hack: Seattle.
I owned the OSINT layer and the inference endpoints on the Spark.
