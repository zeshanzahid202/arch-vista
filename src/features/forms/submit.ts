import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Inquiry, Consultation } from "@/models";
import { checkOrigin, clientIp, rateLimit, readJson } from "@/lib/security";
import {
  contactSchema,
  consultationSchema,
  newsletterSchema,
} from "@/lib/validation";
import { notifySubmission } from "@/lib/email";
import { apiError } from "@/lib/http";
export async function submit(
  request: Request,
  kind: "contact" | "consultation" | "newsletter",
) {
  try {
    checkOrigin(request);
    await rateLimit(`submit:${clientIp(request)}`, 8);
    const schema =
      kind === "consultation"
        ? consultationSchema
        : kind === "newsletter"
          ? newsletterSchema
          : contactSchema;
    const data = schema.parse(await readJson(request));
    await connectDB();
    const record =
      kind === "consultation"
        ? await Consultation.create(data)
        : await Inquiry.create({
            ...data,
            kind,
            ...(kind === "newsletter"
              ? {
                  name: "Newsletter subscriber",
                  message: "Requested architecture journal updates",
                }
              : {}),
          });
    await notifySubmission(kind, String(record._id));
    return NextResponse.json(
      {
        id: String(record._id),
        message:
          kind === "newsletter"
            ? "Your subscription request has been saved."
            : "Your request has been received. Thank you for sharing your vision.",
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
