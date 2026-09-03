# Content rules

Rules for anything a visitor can read: `src/content/`, overlays, `index.html` meta, `public/llms.txt`, commit messages, and mesh, material and node names.
They summarize a local content corpus that is not tracked; when in doubt, the stricter reading wins.

## Hard rules

1. **The government platform is described only at its approved ceiling**: "I built and maintain a production platform for a US state government client." Approved adjacent facts: a paid five-figure contract, 2,000+ authorized users, direct client contact, and the stack (React, Express, Firebase, Tailwind CSS, Vite, Vercel). Never the client, state, agency, product, domain, or a screenshot. This applies to identifiers in the world too.
2. **Authorship framings are fixed.** Orion: "I contributed to Orion" or "a project I work on with Aditya Bankoti", never "I built"; its numbers describe the project. Nazar, Cypher, AltiGoz, fegis, Wisconsin Racing: "my team". IMC Prosperity 4: "team DAAB, with Aditya Bankoti". Synthesis: "I develop and market it as an Autodesk intern", no commit count. leetui and FreeFlow: "I contributed to". obsidian-agile: "a fork of obsidian-kanban".
3. **The SHA256 timing work is "self-directed research in progress"**, never a paper or publication.
4. **monkeytype-tui ships with its AI-assistance disclosure** or not at all.
5. **Never print**: a GPA or grade, Soundwave prize amounts, unconfirmed course numbers, an AltiGoz placement, a third-party citation for Cypher's 3rd place, or a framework name for Soundwave.
6. **No em dashes anywhere.** Plain dash.

## Voice

Plain, declarative, slightly dry.
Numbers over adjectives, exact or absent.
Failures stay in (a losing round, a shipped defect).
No exclamation marks.
Lowercase is fine in labels, kickers and the mono HUD.

## Where the rules are enforced

- `src/simulator/overlay/ProjectDock.test.ts` fails on the client name, on Soundwave prize figures, and if monkeytype-tui loses its disclosure; it also requires every contract zone to resolve to copy.
- The world lint restricts material names to tokens, so no identifying text can enter the scene through Blender.
- Before shipping, grep the tracked tree for the forbidden strings above; the audit on 2026-09-07 found and fixed the experience entry, two award details and two project taglines.

## Open questions only the owner can settle

- Orion's preferred framing beyond the permitted phrasings.
- Which resume PDF ships in `public/resume/`.
- Whether private repos (astute, agentic-cad-spike, kerms, gcal-axi, sha256-timing) get links or stay described.
- The Soundwave prize figures and framework, currently withheld.
