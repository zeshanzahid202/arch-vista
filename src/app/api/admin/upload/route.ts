import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiError } from "@/lib/http";
import { audit, checkOrigin, HttpError, rateLimit } from "@/lib/security";
import { cloudinary } from "@/lib/media";
import { validateFile } from "@/lib/validation";
import { Media } from "@/models";
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`upload:${admin.id}`, 30);
    if (!process.env.CLOUDINARY_API_SECRET)
      throw new HttpError(503, "Configure Cloudinary to upload images");
    if (Number(request.headers.get("content-length")) > 4500000)
      throw new HttpError(413, "Upload an image under 4 MB");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(422, "Choose an image");
    if (file.size > 4 * 1024 * 1024)
      throw new HttpError(413, "Upload an image under 4 MB");
    const alt = String(form.get("alt") || "").trim();
    if (alt.length < 3 || alt.length > 300)
      throw new HttpError(422, "Describe the image (3–300 characters)");
    const folder = String(form.get("folder") || "archvista");
    if (!/^[a-zA-Z0-9/_-]{1,100}$/.test(folder))
      throw new HttpError(422, "Invalid folder");
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      validateFile(buffer, file.type, file.size);
    } catch (error) {
      throw new HttpError(422, (error as Error).message);
    }
    const result = await cloudinary().uploader.upload(
      `data:${file.type};base64,${buffer.toString("base64")}`,
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "png", "webp"],
        max_image_pixels: 40000000,
      },
    );
    const record = await Media.create({
      title: file.name.slice(0, 180),
      url: result.secure_url,
      publicId: result.public_id,
      alt,
      folder,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
    await audit(admin.id, "upload", "media", String(record._id));
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
