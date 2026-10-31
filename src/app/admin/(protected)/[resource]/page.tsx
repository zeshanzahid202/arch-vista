import { notFound } from "next/navigation";
import { resources } from "@/config/site";
import type { Resource } from "@/types/content";
import { ResourceList } from "@/features/admin/resource-list";
export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  if (!resources.includes(resource as Resource)) notFound();
  return <ResourceList resource={resource as Resource} />;
}
