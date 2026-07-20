"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CloudIntro.module.css";

/**
 * First-visit intro. A soft mass of clouds gathers over the whole screen with a
 * progress bar filling 1→100 underneath. When it reaches 100 the cloud mass
 * parts down the middle — the two halves drift apart slowly — to reveal the
 * site behind.
 *
 * Driven by a requestAnimationFrame counter (not CSS keyframes) so the global
 * prefers-reduced-motion freeze can't stall it. Reduce-motion still shortens the
 * whole thing to a brief hold + quick fade instead of the slow theatrical part.
 *
 * Shown once per browser session (sessionStorage) so moving between pages during
 * one visit doesn't replay it. Scroll is locked until it finishes.
 */
export default function CloudIntro() {
  const [phase, setPhase] = useState<"idle" | "counting" | "parting" | "done">(
    "idle"
  );
  const [count, setCount] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
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

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setPhase("counting");

    // deliberately unhurried: ~3.4s to fill, so 1→100 reads as a real load
    const COUNT_MS = reduce ? 600 : 3400;
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - start) / COUNT_MS, 1);
      // ease-in-out so it starts gently, moves through the middle, settles at 100
      const eased =
        p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setCount(Math.round(eased * 100));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("parting");
        // the slow reveal: clouds drift apart, then unlock + remove
        const PART_MS = reduce ? 400 : 1600;
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

  const parting = phase === "parting";

  return (
    <div
      className={`${styles.overlay} ${parting ? styles.parting : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${count} percent`}
    >
      {/* two cloud halves that overlap in the center, then part */}
      <div className={`${styles.half} ${styles.left}`} aria-hidden="true">
        <CloudMass side="left" />
      </div>
      <div className={`${styles.half} ${styles.right}`} aria-hidden="true">
        <CloudMass side="right" />
      </div>

      {/* counter + progress bar, centered, fading as the clouds part */}
      <div className={styles.hud} aria-hidden="true">
        <div className={styles.count}>
          <span className={styles.num}>{count}</span>
          <span className={styles.pct}>%</span>
        </div>
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ transform: `scaleX(${count / 100})` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * One half of the covering cloud mass: a set of clean, overlapping white puffs
 * with a soft gradient, extending past the center seam so the two halves meet
 * with no gap. A crisp, rounded cloud edge — not scalloped noise.
 */
function CloudMass({ side }: { side: "left" | "right" }) {
  const id = `cloudmass-${side}`;
  // puffs sized/placed to build a billowing wall; the inner edge (toward the
  // seam) is a stack of large arcs so the meeting line reads as one soft cloud.
  const puffs =
    side === "left"
      ? [
          { cx: 20, cy: 30, r: 34 },
          { cx: 44, cy: 20, r: 30 },
          { cx: 60, cy: 34, r: 32 },
          { cx: 30, cy: 60, r: 36 },
          { cx: 58, cy: 64, r: 34 },
          { cx: 74, cy: 50, r: 30 },
          { cx: 78, cy: 78, r: 30 },
          { cx: 46, cy: 86, r: 30 },
          { cx: 12, cy: 84, r: 30 },
        ]
      : [
          { cx: 80, cy: 30, r: 34 },
          { cx: 56, cy: 20, r: 30 },
          { cx: 40, cy: 34, r: 32 },
          { cx: 70, cy: 60, r: 36 },
          { cx: 42, cy: 64, r: 34 },
          { cx: 26, cy: 50, r: 30 },
          { cx: 22, cy: 78, r: 30 },
          { cx: 54, cy: 86, r: 30 },
          { cx: 88, cy: 84, r: 30 },
        ];

  return (
    <svg
      className={styles.mass}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f2f8ff" />
          <stop offset="100%" stopColor="#d8e8f7" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        {puffs.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
    </svg>
  );
}
