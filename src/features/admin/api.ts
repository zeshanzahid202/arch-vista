import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { modelMap } from "@/models";
import { resources } from "@/config/site";
import {
  contentSchema,
  kvSchema,
  mediaUpdate,
  submissionUpdate,
  validatePublication,
} from "@/lib/validation";
import { audit, checkOrigin, HttpError, readJson } from "@/lib/security";
import { apiError } from "@/lib/http";
import { cleanHtml } from "@/lib/html";
import { listContent, serialize } from "@/lib/content";
import type { Resource } from "@/types/content";
import { cloudinary } from "@/lib/media";
function resourceName(value: string): Resource {
  if (!resources.includes(value as Resource))
    throw new HttpError(404, "Not found");
  return value as Resource;
}
function validateId(id: string) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Not found");
}
function ownerOnly(resource: Resource) {
  return ["settings", "seo"].includes(resource);
}
function contentKey(resource: Resource) {
  return resource === "homepage"
    ? "home"
    : resource === "seo"
      ? "default"
      : resource === "settings"
        ? "studio"
        : undefined;
}
function parse(resource: Resource, input: unknown) {
  if (["inquiries", "consultations"].includes(resource))
    return submissionUpdate.parse(input);
  if (resource === "media") return mediaUpdate.parse(input);
  if (["homepage", "settings", "seo"].includes(resource)) {
    const data = kvSchema.parse(input);
    if (data.key !== contentKey(resource))
      throw new HttpError(
        422,
        `Use the content key "${contentKey(resource)}" for this collection`,
      );
    return data;
  }
  const data = contentSchema.parse(input);
  data.body = cleanHtml(data.body);
  if (["testimonials", "team"].includes(resource) && !data.name)
    throw new HttpError(422, "Name is required");
  if (resource === "team" && !data.role)
    throw new HttpError(422, "Role is required");
  if (resource === "testimonials" && !data.quote)
    throw new HttpError(422, "Quotation is required");
  try {
    validatePublication(data, resource);
  } catch (error) {
    throw new HttpError(422, (error as Error).message);
  }
  return {
    ...data,
    body: cleanHtml(data.body),
    ...(resource === "articles" &&
    data.status === "published" &&
    !data.publishedAt
      ? { publishedAt: new Date() }
      : {}),
  };
}
function refresh() {
  revalidatePath("/", "layout");
}
export async function collection(request: Request, name: string) {
  try {
    const resource = resourceName(name);
    const admin = await requireAdmin(ownerOnly(resource));
    if (request.method === "GET") {
      if (["homepage", "settings", "seo", "media"].includes(resource)) {
        const params = new URL(request.url).searchParams;
        const q = params.get("q")?.slice(0, 120);
        const page = Math.min(
          10000,
          Math.max(1, Math.floor(Number(params.get("page"))) || 1),
        );
        const query: Record<string, unknown> = q
          ? {
              [resource === "media" ? "title" : "key"]: {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
              },
            }
          : {};
        if (resource === "media" && q) {
          const regex = {
            $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          };
          delete query.title;
          query.$or = [{ title: regex }, { alt: regex }, { folder: regex }];
        }
        if (resource !== "media") query.key = contentKey(resource);
        const [items, total] = await Promise.all([
          modelMap[resource]
            .find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * 20)
            .limit(20)
            .lean(),
          modelMap[resource].countDocuments(query),
        ]);
        return NextResponse.json({
          items: serialize(items),
          total,
          page,
          pages: Math.ceil(total / 20),
        });
      }
      return NextResponse.json(
        await listContent(resource, new URL(request.url).searchParams, false),
      );
    }
    checkOrigin(request);
    if (["inquiries", "consultations", "media"].includes(resource))
      throw new HttpError(405, "Use the public submission or upload endpoint");
    const record = await modelMap[resource].create(
      parse(resource, await readJson(request)),
    );
    await audit(admin.id, "create", resource, String(record._id));
    refresh();
    return NextResponse.json(serialize(record), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
export async function individual(request: Request, name: string, id: string) {
  try {
    const resource = resourceName(name);
    const admin = await requireAdmin(ownerOnly(resource));
    validateId(id);
    const model = modelMap[resource];
    const record = await model.findById(id);
    if (!record) throw new HttpError(404, "Not found");
    if (contentKey(resource) && record.key !== contentKey(resource))
      throw new HttpError(404, "Not found");
    if (request.method === "GET") return NextResponse.json(serialize(record));
    checkOrigin(request);
    if (request.method === "DELETE") {
      if (resource === "media") {
        const url = record.url;
        const usages = await Promise.all(
          ["projects", "services", "articles", "team", "testimonials"].map(
            (r) =>
              modelMap[r as Resource].exists({
                $or: [
                  { "cover.url": url },
                  { "gallery.url": url },
                  {
                    body: {
                      $regex: url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    },
                  },
                  {
                    body: {
                      $regex: String(url)
                        .replace(/&/g, "&amp;")
                        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    },
                  },
                  { "seo.image": url },
                ],
              }),
          ),
        );
        const values = await modelMap.homepage.find({}).lean();
        const settings = await modelMap.settings.find({}).lean();
        if (
          usages.some(Boolean) ||
          JSON.stringify([...values, ...settings]).includes(url)
        )
          throw new HttpError(
            409,
            "This image is in use. Remove it from content first.",
          );
        if (!process.env.CLOUDINARY_API_SECRET)
          throw new HttpError(503, "Cloudinary is not configured");
        const result = await cloudinary().uploader.destroy(record.publicId, {
          invalidate: true,
        });
        if (!["ok", "not found"].includes(result.result))
          throw new HttpError(503, "Image could not be deleted");
      }
      await model.deleteOne({ _id: id });
      await audit(admin.id, "delete", resource, id);
      refresh();
      return NextResponse.json({ deleted: true });
    }
    const input = await readJson(request);
    const merged = { ...serialize<Record<string, unknown>>(record), ...input };
    const data = parse(resource, merged);
    const updated = await model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );
    await audit(admin.id, "update", resource, id);
    refresh();
    return NextResponse.json(serialize(updated));
  } catch (error) {
    return apiError(error);
  }
}
