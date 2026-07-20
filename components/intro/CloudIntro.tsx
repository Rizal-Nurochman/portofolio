"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CloudIntro.module.css";

/**
 * First-visit intro: two banks of cloud close the screen while a 1→100 counter
 * runs, then at 100 the clouds part (sliding left/right) to reveal the site.
 *
 * Driven by a requestAnimationFrame loop, not CSS keyframes, so it can't be
 * frozen by the global prefers-reduced-motion rule — but we DO respect
 * reduce-motion by making it near-instant (a short hold, no long count, a quick
 * fade) rather than a big theatrical parting.
 *
 * Shown once per browser session (sessionStorage) so navigating back to the
 * site during the same visit doesn't replay it. The counter drives real intent:
 * scroll is locked (body) until it finishes, then unlocked.
 */
export default function CloudIntro() {
  // start hidden during SSR; decide on mount to avoid a flash for repeat views
  const [phase, setPhase] = useState<"idle" | "counting" | "parting" | "done">(
    "idle"
  );
  const [count, setCount] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    // only on the very first load of the session
    let seen = false;
    try {
      seen = sessionStorage.getItem("cloudIntroSeen") === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      setPhase("done");
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // lock scroll while the intro is up
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setPhase("counting");

    const COUNT_MS = reduce ? 500 : 2100;
    let start = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - start) / COUNT_MS, 1);
      // ease-out so it decelerates toward 100
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("parting");
        // after the parting transition, fully remove + unlock
        const PART_MS = reduce ? 350 : 1150;
        window.setTimeout(() => {
          document.body.style.overflow = prevOverflow;
          try {
            sessionStorage.setItem("cloudIntroSeen", "1");
          } catch {
            /* ignore */
          }
          setPhase("done");
        }, PART_MS);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`${styles.overlay} ${
        phase === "parting" ? styles.parting : ""
      }`}
      // decorative loading curtain; announce politely for AT
      role="status"
      aria-live="polite"
      aria-label={`Loading ${count} percent`}
    >
      <div className={`${styles.bank} ${styles.left}`} aria-hidden="true">
        <CloudBank side="left" />
      </div>
      <div className={`${styles.bank} ${styles.right}`} aria-hidden="true">
        <CloudBank side="right" />
      </div>

      <div className={styles.center} aria-hidden="true">
        <span className={styles.count}>{count}</span>
        <span className={styles.pct}>%</span>
      </div>
    </div>
  );
}

/** A soft wall of overlapping cloud puffs filling one half of the screen. */
function CloudBank({ side }: { side: "left" | "right" }) {
  return (
    <svg
      className={styles.bankSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`cg-${side}`} cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f4f9ff" />
          <stop offset="100%" stopColor="#dcebfa" />
        </radialGradient>
      </defs>
      {/* a fill so no sky shows through, plus a lumpy inner edge */}
      <rect
        x={side === "left" ? -20 : 20}
        y="-10"
        width="120"
        height="120"
        fill={`url(#cg-${side})`}
      />
      {/* scalloped edge toward the seam so the two banks read as clouds */}
      <g fill={`url(#cg-${side})`}>
        {[8, 26, 44, 62, 80, 98].map((cy, i) => (
          <circle
            key={i}
            cx={side === "left" ? 100 : 0}
            cy={cy}
            r={12 + (i % 2) * 5}
          />
        ))}
      </g>
    </svg>
  );
}
