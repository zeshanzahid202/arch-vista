import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "../src/lib/db";
import { Admin, AuditLog } from "../src/models";
async function main() {
  const config = z
    .object({
      ADMIN_EMAIL: z.email(),
      ADMIN_NAME: z.string().min(2),
      ADMIN_PASSWORD: z
        .string()
        .min(14)
        .refine(
          (v) => Buffer.byteLength(v) <= 72,
          "bcrypt passwords must be at most 72 UTF-8 bytes",
        ),
    })
    .parse(process.env);
  await connectDB();
  await Admin.init();
  if (await Admin.exists({ email: config.ADMIN_EMAIL.toLowerCase() }))
    throw new Error(
      "An administrator with this email already exists. No changes made.",
    );
  const admin = await Admin.create({
    name: config.ADMIN_NAME,
    email: config.ADMIN_EMAIL.toLowerCase(),
    passwordHash: await hash(config.ADMIN_PASSWORD, 12),
    role: "owner",
  });
  await AuditLog.create({
    actor: admin._id,
    action: "admin.initialized",
    resource: "security",
  });
  console.log(
    "Owner account created. Remove ADMIN_PASSWORD from your environment after setup.",
  );
}
main()
  .catch((error) => {
    console.error(
      error instanceof z.ZodError
        ? error.issues.map((i) => i.message).join("; ")
        : error.message,
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
