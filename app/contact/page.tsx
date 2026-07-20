import type { Metadata } from "next";
import SkyCanvas from "@/components/sky/SkyCanvas";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import Reveal from "@/components/ui/Reveal";
import GopherSVG from "@/components/gopher/GopherSVG";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact — Perjalanan Awan",
  description:
    "Reach out by email or social. The primary way to get in touch about work.",
};

// Socials + email (PRODUCT.md). Swap placeholders for the real handles/address.
const CHANNELS = [
  {
    label: "Email",
    value: "you@example.com",
    href: "mailto:you@example.com",
    hint: "The surest way to reach me.",
  },
  {
    label: "GitHub",
    value: "@yourhandle",
    href: "https://github.com/",
    hint: "Code, side projects, the occasional experiment.",
  },
  {
    label: "LinkedIn",
    value: "Your Name",
    href: "https://www.linkedin.com/",
    hint: "For roles and longer conversations.",
  },
];

/**
 * Contact is the peak of the climb — the whole site funnels here. The Gopher
 * waves from the top of the clouds. No form: the brief is socials + email, so
 * the channels are the content, each a clear, large tap target.
 */
export default function ContactPage() {
  return (
    <>
      <SkyCanvas />
      <Nav />
      <main id="main" className={styles.wrap}>
        <Reveal className={styles.inner} y={16}>
          <div className={styles.gopherSeat}>
            <span className={styles.cloudSeat} aria-hidden="true" />
            <GopherSVG width={150} pose="waiting" className={styles.gopher} />
          </div>

          <p className={styles.altitude}>Altitude · the peak</p>
          <h1 className={styles.title}>Let&apos;s talk</h1>
          <p className={styles.lead}>
            You&apos;ve made it to the top. If you&apos;ve got a project, a role,
            or just a question about Go, pick whichever way is easiest.
          </p>

          <ul className={styles.channels}>
            {CHANNELS.map((c, i) => (
              <li key={c.label}>
                <Reveal delay={i * 80}>
                  <a
                    href={c.href}
                    className={styles.channel}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <span className={styles.channelLabel}>{c.label}</span>
                    <span className={styles.channelValue}>{c.value}</span>
                    <span className={styles.channelHint}>{c.hint}</span>
                    <span className={styles.channelCue} aria-hidden="true">
                      →
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
