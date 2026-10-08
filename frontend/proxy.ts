import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type SessionUser = { id: string; name: string; email: string; role: "admin" | "customer" };

async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;

  try {
    // Sanctum's EnsureFrontendRequestsAreStateful checks Origin/Referer to
    // decide whether a request is "from the SPA" (and therefore gets
    // session-based auth) — a server-to-server fetch has neither by
    // default, so it must be set explicitly here to match
    // SANCTUM_STATEFUL_DOMAINS on the backend.
    const res = await fetch(`${API_URL}/api/user`, {
      headers: { Accept: "application/json", Cookie: cookie, Origin: APP_URL, Referer: APP_URL },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { success: boolean; data?: SessionUser };
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login is reachable by anyone (it's the admin sign-in page
  // itself) — everything else under /admin, plus all of /dashboard and
  // /buku-tamu, requires a session.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/buku-tamu");

  const user = await getSessionUser(request);

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isDashboardRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && user && user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute && user && user.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/buku-tamu/:path*", "/admin/:path*"],
};
