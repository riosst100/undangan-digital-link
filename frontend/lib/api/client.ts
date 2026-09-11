const API_BASE_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

function readXsrfTokenCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Laravel Sanctum's SPA (cookie) auth requires a CSRF token on every
 * mutating request. The token comes from the XSRF-TOKEN cookie, which the
 * backend only sets once GET /sanctum/csrf-cookie has been hit — so on the
 * browser's first mutating call in a session, fetch that first.
 *
 * `force` bypasses the "already have a cookie" shortcut. Needed because the
 * XSRF-TOKEN cookie now outlives the server-side session it was minted for
 * in some cases (e.g. the backend restarts, or the Laravel session record
 * is pruned/rotated) — the browser can hold a stale-but-present cookie
 * indefinitely and never know to refresh it otherwise.
 */
async function ensureXsrfCookie(force = false): Promise<string | null> {
  if (!force) {
    const existing = readXsrfTokenCookie();
    if (existing) return existing;
  }

  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, { credentials: "include", cache: "no-store" });
  return readXsrfTokenCookie();
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !json || json.success === false) {
    const message = json && "message" in json ? json.message : "Unexpected error";
    throw new ApiError(message, res.status);
  }

  return json.data;
}

async function doFetch(path: string, method: string, options: RequestOptions, xsrfToken: string | null) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    next: options.next,
    credentials: "include",
  });
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const isMutating = MUTATING_METHODS.has(method);

  let res = await doFetch(path, method, options, isMutating ? await ensureXsrfCookie() : null);

  // A stale XSRF-TOKEN cookie (e.g. left over from before the backend
  // restarted or the session was pruned) reads as "already have one" and
  // never gets refreshed on its own — retry once with a forced-fresh token
  // before giving up.
  if (isMutating && res.status === 419) {
    res = await doFetch(path, method, options, await ensureXsrfCookie(true));
  }

  return parseApiResponse<T>(res);
}
