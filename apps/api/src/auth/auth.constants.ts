export const ACCESS_COOKIE = "me_access";
export const REFRESH_COOKIE = "me_refresh";

/**
 * The browser reaches the API through the web app's "/api" proxy, so the
 * refresh cookie must be visible on every path of the web origin
 * (the Next.js middleware also needs to see it).
 */
export const REFRESH_COOKIE_PATH = "/";

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_LOCKED: "Account temporarily locked due to repeated failed attempts",
  MFA_REQUIRED: "Multi-factor authentication required",
  MFA_INVALID: "Invalid verification code",
  MFA_EXPIRED: "Verification expired — please sign in again",
  TOKEN_INVALID: "Session expired. Please sign in again.",
  ACCOUNT_SUSPENDED: "Account suspended",
  EMAIL_NOT_VERIFIED: "Email address not verified",
} as const;
