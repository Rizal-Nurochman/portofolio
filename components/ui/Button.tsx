import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary";

interface BaseProps {
  variant?: Variant;
  children: ReactNode;
}

/**
 * Pill button in two weights: primary (azure fill, white text — the "hire me"
 * action) and secondary (white cloud fill, ink text, hairline border — softer
 * fallbacks like "view all"). Renders as a Next <Link> when `href` is set,
 * otherwise a native <button>.
 */
export function Button({
  variant = "primary",
  children,
  href,
  ...rest
}: BaseProps &
  (
    | ({ href: string } & Omit<ComponentProps<typeof Link>, "href" | "children">)
    | ({ href?: undefined } & ComponentProps<"button">)
  )) {
  const className = `${styles.btn} ${styles[variant]}`;

  if (href) {
    return (
      <Link href={href} className={className} {...(rest as object)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
