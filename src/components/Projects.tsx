import { profile } from "../content/profile";
import { compactProjects } from "../content/projects";
import { ProjectCardCompact } from "./ProjectCardCompact";
import { ProjectsShowcase } from "./projects-showcase/ProjectsShowcase";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Projects() {
  return (
    <Section id="projects" index="03" title="projects" wide hue="violet">
      <ProjectsShowcase />

      <div className="mt-14 mb-6 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">more projects</h3>
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          all repos on github
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {compactProjects.map((project, i) => (
          <Reveal key={project.name} delay={(i % 3) * 0.05}>
            <ProjectCardCompact project={project} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
