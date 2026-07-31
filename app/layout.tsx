import type { Metadata } from "next";
import {
  Fraunces,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import CloudIntro from "@/components/intro/CloudIntro";
import Sky from "@/components/sky/Sky";
import GopherCompanion from "@/components/gopher/GopherCompanion";
import Nav from "@/components/ui/Nav";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "Rizal | Backend Engineer",
    template: "%s | Rizal",
  },
  description:
    "Portofolio Mohamad Rizal Nurochman, Backend Engineer yang membangun aplikasi web menggunakan Go, Gin, dan teknologi modern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <Sky />
        <GopherCompanion />
        <Nav />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');",
          }}
        />
      </head>

      <body>
        <Sky />
        <CloudIntro />

        <div className="site-shell">
          {children}
        </div>

        <GopherCompanion />
         <Footer />
      </body>
    </html>
  );
}