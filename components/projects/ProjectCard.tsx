import Link from "next/link";
import type { Project } from "@/lib/projects";
import styles from "./ProjectCard.module.css";

/**
 * A single project tile: a preview image (or a colored sky/gold placeholder
 * when no screenshot exists yet), the title, a one-line role, the summary, and
 * the tech stack as mono tags. The whole card links to its detail page; the
 * live/repo actions live on the detail page to keep one clear tap target here.
 */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`${styles.card} ${styles[project.accent]}`}
    >
      <div className={styles.preview} data-accent={project.accent}>
        {project.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.preview} alt="" className={styles.shot} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            {project.title
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.role}>{project.role}</p>
        <p className={styles.summary}>{project.summary}</p>
        <ul className={styles.stack} aria-label="Tech stack">
          {project.stack.map((s) => (
            <li key={s} className={styles.tag}>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <span className={styles.cue} aria-hidden="true">
        View project →
      </span>
    </Link>
  );
}
