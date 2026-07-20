"use client";

import { useEffect, useRef } from "react";
import styles from "./SkyCanvas.module.css";

/**
 * The living daytime sky, drawn on a real <canvas> with a continuous
 * requestAnimationFrame loop. This is deliberately NOT CSS animation: the
 * global `prefers-reduced-motion` rule in globals.css freezes every CSS
 * animation/transition, so an ambient CSS sky dies completely on machines that
 * have "reduce motion" enabled. A JS render loop repaints every frame and stays
 * alive regardless — which is what makes the sky read as genuinely moving.
 *
 * Composition:
 *  - a vertical daytime gradient background (painted each frame)
 *  - three depth bands of soft clouds; nearer bands are larger, more opaque,
 *    and drift faster. Clouds wrap around the horizontal edges so the sky is
 *    never empty.
 *  - each cloud bobs vertically on its own sine phase so nothing moves in
 *    lockstep.
 *  - scroll adds a bounded vertical parallax per band (the "climb"); this is
 *    interaction-driven motion, so it's the one thing we damp under
 *    reduce-motion. The ambient drift/bob keeps going — decorative, gentle,
 *    non-vestibular.
 *
 * Clouds are pre-rendered once to offscreen sprite canvases and blitted each
 * frame (cheap drawImage), so the per-frame cost stays tiny and holds 60fps.
 * Decorative throughout: the canvas is aria-hidden.
 */

interface Cloud {
  band: number; // depth band index
  x: number; // 0..1 fraction of width
  y: number; // 0..1 fraction of height
  scale: number;
  opacity: number;
  speed: number; // fraction of width per second (signed)
  bobAmp: number; // px
  bobSpeed: number; // rad per second
  bobPhase: number;
  sprite: number; // which sprite shape
}

// Depth bands: [driftMultiplier, parallax px across full scroll]
const BANDS = [
  { drift: 0.6, parallax: 26 }, // far: small, faint, slow
  { drift: 1.0, parallax: 60 }, // mid
  { drift: 1.6, parallax: 110 }, // near: big, bright, fast
];

// Sky gradient stops (sampled from the OKLCH tokens, in sRGB for canvas).
const SKY_TOP = "#7fb2e6"; // --sky-high-ish
const SKY_MID = "#9cc6f0";
const SKY_LOW = "#bfe0f7"; // horizon, paler

// The four crisp cloud silhouettes from CloudShape.tsx, on a 200x100 viewBox.
// Reusing them keeps the canvas sky consistent with the SVG clouds elsewhere,
// and — crucially — gives every cloud a DEFINED EDGE. Soft radial blobs read as
// smoke and, having no edge, make drift impossible for the eye to track. A hard
// silhouette with a gentle top-lit gradient inside reads as a real cloud and
// its motion is legible.
const CLOUD_PATHS = [
  "M30 78 Q10 78 10 60 Q10 44 28 42 Q30 22 54 22 Q70 8 92 20 Q112 10 128 26 Q150 20 160 40 Q186 42 186 60 Q186 78 166 78 Z",
  "M44 80 Q22 80 22 60 Q22 46 38 44 Q40 22 68 24 Q84 6 108 22 Q134 18 138 42 Q160 46 158 62 Q158 80 138 80 Z",
  "M52 76 Q34 76 34 60 Q34 48 48 46 Q52 30 74 32 Q90 22 106 34 Q126 34 126 52 Q140 56 138 66 Q136 76 120 76 Z",
  "M24 74 Q8 74 8 62 Q8 50 24 48 Q28 34 52 36 Q64 26 82 34 Q100 28 116 36 Q140 32 152 46 Q176 46 178 60 Q180 74 160 74 Z",
];

const SPRITE_VW = 200; // path viewBox width
const SPRITE_VH = 100; // path viewBox height
const SPRITE_PAD = 16; // room around the shape for the soft drop shadow

/**
 * Pre-render one crisp cloud silhouette to an offscreen canvas: a defined shape
 * filled with a subtle top→bottom white gradient (bright crown, faintly shaded
 * underside) so it has volume, plus a soft shadow beneath. Blitted each frame.
 */
