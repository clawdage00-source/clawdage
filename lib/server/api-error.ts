import { NextResponse } from "next/server";

export function logApiError(route: string, error: unknown, metadata?: Record<string, unknown>) {
  console.error(
    JSON.stringify({
      level: "error",
      route,
      metadata: metadata ?? {},
      error: error instanceof Error ? error.message : String(error),
      at: new Date().toISOString(),
    }),
  );
}

export function internalApiError(route: string, error: unknown, metadata?: Record<string, unknown>) {
  logApiError(route, error, metadata);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
