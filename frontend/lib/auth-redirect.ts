const CUSTOMER_AREAS = ["/dashboard", "/buku-tamu"];

/** Where to send a customer after login/register: the ?redirect= target if
 * it's a customer page on this site, else the dashboard. */
export function resolveRedirectTarget(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return CUSTOMER_AREAS.some((area) => raw === area || raw.startsWith(`${area}/`) || raw.startsWith(`${area}?`))
    ? raw
    : "/dashboard";
}

/** Carries the ?redirect= target over when switching between login and register. */
export function withRedirect(path: string, redirect: string | null): string {
  return redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;
}
