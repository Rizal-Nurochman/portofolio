import type { Metadata } from "next";
import SkyCanvas from "@/components/sky/SkyCanvas";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import Reveal from "@/components/ui/Reveal";
import GopherSVG from "@/components/gopher/GopherSVG";
import BrandIcon from "@/components/ui/BrandIcon";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Rizal Nurochman | Contact",
  description:
    "Reach out by email or social. The primary way to get in touch about work.",
};

// Socials + email (PRODUCT.md) - no form, the channels are the content.
const CHANNELS = [
  {
    label: "Email",
    value: "muhamadrizalnurohman@gmail.com",
    href: "mailto:muhamadrizalnurohman@gmail.com",
    hint: "The surest way to reach me.",
    icon: "email" as const,
  },
  {
    label: "GitHub",
    value: "@Rizal-Nurochman",
    href: "https://github.com/Rizal-Nurochman",
    hint: "Code, side projects, the occasional experiment.",
    icon: "github" as const,
  },
  {
    label: "LinkedIn",
    value: "Mohamad Rizal Nurochman",
    href: "https://www.linkedin.com/in/mohamad-rizal-nurochman",
    hint: "For roles and longer conversations.",
    icon: "linkedin" as const,
  },
];

/**
 * Contact is the peak of the climb. Two columns: the invitation on the left,
 * the channels (and a waving Gopher) on the right.
 */
export default function ContactPage() {
  return (
    <>
      <SkyCanvas />
      <Nav />
      <main id="main" className={styles.wrap}>
        <Reveal className={styles.head} y={16}>
          <p className={styles.altitude}>Altitude · the peak</p>
          <h1 className={styles.title}>Let&apos;s work together</h1>
          <p className={styles.lead}>
            You&apos;ve made it to the top. If you&apos;ve got a project, a role,
            or just a question about Go, pick whichever way is easiest.
          </p>
        </Reveal>

        <div className={styles.grid}>
          <Reveal className={styles.aside} y={16} delay={80}>
            <h2 className={styles.asideTitle}>Ready to collaborate</h2>
            <p className={styles.asideText}>
              Open to freelance work, full-time roles, and collaboration on
              anything built with Go. I usually reply within a day.
            </p>
            <p className={styles.location}>Indonesia · remote-friendly</p>
            <p className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              Available for new projects
            </p>
          </Reveal>

          <div className={styles.channelCol}>
            <Reveal className={styles.gopherSeat} y={16} delay={120}>
              <span className={styles.cloudSeat} aria-hidden="true" />
              <GopherSVG width={132} pose="waiting" className={styles.gopher} />
            </Reveal>

            <ul className={styles.channels}>
              {CHANNELS.map((c, i) => (
                <li key={c.label}>
                  <Reveal delay={160 + i * 80}>
                    <a
                      href={c.href}
                      className={styles.channel}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      <span className={styles.channelIcon}>
                        <BrandIcon name={c.icon} size={20} />
                      </span>
                      <span className={styles.channelBody}>
                        <span className={styles.channelLabel}>{c.label}</span>
                        <span className={styles.channelValue}>{c.value}</span>
                        <span className={styles.channelHint}>{c.hint}</span>
                      </span>
                      <span className={styles.channelCue} aria-hidden="true">
                        →
                      </span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
