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

/** Build a soft, puffy cloud sprite on its own offscreen canvas. */
function makeCloudSprite(seed: number, dpr: number): HTMLCanvasElement {
  const w = 320;
  const h = 180;
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // A cluster of overlapping soft radial blobs = one fluffy cloud.
  // Vary the cluster deterministically by seed so clouds aren't identical.
  const rnd = mulberry32(seed * 9973 + 7);
  const puffs = 6 + Math.floor(rnd() * 4);
  const cx = w * 0.5;
  const cy = h * 0.62;

  for (let i = 0; i < puffs; i++) {
    const angle = (i / puffs) * Math.PI * 2 + rnd() * 0.6;
    const dist = (0.18 + rnd() * 0.32) * w * 0.5;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist * 0.5;
    const r = (0.22 + rnd() * 0.26) * w * 0.5;

    const g = ctx.createRadialGradient(px, py, r * 0.1, px, py, r);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.6, "rgba(255,255,255,0.7)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // a soft flat-ish base so the bottom reads as a cloud, not a fuzzy ball
  const base = ctx.createRadialGradient(cx, cy + h * 0.12, 10, cx, cy + h * 0.12, w * 0.42);
  base.addColorStop(0, "rgba(255,255,255,0.9)");
  base.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.14, w * 0.42, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

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
    const perBand = [7, 6, 5];
    BANDS.forEach((b, band) => {
      for (let i = 0; i < perBand[band]; i++) {
        const dir = rnd() > 0.5 ? 1 : -1;
        clouds.push({
          band,
          x: rnd(),
          y: 0.05 + rnd() * 0.9,
          scale: (0.5 + rnd() * 0.5) * (0.7 + band * 0.35),
          opacity: (0.35 + rnd() * 0.25) * (0.7 + band * 0.28),
          speed: dir * (0.008 + rnd() * 0.02) * b.drift,
          bobAmp: 6 + rnd() * 14 + band * 6,
          bobSpeed: (0.12 + rnd() * 0.16),
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
    const SPRITE_W = 320;
    const SPRITE_H = 180;

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
