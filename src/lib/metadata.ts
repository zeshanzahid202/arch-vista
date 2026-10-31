import type { Metadata } from "next";
import type { Content } from "@/types/content";
import { site } from "@/config/site";
import { optionalValues } from "@/lib/content";
export async function contentMetadata(
  item: Content | null,
  path: string,
): Promise<Metadata> {
  if (!item) return { title: "Not found", robots: { index: false } };
  const defaults = await optionalValues("seo", "default");
  return {
    title: item.seo?.title || item.title,
    description: item.seo?.description || item.summary,
    alternates: { canonical: item.seo?.canonical || `${site.url}${path}` },
    robots: {
      index: !item.seo?.noIndex && defaults.noIndex !== true,
      follow: true,
    },
    openGraph: {
      title: item.seo?.title || item.title,
      description: item.seo?.description || item.summary,
      images:
        item.seo?.image || item.cover?.url
          ? [
              {
                url: item.seo?.image || item.cover.url,
                alt: item.cover?.alt || item.title,
              },
            ]
          : [],
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
