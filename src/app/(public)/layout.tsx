import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { optionalValues } from "@/lib/content";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { AmbientMotion } from "@/components/ambient-motion";
import { jsonLd } from "@/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  let defaults: Record<string, unknown> = {};
  let settings: Record<string, unknown> = {};
  try {
    [defaults, settings] = await Promise.all([
      optionalValues("seo", "default"),
      optionalValues("settings", "studio"),
    ]);
  } catch {}
  const description = String(
    defaults.description ||
      settings.description ||
      "Thoughtful architecture, considered interiors, and timeless spaces.",
  );
  return {
    title: {
      default: String(
        defaults.title || "ArchVista — Architecture Shaped by Vision",
      ),
      template: `%s — ${String(settings.name || "ArchVista")}`,
    },
    description,
    alternates: { canonical: String(defaults.canonical || site.url) },
    robots: { index: defaults.noIndex !== true, follow: true },
    openGraph: {
      title: String(defaults.title || "ArchVista"),
      description,
      images:
        typeof defaults.image === "string" && defaults.image
          ? [defaults.image]
          : [],
    },
  };
}
export const dynamic = "force-dynamic";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: Record<string, unknown> = {};
  try {
    settings = await optionalValues("settings", "studio");
  } catch {
    /* Public contact data can be temporarily unavailable. */
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Organization",
            name:
              typeof settings.name === "string" ? settings.name : "ArchVista",
            url: site.url,
            ...(settings.email ? { email: String(settings.email) } : {}),
          }),
        }}
      />
      <Navigation
        name={typeof settings.name === "string" ? settings.name : "ArchVista"}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <AmbientMotion />
    </>
  );
}
