import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { apiError } from "@/lib/http";
export async function GET(
  _: Request,
  context: { params: Promise<{ resource: string; slug: string }> },
) {
  try {
    const { resource, slug } = await context.params;
    if (
      resource !== "projects" &&
      resource !== "services" &&
      resource !== "articles"
    )
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = await getContent(resource, slug);
    return data
      ? NextResponse.json(data)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
