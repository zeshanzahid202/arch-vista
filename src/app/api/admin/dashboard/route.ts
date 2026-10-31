import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { Project, Article, Inquiry, Consultation, AuditLog } from "@/models";
import { apiError } from "@/lib/http";
export async function GET() {
  try {
    await requireAdmin();
    const [
      projects,
      published,
      drafts,
      inquiries,
      newInquiries,
      consultations,
      articles,
      recent,
      activity,
      monthly,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: "published" }),
      Project.countDocuments({ status: "draft" }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "new" }),
      Consultation.countDocuments(),
      Article.countDocuments({ status: "published" }),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("actor", "name")
        .lean(),
      Inquiry.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 180 * 86400000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    return NextResponse.json({
      stats: {
        projects,
        published,
        drafts,
        inquiries,
        newInquiries,
        consultations,
        articles,
      },
      recent,
      activity,
      monthly,
    });
  } catch (error) {
    return apiError(error);
  }
}
