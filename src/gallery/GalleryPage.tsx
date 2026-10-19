import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  fullSrc,
  type GalleryPhoto,
  gallery,
  galleryPage,
} from "../content/gallery";
import { profile } from "../content/profile";
import { justifyRows } from "./justify.ts";

function srcSet(photo: GalleryPhoto): string {
  return photo.widths.map((w) => `${fullSrc(photo, w)} ${w}w`).join(", ");
}

/** The lightbox image fits inside the viewport less its chrome. */
function lightboxSizes(photo: GalleryPhoto): string {
  const ratio = (photo.width / photo.height).toFixed(3);
  return `min(calc(100vw - 2rem), calc((100vh - 8rem) * ${ratio}))`;
}

/**
 * The aspect sum of an ideal row per breakpoint, widest first: rows about
 * 300 px tall in the 72rem column, two landscapes across a tablet, one
 * landscape (or two portraits) across a phone.
 */
const LAYOUTS = [
  { query: "(min-width: 1024px)", target: 3.6 },
  { query: "(min-width: 640px)", target: 2.6 },
];
const PHONE_TARGET = 1.5;

function rowTarget(): number {
  return (
    LAYOUTS.find((l) => window.matchMedia(l.query).matches)?.target ??
    PHONE_TARGET
  );
}

function subscribeLayout(onChange: () => void) {
  const lists = LAYOUTS.map((l) => window.matchMedia(l.query));
  for (const l of lists) l.addEventListener("change", onChange);
  return () => {
    for (const l of lists) l.removeEventListener("change", onChange);
  };
}

const aspect = (p: GalleryPhoto) => p.width / p.height;

function useRows(): GalleryPhoto[][] {
  const target = useSyncExternalStore(subscribeLayout, rowTarget);
  return useMemo(
    () =>
      justifyRows(gallery.map(aspect), target).map((row) =>
        row.map((i) => gallery[i]),
      ),
    [target],
  );
}

/**
 * What a tile renders at: its share of the row's width, inside `max-w-6xl`
 * less the page gutter (`px-4`, `sm:px-6`) and the row's gaps (`gap-3`).
 */
function tileSizes(photo: GalleryPhoto, row: GalleryPhoto[]): string {
  const share = (
    aspect(photo) / row.reduce((t, p) => t + aspect(p), 0)
  ).toFixed(4);
  const gaps = `${(row.length - 1) * 0.75}rem`;
  return `(min-width: 640px) calc((min(100vw, 72rem) - 3rem - ${gaps}) * ${share}), calc((100vw - 2rem - ${gaps}) * ${share})`;
}

function slugFromHash(): string | null {
  const slug = decodeURIComponent(location.hash.slice(1));
  return gallery.some((p) => p.slug === slug) ? slug : null;
}

/**
 * The open photo lives in the URL hash, so a link to one photo opens it,
 * and the back button closes it when the lightbox pushed the entry.
 */
