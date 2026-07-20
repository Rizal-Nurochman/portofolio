import type { ReactNode } from "react";
import SkyCanvas from "@/components/sky/SkyCanvas";
import GopherCompanion from "@/components/gopher/GopherCompanion";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";

/**
 * Shared shell for the inner routes: the persistent Sky + Gopher journey, the
 * nav, and the footer wrapped around each page's content. Home composes these
 * pieces directly (it has a full-bleed hero), so it doesn't use this shell.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sky />
      <GopherCompanion />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
