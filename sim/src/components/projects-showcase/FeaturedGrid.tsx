import { featuredProjects } from "../../content/projects";
import { ProjectCardFeatured } from "../ProjectCardFeatured";
import { Reveal } from "../Reveal";

/**
 * The static featured-projects grid: the showcase's fallback for mobile,
 * reduced motion, and WebGL failures.
 */
export function FeaturedGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {featuredProjects.map((project, i) => (
        <Reveal
          key={project.name}
          delay={(i % 2) * 0.07}
          className={i === 0 ? "md:col-span-2" : undefined}
        >
          <ProjectCardFeatured project={project} />
        </Reveal>
      ))}
    </div>
  );
}