function makeCloudSprite(shape: number, dpr: number): HTMLCanvasElement {
  const w = SPRITE_VW + SPRITE_PAD * 2;
  const h = SPRITE_VH + SPRITE_PAD * 2;
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.translate(SPRITE_PAD, SPRITE_PAD);

  const path = new Path2D(CLOUD_PATHS[shape % CLOUD_PATHS.length]);

  // soft shadow under the cloud for a touch of depth
  ctx.save();
  ctx.shadowColor = "rgba(70, 110, 160, 0.28)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 7;
  ctx.fillStyle = "#ffffff";
  ctx.fill(path);
  ctx.restore();

  // top-lit gradient fill inside the crisp silhouette → gives the cloud volume
  const g = ctx.createLinearGradient(0, 6, 0, SPRITE_VH);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, "#f4f9ff");
  g.addColorStop(1, "#d9e8f7");
  ctx.fillStyle = g;
  ctx.fill(path);

  return c;
}

/** Tiny deterministic PRNG so cloud layouts are stable across renders. */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const sprites: HTMLCanvasElement[] = [
      makeCloudSprite(1, dpr),
      makeCloudSprite(2, dpr),
      makeCloudSprite(3, dpr),
      makeCloudSprite(4, dpr),
    ];

    // Build the cloud field. More/bigger clouds in nearer bands.
    const clouds: Cloud[] = [];
    const rnd = mulberry32(42);
    const perBand = [6, 5, 4];
    BANDS.forEach((b, band) => {
      for (let i = 0; i < perBand[band]; i++) {
        const dir = rnd() > 0.5 ? 1 : -1;
        clouds.push({
          band,
          x: rnd(),
          y: 0.05 + rnd() * 0.9,
          // bigger clouds overall so the silhouette reads clearly
          scale: (0.85 + rnd() * 0.6) * (0.8 + band * 0.4),
          opacity: (0.55 + rnd() * 0.3) * (0.7 + band * 0.3),
          // ~4-8x faster than before so the drift is actually legible
          speed: dir * (0.035 + rnd() * 0.05) * b.drift,
          bobAmp: 5 + rnd() * 10 + band * 5,
          bobSpeed: 0.12 + rnd() * 0.16,
          bobPhase: rnd() * Math.PI * 2,
          sprite: Math.floor(rnd() * sprites.length),
        });
      }
    });
    // draw far bands first
    clouds.sort((a, b) => a.band - b.band);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let scrollProgress = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    };
    onScroll();

    let raf = 0;
    let last = performance.now();
    const SPRITE_W = SPRITE_VW + SPRITE_PAD * 2;
    const SPRITE_H = SPRITE_VH + SPRITE_PAD * 2;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp for tab-switches
      last = now;
      const t = now / 1000;

      // sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, SKY_TOP);
      grad.addColorStop(0.5, SKY_MID);
      grad.addColorStop(1, SKY_LOW);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      for (const cl of clouds) {
        // ambient drift always runs (decorative); damped a touch under reduce
        cl.x += cl.speed * dt * (reduce ? 0.25 : 1);
        if (cl.x > 1.25) cl.x -= 1.5;
        if (cl.x < -0.25) cl.x += 1.5;

        const bob = reduce ? 0 : Math.sin(t * cl.bobSpeed + cl.bobPhase) * cl.bobAmp;
        // scroll parallax is interaction-driven → damped hard under reduce
        const parallax =
          -scrollProgress * BANDS[cl.band].parallax * (reduce ? 0.15 : 1);

        const w = SPRITE_W * cl.scale;
        const h = SPRITE_H * cl.scale;
        const px = cl.x * width - w / 2;
        const py = cl.y * height - h / 2 + bob + parallax;

        ctx.globalAlpha = cl.opacity;
        ctx.drawImage(sprites[cl.sprite], px, py, w, h);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.sky} aria-hidden="true" />;
}
