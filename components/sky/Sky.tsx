"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import CloudShape, { type CloudVariant } from "./CloudShape";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Sky.module.css";

/**
 * Fixed full-viewport sky behind all content. A daytime gradient plus three
 * depth bands of clouds that ALWAYS drift and bob continuously (CSS animation),
 * so the sky is visibly alive whether or not you scroll. On top of that idle
 * motion, scrolling adds a small, progress-bounded parallax per band — nearer
 * bands shift a little more — but the shift is capped so clouds never slide off
 * screen and leave an empty blue void.
 *
 * All movement is transform/translate, batched through requestAnimationFrame.
 * Decorative throughout (aria-hidden). Under reduced-motion, clouds hold still
 * and no scroll listener is attached.
 */

interface Cloud {
  variant: CloudVariant;
  top: number; // % of viewport height
  left: number; // % of viewport width
  width: number;
  opacity: number;
  driftDur: number; // seconds for one horizontal sweep
  driftFrom: number; // vw
  driftTo: number; // vw
  bob: number; // px vertical bob amplitude
  bobDur: number; // seconds
}

// Nearer bands: bigger, more opaque, larger parallax shift (px across full scroll).
const LAYERS: { parallax: number; clouds: Cloud[] }[] = [
  {
    parallax: 40,
    clouds: [
      { variant: 4, top: 10, left: 6, width: 210, opacity: 0.5, driftDur: 60, driftFrom: -5, driftTo: 7, bob: 10, bobDur: 8 },
      { variant: 3, top: 26, left: 70, width: 160, opacity: 0.45, driftDur: 72, driftFrom: 6, driftTo: -6, bob: 12, bobDur: 9 },
      { variant: 2, top: 58, left: 38, width: 175, opacity: 0.42, driftDur: 66, driftFrom: -7, driftTo: 5, bob: 9, bobDur: 7.5 },
    ],
  },
  {
    parallax: 90,
    clouds: [
      { variant: 1, top: 18, left: 52, width: 300, opacity: 0.82, driftDur: 46, driftFrom: -8, driftTo: 8, bob: 16, bobDur: 6.5 },
      { variant: 2, top: 46, left: 4, width: 260, opacity: 0.78, driftDur: 52, driftFrom: 7, driftTo: -7, bob: 14, bobDur: 7 },
      { variant: 3, top: 76, left: 66, width: 220, opacity: 0.74, driftDur: 40, driftFrom: -6, driftTo: 9, bob: 18, bobDur: 6 },
    ],
  },
  {
    parallax: 150,
    clouds: [
      { variant: 1, top: 38, left: 16, width: 430, opacity: 0.96, driftDur: 34, driftFrom: -10, driftTo: 10, bob: 22, bobDur: 5.5 },
      { variant: 4, top: 84, left: 58, width: 390, opacity: 0.94, driftDur: 38, driftFrom: 9, driftTo: -9, bob: 20, bobDur: 6 },
    ],
  },
];

export default function Sky() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gradientRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(y / max, 1) : 0;

      // gradient drifts up a touch as you climb — thinner, higher air
      if (gradientRef.current) {
        gradientRef.current.style.transform = `translateY(${-progress * 6}%)`;
      }
      // each band shifts by a bounded amount tied to scroll progress, so clouds
      // move with the climb but never leave the viewport
      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(0, ${-progress * layer.parallax}px, 0)`;
        }
      });
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
    <div className={styles.sky} aria-hidden="true">
      <div ref={gradientRef} className={styles.gradient} />
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className={styles.layer}
        >
          {layer.clouds.map((c, j) => (
            <div
              key={j}
              className={styles.cloud}
              style={
                {
                  top: `${c.top}%`,
                  left: `${c.left}%`,
                  "--drift-dur": `${c.driftDur}s`,
                  "--drift-delay": `${(i * 3 + j) * -3.1}s`,
                  "--drift-from": `${c.driftFrom}vw`,
                  "--drift-to": `${c.driftTo}vw`,
                  "--bob": `${c.bob}px`,
                  "--bob-dur": `${c.bobDur}s`,
                  "--bob-delay": `${(i * 2 + j) * -1.7}s`,
                } as CSSProperties
              }
            >
              <CloudShape variant={c.variant} width={c.width} opacity={c.opacity} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
