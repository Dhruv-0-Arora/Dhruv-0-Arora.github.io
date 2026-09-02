import type { Experience } from "./types";

export const experience: Experience[] = [
  {
    company: "Autodesk",
    role: "Software Engineering Intern",
    location: "Portland, OR",
    start: "Jun 2024",
    end: "present",
    bullets: [
      "1 of 2 paid high school interns selected to develop and market Synthesis, a robotics simulator and 3D file exporter. Its user base grew from 5K to 20K+ across my tenure.",
      "Built and led the team presentation of Synthesis' core value proposition to Autodesk's EVP and executive team.",
    ],
    tech: ["React", "TypeScript", "Three.js", "Python", "Docker", "AWS"],
  },
  {
    company: "SwiftLabs",
    role: "Partner / Developer",
    location: "Remote",
    start: "Jun 2025",
    end: "present",
    bullets: [
      "I built and maintain a production platform for a US state government client, a paid five-figure contract.",
      "Deployed to 2,000+ authorized users. I interface directly with the client.",
    ],
    tech: ["React", "Express", "Firebase", "Tailwind CSS", "Vite", "Vercel"],
  },
  {
    company: "True Martial Arts",
    role: "Senior Instructor",
    location: "Sammamish, WA",
    start: "Apr 2021",
    end: "Jun 2025",
    bullets: [
      "Trained 30+ assistant and head instructors and directly evaluated 100+ students in Taekwondo proficiency.",
      "Organized events and tournaments for 700+ participants across 4 schools, managing judges, scoring, and safety.",
    ],
    tech: ["Instruction", "Evaluation", "Event operations"],
  },
];
