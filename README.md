# dhruv arora - portfolio

Personal portfolio: projects, experience, and a hero that parses a real Autodesk Synthesis robot.

## The hero

The 3D robot (Dozer) is not a GLB export.
The site fetches the actual `.mira` file - the Mirabuf protobuf format Synthesis uses to move CAD assemblies out of Fusion - and parses it live in the browser with protobufjs + pako, building three.js meshes from the raw assembly tree.
The parser is a slimmed visual-only port of the open source [Synthesis](https://github.com/Autodesk/synthesis) Fission importer (Apache-2.0), which I work on at Autodesk.

## Stack

React 19, Vite, TypeScript, Bun, Tailwind CSS v4, motion, react-three-fiber.
Linted and formatted with Biome.

## Develop

```sh
bun install
bun run dev      # http://localhost:5173
bun run build    # typecheck + production build
bun run lint     # biome
bun run test     # vitest (unit tests, plus a Blender pipeline test when blender is on PATH)
```

## The world

The simulator's world is authored in Blender (`assets/blender/world.blend`) and shipped as meshopt-compressed glbs in `public/world/`.
`assets/blender/contract.json` is the contract both sides follow: collection layout, object naming, the material-name theming scheme, zones, and triangle and wire budgets.

```sh
bun run world:build   # blender (headless) -> lint -> export -> gltf-transform -> public/world/
```

The build fails on any lint, naming, or budget breach.
`public/world/` is committed so deploys never need Blender.

Content lives in `src/content/` as typed data modules; components never hard-code copy.
The Mirabuf pipeline is in `src/mirabuf/` (`parseMira.ts`, `buildRobot.ts`, generated proto module).

Deployed on Vercel.
