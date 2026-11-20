import { awards, leadership } from "../content/awards";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Awards() {
  return (
    <Section id="recognition" index="05" title="recognition" wide hue="amber">
      <div className="grid gap-12 md:grid-cols-2">
        <Reveal>
          <h3 className="mb-5 font-display text-lg font-semibold">awards</h3>
          <ul className="space-y-4">
            {awards.map((award) => (
              <li key={award.title} className="flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-xs text-faint">
                  {award.year}
                </span>
                <div>
                  <p className="text-sm font-medium">{award.title}</p>
                  {award.detail && (
                    <p className="text-sm text-muted">{award.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.07}>
          <h3 className="mb-5 font-display text-lg font-semibold">
            leadership
          </h3>
          <ul className="space-y-6">
            {leadership.map((role) => (
              <li key={role.organization}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {role.role}
                    <span className="text-muted"> · {role.organization}</span>
                  </p>
                  <span className="shrink-0 font-mono text-xs text-faint">
                    {role.period}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {role.detail}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
