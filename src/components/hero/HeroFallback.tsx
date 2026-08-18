/**
 * Static stand-in for the 3D canvas: shown for reduced motion, weak devices,
 * while the lazy chunk loads, or if the .mira parse fails.
 * Posters are captured from the live scene per theme, so the flat background
 * blends into the page.
 */
export function HeroFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <img
        src="/models/dozer-poster-light.png"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain dark:hidden"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <img
        src="/models/dozer-poster-dark.png"
        alt=""
        aria-hidden="true"
        className="hidden h-full w-full object-contain dark:block"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}
