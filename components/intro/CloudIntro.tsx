"use client";

import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./CloudIntro.module.css";

const CloudScene = dynamic(() => import("./CloudScene"), {
  ssr: false,
  loading: () => null,
});

type Phase = "loading" | "revealing" | "done";

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithHints = Navigator & {
  connection?: NetworkInformationLike;
  deviceMemory?: number;
};

type SceneBoundaryProps = {
  children: ReactNode;
  onFailure: () => void;
};

type SceneBoundaryState = {
  failed: boolean;
};

const INTRO_KEY = "portfolio-entry:v3";

class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function readIntroState(): boolean {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

function persistIntroState(): void {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    return;
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");

    const options: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "high-performance",
    };

    const context =
      canvas.getContext("webgl2", options) ??
      canvas.getContext("webgl", options) ??
      (canvas.getContext(
        "experimental-webgl",
        options
      ) as WebGLRenderingContext | null);

    if (!context) return false;

    context.getExtension("WEBGL_lose_context")?.loseContext();

    return true;
  } catch {
    return false;
  }
}

function shouldUseWebGL(reducedMotion: boolean): boolean {
  if (reducedMotion) return false;

  const nav = navigator as NavigatorWithHints;
  const effectiveType = nav.connection?.effectiveType;

  if (nav.connection?.saveData) return false;
  if (effectiveType === "slow-2g" || effectiveType === "2g") return false;
  if ((nav.deviceMemory ?? 4) < 4) return false;
  if ((nav.hardwareConcurrency ?? 4) < 4) return false;

  return hasWebGL();
}

function getStatus(progress: number): string {
  if (progress < 18) return "CALIBRATING ATMOSPHERE";
  if (progress < 42) return "ALIGNING INTERFACE";
  if (progress < 68) return "CONNECTING SYSTEMS";
  if (progress < 92) return "ASSEMBLING EXPERIENCE";

  return "SYSTEM READY";
}

export default function CloudIntro() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [useWebGL, setUseWebGL] = useState(false);
  const frameRef = useRef(0);

  useEffect(() => {
    if (readIntroState()) {
      setPhase("done");
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    setUseWebGL(shouldUseWebGL(reducedMotion));

    const root = document.documentElement;
    const body = document.body;

    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;
    const previousBusy = body.getAttribute("aria-busy");

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.setAttribute("aria-busy", "true");

    let released = false;
    let cancelled = false;
    let pageReady = document.readyState === "complete";
    let fontsReady = document.fonts.status === "loaded";
    let forcedReady = false;
    let current = 0;
    let published = -1;
    let revealTimer = 0;

    let lastTime = performance.now();
    const startedAt = lastTime;

    const minDuration = reducedMotion ? 120 : 1500;
    const maxDuration = reducedMotion ? 360 : 3200;
    const revealDuration = reducedMotion ? 240 : 1280;

    const release = () => {
      if (released) return;

      released = true;

      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousTouchAction;

      if (previousBusy === null) {
        body.removeAttribute("aria-busy");
      } else {
        body.setAttribute("aria-busy", previousBusy);
      }
    };

    const handleLoad = () => {
      pageReady = true;
    };

    if (!pageReady) {
      window.addEventListener("load", handleLoad, { once: true });
    }

    void document.fonts.ready
      .then(() => {
        fontsReady = true;
      })
      .catch(() => {
        fontsReady = true;
      });

    const forceTimer = window.setTimeout(() => {
      forcedReady = true;
    }, maxDuration);

    const finish = () => {
      setProgress(100);
      setPhase("revealing");

      revealTimer = window.setTimeout(() => {
        if (cancelled) return;

        persistIntroState();
        release();
        setPhase("done");
      }, revealDuration);
    };

    const tick = (now: number) => {
      const delta = Math.min(now - lastTime, 64);
      const elapsed = now - startedAt;

      lastTime = now;

      const stagedTarget = Math.min(
        92,
        7 + 88 * (1 - Math.exp(-elapsed / 760))
      );

      const canComplete =
        elapsed >= minDuration && ((pageReady && fontsReady) || forcedReady);

      const target = canComplete ? 100 : stagedTarget;

      const response =
        target === 100
          ? 1 - Math.exp(-delta / 90)
          : 1 - Math.exp(-delta / 240);

      current += (target - current) * response;

      const nextValue = Math.min(100, Math.round(current));

      if (nextValue !== published) {
        published = nextValue;
        setProgress(nextValue);
      }

      if (target === 100 && current >= 99.6) {
        finish();
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;

      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(forceTimer);
      window.clearTimeout(revealTimer);
      window.removeEventListener("load", handleLoad);

      release();
    };
  }, []);

  if (phase === "done") return null;

  const revealing = phase === "revealing";
  const circumference = 2 * Math.PI * 48;
  const dashOffset = circumference * (1 - progress / 100);
  const formattedProgress = progress.toString().padStart(3, "0");

  return (
    <div
      className={`${styles.overlay} ${revealing ? styles.revealing : ""}`}
      role="progressbar"
      aria-label="Preparing Misbahul Muttaqin portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-valuetext={`${progress} percent, ${getStatus(progress)}`}
    >
      <div className={styles.atmosphere} aria-hidden="true">
        {useWebGL ? (
          <SceneBoundary onFailure={() => setUseWebGL(false)}>
            <CloudScene progress={progress / 100} revealing={revealing} />
          </SceneBoundary>
        ) : (
          <div className={styles.fallbackAtmosphere} />
        )}
      </div>

      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brandLockup}>
            <span className={styles.liveDot} />
            <span>MISBAHUL MUTTAQIN</span>
          </div>

          <span className={styles.edition}>PORTFOLIO / 2026</span>
        </header>

        <main className={styles.stage}>
          <div className={styles.signal} aria-hidden="true">
            <div className={`${styles.orbit} ${styles.orbitOuter}`} />
            <div className={`${styles.orbit} ${styles.orbitInner}`} />

            <svg className={styles.progressRing} viewBox="0 0 108 108">
              <circle
                className={styles.ringTrack}
                cx="54"
                cy="54"
                r="48"
              />

              <circle
                className={styles.ringValue}
                cx="54"
                cy="54"
                r="48"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>

            <div className={styles.monogram}>MM</div>
          </div>

          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              FULL-STACK ENGINEER · AGENTIC AI
            </p>

            <h1 className={styles.title}>
              <span>Building systems</span>
              <span>that learn and evolve.</span>
            </h1>
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerMeta}>
            <span>DIGITAL ECOSYSTEM</span>
            <span>SURABAYA · INDONESIA</span>
          </div>

          <div className={styles.progressBlock}>
            <div className={styles.progressHeader}>
              <span>{getStatus(progress)}</span>
              <span>{formattedProgress}%</span>
            </div>

            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{
                  transform: `scaleX(${progress / 100})`,
                }}
              />
            </div>
          </div>
        </footer>
      </div>

      <div className={styles.revealEdge} aria-hidden="true" />
    </div>
  );
}