import nodemailer from "smtp-mailer";
import { Consultation, Inquiry } from "@/models";
export async function notifySubmission(
  kind: "contact" | "consultation" | "newsletter",
  id: string,
) {
  const model = kind === "consultation" ? Consultation : Inquiry;
  try {
    if (
      !process.env.SMTP_HOST ||
      !process.env.MAIL_FROM ||
      !process.env.NOTIFICATION_EMAIL
    )
      throw new Error("Email is not configured");
    const record = await model.findById(id);
    if (!record || record.notificationStatus === "sent") return;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
      connectionTimeout: 5000,
      socketTimeout: 8000,
    });
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.NOTIFICATION_EMAIL,
      replyTo: record.email,
      subject: `ArchVista — new ${kind} request`,
      text: [
        `Name: ${record.name}`,
        `Email: ${record.email}`,
        `Phone: ${record.phone || "—"}`,
        `Project: ${record.projectType || "—"}`,
        `Location: ${record.location || "—"}`,
        `Budget: ${record.budget || "—"}`,
        `Timeline: ${record.timeline || "—"}`,
        "",
        record.message,
        "",
        `Reference: ${id}`,
      ].join("\n"),
    });
    await model.updateOne({ _id: id }, { notificationStatus: "sent" });
  } catch {
    await model.updateOne({ _id: id }, { notificationStatus: "failed" });
  }
}
