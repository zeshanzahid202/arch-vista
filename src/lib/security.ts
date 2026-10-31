import { createHash } from "node:crypto";
import { connectDB } from "@/lib/db";
import { AuditLog, RateLimit } from "@/models";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(
    process.env.AUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000",
  ).origin;
  if (origin !== expected)
    throw new HttpError(403, "This request origin is not permitted");
}
export function clientIp(request: Request) {
  return process.env.VERCEL || process.env.TRUST_PROXY === "true"
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "local";
}
export async function rateLimit(
  identifier: string,
  limit = 6,
  duration = 15 * 60 * 1000,
) {
  await connectDB();
  const now = Date.now();
  const window = Math.floor(now / duration);
  const key = createHash("sha256")
    .update(`${identifier}:${window}`)
    .digest("hex");
  const record = await RateLimit.findOneAndUpdate(
    { key },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((window + 1) * duration) },
    },
    { upsert: true, new: true },
  );
  if (record.count > limit)
    throw new HttpError(429, "Too many attempts. Please try again later.");
}
export async function audit(
  actor: string | undefined,
  action: string,
  resource?: string,
  target?: string,
) {
  await AuditLog.create({ actor, action, resource, target });
}
export async function readJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "A JSON body is required");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 200000) {
      await reader.cancel();
      throw new HttpError(413, "Request is too large");
    }
    chunks.push(value);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}
