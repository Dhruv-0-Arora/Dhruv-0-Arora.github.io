import * as THREE from "three";
import type { Palette } from "../../theme/palette.ts";

/**
 * The picture on a floating screen or photo frame: a placeholder painted in
 * the palette until a source arrives, then an image or a looping video.
 * Never registered with the retint registry; the frame around it is.
 */

const PLACEHOLDER_W = 512;
const PLACEHOLDER_H = 288;
const PLACEHOLDER_FPS = 12;
const VIDEO_EXT = /\.(webm|mp4|mov)$/i;

type Rgb = { r: number; g: number; b: number };

function css(c: Rgb, alpha = 1): string {
  const to = (v: number) => Math.round(v * 255);
  return `rgb(${to(c.r)} ${to(c.g)} ${to(c.b)} / ${alpha})`;
}

/** Scales texture uv so an image of any aspect covers a frame of `aspect`. */
export function coverFit(texture: THREE.Texture, aspect: number): void {
  const image = texture.image as
    | {
        width?: number;
        height?: number;
        videoWidth?: number;
        videoHeight?: number;
      }
    | undefined;
  const w = image?.videoWidth || image?.width || 0;
  const h = image?.videoHeight || image?.height || 0;
  if (!w || !h) return;
  const source = w / h;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  if (source > aspect) {
    texture.repeat.set(aspect / source, 1);
    texture.offset.set((1 - aspect / source) / 2, 0);
  } else {
    texture.repeat.set(1, source / aspect);
    texture.offset.set(0, (1 - source / aspect) / 2);
  }
  texture.needsUpdate = true;
}

export class MediaSurface {
  readonly material: THREE.MeshBasicMaterial;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly placeholder: THREE.CanvasTexture;
  private media: THREE.Texture | null = null;
  private video: HTMLVideoElement | null = null;
  private palette: Palette | null = null;
  private clock = 0;
  private lastPaint = -1;
  private src: string | undefined;
  private disposed = false;
  private readonly aspect: number;

  constructor(aspect: number) {
    this.aspect = aspect;
    this.canvas = document.createElement("canvas");
    this.canvas.width = PLACEHOLDER_W;
    this.canvas.height = PLACEHOLDER_H;
    this.ctx = this.canvas.getContext("2d");
    this.placeholder = new THREE.CanvasTexture(this.canvas);
    this.placeholder.colorSpace = THREE.SRGBColorSpace;
    this.material = new THREE.MeshBasicMaterial({
      map: this.placeholder,
      toneMapped: false,
    });
  }

  setPalette(palette: Palette): void {
    this.palette = palette;
    this.lastPaint = -1;
  }

  /** An image (jpg, png, webp) or a video (webm, mp4). Undefined shows the placeholder. */
  setSource(src: string | undefined): void {
    if (src === this.src) return;
    this.src = src;
    this.clearMedia();
    if (!src) return;
    if (VIDEO_EXT.test(src)) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      video.src = src;
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      video.addEventListener(
        "loadedmetadata",
        () => {
          if (this.disposed || this.video !== video) return;
          coverFit(texture, this.aspect);
          this.show(texture);
        },
        { once: true },
      );
      video.addEventListener("error", () => this.clearMedia(), { once: true });
      this.video = video;
      this.media = texture;
      return;
    }
    new THREE.TextureLoader().load(
      src,
      (texture) => {
        if (this.disposed || this.src !== src) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        coverFit(texture, this.aspect);
        this.media = texture;
        this.show(texture);
      },
      undefined,
      () => {
        /* keep the placeholder */
      },
    );
  }

  /** Call every frame with whether the surface is on screen. */
  tick(dt: number, visible: boolean): void {
    if (this.video) {
      if (visible && this.video.paused) {
        this.video.play().catch(() => {
          /* autoplay policy: stays on the first frame */
        });
      } else if (!visible && !this.video.paused) {
        this.video.pause();
      }
      return;
    }
    if (this.media || !visible || !this.ctx || !this.palette) return;
    this.clock += dt;
    if (this.clock - this.lastPaint < 1 / PLACEHOLDER_FPS) return;
    this.lastPaint = this.clock;
    this.paint(this.ctx, this.palette, this.clock);
    this.placeholder.needsUpdate = true;
  }

  dispose(): void {
    this.disposed = true;
    this.clearMedia();
    this.placeholder.dispose();
    this.material.dispose();
  }

  private show(texture: THREE.Texture): void {
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  private clearMedia(): void {
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute("src");
      this.video.load();
      this.video = null;
    }
    this.media?.dispose();
    this.media = null;
    this.material.map = this.placeholder;
    this.material.needsUpdate = true;
    this.lastPaint = -1;
  }

  /** Color bars over the surface tone, a faint grid and a drifting scanline. */
  private paint(ctx: CanvasRenderingContext2D, p: Palette, t: number): void {
    const w = PLACEHOLDER_W;
    const h = PLACEHOLDER_H;
    ctx.fillStyle = css(p["surface-2"]);
    ctx.fillRect(0, 0, w, h);
    const bars = [
      p.accent,
      p["hue-amber-vivid"],
      p["hue-green-vivid"],
      p["hue-sky-vivid"],
      p["hue-violet-vivid"],
      p["hue-rose-vivid"],
    ];
    const barW = w / bars.length;
    bars.forEach((c, i) => {
      ctx.fillStyle = css(c, 0.55);
      ctx.fillRect(i * barW, 0, barW + 1, h * 0.62);
    });
    ctx.strokeStyle = css(p.border, 0.9);
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
    const sweep = ((t * 0.35) % 1) * (h + 24) - 12;
    ctx.fillStyle = css(p.text, 0.18);
    ctx.fillRect(0, sweep, w, 6);
    ctx.fillStyle = css(p.text, 0.08);
    ctx.fillRect(0, sweep + 6, w, 18);
  }
}
