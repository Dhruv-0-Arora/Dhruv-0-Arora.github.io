import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { profile } from "../content/profile";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { id: "about", label: "about" },
  { id: "experience", label: "experience" },
  { id: "projects", label: "projects" },
  { id: "skills", label: "skills" },
  { id: "recognition", label: "recognition" },
];

export function Nav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const { id } of links) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6"
        aria-label="Main"
      >
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-text"
        >
          da<span className="text-accent">.</span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={clsx(
                "rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors",
                active === id ? "text-accent" : "text-muted hover:text-text",
              )}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={profile.resumeHref}
            download="Arora_Dhruv_Resume.pdf"
            className="rounded-lg border border-border px-3 py-1.5 font-mono text-[13px] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            resume
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
