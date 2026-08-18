import { m, useReducedMotion, type Variants } from "motion/react";
import { lazy, Suspense } from "react";
import { profile, socials } from "../../content/profile";
import { useIdleMount } from "../../lib/useIdleMount";
import { useReducedMotionOrMobile } from "../../lib/useReducedMotionOrMobile";
import { HeroFallback } from "./HeroFallback";

const HeroCanvas = lazy(() => import("./HeroCanvas"));

const stagger: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.08 + i * 0.06, duration: 0.55, ease: "easeOut" },
  }),
};

export function Hero() {
  const reduced = useReducedMotion();
  const useStatic = useReducedMotionOrMobile();
  const idle = useIdleMount();
  const show3d = !useStatic && idle;

  const item = (i: number) =>
    reduced
      ? {}
      : ({
          variants: stagger,
          initial: "hidden",
          animate: "show",
          custom: i,
        } as const);

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-6 pt-14 md:grid-cols-[1fr_1.2fr]">
        <div className="relative z-10">
          <m.p {...item(0)} className="mb-4 font-mono text-sm text-accent">
            {profile.kicker}
          </m.p>
          <m.h1
            {...item(1)}
            className="font-display text-5xl font-bold tracking-tight md:text-6xl"
          >
            {profile.name}
          </m.h1>
          <m.p
            {...item(2)}
            className="mt-5 max-w-md text-lg leading-relaxed text-muted"
          >
            {profile.headline}
          </m.p>
          <m.div {...item(3)} className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              View projects
            </a>
            <a
              href={profile.resumeHref}
              download="Arora_Dhruv_Resume.pdf"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              Download resume
            </a>
          </m.div>
          <m.div {...item(4)} className="mt-8 flex gap-4">
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                className="font-mono text-[13px] text-faint underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {label.toLowerCase()}
              </a>
            ))}
          </m.div>
        </div>

        <div
          className="relative h-[340px] md:h-[560px] md:-mr-[max(0px,calc((100vw-64rem)/2))]"
          aria-hidden="true"
        >
          {show3d ? (
            <Suspense fallback={<HeroFallback />}>
              <HeroCanvas />
            </Suspense>
          ) : (
            <HeroFallback />
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-4">
        <p className="pointer-events-auto px-6 text-center font-mono text-xs text-faint">
          Dozer - parsed live from a{" "}
          <a
            href="https://github.com/Autodesk/synthesis"
            target="_blank"
            rel="noreferrer"
            className="text-muted underline underline-offset-4 transition-colors hover:text-accent"
          >
            Synthesis
          </a>{" "}
          .mira file
        </p>
        <div className="h-8 w-px bg-gradient-to-b from-faint to-transparent" />
      </div>
    </section>
  );
}
