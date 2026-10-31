import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models";
import { HttpError } from "@/lib/security";
export async function requireAdmin(ownerOnly = false) {
  const session = await auth();
  if (!session?.user?.id) throw new HttpError(401, "Please sign in");
  await connectDB();
  const admin = await Admin.findById(session.user.id);
  if (!admin?.active || admin.sessionVersion !== session.user.sessionVersion)
    throw new HttpError(401, "Session expired. Please sign in again.");
  if (ownerOnly && admin.role !== "owner")
    throw new HttpError(403, "Owner access is required");
  return {
    id: String(admin._id),
    name: String(admin.name),
    role: String(admin.role),
  };
}
