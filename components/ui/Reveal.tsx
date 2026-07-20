"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  /** stagger offset in ms when several reveals sit together */
  delay?: number;
  /** how far it rises into place */
  y?: number;
  className?: string;
}

/**
 * Scroll-triggered entrance. The content is fully rendered and readable by
 * default (opacity/transform only shift the *presentation*); an Intersection
 * Observer adds the settled class when it scrolls into view. If JS never runs,
 * or under reduced-motion, it shows immediately with no movement — the reveal
 * enhances an already-visible default, it never gates content.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${shown ? styles.shown : ""} ${
        className ?? ""
      }`}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-y": `${y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
