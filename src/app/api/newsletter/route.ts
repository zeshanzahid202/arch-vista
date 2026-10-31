import { submit } from "@/features/forms/submit";
export const POST = (request: Request) => submit(request, "newsletter");
