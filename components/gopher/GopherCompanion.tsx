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

    // grab the animatable SVG groups once (blink + arm swing live inside the SVG)
    const eyes = el.querySelector<SVGGElement>(".gopher-eyes");
    const armL = el.querySelector<SVGGElement>(".gopher-arm-left");
    const armR = el.querySelector<SVGGElement>(".gopher-arm-right");

    let raf = 0;
    let last = performance.now();
    let lastScrollY = window.scrollY;
    let boost = 0;
    let facing = 1;
    // travel band as a fraction of viewport height: low at page top, high at bottom
    const LOW = 0.68;
    const HIGH = 0.2;

    // blink scheduling: eyes stay open, then a quick ~140ms squeeze at intervals
    let nextBlink = 1.5 + Math.random() * 3;
    let blinkT = -1; // >=0 while a blink is in progress

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

      // The hop always runs — this is the ambient life the mascot needs. It's
      // decorative, gentle, and non-vestibular, so we keep it under
      // reduce-motion; only the scroll-driven leap boost is interaction-driven,
      // and that simply stays at rest when the user isn't scrolling.
      const HOP_PERIOD = reduce ? 1.6 : 1.0;
      const phase = (t / HOP_PERIOD) % 1;
      const arc = 1 - Math.pow(2 * phase - 1, 2); // 0..1..0 parabola
      const peak = (reduce ? 16 : 42) + (reduce ? 0 : boost * 34);
      const hopY = -arc * peak;
      const ground = 1 - arc; // 1 at floor, 0 at apex
      const squashY = 1 - ground * 0.1 + arc * 0.06;
      const squashX = 1 + ground * 0.12 - arc * 0.05;

      el.style.transform =
        `translate3d(0, ${(bandTop + hopY).toFixed(1)}px, 0) ` +
        `scaleX(${(facing * squashX).toFixed(3)}) scaleY(${squashY.toFixed(3)})`;
      el.style.transformOrigin = "center bottom";

      // arms lift as it rises, drop as it lands — reads as a real jump
      if (armL && armR) {
        const swing = arc * 34;
        armL.style.transform = `rotate(${(-swing).toFixed(1)}deg)`;
        armR.style.transform = `rotate(${swing.toFixed(1)}deg)`;
      }

      // blink: periodic quick eye squeeze on the vertical axis
      if (eyes) {
        if (blinkT < 0) {
          nextBlink -= dt;
          if (nextBlink <= 0) {
            blinkT = 0;
            nextBlink = 2 + Math.random() * 4;
          }
        } else {
          blinkT += dt;
        }
        // 0.14s blink: close (first half) then open (second half)
        const DUR = 0.14;
        let open = 1;
        if (blinkT >= 0) {
          const p = blinkT / DUR;
          if (p >= 1) {
            blinkT = -1;
          } else {
            open = 1 - (1 - Math.abs(p * 2 - 1)); // 1→0→1 triangle
          }
        }
        eyes.style.transform = `scaleY(${Math.max(open, 0.08).toFixed(3)})`;
        eyes.style.transformOrigin = "100px 92px";
      }

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
