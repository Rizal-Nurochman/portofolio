"use client";

import { useEffect, useRef } from "react";
import GopherSVG from "./GopherSVG";
import styles from "./GopherCompanion.module.css";

/**
 * The Gopher that climbs the sky. Driven by a single requestAnimationFrame loop
 * that writes the wrapper's transform every frame — deliberately NOT a CSS
 * animation, because the global prefers-reduced-motion rule in globals.css
 * freezes all CSS animation. A JS loop keeps the hop alive on every machine.
 *
 * Two motions combine into one transform string:
 *  1. A continuous, self-driven hop (a clamped parabola with squash/stretch) so
 *     it's visibly bouncing even when you never touch the scroll wheel.
 *  2. Scroll progress → vertical travel up the viewport (the climb) and a
 *     horizontal flip to face the direction of travel; fast scrolling briefly
 *     boosts the hop height.
 *
 * Under reduce-motion we keep a gentle, slow bob (decorative, non-vestibular)
 * but stop the scroll-driven leaping — motion triggered by interaction is the
 * part WCAG 2.3.3 targets. Decorative throughout (aria-hidden).
 */
export default function GopherCompanion() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = performance.now();
    let lastScrollY = window.scrollY;
    let boost = 0;
    let facing = 1;
    // travel band as a fraction of viewport height: low at page top, high at bottom
    const LOW = 0.68;
    const HIGH = 0.2;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const progress = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;

      const velocity = y - lastScrollY;
      lastScrollY = y;
      if (Math.abs(velocity) > 0.5) facing = velocity > 0 ? 1 : -1;
      boost = Math.max(boost * 0.92, Math.min(Math.abs(velocity) / 50, 1));

      // vertical climb position (px from top of viewport)
      const bandTop = (LOW + (HIGH - LOW) * progress) * window.innerHeight;

      // the hop: a repeating clamped bounce. Under reduce-motion, a slow calm bob.
      let hopY: number;
      let squashY = 1;
      let squashX = 1;
      if (reduce) {
        hopY = Math.sin(t * 0.8) * 5;
      } else {
        const HOP_PERIOD = 1.05;
        const phase = (now / 1000 / HOP_PERIOD) % 1;
        // parabolic arc: up then down, peak at phase 0.5
        const arc = 1 - Math.pow(2 * phase - 1, 2); // 0..1..0
        const peak = 40 + boost * 34;
        hopY = -arc * peak;
        // squash at the bottom of the cycle, stretch near the peak
        const ground = 1 - arc; // 1 at ground, 0 at peak
        squashY = 1 - ground * 0.1 + arc * 0.06;
        squashX = 1 + ground * 0.12 - arc * 0.05;
      }

      el.style.transform =
        `translate3d(0, ${(bandTop + hopY).toFixed(1)}px, 0) ` +
        `scaleX(${(facing * squashX).toFixed(3)}) scaleY(${squashY.toFixed(3)})`;
      el.style.transformOrigin = "center bottom";

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className={styles.companion} aria-hidden="true">
      <GopherSVG width={150} className={styles.gopher} />
    </div>
  );
}
