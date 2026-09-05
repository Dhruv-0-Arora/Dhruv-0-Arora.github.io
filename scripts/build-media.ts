/**
 * Prepares gallery photos for the hub carousel.
 *
 *   node scripts/build-media.ts                # assets/gallery/*.{jpg,jpeg,png,webp} -> public/gallery/
 *   node scripts/build-media.ts --from DIR     # another source directory
 *
 * Every source image is cover-fitted to the carousel's 3:2 frame at 1280 x
 * 853, re-encoded as a progressive JPEG, and written under `public/gallery/`
 * with a slug of its file name. Originals stay out of git; the outputs are
 * committed. Prints a `gallery.ts` entry per photo to paste into
 * `src/content/gallery.ts`. Runs under Node for the same reason as
 * `build-world.ts`: `sharp` is native.
 */
import { mkdir, readdir } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "public/gallery");
const WIDTH = 1280;
const HEIGHT = 853;
const SOURCES = /\.(jpe?g|png|webp|tiff?)$/i;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  await mkdir(OUT, { recursive: true });
  const entries: string[] = [];
  for (const file of files) {
    const slug = slugify(basename(file, extname(file)));
    const out = join(OUT, `${slug}.jpg`);
    const info = await sharp(join(from, file))
      .rotate()
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(out);
    console.log(
      `${file} -> public/gallery/${slug}.jpg (${(info.size / 1000).toFixed(0)}KB)`,
    );
    entries.push(`  { src: "/gallery/${slug}.jpg", alt: "", place: "" },`);
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
