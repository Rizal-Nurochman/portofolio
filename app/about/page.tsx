import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import Reveal from "@/components/ui/Reveal";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "Rizal Nurochman | About",
  description:
    "The climb so far: education, organisations, and how I work as a Go developer.",
};

// Placeholder journey. Education + organisation experience share one upward
// timeline (oldest at the base, newest near the peak). Swap for real entries.
type Entry = {
  when: string;
  title: string;
  place: string;
  kind: "education" | "organization";
  detail: string;
};

const timeline: Entry[] = [
    {
    when: "2024 - 2027",
    title: "Information Systems",
    place: "Airlangga University",
    kind: "education",
    detail:
      "Where the systems thinking started — from data modelling to building things people actually use.",
  },
  {
    when: "2025-now",
    title: "Head of Education Technology & Development Departement",
    place: "Revolusi Edukasi",
    kind: "organization",
    detail:
      "Leading the tech behind an SNBT prep platform, shipping the Go and Gin services that power its tryouts, courses, and live classes.",
  },
  {
    when: "2025",
    title: "Staff of IT Development",
    place: "Society of Renewable Energy UNAIR",
    kind: "organization",
    detail:
      "Built and maintained the organisation's web presence with Laravel, keeping its programmes online and up to date.",
  },
  {
    when: "2025",
    title: "Expert Staff of Web Development",
    place: "Information System Airlangga Competition (ISAC)",
    kind: "organization",
    detail:
      "Built the web platform behind the competition and olympiad — registration, scoring, and the pages that kept participants in sync.",
  },
  {
    when: "2026",
    title: "Backend Manager",
    place: "TEDX UNAIR",
    kind: "organization",
    detail:
      "Leading the backend for the event's site in Go and Gin: the APIs behind ticketing, speakers, and the day-of experience.",
  },
  {
    when: "2026",
    title: "Staff of Medinfo BEM UNAIR",
    place: "BEM UNAIR",
    kind: "organization",
    detail:
      "Building web tools for the student executive board in Go and Gin, supporting its media and information work.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <div className={styles.wrap}>
        <Reveal className={styles.intro} y={16}>
          <p className={styles.altitude}>About</p>
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
