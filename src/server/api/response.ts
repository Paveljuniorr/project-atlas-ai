import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "PROVIDER_ERROR"
  | "INTERNAL_ERROR";

export function apiSuccess<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status }
  );
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status }
  );
}

export function mapErrorToResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "An unexpected error occurred";

  if (message.startsWith("UNAUTHORIZED")) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }
  if (message.startsWith("FORBIDDEN")) {
    return apiError("FORBIDDEN", "You do not have permission for this action", 403);
  }
  if (message.startsWith("NOT_FOUND")) {
    return apiError("NOT_FOUND", message.replace("NOT_FOUND: ", ""), 404);
  }
  if (message.startsWith("VALIDATION")) {
    return apiError("VALIDATION_ERROR", message.replace("VALIDATION: ", ""), 400);
  }
  if (message.startsWith("RATE_LIMIT")) {
    return apiError("RATE_LIMITED", "Too many requests. Please try again later.", 429);
  }
  if (message.startsWith("CONFLICT")) {
    return apiError("CONFLICT", message.replace("CONFLICT: ", ""), 409);
  }
  if (message.startsWith("PROVIDER")) {
    return apiError("PROVIDER_ERROR", message.replace("PROVIDER: ", ""), 502);
  }

  return apiError("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
}
