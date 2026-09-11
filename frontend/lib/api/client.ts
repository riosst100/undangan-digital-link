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
 */
async function ensureXsrfCookie(): Promise<string | null> {
  const existing = readXsrfTokenCookie();
  if (existing) return existing;

  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, { credentials: "include" });
  return readXsrfTokenCookie();
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (MUTATING_METHODS.has(method)) {
    const xsrfToken = await ensureXsrfCookie();
    if (xsrfToken) headers["X-XSRF-TOKEN"] = xsrfToken;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    next: options.next,
    credentials: "include",
  });

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !json || json.success === false) {
    const message = json && "message" in json ? json.message : "Unexpected error";
    throw new ApiError(message, res.status);
  }

  return json.data;
}
