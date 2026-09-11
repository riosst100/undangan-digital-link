import { cookies } from "next/headers";
import type { ApiResponse } from "./client";

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Server Component fetch helper that forwards the incoming request's
 * session cookie to Laravel, for authenticated GETs (e.g. an admin page
 * reading its own data at render time). Route protection itself lives in
 * proxy.ts; this only reads data inside a page proxy already allowed
 * through. Returns null on any failure so pages can degrade gracefully.
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json", Cookie: cookieHeader, Origin: APP_URL, Referer: APP_URL },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as ApiResponse<T>;
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}
