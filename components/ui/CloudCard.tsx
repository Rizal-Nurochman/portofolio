import type { ElementType, ReactNode } from "react";
import styles from "./CloudCard.module.css";

/**
 * The white "cloud" surface content sits on so it stays readable above the blue
 * sky. Soft, rounded, gently floating. This is the workhorse container; vary
 * its size and padding rather than reaching for a rigid card grid.
 */
export default function CloudCard({
  children,
  as: Tag = "div",
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <Tag
      className={`${styles.card} ${interactive ? styles.interactive : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
