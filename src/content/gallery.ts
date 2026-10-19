/**
 * Photos for the hub carousel and the /gallery/ page. Files live in
 * `public/photos/` and are produced by `scripts/build-media.ts` from
 * originals kept outside git; `slug`, the dimensions and `widths` are what
 * that script prints. Array order is the gallery's order.
 */
export interface GalleryPhoto {
  /** File stem under `public/photos/`, also the photo's `#hash` on the page. */
  slug: string;
  /** Original pixel size; only the aspect ratio is used. */
  width: number;
  height: number;
  /** Widths of the `full/<slug>-<w>.webp` renditions, ascending. */
  widths: number[];
  alt: string;
  place: string;
  /** Shown on one of the hub carousel's six 3:2 frames. */
  hub?: boolean;
}

export const galleryPage = {
  title: "photos",
  intro: "Chicago, mostly, and one dog. Click a photo to see it full size.",
};

export const gallery: GalleryPhoto[] = [
  {
    slug: "chicago-river-night",
    width: 7968,
    height: 5320,
    widths: [960, 1600, 2400],
    alt: "The Chicago River at night, a raised railroad bridge in silhouette against the lit skyline",
    place: "Chicago River",
    hub: true,
  },
  {
    slug: "millennium-park",
    width: 7968,
    height: 5320,
    widths: [960, 1600, 2400],
    alt: "Millennium Park from a rooftop: Cloud Gate, the bandshell's steel trellis, towers and Lake Michigan",
    place: "Millennium Park",
    hub: true,
  },
  {
    slug: "autumn-tower",
    width: 5320,
    height: 7968,
    widths: [641, 1068, 1602],
    alt: "Autumn leaves overhanging a distant black skyscraper",
    place: "Lincoln Park",
  },
  {
    slug: "downtown-dusk",
    width: 7968,
    height: 5320,
    widths: [960, 1600, 2400],
    alt: "Downtown Chicago from high above at dusk, under a streaked orange sky",
    place: "Chicago",
    hub: true,
  },
  {
    slug: "dog",
    width: 3084,
    height: 4644,
    widths: [638, 1063, 1594],
    alt: "A small shaggy dog curled up in a grey dog bed",
    place: "At home",
  },
  {
    slug: "lincoln-park-skyline",
    width: 7137,
    height: 4765,
    widths: [960, 1600, 2400],
    alt: "The skyline reflected in a still pond, framed by trees and reeds",
    place: "Lincoln Park",
    hub: true,
  },
  {
    slug: "nicobar-pigeon",
    width: 4996,
    height: 3336,
    widths: [960, 1600, 2400],
    alt: "An iridescent green and copper Nicobar pigeon sitting on its nest among leaves",
    place: "Lincoln Park Zoo",
    hub: true,
  },
  {
    slug: "riverfront-towers",
    width: 5320,
    height: 7968,
    widths: [641, 1068, 1602],
    alt: "Evening sun on the towers above the riverwalk",
    place: "Chicago River",
  },
  {
    slug: "navy-pier-above",
    width: 6728,
    height: 4357,
    widths: [960, 1600, 2400],
    alt: "Navy Pier and the lakefront seen from high above",
    place: "Navy Pier",
    hub: true,
  },
  {
    slug: "through-the-bridge",
    width: 5817,
    height: 3884,
    widths: [960, 1600, 2400],
    alt: "Marina City and the river towers framed by the underside of a bridge",
    place: "Chicago River",
  },
  {
    slug: "tawny-frogmouth",
    width: 5830,
    height: 3892,
    widths: [960, 1600, 2400],
    alt: "A tawny frogmouth perched on a branch, staring back",
    place: "Lincoln Park Zoo",
  },
  {
    slug: "river-cruise",
    width: 4607,
    height: 6900,
    widths: [641, 1068, 1602],
    alt: "A sightseeing boat on the green river below Marina City, a pink hibiscus in the foreground",
    place: "Chicago River",
  },
  {
    slug: "van-buren-street",
    width: 7968,
    height: 5320,
    widths: [960, 1600, 2400],
    alt: "The Van Buren Street bridge under dark glass towers",
    place: "Van Buren Street",
  },
];

/** Path of a photo's 3:2 carousel crop, also its link preview image. */
export function hubSrc(photo: GalleryPhoto): string {
  return `/photos/${photo.slug}.jpg`;
}

/** Path of a photo's rendition at width `w`. */
export function fullSrc(photo: GalleryPhoto, w: number): string {
  return `/photos/full/${photo.slug}-${w}.webp`;
}
