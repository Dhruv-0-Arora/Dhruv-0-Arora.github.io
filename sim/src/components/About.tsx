import { profile } from "../content/profile";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function About() {
  return (
    <Section id="about" index="01" title="about" hue="green">
      <div className="space-y-5">
        {profile.about.map((paragraph, i) => (
          <Reveal key={paragraph.slice(0, 24)} delay={i * 0.05}>
            <p className="leading-relaxed text-muted">{paragraph}</p>
          </Reveal>
        ))}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {interest}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
