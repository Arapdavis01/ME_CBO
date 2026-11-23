// apps/web/src/app/session-status/route.ts
import { cookies } from "next/headers";

// Always evaluated per request: it reads the visitor's cookies.
export const dynamic = "force-dynamic";

/**
 * Tells the public header whether the visitor looks signed in.
 * The session cookies are HttpOnly, so the browser cannot read them itself.
 * This only checks that a session cookie exists; the real checks happen in the API.
 */
export function GET() {
  const jar = cookies();
  const signedIn = Boolean(jar.get("me_access")?.value || jar.get("me_refresh")?.value);
  return Response.json({ signedIn }, { headers: { "Cache-Control": "no-store" } });
}
