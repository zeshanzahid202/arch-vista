import { NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
  checkOrigin,
  readJson,
  audit,
  rateLimit,
  HttpError,
} from "@/lib/security";
import { Admin, AuditLog } from "@/models";
import { apiError } from "@/lib/http";
import { passwordSchema } from "@/lib/validation";
export async function GET() {
  try {
    await requireAdmin(true);
    return NextResponse.json(
      await AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("actor", "name")
        .lean(),
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    const actor = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`password:${actor.id}`, 5);
    const data = z
      .object({
        currentPassword: z.string().max(128),
        password: passwordSchema,
      })
      .parse(await readJson(request));
    const admin = await Admin.findById(actor.id).select("+passwordHash");
    if (!(await compare(data.currentPassword, admin.passwordHash)))
      throw new HttpError(422, "Current password is incorrect");
    admin.passwordHash = await hash(data.password, 12);
    admin.sessionVersion += 1;
    await admin.save();
    await audit(actor.id, "password.changed", "security");
    return NextResponse.json({
      message: "Password changed. Sign in again on all devices.",
    });
  } catch (e) {
    return apiError(e);
  }
}
