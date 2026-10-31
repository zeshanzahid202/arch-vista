import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { connectDB } from "@/lib/db";
import { Project, Service, Article } from "@/models";
import { optionalValues } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    "",
    "/about",
    "/projects",
    "/services",
    "/studio",
    "/journal",
    "/contact",
    "/consultation",
    "/privacy",
    "/terms",
  ].map((path) => ({ url: `${site.url}${path}` }));
  try {
    await connectDB();
    const defaults = await optionalValues("seo", "default");
    if (defaults.noIndex === true) return [];
    const groups = await Promise.all(
      [Project, Service, Article].map((m) =>
        m
          .find({ status: "published", "seo.noIndex": { $ne: true } })
          .select("slug updatedAt")
          .lean(),
      ),
    );
    return [
      ...pages,
      ...groups.flatMap((group, i) =>
        group.map((item) => ({
          url: `${site.url}/${["projects", "services", "journal"][i]}/${item.slug}`,
          lastModified: item.updatedAt,
        })),
      ),
    ];
  } catch {
    return pages;
  }
}
