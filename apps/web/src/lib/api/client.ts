/**
 * ME_CBO API client — single fetch wrapper.
 * - Calls go to "/api/*" on the SAME origin as the website. next.config.mjs
 *   rewrites that to the NestJS API, so the auth cookies are first-party and
 *   the Next.js middleware can read them.
 * - Sends cookies (HttpOnly JWT lives server-side; never in JS).
 * - Silently refreshes an expired access token once, then retries.
 * - Normalizes errors.
 * - Ready for TanStack Query.
 */
export const API_BASE = "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/** Auth endpoints that must never trigger a refresh-and-retry. */
const NO_REFRESH_PREFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/mfa/verify",
  "/auth/password",
];

let refreshInFlight: Promise<boolean> | null = null;

/** One refresh at a time; concurrent 401s share the same attempt. */
function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const { body, headers, ...rest } = options;
  return fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include", // send HttpOnly refresh/access cookies
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let res = await send(path, options);

  if (
    res.status === 401 &&
    !NO_REFRESH_PREFIXES.some((p) => path.startsWith(p))
  ) {
    const refreshed = await refreshSession();
    if (refreshed) res = await send(path, options);
  }

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const data = (await res.json()) as { message?: string; code?: string };
      message = data.message ?? message;
      code = data.code;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};
