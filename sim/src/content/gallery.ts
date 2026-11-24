/**
 * Photos on the hub carousel's six 3:2 frames, in frame order. Each is a
 * file stem under the repo root's `static/photos/`, served at /photos/
 * and produced by `scripts/build-media.ts` from originals kept outside git.
 */
export const carouselPhotos: string[] = [
  "chicago-river-night",
  "millennium-park",
  "downtown-dusk",
  "lincoln-park-skyline",
  "nicobar-pigeon",
  "navy-pier-above",
];

/** Path of a photo's 3:2 carousel crop. */
export function carouselSrc(slug: string): string {
  return `/photos/${slug}.jpg`;
}
