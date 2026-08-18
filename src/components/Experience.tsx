import { experience } from "../content/experience";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { TechBadge } from "./TechBadge";

export function Experience() {
  return (
    <Section id="experience" index="02" title="experience" hue="sky">
      <ol className="relative space-y-12 border-l border-border pl-8">
        {experience.map((job, i) => (
          <li key={job.company} className="relative">
            <span
              className="absolute top-1.5 -left-[37px] h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-accent-soft"
              aria-hidden="true"
            />
            <Reveal delay={i * 0.05}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">
                  {job.role}
                  <span className="text-muted"> · {job.company}</span>
                </h3>
                <p className="font-mono text-xs text-faint">
                  {job.start} - {job.end}
                </p>
              </div>
              <p className="mt-1 font-mono text-xs text-faint">
                {job.location}
              </p>
              <ul className="mt-3 space-y-2">
                {job.bullets.map((bullet) => (
                  <li
                    key={bullet.slice(0, 24)}
                    className="text-sm leading-relaxed text-muted"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.tech.map((t) => (
                  <TechBadge key={t} label={t} />
                ))}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
