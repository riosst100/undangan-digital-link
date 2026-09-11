import { cookies } from "next/headers";
import type { User } from "./auth";

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Server-side session lookup for use in Server Components. Must forward the
 * incoming request's cookies explicitly — Laravel Sanctum SPA auth is
 * cookie-based, and a server-to-server fetch has no browser cookie jar.
 * Route protection itself lives in middleware.ts; this is only for reading
 * "who is logged in" inside a page that middleware already allowed through.
 */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    // See middleware.ts for why Origin/Referer must be forwarded explicitly
    // for Sanctum to treat this as a stateful (cookie-authenticated) request.
    const res = await fetch(`${API_URL}/api/user`, {
      headers: { Accept: "application/json", Cookie: cookieHeader, Origin: APP_URL, Referer: APP_URL },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { success: boolean; data?: User };
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}
