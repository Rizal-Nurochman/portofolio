import Link from "next/link";
import BrandIcon from "./BrandIcon";
import styles from "./Footer.module.css";

const EXPLORE = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/articles", label: "Articles" },
  { href: "/contact", label: "Contact" },
];

// Socials + email are the primary way to reach out (PRODUCT.md).
const CONNECT = [
  { href: "mailto:muhamadrizalnurohman@gmail.com", label: "Email", icon: "email" as const },
  { href: "https://github.com/Rizal-Nurochman", label: "GitHub", icon: "github" as const },
  { href: "https://www.linkedin.com/in/mohamad-rizal-nurochman", label: "LinkedIn", icon: "linkedin" as const },
];

/**
 * Footer sits at the peak of the climb. Carries the two link groups, the
 * required Gopher CC-BY attribution, and a build credit.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <p className={styles.wordmark}>Rizal Nurochman</p>
          <p className={styles.tagline}>
            Building web things with Go &amp; Gin. Let&apos;s make something.
          </p>
        </div>

        <nav className={styles.col} aria-label="Explore">
          <h2 className={styles.colTitle}>Explore</h2>
          {EXPLORE.map((l) => (
            <Link key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Connect">
          <h2 className={styles.colTitle}>Connect</h2>
          {CONNECT.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={styles.link}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noreferrer" : undefined}
            >
              <BrandIcon name={l.icon} size={16} className={styles.linkIcon} />
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={styles.legal}>
        <p>© {new Date().getFullYear()} Rizal. All rights reserved.</p>
        <p className={styles.credit}>
          The Go Gopher by{" "}
          <a
            href="http://reneefrench.blogspot.com/"
            target="_blank"
            rel="noreferrer"
          >
            Renée French
          </a>
          , licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by/3.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 3.0
          </a>
          . Built with Next.js.
        </p>
      </div>
    </footer>
  );
}
