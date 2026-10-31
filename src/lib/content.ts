import "server-only";
import { connectDB } from "@/lib/db";
import { modelMap } from "@/models";
import type { Content, PageResult, Resource } from "@/types/content";
export function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value));
}
export function searchFilter(params: URLSearchParams, published = true) {
  const query: Record<string, unknown> = published
    ? { status: "published" }
    : {};
  const category = params.get("category");
  if (category && category !== "All") query.category = category.slice(0, 80);
  const status = params.get("status");
  if (!published && status) query.status = status;
  if (params.get("featured") === "true") query.featured = true;
  const q = params.get("q")?.trim().slice(0, 120);
  if (q) {
    const regex = {
      $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
    query.$or = [
      { title: regex },
      { summary: regex },
      { name: regex },
      { email: regex },
    ];
  }
  if (params.get("projectType")) query.projectType = params.get("projectType");
  return query;
}
export async function listContent(
  resource: Resource,
  params = new URLSearchParams(),
  published = true,
): Promise<PageResult<Content>> {
  await connectDB();
  const model = modelMap[resource];
  const query = searchFilter(params, published);
  if (resource === "testimonials" && published) query.approved = true;
  const page = Math.min(
    10000,
    Math.max(1, Math.floor(Number(params.get("page"))) || 1),
  );
  const limit = Math.min(
    100,
    Math.max(1, Math.floor(Number(params.get("limit"))) || 12),
  );
  const [items, total] = await Promise.all([
    model
      .find(query)
      .sort({ order: 1, publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    model.countDocuments(query),
  ]);
  return serialize({ items, total, page, pages: Math.ceil(total / limit) });
}
export async function getContent(
  resource: Resource,
  slug: string,
): Promise<Content | null> {
  await connectDB();
  return serialize(
    await modelMap[resource].findOne({ slug, status: "published" }).lean(),
  );
}
export async function getValues(
  resource: "homepage" | "settings" | "seo",
  key: string,
): Promise<Record<string, unknown>> {
  await connectDB();
  const item = await modelMap[resource].findOne({ key }).lean();
  return serialize(
    (item as { value?: Record<string, unknown> } | null)?.value || {},
  );
}
export async function optionalValues(
  resource: "homepage" | "settings" | "seo",
  key: string,
) {
  if (!process.env.MONGODB_URI) return {};
  return getValues(resource, key);
}
export async function publicList(
  resource: Resource,
  params = new URLSearchParams(),
) {
  try {
    return { ...(await listContent(resource, params)), unavailable: false };
  } catch {
    return {
      items: [] as Content[],
      total: 0,
      page: 1,
      pages: 0,
      unavailable: true,
    };
  }
}
