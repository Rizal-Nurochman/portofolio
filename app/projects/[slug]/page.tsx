import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/ui/PageShell";
import Reveal from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { getProject, projects } from "@/lib/projects";
import styles from "./detail.module.css";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProject(params.slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Perjalanan Awan`,
    description: project.summary,
  };
}

/**
 * Project detail — the case study for one piece of work: what it is, what was
 * built, the stack, and the two actions that matter (live demo + source). Copy
 * here is placeholder-realistic; swap for the real write-up per project.
 */
export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProject(params.slug);
  if (!project) notFound();

  return (
    <PageShell>
      <article className={styles.wrap}>
        <Reveal className={styles.head} y={16}>
          <Link href="/projects" className={styles.back}>
            ← All projects
          </Link>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.role}>{project.role}</p>

          <div className={styles.actions}>
            {project.liveUrl && (
              <Button href={project.liveUrl}>Live demo ↗</Button>
            )}
            {project.repoUrl && (
              <Button href={project.repoUrl} variant="secondary">
                Source code ↗
              </Button>
            )}
          </div>
        </Reveal>

        <Reveal
          className={styles.preview}
          data-accent={project.accent}
          y={20}
        >
          {project.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.preview} alt={`${project.title} preview`} />
          ) : (
            <span className={styles.placeholder} aria-hidden="true">
              {project.title}
            </span>
          )}
        </Reveal>

        <div className={styles.grid}>
          <Reveal className={styles.prose}>
            <h2 className={styles.h2}>What it is</h2>
            <p>{project.summary}</p>
            <p>
              This is placeholder detail. Replace it with the real story: the
              problem, the constraints, the interesting decisions, and how it
              held up in production.
            </p>

            <h2 className={styles.h2}>What I built</h2>
            <p>
              {project.role} A short walk through the architecture goes here —
              the API surface, the data model, and the parts you&apos;d want a
              reviewer to notice.
            </p>
          </Reveal>

          <Reveal className={styles.aside} delay={80}>
            <h2 className={styles.asideTitle}>Tech</h2>
            <ul className={styles.stack} aria-label="Tech stack">
              {project.stack.map((s) => (
                <li key={s} className={styles.tag}>
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </article>
    </PageShell>
  );
}
