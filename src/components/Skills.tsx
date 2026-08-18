import { skillGroups } from "../content/skills";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { TechBadge } from "./TechBadge";

export function Skills() {
  return (
    <Section id="skills" index="04" title="skills" hue="rose">
      <div className="space-y-8">
        {skillGroups.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.05}>
            <p className="mb-3 font-mono text-xs text-hue-rose">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <TechBadge key={skill} label={skill} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
