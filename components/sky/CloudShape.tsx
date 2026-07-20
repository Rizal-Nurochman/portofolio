import type { CSSProperties } from "react";

/**
 * A single puffy cloud rendered as inline SVG so we can tint, scale, and
 * animate it cheaply with transforms. Decorative only — always aria-hidden.
 *
 * Four silhouettes keep the sky from looking like one stamp repeated. Each is
 * drawn on a 200x100 viewBox and stretched via width.
 */

type CloudVariant = 1 | 2 | 3 | 4;

const PATHS: Record<CloudVariant, string> = {
  // low, wide bank
  1: "M30 78 Q10 78 10 60 Q10 44 28 42 Q30 22 54 22 Q70 8 92 20 Q112 10 128 26 Q150 20 160 40 Q186 42 186 60 Q186 78 166 78 Z",
  // tall, rounded
  2: "M44 80 Q22 80 22 60 Q22 46 38 44 Q40 22 68 24 Q84 6 108 22 Q134 18 138 42 Q160 46 158 62 Q158 80 138 80 Z",
  // small puff
  3: "M52 76 Q34 76 34 60 Q34 48 48 46 Q52 30 74 32 Q90 22 106 34 Q126 34 126 52 Q140 56 138 66 Q136 76 120 76 Z",
  // long stratus
  4: "M24 74 Q8 74 8 62 Q8 50 24 48 Q28 34 52 36 Q64 26 82 34 Q100 28 116 36 Q140 32 152 46 Q176 46 178 60 Q180 74 160 74 Z",
};

interface CloudShapeProps {
  variant?: CloudVariant;
  /** rendered width in px; height scales to keep aspect */
  width?: number;
  /** 0–1, how opaque the cloud body is */
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}

export default function CloudShape({
  variant = 1,
  width = 240,
  opacity = 1,
  className,
  style,
}: CloudShapeProps) {
  const height = (width / 200) * 100;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={width}
      height={height}
      viewBox="0 0 200 100"
      className={className}
      style={style}
      role="presentation"
    >
      <path d={PATHS[variant]} fill="var(--cloud)" fillOpacity={opacity} />
    </svg>
  );
}

export type { CloudVariant };
