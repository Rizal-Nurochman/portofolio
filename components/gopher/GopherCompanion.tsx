"use client";

import { useEffect, useRef } from "react";
import GopherSVG from "./GopherSVG";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./GopherCompanion.module.css";

/**
 * The Gopher that climbs the sky as you scroll. It's pinned to the viewport and
 * travels from low (page top) toward the upper-middle (page bottom), so
 * scrolling down reads as hopping UP through the clouds. Two things move it:
 *
 *  1. A continuous, self-driven hop (CSS animation) so it's visibly alive and
 *     bouncing even when you're not touching the scroll wheel.
 *  2. Scroll progress, which sets its vertical travel (the climb) and flips it
 *     to face the direction of travel. Fast scrolling briefly boosts the hop.
 *
 * All movement is transform/translate, batched in one rAF. Under reduced-motion
 * it parks calmly with no hop and no scroll listener. Decorative throughout
 * (aria-hidden), scaled down and nudged aside on phones so it never covers
 * content or controls.
 */
export default function GopherCompanion() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (prefersReduced) {
      el.style.setProperty("--climb", "0.5");
      return;
    }

    let raf = 0;
    let lastY = window.scrollY;
    let boost = 0; // extra hop energy from fast scrolling, decays over time

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;

      const velocity = y - lastY;
      lastY = y;

      boost = Math.max(boost * 0.9, Math.min(Math.abs(velocity) / 60, 1));

      el.style.setProperty("--climb", (1 - progress).toFixed(4));
      el.style.setProperty("--boost", boost.toFixed(3));
      if (velocity !== 0) {
        el.style.setProperty("--facing", velocity > 0 ? "1" : "-1");
      }

      if (boost > 0.01) raf = requestAnimationFrame(update);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReduced]);

  return (
    <div ref={wrapRef} className={styles.companion} aria-hidden="true">
      <div className={styles.facing}>
        <div className={styles.hopper}>
          <GopherSVG width={150} className={styles.gopher} />
        </div>
      </div>
    </div>
  );
}
