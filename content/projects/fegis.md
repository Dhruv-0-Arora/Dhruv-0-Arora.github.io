+++
kind = "project"
title = "Fegis"
description = "Fegis is a Chrome extension that catches personal data before it reaches an AI chatbot. 13 PII types, all on the device."
summary = "A Chrome extension that catches personal data before it reaches an AI chatbot."
note = "13 PII types, on-device"
group = "judgment"
order = 40
tech = ["TypeScript", "React", "TensorFlow", "TF.js", "Tesseract.js"]
role = "led a team of 3"
when = "March 2026"

[[links]]
label = "repo"
href = "https://github.com/Dhruv-0-Arora/fegis"
+++
Fegis reads what you are about to send to an AI chatbot.
If it finds personal data, it blocks the message, or swaps the data for tokens or realistic fakes in the outgoing request.

- 13 PII types.
- 2 detection engines: regex, and a BiLSTM-CRF NER model running in TF.js.
- Credit cards are Luhn-validated, not pattern-matched.
- PDFs, DOCX files and images are parsed inside the extension.
- 7 AI sites supported, plus a generic fallback.

It makes 0 network calls with your data.
Everything stays on the device.
