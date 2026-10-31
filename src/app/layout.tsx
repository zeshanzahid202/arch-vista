import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import { site } from "@/config/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ArchVista — Architecture Shaped by Vision",
    template: "%s — ArchVista",
  },
  description:
    "Thoughtful architecture, considered interiors, and timeless spaces. Explore the ArchVista studio and begin a conversation about your project.",
  openGraph: { type: "website", siteName: "ArchVista" },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
