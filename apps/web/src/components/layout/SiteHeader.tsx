// apps/web/src/components/layout/SiteHeader.tsx
import { cookies } from "next/headers";
import { SiteHeaderClient } from "./SiteHeaderClient";

/**
 * Server wrapper: the session cookies are HttpOnly, so only the server can see
 * whether a visitor is signed in. The pages keep importing { SiteHeader }.
 */
export function SiteHeader() {
  const jar = cookies();
  const signedIn = Boolean(jar.get("me_access")?.value || jar.get("me_refresh")?.value);
  return <SiteHeaderClient signedIn={signedIn} />;
}