function useHashPhoto() {
  const [slug, setSlug] = useState(slugFromHash);
  const pushed = useRef(false);

  useEffect(() => {
    const sync = () => {
      pushed.current = false;
      setSlug(slugFromHash());
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const open = useCallback((next: string) => {
    history.pushState(null, "", `#${next}`);
    pushed.current = true;
    setSlug(next);
  }, []);

  const go = useCallback((next: string) => {
    history.replaceState(null, "", `#${next}`);
    setSlug(next);
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      // popstate clears the slug.
      history.back();
      return;
    }
    history.replaceState(null, "", location.pathname + location.search);
    setSlug(null);
  }, []);

  return { slug, open, go, close };
}

export function GalleryPage() {
  const { slug, open, go, close } = useHashPhoto();
  const rows = useRows();
  const index = slug ? gallery.findIndex((p) => p.slug === slug) : -1;
  const lastOpened = useRef<string | null>(null);

  useEffect(() => {
    if (slug) {
      lastOpened.current = slug;
      return;
    }
    // Back on the grid: focus returns to the photo that was last open.
    const prev = lastOpened.current;
    lastOpened.current = null;
    if (prev) document.getElementById(`photo-${prev}`)?.focus();
  }, [slug]);

  return (
    <>
      <header className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="/"
          className="font-display text-lg font-bold tracking-tight text-text"
          aria-label={`${profile.name}, home`}
        >
          da<span className="text-accent">.</span>
        </a>
        <a
          href="/"
          className="font-mono text-[13px] text-muted transition-colors hover:text-accent"
        >
          <span aria-hidden="true">← </span>back to the range
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="pt-10 pb-8 sm:pt-16 sm:pb-10">
          <p className="font-mono text-[13px] text-accent">{profile.name}</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {galleryPage.title}
          </h1>
          <p className="mt-3 max-w-xl text-muted">{galleryPage.intro}</p>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <ul key={row[0].slug} className="flex gap-3">
              {row.map((photo) => (
                <li
                  key={photo.slug}
                  className="min-w-0"
                  // Widths in proportion to aspect give the row one height.
                  style={{ flex: `${aspect(photo)} 1 0%` }}
                >
                  <Tile
                    photo={photo}
                    sizes={tileSizes(photo, row)}
                    onOpen={open}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 font-mono text-xs text-faint sm:px-6">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <a href="/" className="transition-colors hover:text-accent">
            darora1.me
          </a>
        </div>
      </footer>

      {index >= 0 ? (
        <Lightbox
          index={index}
          onClose={close}
          onGo={(i) => go(gallery[(i + gallery.length) % gallery.length].slug)}
        />
      ) : null}
    </>
  );
}

function Tile({
  photo,
  sizes,
  onOpen,
}: {
  photo: GalleryPhoto;
  sizes: string;
  onOpen: (slug: string) => void;
}) {
  return (
    <a
      id={`photo-${photo.slug}`}
      href={`#${photo.slug}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(photo.slug);
      }}
      className="group relative block overflow-hidden rounded-md bg-surface-2"
    >
      <img
        src={fullSrc(photo, photo.widths[0])}
        srcSet={srcSet(photo)}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 pt-8 pb-2.5 font-mono text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        {photo.place}
      </span>
    </a>
  );
}

const control =
  "rounded-md px-3 py-2 font-mono text-[13px] text-white/75 transition-colors hover:bg-white/10 hover:text-white";

function Lightbox({
  index,
  onClose,
  onGo,
}: {
  index: number;
  onClose: () => void;
  onGo: (index: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const photo = gallery[index];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    el.showModal();
    // Focus the dialog itself rather than its first button, so opening a
    // photo does not ring the close control.
    el.focus();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
      el.close();
    };
  }, []);

  // Warm the neighbours so stepping through does not flash empty.
  useEffect(() => {
    for (const i of [index - 1, index + 1]) {
      const p = gallery[(i + gallery.length) % gallery.length];
      const img = new Image();
      img.sizes = lightboxSizes(p);
      img.srcset = srcSet(p);
    }
  }, [index]);

  return (
    <dialog
      ref={dialog}
      tabIndex={-1}
      // Inline, since the page-wide :focus-visible ring is unlayered and
      // would beat a utility class.
      style={{ outline: "none" }}
      aria-label={`${photo.place}, photo ${index + 1} of ${gallery.length}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onGo(index - 1);
        else if (e.key === "ArrowRight") onGo(index + 1);
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // A click on the empty dark (not the photo or a control) closes.
        const target = e.target as HTMLElement;
        if (target === e.currentTarget || "backdrop" in target.dataset)
          onClose();
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 50) onGo(dx < 0 ? index + 1 : index - 1);
      }}
      className="m-0 flex h-dvh max-h-none w-screen max-w-none flex-col bg-black p-0 text-white backdrop:bg-black"
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-2 sm:px-4">
        <span className="px-3 font-mono text-[13px] text-white/60">
          {index + 1} / {gallery.length}
        </span>
        <button type="button" onClick={onClose} className={control}>
          close <span aria-hidden="true">×</span>
        </button>
      </div>

      <div
        data-backdrop
        className="flex min-h-0 flex-1 items-center justify-center px-4"
      >
        <img
          key={photo.slug}
          src={fullSrc(photo, photo.widths[photo.widths.length - 1])}
          srcSet={srcSet(photo)}
          sizes={lightboxSizes(photo)}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          className="h-auto max-h-full w-auto max-w-full object-contain"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        />
      </div>

      <div className="flex min-h-16 shrink-0 items-center justify-between gap-2 px-2 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => onGo(index - 1)}
          className={control}
          aria-label="Previous photo"
        >
          <span aria-hidden="true">‹ </span>prev
        </button>
        <p className="min-w-0 text-center text-sm">
          <span className="font-mono text-xs text-white/60">{photo.place}</span>
          <span className="mt-0.5 hidden text-white/85 sm:block">
            {photo.alt}
          </span>
        </p>
        <button
          type="button"
          onClick={() => onGo(index + 1)}
          className={control}
          aria-label="Next photo"
        >
          next<span aria-hidden="true"> ›</span>
        </button>
      </div>
    </dialog>
  );
}
