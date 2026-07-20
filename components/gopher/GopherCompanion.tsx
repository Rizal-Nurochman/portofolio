"use client";

import { useEffect, useRef } from "react";
import GopherSVG from "./GopherSVG";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./GopherCompanion.module.css";

/**
 * The Gopher that climbs the sky as you scroll. It's pinned to the viewport
 * and travels from near the bottom (page top) toward the upper-middle (page
 * bottom), so scrolling down reads as the Gopher hopping UP through the clouds.
 * When the scroll direction/velocity spikes it plays a brief jump pose.
 *
 * All movement is transform/opacity, batched in a single rAF. Under
 * reduced-motion it parks in one spot with no hopping and no scroll listener.
 * Decorative throughout (aria-hidden), sized down and nudged aside on small
 * screens so it never covers content or controls.
 */
export default function GopherCompanion() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (prefersReduced) {
      // park it in a calm resting spot, upright, no hop
      el.style.setProperty("--climb", "0.5");
      el.style.setProperty("--hop", "0");
      return;
    }

    let raf = 0;
    let lastY = window.scrollY;
    let hop = 0; // 0..1 how mid-jump we are
    let velocity = 0;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? y / max : 0;

      velocity = y - lastY;
      lastY = y;

      // scroll movement feeds the hop; it decays each frame when idle
      const targetHop = Math.min(Math.abs(velocity) / 40, 1);
      hop = Math.max(hop * 0.88, targetHop);

      el.style.setProperty("--climb", (1 - progress).toFixed(4));
      el.style.setProperty("--hop", hop.toFixed(3));
      // face the direction of travel: down-scroll (climbing) faces right
      el.style.setProperty("--facing", velocity >= 0 ? "1" : "-1");

      if (hop > 0.01) raf = requestAnimationFrame(update);
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
      <div className={styles.hopper}>
        <GopherSVG width={150} className={styles.gopher} />
      </div>
    </div>
  );
}
