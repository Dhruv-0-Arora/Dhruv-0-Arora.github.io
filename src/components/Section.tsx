import { clsx } from "clsx";
import type { ReactNode } from "react";
import { type Hue, hueVar } from "../lib/hues";
import { Reveal } from "./Reveal";

interface SectionProps {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
  wide?: boolean;
  hue?: Hue;
}

export function Section({
  id,
  index,
  title,
  children,
  wide,
  hue,
}: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-28">
      <div className={clsx("mx-auto px-6", wide ? "max-w-5xl" : "max-w-3xl")}>
        <Reveal>
          <h2 className="mb-10 flex items-baseline gap-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            <span
              className="font-mono text-sm font-normal"
              style={{ color: hueVar(hue) }}
            >
              {index} /
            </span>
            {title}
          </h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}
