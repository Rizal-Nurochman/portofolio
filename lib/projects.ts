export interface Project {
  slug: string;
  title: string;
  summary: string;
  role: string;
  stack: string[];
  description?: string[];
  preview?: string;
  liveUrl?: string;
  repoUrl?: string;
  accent: "azure" | "gold" | "sky";
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "revolusi-edukasi",
    title: "Revolusi Edukasi",
    summary: "An e-learning platform that helps high-school and gap-year students prepare for the SNBT exam through mock tryouts, structured courses, and live classes.",
    role: "Backend",
    stack: ["Go", "Gin", "Vue", "PostgreSQL"],
    description: [
      "Revolusi Edukasi is an e-learning platform built for students preparing for the SNBT university-entrance exam. It brings tryouts, courses, and live classes into one place so students can study, practice, and get feedback without juggling separate tools.",
      "I built the backend in Go and Gin: the REST API, the PostgreSQL data model behind courses and tryout scoring, and the endpoints that power the live-class and progress-tracking features.",
    ],
    preview: "/Reduka.png",
    liveUrl: "https://revolusi-edukasi.com",
    repoUrl: "https://github.com/redukasquad/be-reduka",
    accent: "azure",
    featured: true,
  },
  {
    slug: "literasiku-library",
    title: "Literasiku",
    summary: "An online library for borrowing both digital and physical books, with a searchable catalog, a borrow-and-return flow, and an in-reader chatbot that helps while you read.",
    role: "Backend",
    stack: ["Go", "Gin", "PostgreSQL", "Vue", "Docker"],
    description: [
      "Literasiku is an online library where readers can borrow both digital and physical books. A searchable catalog helps them find titles, and a borrow-and-return flow tracks what's out on loan — plus an in-reader chatbot that answers questions while reading digital books.",
      "I built the backend with Go, Gin, and PostgreSQL, and containerized the service with Docker. My work covered the catalog and lending API, the loan lifecycle, and the integration that powers the reading chatbot.",
    ],
    accent: "azure",
    liveUrl: "https://literasiku-library.vercel.app",
    repoUrl: "https://github.com/Rizal-Nurochman/literasiku",
    preview: "/Literasiku.png",
    featured: true,
  },
  {
    slug: "match-and-build",
    title: "Match and Build",
    summary: "A marketplace that connects clients with architecture and interior designers, using a machine-learning recommender to surface designs that match each client's taste.",
    role: "Backend and Machine Learning Engineer",
    stack: ["Go", "Gin", "PostgreSQL", "Python"],
    description: [
      "Match and Build is a marketplace that connects clients with architecture and interior designers. Instead of scrolling endlessly, clients get design recommendations tailored to their taste, making it faster to find a designer whose style fits.",
      "I worked on both the backend and the machine-learning side: the Go and Gin API and PostgreSQL model, and a Python recommender that ranks designs by cosine similarity so the closest matches to a client's preferences surface first.",
    ],
    accent: "gold",
    liveUrl: "https://matchnbuild.vercel.app",
    repoUrl: "https://github.com/Rizal-Nurochman/matchnbuild-be",
    preview: "/MnB.png",
    featured: true,
  },
  {
    slug: "dodolan",
    title: "Dodolan",
    summary: "A SaaS point-of-sale for small businesses — manage products, ring up sales, and track transactions from a single dashboard.",
    role: "Fullstack",
    stack: ["Go", "Gin", "Next.js", "PostgreSQL"],
    description: [
      "Dodolan is a SaaS point-of-sale for small businesses. It pulls product management, sales, and transaction history into a single dashboard, so a shop can run day-to-day operations from one place.",
      "I built it full-stack: a Go and Gin backend with a PostgreSQL data model for products and transactions, and a Next.js front end for the POS dashboard.",
    ],
    accent: "azure",
    liveUrl: "https://dodolan.vercel.app",
    repoUrl: "https://github.com/Rizal-Nurochman/Dodolan",
    preview: "/Dodolan.png",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
