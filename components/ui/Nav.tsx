"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandIcon from "./BrandIcon";
import styles from "./Nav.module.css";

type NavLink = {
  href: string;
  label: string;
  icon?: "github" | "linkedin" | "email";
};

const LINKS: NavLink[] = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/articles", label: "Articles" },
  { href: "/contact", label: "Contact" },
  { href: "https://github.com/Rizal-Nurochman", label: "GitHub", icon: "github" },
  { href: "https://www.linkedin.com/in/mohamad-rizal-nurochman", label: "LinkedIn", icon: "linkedin" },
];

/**
 * Light, transparent-over-sky navigation. Gains a frosted cloud background
 * once the page scrolls, so it stays legible over content without a hard bar
 * at the top. Includes a skip link and a mobile disclosure menu.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          {/* Name placeholder - swap for real name/logo */}
          <span className={styles.mark} aria-hidden="true" />
          Nurochman R.
        </Link>

        <nav aria-label="Primary" className={styles.desktop}>
          {LINKS.map((l) => {
            const external = l.href.startsWith("http");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link} ${l.icon ? styles.iconLink : ""}`}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                aria-label={l.icon ? l.label : undefined}
              >
                {l.icon ? (
                  <BrandIcon name={l.icon} size={18} />
                ) : (
                  l.label
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.toggleLabel}>Menu</span>
          <span
            className={`${styles.burger} ${open ? styles.burgerOpen : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Primary"
        className={`${styles.mobile} ${open ? styles.mobileOpen : ""}`}
        hidden={!open}
      >
        {LINKS.map((l) => {
          const external = l.href.startsWith("http");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={styles.mobileLink}
              onClick={() => setOpen(false)}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
            >
              {l.icon && <BrandIcon name={l.icon} size={18} />}
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
