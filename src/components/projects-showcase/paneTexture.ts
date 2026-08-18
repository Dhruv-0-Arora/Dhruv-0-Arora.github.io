import { useEffect, useState } from "react";
import * as THREE from "three";
import type { Project } from "../../content/types";
import { HUE_HEX } from "../../lib/hues";

const proceduralCache = new Map<string, THREE.Texture>();
const thumbCache = new Map<string, THREE.Texture>();

function darken(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * (1 - amount));
  const g = Math.round(((n >> 8) & 0xff) * (1 - amount));
  const b = Math.round((n & 0xff) * (1 - amount));
  return `rgb(${r} ${g} ${b})`;
}

/**
 * Placeholder artwork drawn to a canvas: project-hue gradient, giant initial,
 * name in mono. Used until real thumbnails land in public/thumbs/<slug>.webp.
 * Always uses the dark-theme hue so panes read as consistent artwork in both
 * themes.
 */
function proceduralTexture(project: Project): THREE.Texture {
  const key = project.slug ?? project.name;
  const cached = proceduralCache.get(key);
  if (cached) return cached;

  const w = 1024;
  const h = 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const hex = project.accent ? HUE_HEX[project.accent].dark : "#f97316";

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, darken(hex, 0.25));
    gradient.addColorStop(1, darken(hex, 0.72));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255 255 255 / 0.14)";
    ctx.font = "700 480px 'Space Grotesk Variable', ui-sans-serif, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(project.name[0], w * 0.5, h * 0.58);

    ctx.fillStyle = "rgba(255 255 255 / 0.88)";
    ctx.font = "500 34px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(project.name.toLowerCase(), 48, h - 56);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  proceduralCache.set(key, texture);
  return texture;
}

let cachedShadow: THREE.Texture | null = null;

/** Pre-blurred radial gradient used as a soft drop shadow under each pane. */
export function shadowTexture(): THREE.Texture {
  if (cachedShadow) return cachedShadow;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgb(0 0 0 / 1)");
    gradient.addColorStop(0.4, "rgb(0 0 0 / 0.55)");
    gradient.addColorStop(0.7, "rgb(0 0 0 / 0.18)");
    gradient.addColorStop(1, "rgb(0 0 0 / 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  cachedShadow = new THREE.CanvasTexture(canvas);
  return cachedShadow;
}

/**
 * Returns the pane texture for a project: the procedural placeholder
 * immediately, silently upgraded to the real thumbnail if it exists.
 */
export function usePaneTexture(project: Project): THREE.Texture {
  const [texture, setTexture] = useState<THREE.Texture>(() => {
    const key = project.slug ?? project.name;
    return thumbCache.get(key) ?? proceduralTexture(project);
  });

  useEffect(() => {
    if (!project.slug || thumbCache.has(project.slug)) return;
    const slug = project.slug;
    let cancelled = false;
    new THREE.TextureLoader().load(
      `/thumbs/${slug}.webp`,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 4;
        thumbCache.set(slug, loaded);
        if (!cancelled) setTexture(loaded);
      },
      undefined,
      () => {
        // Thumbnail not present yet; keep the procedural placeholder.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [project.slug]);

  return texture;
}
