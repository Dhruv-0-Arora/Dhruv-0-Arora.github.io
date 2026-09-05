/**
 * Photos on the hub carousel. Files live in `public/gallery/` and are
 * produced by `scripts/build-media.ts` from originals kept outside git.
 * Frames without a photo show the placeholder pattern.
 */
export interface GalleryPhoto {
  /** Path under the site root, e.g. `/gallery/adams-summit.jpg`. */
  src: string;
  alt: string;
  place: string;
  date?: string;
}

export const gallery: GalleryPhoto[] = [];
