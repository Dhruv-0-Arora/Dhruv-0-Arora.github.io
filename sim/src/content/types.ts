import type { Hue } from "../lib/hues";

export interface Project {
  name: string;
  tagline: string;
  description?: string;
  /** Technical specifics, one fact per line; the panel renders them as a list. */
  details?: string[];
  tech: string[];
  repo?: string;
  demo?: string;
  highlight?: string;
  slug?: string;
  /** Per-project accent hue; falls back to the global forest accent. */
  accent?: Hue;
}
