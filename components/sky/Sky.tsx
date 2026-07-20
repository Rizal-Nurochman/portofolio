"use client";

import { useEffect, useRef } from "react";
import CloudShape, { type CloudVariant } from "./CloudShape";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Sky.module.css";

/**
 * Fixed full-viewport sky behind all content. A vertical gradient from the
 * daytime sky colors, with three parallax cloud layers that drift as the page
 * scrolls. The gradient itself is anchored to scroll height so climbing the
 * page reads as climbing into thinner, higher air.
 *
 * Everything here is decorative (aria-hidden) and animated with transforms
 * only, batched through requestAnimationFrame. Under reduced-motion the clouds
 * hold still and no scroll listener is attached.
 */

interface Cloud {
  variant: CloudVariant;
  /** vertical position as % of viewport height */
  top: number;
  /** horizontal start as % of viewport width */
  left: number;
  width: number;
  opacity: number;
}

// Three depth bands. Nearer layers are bigger, more opaque, and move faster.
const LAYERS: { speed: number; clouds: Cloud[] }[] = [
  {
    speed: 0.15,
    clouds: [
      { variant: 4, top: 12, left: 8, width: 200, opacity: 0.55 },
      { variant: 3, top: 30, left: 72, width: 150, opacity: 0.5 },
      { variant: 2, top: 62, left: 40, width: 170, opacity: 0.45 },
    ],
  },
  {
    speed: 0.35,
    clouds: [
      { variant: 1, top: 20, left: 55, width: 300, opacity: 0.8 },
      { variant: 2, top: 48, left: 5, width: 260, opacity: 0.75 },
      { variant: 3, top: 78, left: 68, width: 220, opacity: 0.72 },
    ],
  },
  {
    speed: 0.6,
    clouds: [
      { variant: 1, top: 40, left: 20, width: 420, opacity: 0.95 },
      { variant: 4, top: 85, left: 60, width: 380, opacity: 0.92 },
    ],
  },
];

export default function Sky() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      LAYERS.forEach((layer, i) => {
        const el = layerRefs.current[i];
        if (el) {
          // clouds drift upward slower than content, and sideways a touch
          el.style.transform = `translate3d(${y * layer.speed * 0.05}px, ${
            -y * layer.speed
          }px, 0)`;
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReduced]);

  return (
    <div className={styles.sky} aria-hidden="true">
      <div className={styles.gradient} />
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
              style={{
                top: `${c.top}%`,
                left: `${c.left}%`,
                // gentle idle drift, staggered so they don't pulse in unison
                animationDelay: `${(i * 3 + j) * -2.5}s`,
              }}
            >
              <CloudShape variant={c.variant} width={c.width} opacity={c.opacity} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
