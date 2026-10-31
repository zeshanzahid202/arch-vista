import { collection } from "@/features/admin/api";
type Context = { params: Promise<{ resource: string }> };
export async function GET(request: Request, context: Context) {
  return collection(request, (await context.params).resource);
}
export async function POST(request: Request, context: Context) {
  return collection(request, (await context.params).resource);
}
