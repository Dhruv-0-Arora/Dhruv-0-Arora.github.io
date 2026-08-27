import { About } from "../../components/About";
import { Awards } from "../../components/Awards";
import { Experience } from "../../components/Experience";
import { Footer } from "../../components/Footer";
import { Hero } from "../../components/hero/Hero";
import { Nav } from "../../components/Nav";
import { Projects } from "../../components/Projects";
import { Skills } from "../../components/Skills";

/**
 * The page for visitors who cannot or should not get the simulator:
 * reduced motion, tiny screens, no WebGL, or a canvas failure.
 */
export function StaticPortfolio() {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Awards />
      </main>
      <Footer />
    </>
  );
}
