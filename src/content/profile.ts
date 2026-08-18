import type { SocialLink } from "./types";

export const profile = {
  name: "Dhruv Arora",
  kicker: "cs + math @ uw-madison",
  headline: "I build simulators, terminals, and systems that think in graphs.",
  location: "Seattle / Madison",
  email: "a_dhruv@outlook.com",
  resumeHref: "/resume/Arora_Dhruv_Resume.pdf",
  github: "https://github.com/Dhruv-0-Arora",
  about: [
    "I'm a computer science and math student at UW-Madison, currently a software engineering intern at Autodesk, where I help build Synthesis - an open source robotics simulator used by 5,000+ FIRST robotics students. Before that meant anything on a resume, it meant I got to demo my own work to Autodesk's executive team as one of two high school interns.",
    "Outside of work I live in the terminal: I write Rust CLI and TUI tools, tinker with prediction-market trading systems, and build agent-native software that language models can actually use. I care about tools that are fast, quiet, and precise - and I hold the things I ship to that same standard.",
  ],
  interests: [
    "classical piano",
    "bouldering + mountaineering",
    "jiujitsu + taekwondo (2nd degree black belt)",
    "trail building",
    "microphone architecture",
  ],
};

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/Dhruv-0-Arora" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dhruv0arora" },
  { label: "Email", href: "mailto:a_dhruv@outlook.com" },
];
