/**
 * Prepares photos for the hub carousel and the /gallery/ page.
 *
 *   node scripts/build-media.ts                # assets/gallery/*.{jpg,jpeg,png,webp} -> public/photos/
 *   node scripts/build-media.ts --from DIR     # another source directory
 *
 * Every source image becomes, under `public/photos/` with a slug of its
 * file name:
 *
 * - `<slug>.jpg`, cover-fitted to the carousel's 3:2 frame at 1280 x 853,
 *   a progressive JPEG. It doubles as the photo's link preview image.
 * - `full/<slug>-<w>.webp` at its own aspect, with the long edge at each
 *   of `LONG_EDGES` the original can fill, for the gallery's srcset and
 *   lightbox. Sizing by the long edge keeps a full-screen portrait no
 *   heavier than a full-screen landscape.
 *
 * Metadata is stripped (no GPS, no camera serials) and colour converted to
 * sRGB. `public/photos/` is wholly derived, so it is cleared first.
 * Originals stay out of git; the outputs are committed. Prints a
 * `gallery.ts` entry per photo to paste into `src/content/gallery.ts`.
 * Runs under Node for the same reason as `build-world.ts`: `sharp` is
 * native.
 */
import { mkdir, readdir, rm } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "public/photos");
const HUB_W = 1280;
const HUB_H = 853;
/** Gallery long edges: a grid cell, a high-DPI cell, a full-screen view. */
const LONG_EDGES = [960, 1600, 2400];
const SOURCES = /\.(jpe?g|png|webp|tiff?)$/i;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const kb = (bytes: number) => `${(bytes / 1000).toFixed(0)}KB`;

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: { from: { type: "string" } },
    allowPositionals: false,
  });
  const from = resolve(values.from ?? join(ROOT, "assets/gallery"));
  const files = (await readdir(from).catch(() => [] as string[]))
    .filter((f) => SOURCES.test(f))
    .sort();
  if (files.length === 0) {
    console.error(`no source images in ${from}`);
    return 1;
  }
  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, "full"), { recursive: true });
  const entries: string[] = [];
  for (const file of files) {
    const slug = slugify(basename(file, extname(file)));
    // Decode once (some sources are 16-bit PNGs of tens of MB) and orient.
    const { data, info: src } = await sharp(join(from, file))
      .rotate()
      .toColorspace("srgb")
      .raw()
      .toBuffer({ resolveWithObject: true });
    const image = () =>
      sharp(data, {
        raw: { width: src.width, height: src.height, channels: src.channels },
      });

    const hub = await image()
      .resize(HUB_W, HUB_H, { fit: "cover", position: "attention" })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(join(OUT, `${slug}.jpg`));
    const sizes = [`hub ${kb(hub.size)}`];

    const long = Math.max(src.width, src.height);
    const edges = LONG_EDGES.filter((e) => e <= long);
    if (edges.length === 0) edges.push(long);
    const widths = edges.map((e) => Math.round((e * src.width) / long));
    for (const w of widths) {
      const out = await image()
        .resize({ width: w })
        .webp({ quality: 82, effort: 6 })
        .toFile(join(OUT, "full", `${slug}-${w}.webp`));
      sizes.push(`${w}w ${kb(out.size)}`);
    }
    console.log(`${file} -> ${slug} (${sizes.join(", ")})`);
    entries.push(
      `  { slug: "${slug}", width: ${src.width}, height: ${src.height}, widths: [${widths.join(", ")}], alt: "", place: "" },`,
    );
  }
  console.log("\nsrc/content/gallery.ts entries (fill in alt and place):\n");
  console.log(entries.join("\n"));
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
