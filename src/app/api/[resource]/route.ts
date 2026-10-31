import { NextResponse } from "next/server";
import { listContent } from "@/lib/content";
import { apiError } from "@/lib/http";
export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  try {
    const { resource } = await context.params;
    if (
      resource !== "projects" &&
      resource !== "services" &&
      resource !== "articles"
    )
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(
      await listContent(resource, new URL(request.url).searchParams),
    );
  } catch (error) {
    return apiError(error);
  }
}
