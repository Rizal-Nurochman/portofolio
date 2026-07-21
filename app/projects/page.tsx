import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/ui/PageShell";
import Reveal from "@/components/ui/Reveal";
import ProjectCard from "@/components/projects/ProjectCard";
import { projects } from "@/lib/projects";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Projects · Perjalanan Awan",
  description: "Web services and APIs built with Go and Gin.",
};

/**
 * Projects - one altitude up from Home. The full grid of work; each tile links
 * to its own detail page. This is the most important surface after Home; the
 * grid is real, the detail pages are the next build pass.
 */
export default function ProjectsPage() {
  return (
    <PageShell>
      <div className={styles.wrap}>
        <Reveal className={styles.head} y={16}>
          <p className={styles.altitude}>Altitude 2 · the work</p>
          <h1 className={styles.title}>Things I&apos;ve built</h1>
          <p className={styles.lede}>
            Backend-leaning web projects, mostly Go and Gin. Tap any one for the
            story, the stack, and links to the live site and source.
          </p>
        </Reveal>

        <ul className={styles.grid}>
          {projects.map((project, i) => (
            <li key={project.slug}>
              <Reveal delay={i * 70}>
                <ProjectCard project={project} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className={styles.foot}>
          <Link href="/" className={styles.link}>
            ← Back down to Home
          </Link>
        </Reveal>
      </div>
    </PageShell>
  );
}
