import type { Experience } from "./types";

export const experience: Experience[] = [
  {
    company: "Autodesk",
    role: "Software Engineering Intern",
    location: "Portland, OR",
    start: "Jun 2024",
    end: "present",
    bullets: [
      "1 of 2 paid high school interns selected to develop and market Synthesis, a robotics simulator and 3D file exporter with 5K+ users.",
      "Built and led the team presentation of Synthesis' core value proposition to Autodesk's EVP and executive team.",
    ],
    tech: ["React", "TypeScript", "Three.js", "Python", "Docker", "AWS"],
  },
  {
    company: "SwiftLabs",
    role: "Partner / Developer",
    location: "Clive, IA",
    start: "Jun 2025",
    end: "present",
    bullets: [
      "Built a 5-figure government contract product for School Administrators of Iowa that helps principals draft teacher evaluation reports.",
      "Designed and deployed the evaluation portal to 2K+ government-authorized users, interfacing directly with clients.",
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
