import { individual } from "@/features/admin/api";
type Context = { params: Promise<{ resource: string; id: string }> };
async function handle(request: Request, context: Context) {
  const { resource, id } = await context.params;
  return individual(request, resource, id);
}
export { handle as GET, handle as PATCH, handle as DELETE };
