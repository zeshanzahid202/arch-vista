import { notFound } from "next/navigation";
import { resources } from "@/config/site";
import type { Resource } from "@/types/content";
import { ResourceEditor } from "@/features/admin/editor";
export default async function EditorPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  if (
    !resources.includes(resource as Resource) ||
    (id === "new" && ["media", "inquiries", "consultations"].includes(resource))
  )
    notFound();
  return <ResourceEditor resource={resource as Resource} id={id} />;
}
