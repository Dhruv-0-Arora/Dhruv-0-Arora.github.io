import type { Hue } from "../lib/hues";

export interface Project {
  name: string;
  tagline: string;
  description?: string;
  tech: string[];
  repo?: string;
  demo?: string;
  tier: "featured" | "compact";
  highlight?: string;
  image?: string;
  /** Stable id used for thumbnail lookup: public/thumbs/<slug>.webp */
  slug?: string;
  /** Per-project accent hue; falls back to the global ember accent. */
  accent?: Hue;
}

export interface Experience {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
  tech: string[];
}

export interface Award {
  title: string;
  detail?: string;
  year: string;
}

export interface LeadershipRole {
  organization: string;
  role: string;
  period: string;
  detail: string;
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface SocialLink {
  label: string;
  href: string;
}
