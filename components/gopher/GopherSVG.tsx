"use client";

import { forwardRef } from "react";

/**
 * The Gopher mascot, drawn from scratch in the spirit of Renée French's
 * original (CC-BY 3.0 — attributed in the footer). Not a copy of the asset:
 * a friendly rodent with a rounded body, big round eyes, two front teeth,
 * little arms and feet, plus a gold scarf that ties it to our sun accent and
 * keeps the light-blue body readable against a light-blue sky.
 *
 * Pose is driven entirely by CSS custom properties consumed by the caller's
 * stylesheet (arm/leg rotation, squash). The SVG itself just exposes named
 * groups; the scroll layer decides how they move. Decorative — the wrapper
 * carries aria-hidden.
 */

export type GopherPose = "idle" | "jump" | "land" | "waiting";

interface Props {
  width?: number;
  className?: string;
  /** static pose hint, applied as a data attribute the stylesheet can key on */
  pose?: GopherPose;
}

const GopherSVG = forwardRef<SVGSVGElement, Props>(function GopherSVG(
  { width = 160, className, pose = "idle" },
  ref
) {
  return (
    <svg
      ref={ref}
      className={className}
      data-pose={pose}
      width={width}
      height={width * 1.15}
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      {/* soft contact shadow, kept as its own group so it can fade on jump */}
      <ellipse
        className="gopher-shadow"
        cx="100"
        cy="222"
        rx="52"
        ry="9"
        fill="var(--ink)"
        opacity="0.14"
      />

      {/* feet */}
      <g className="gopher-feet">
        <ellipse cx="78" cy="206" rx="20" ry="12" fill="var(--gopher-limb)" stroke="var(--gopher-outline)" strokeWidth="3" />
        <ellipse cx="122" cy="206" rx="20" ry="12" fill="var(--gopher-limb)" stroke="var(--gopher-outline)" strokeWidth="3" />
      </g>

      {/* body */}
      <path
        d="M100 40
           C58 40 40 78 40 128
           C40 184 66 210 100 210
           C134 210 160 184 160 128
           C160 78 142 40 100 40 Z"
        fill="var(--gopher-body)"
        stroke="var(--gopher-outline)"
        strokeWidth="4"
      />

      {/* belly patch */}
      <ellipse cx="100" cy="150" rx="40" ry="50" fill="var(--gopher-belly)" />

      {/* arms — pivot from the shoulder via transform-origin in CSS */}
      <g className="gopher-arm gopher-arm-left" style={{ transformOrigin: "62px 128px" }}>
        <ellipse cx="52" cy="150" rx="13" ry="22" fill="var(--gopher-limb)" stroke="var(--gopher-outline)" strokeWidth="3" />
      </g>
      <g className="gopher-arm gopher-arm-right" style={{ transformOrigin: "138px 128px" }}>
        <ellipse cx="148" cy="150" rx="13" ry="22" fill="var(--gopher-limb)" stroke="var(--gopher-outline)" strokeWidth="3" />
      </g>

      {/* scarf — the warm accent that makes it pop off the sky */}
      <path
        d="M62 96 Q100 116 138 96 L140 112 Q100 132 60 112 Z"
        fill="var(--gopher-scarf)"
        stroke="var(--gopher-outline)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        className="gopher-scarf-tail"
        d="M128 108 Q150 120 146 150 L132 146 Q134 122 120 116 Z"
        fill="var(--gopher-scarf-deep)"
        stroke="var(--gopher-outline)"
        strokeWidth="3"
        strokeLinejoin="round"
        style={{ transformOrigin: "128px 108px" }}
      />

      {/* ears */}
      <circle cx="58" cy="52" r="15" fill="var(--gopher-body)" stroke="var(--gopher-outline)" strokeWidth="4" />
      <circle cx="142" cy="52" r="15" fill="var(--gopher-body)" stroke="var(--gopher-outline)" strokeWidth="4" />

      {/* eyes — big white rounds with dark pupils */}
      <g className="gopher-eyes">
        <circle cx="80" cy="92" r="20" fill="#fff" stroke="var(--gopher-outline)" strokeWidth="3.5" />
        <circle cx="120" cy="92" r="20" fill="#fff" stroke="var(--gopher-outline)" strokeWidth="3.5" />
        <circle className="gopher-pupil" cx="84" cy="94" r="8" fill="var(--gopher-outline)" />
        <circle className="gopher-pupil" cx="116" cy="94" r="8" fill="var(--gopher-outline)" />
        <circle cx="87" cy="91" r="2.6" fill="#fff" />
        <circle cx="119" cy="91" r="2.6" fill="#fff" />
      </g>

      {/* snout + teeth */}
      <ellipse cx="100" cy="112" rx="9" ry="7" fill="var(--gopher-outline)" />
      <g className="gopher-teeth">
        <rect x="94" y="118" width="5.5" height="10" rx="1.5" fill="#fff" stroke="var(--gopher-outline)" strokeWidth="1.5" />
        <rect x="100.5" y="118" width="5.5" height="10" rx="1.5" fill="#fff" stroke="var(--gopher-outline)" strokeWidth="1.5" />
      </g>
    </svg>
  );
});

export default GopherSVG;
