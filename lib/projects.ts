/**
 * Placeholder project data. Shape mirrors what real projects will carry so the
 * UI is built against final data, not throwaway strings. Swap the contents for
 * real work later; the `slug` becomes the /projects/[slug] route.
 *
 * `preview` points at a screenshot in /public/projects. Until real shots exist,
 * a gradient placeholder is rendered from the accent/sky colors (see ProjectCard).
 */
export interface Project {
  slug: string;
  title: string;
  summary: string;
  /** short role/what-you-built line */
  role: string;
  stack: string[];
  preview?: string;
  liveUrl?: string;
  repoUrl?: string;
  /** used for the placeholder gradient when preview is absent */
  accent: "azure" | "gold" | "sky";
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "cloudpost-api",
    title: "CloudPost API",
    summary:
      "A REST API for a social posting platform: auth, rate limiting, and media uploads served behind a clean, versioned surface.",
    role: "Designed and built the full backend and data model.",
    stack: ["Go", "Gin", "PostgreSQL", "Redis"],
    accent: "azure",
    liveUrl: "#",
    repoUrl: "#",
    featured: true,
  },
  {
    slug: "skyledger",
    title: "SkyLedger",
    summary:
      "A double-entry bookkeeping service with idempotent transactions and a reporting engine that stays correct under concurrency.",
    role: "Backend architecture, transaction integrity, reporting API.",
    stack: ["Go", "Gin", "PostgreSQL"],
    accent: "gold",
    liveUrl: "#",
    repoUrl: "#",
    featured: true,
  },
  {
    slug: "nimbus-notify",
    title: "Nimbus Notify",
    summary:
      "A fan-out notification service that batches, dedupes, and delivers across email, push, and webhooks with retry semantics.",
    role: "Event pipeline, delivery workers, retry and backoff design.",
    stack: ["Go", "Gin", "RabbitMQ"],
    accent: "sky",
    liveUrl: "#",
    repoUrl: "#",
    featured: true,
  },
  {
    slug: "altimeter",
    title: "Altimeter",
    summary:
      "A lightweight uptime and latency monitor with a public status page and a clean metrics query layer.",
    role: "Probing engine, time-series storage, status API.",
    stack: ["Go", "Gin", "SQLite"],
    accent: "azure",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    slug: "stratus-shorten",
    title: "Stratus Shorten",
    summary:
      "A URL shortener with per-link analytics, custom slugs, and a cache-first read path built for scale.",
    role: "Full service design, caching strategy, analytics rollups.",
    stack: ["Go", "Gin", "Redis"],
    accent: "gold",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    slug: "cirrus-chat",
    title: "Cirrus Chat",
    summary:
      "A real-time chat backend over WebSockets with presence, typing indicators, and message history pagination.",
    role: "WebSocket hub, presence system, message persistence.",
    stack: ["Go", "Gin", "WebSocket", "PostgreSQL"],
    accent: "sky",
    liveUrl: "#",
    repoUrl: "#",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
