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
    slug: "revolusi-edukasi",
    title: "Revolusi Edukasi",
    summary: "",
    role: "Backend",
    stack: ["Go", "GIN", "Vue", "PostgreSQL"],
    preview: "/Reduka.png",
    liveUrl: "https://revolusi-edukasi.com",
    repoUrl: "https://github.com/redukasquad/be-reduka",
    accent: "azure",
    featured: true
  },
  {
    slug: "literasiku-library",
    title: "Literasiku",
    summary: "",
    role: "Backend",
    stack: ["Go", "Gin", "PostgreSQL", "Vue", "Docker"],
    accent: "azure",
    liveUrl: "https://literasiku-library.vercel.app",
    repoUrl: "https://github.com/Rizal-Nurochman/literasiku",
    preview: "/Literasiku.png",
    featured: true,
  },
  {
    slug: "match-and-build",
    title: "Match and Build",
    summary: "",
    role: "Backend and Machine Learning Engineer",
    stack: ["Go", "Gin", "PostgreSQL", "Python"],
    accent: "gold",
    liveUrl: "https://matchnbuild.vercel.app",
    repoUrl: "https://github.com/Rizal-Nurochman/matchnbuild-be",
    preview: "/MnB.png",
    featured: true,
  },
  {
    slug: "dodolan",
    title: "Dodolan",
    summary:"",
    role: "Fullstack",
    stack: ["Go", "Gin", "NextJS", "PostgreSQL"],
    accent: "azure",
    liveUrl: "https://dodolan.vercel.app",
    repoUrl: "https://github.com/Rizal-Nurochman/Dodolan",
    preview: "/Dodolan.png"
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
