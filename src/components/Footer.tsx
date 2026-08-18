import { profile, socials } from "../content/profile";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Get in touch
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Open to internships, interesting problems, and conversations about
            terminals, robots, or markets.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-on-accent transition-opacity hover:opacity-90"
            >
              Say hello
            </a>
            <a
              href={profile.resumeHref}
              download="Arora_Dhruv_Resume.pdf"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Resume
            </a>
          </div>
          <div className="mt-10 flex justify-center gap-5">
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                className="font-mono text-[13px] text-faint transition-colors hover:text-accent"
              >
                {label.toLowerCase()}
              </a>
            ))}
          </div>
          <p className="mt-12 font-mono text-xs text-faint">
            built with react + three.js, deployed on vercel
          </p>
          <p className="mt-2 font-mono text-xs text-faint">
            © {new Date().getFullYear()} Dhruv Arora
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
