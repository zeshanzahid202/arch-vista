import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/features/admin/shell";
import { HttpError } from "@/lib/security";
export const dynamic = "force-dynamic";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) redirect("/admin/login");
    throw e;
  }
  return (
    <AdminShell name={admin.name} role={admin.role}>
      {children}
    </AdminShell>
  );
}
