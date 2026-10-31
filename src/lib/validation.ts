import { z } from "zod";
export const safeUrl = z.url().refine((v) => {
  const u = new URL(v);
  return (
    u.protocol === "https:" &&
    ["images.unsplash.com", "res.cloudinary.com"].includes(u.hostname)
  );
}, "Use an HTTPS Cloudinary or Unsplash image URL");
const image = z.object({
  url: safeUrl,
  alt: z.string().trim().min(3).max(300),
  publicId: z.string().max(300).optional(),
});
const text = z.string().trim().max(20000);
export const contentSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: z
    .string()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().max(1200).default(""),
  body: z.string().max(150000).default(""),
  cover: image.optional(),
  gallery: z.array(image).max(40).default([]),
  category: z.string().trim().max(80).default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).max(10000).default(0),
  demo: z.boolean().default(false),
  location: z.string().trim().max(180).optional(),
  year: z.number().int().min(1900).max(2200).optional(),
  area: z.string().trim().max(80).optional(),
  concept: text.optional(),
  materials: text.optional(),
  challenges: text.optional(),
  solution: text.optional(),
  benefits: z.array(z.string().max(1000)).max(30).default([]),
  stages: z.array(z.string().max(1000)).max(20).default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().min(3).max(500),
        answer: z.string().min(3).max(3000),
      }),
    )
    .max(30)
    .default([]),
  tags: z.array(z.string().max(60)).max(20).default([]),
  author: z.string().trim().max(150).optional(),
  publishedAt: z.iso.datetime().optional(),
  name: z.string().trim().max(150).optional(),
  role: z.string().trim().max(150).optional(),
  quote: z.string().trim().max(3000).optional(),
  approved: z.boolean().default(false),
  seo: z
    .object({
      title: z.string().max(80).optional(),
      description: z.string().max(200).optional(),
      image: safeUrl.optional(),
      canonical: z
        .url()
        .refine((v) => new URL(v).protocol === "https:")
        .optional(),
      noIndex: z.boolean().optional(),
    })
    .default({}),
});
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z
    .email()
    .max(200)
    .transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(40).default(""),
  message: z
    .string()
    .trim()
    .min(20, "Please tell us a little more (at least 20 characters)")
    .max(5000),
  consent: z.literal(true, { error: "Please agree to the privacy policy" }),
  website: z.string().max(0).optional(),
});
export const consultationSchema = contactSchema.extend({
  phone: z.string().trim().min(6).max(40),
  projectType: z.enum([
    "Residential",
    "Commercial",
    "Interior",
    "Hospitality",
    "Renovation",
    "Spatial planning",
    "Other",
  ]),
  location: z.string().trim().min(2).max(180),
  area: z.string().trim().min(1).max(80),
  budget: z.enum([
    "Under $100k",
    "$100k–$300k",
    "$300k–$750k",
    "$750k–$1.5m",
    "$1.5m+",
    "To be discussed",
  ]),
  timeline: z.enum([
    "Within 3 months",
    "3–6 months",
    "6–12 months",
    "Exploring possibilities",
  ]),
});
export const newsletterSchema = z.object({
  email: z
    .email()
    .max(200)
    .transform((v) => v.toLowerCase()),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});
export const submissionUpdate = z.object({
  status: z.enum(["new", "contacted", "closed"]),
  notes: z.string().trim().max(10000).default(""),
});
export const mediaUpdate = z.object({
  title: z.string().trim().min(2).max(180),
  alt: z.string().trim().min(3).max(300),
  folder: z
    .string()
    .regex(/^[a-zA-Z0-9/_-]+$/)
    .max(120),
});
export const passwordSchema = z
  .string()
  .min(14)
  .refine(
    (v) => new TextEncoder().encode(v).length <= 72,
    "Use at most 72 UTF-8 bytes for the password",
  );
export const kvSchema = z.object({
  key: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(150),
  value: z
    .record(z.string(), z.unknown())
    .refine((v) => JSON.stringify(v).length < 100000, "Content is too large"),
});
export function validatePublication(
  data: z.infer<typeof contentSchema>,
  resource: string,
) {
  if (data.status !== "published") return;
  if (
    ["projects", "services", "articles", "team"].includes(resource) &&
    !data.cover
  )
    throw new Error(
      "A cover image with alt text is required before publishing",
    );
  if (
    ["projects", "services", "articles"].includes(resource) &&
    (!data.summary || !data.body.replace(/<[^>]*>/g, "").trim())
  )
    throw new Error("Summary and content are required before publishing");
  if (resource === "testimonials" && !data.approved)
    throw new Error("Approve this testimonial before publishing");
}
export function validateFile(bytes: Uint8Array, type: string, size: number) {
  if (size > 8 * 1024 * 1024 || size === 0)
    throw new Error("Image must be between 1 byte and 8 MB");
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!(
    (type === "image/jpeg" && jpeg) ||
    (type === "image/png" && png) ||
    (type === "image/webp" && webp)
  ))
    throw new Error("Upload a valid JPEG, PNG or WebP image");
}
