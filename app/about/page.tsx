import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import Reveal from "@/components/ui/Reveal";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About · Perjalanan Awan",
  description:
    "The climb so far: education, organisations, and how I work as a Go developer.",
};

// Placeholder journey. Education + organisation experience share one upward
// timeline (oldest at the base, newest near the peak). Swap for real entries.
type Entry = {
  when: string;
  title: string;
  place: string;
  kind: "education" | "organisation";
  detail: string;
};

const timeline: Entry[] = [
  {
    when: "2024 - now",
    title: "Backend Developer",
    place: "Freelance / personal projects",
    kind: "organisation",
    detail:
      "Building web services and APIs in Go and Gin - the projects you see here.",
  },
  {
    when: "2023",
    title: "Core Team, Tech Division",
    place: "Campus student organisation",
    kind: "organisation",
    detail:
      "Led a small team building internal tooling; learned to ship with other people.",
  },
  {
    when: "2021 - 2025",
    title: "Informatics / Computer Science",
    place: "Your University",
    kind: "education",
    detail:
      "Where the systems thinking started. Placeholder - add your real programme and focus.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <div className={styles.wrap}>
        <Reveal className={styles.intro} y={16}>
          <p className={styles.altitude}>Altitude · About</p>
          <h1 className={styles.title}>The climb so far</h1>
          <p className={styles.lead}>
            I&apos;m a developer who likes systems that hold up under pressure:
            clean APIs, honest error handling, and code that still reads well at
            2am. Mostly Go and Gin, and a real fondness for the little blue
            Gopher hopping up the side of this page.
          </p>
        </Reveal>

        <section className={styles.stackSection} aria-labelledby="tools-title">
          <Reveal>
            <h2 id="tools-title" className={styles.h2}>
              Tools I reach for
            </h2>
            <ul className={styles.tools} aria-label="Tools and technologies">
              {["Go", "Gin", "PostgreSQL", "Redis", "Docker", "REST", "Git"].map(
                (t) => (
                  <li key={t} className={styles.tool}>
                    {t}
                  </li>
                )
              )}
            </ul>
          </Reveal>
        </section>

        <section aria-labelledby="journey-title">
          <Reveal>
            <h2 id="journey-title" className={styles.h2}>
              Education &amp; organisations
            </h2>
          </Reveal>
          <ol className={styles.timeline}>
            {timeline.map((e, i) => (
              <li key={i} className={styles.node}>
                <Reveal delay={i * 80} className={styles.nodeInner}>
                  <span
                    className={`${styles.dot} ${styles[e.kind]}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className={styles.when}>{e.when}</p>
                    <h3 className={styles.nodeTitle}>{e.title}</h3>
                    <p className={styles.place}>{e.place}</p>
                    <p className={styles.detail}>{e.detail}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </PageShell>
  );
}
