import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/security";
export function apiError(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: "Please check the highlighted fields",
        fields: error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  if (error instanceof HttpError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  )
    return NextResponse.json(
      { error: "That slug or key is already in use" },
      { status: 409 },
    );
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return NextResponse.json(
    { error: "The service is unavailable. Please try again shortly." },
    { status: 503 },
  );
}
