import type { Metadata } from "next";
import Link from "next/link";
import SkyCanvas from "@/components/sky/SkyCanvas";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import Reveal from "@/components/ui/Reveal";
import GopherSVG from "@/components/gopher/GopherSVG";
import styles from "./articles.module.css";

export const metadata: Metadata = {
  title: "Articles · Perjalanan Awan",
  description: "Writing is on the way. The Gopher is keeping the seat warm.",
};

/**
 * Articles is intentionally a single "coming soon" state for now: the Gopher
 * sits on a cloud, waiting. No scroll companion here - the waiting Gopher is
 * the whole point, so it's placed inline and calm. Kept in the nav so the site
 * reads as living and about to grow.
 */
export default function ArticlesPage() {
  return (
    <>
      <SkyCanvas />
      <Nav />
      <main id="main" className={styles.wrap}>
        <Reveal className={styles.card} y={16}>
          <div className={styles.gopherSeat}>
            <span className={styles.cloudSeat} aria-hidden="true" />
            <GopherSVG width={140} pose="waiting" className={styles.gopher} />
          </div>
          <p className={styles.altitude}>Altitude · Articles</p>
          <h1 className={styles.title}>Coming soon</h1>
          <p className={styles.text}>
            I&apos;m writing up a few things: notes on Go, building APIs with
            Gin, and lessons from projects that didn&apos;t go to plan. The
            Gopher&apos;s saving the seat until they&apos;re ready.
          </p>
          <Link href="/projects" className={styles.link}>
            In the meantime, see the work →
          </Link>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
