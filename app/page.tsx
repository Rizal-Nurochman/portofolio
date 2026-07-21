import Link from "next/link";
import SkyCanvas from "@/components/sky/SkyCanvas";
import GopherCompanion from "@/components/gopher/GopherCompanion";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import Reveal from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import ProjectCard from "@/components/projects/ProjectCard";
import { featuredProjects } from "@/lib/projects";
import styles from "./page.module.css";

/**
 * Home - the lowest altitude of the climb. Hero at cloud level, a peek at the
 * strongest work, a one-line invitation to the story, and the primary "get in
 * touch" call. The Sky and Gopher live at the page shell so they persist across
 * the whole journey; content sits in cloud-white surfaces to stay readable.
 */
export default function HomePage() {
  return (
    <>
      <SkyCanvas />
      <GopherCompanion />
      <Nav />

      <main id="main" className={styles.main}>
        {/* Hero */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <Reveal className={styles.heroInner} y={16}>
            <p className={styles.kicker}>Backend developer · Go &amp; Gin</p>
            <h1 id="hero-title" className={styles.title}>
              Your Name
            </h1>
            <p className={styles.lead}>
              I build reliable web services and APIs, the kind of thing you
              don&apos;t notice because it just keeps working. Come climb through
              a few of them.
            </p>
            <div className={styles.heroActions}>
              <Button href="/projects">See the work</Button>
              <Button href="/contact" variant="secondary">
                Get in touch
              </Button>
            </div>
          </Reveal>

          <span className={styles.scrollHint} aria-hidden="true">
            Scroll to climb
          </span>
        </section>

        {/* Featured work */}
        <section className={styles.section} aria-labelledby="work-title">
          <div className={styles.sectionHead}>
            <Reveal>
              <h2 id="work-title" className={styles.sectionTitle}>
                A few things I&apos;ve built
              </h2>
              <p className={styles.sectionLede}>
                Services carrying real traffic, written in Go. Here are three;
                the rest are one climb away.
              </p>
            </Reveal>
          </div>

          <ul className={styles.featuredGrid}>
            {featuredProjects.map((project, i) => (
              <li key={project.slug}>
                <Reveal delay={i * 90}>
                  <ProjectCard project={project} />
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal className={styles.sectionFoot}>
            <Button href="/projects" variant="secondary">
              View all projects
            </Button>
          </Reveal>
        </section>

        {/* About teaser */}
        <section className={styles.section} aria-labelledby="about-title">
          <Reveal className={styles.aboutTeaser}>
            <h2 id="about-title" className={styles.sectionTitle}>
              A little about the climb
            </h2>
            <p className={styles.aboutText}>
              I&apos;m a developer who likes systems that hold up under pressure:
              clean APIs, honest error handling, and code that reads well at
              2am. There&apos;s a longer story, with the schools and the
              detours, up ahead.
            </p>
            <Link href="/about" className={styles.textLink}>
              Read the whole story →
            </Link>
          </Reveal>
        </section>

        {/* Contact CTA - the peak invitation */}
        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <Reveal className={styles.cta}>
            <h2 id="cta-title" className={styles.ctaTitle}>
              Let&apos;s build something together
            </h2>
            <p className={styles.ctaText}>
              Got a project, a role, or just a question? I&apos;d love to hear
              about it.
            </p>
            <div className={styles.ctaActions}>
              <Button href="/contact">Get in touch</Button>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
