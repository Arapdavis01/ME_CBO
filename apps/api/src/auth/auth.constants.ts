export const ACCESS_COOKIE = "me_access";
export const REFRESH_COOKIE = "me_refresh";
export const REFRESH_COOKIE_PATH = "/api/v1/auth";

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_LOCKED: "Account temporarily locked due to repeated failed attempts",
  MFA_REQUIRED: "Multi-factor authentication required",
  MFA_INVALID: "Invalid verification code",
  MFA_EXPIRED: "Verification code expired — request a new one",
  TOKEN_INVALID: "Session expired. Please sign in again.",
  ACCOUNT_SUSPENDED: "Account suspended",
  EMAIL_NOT_VERIFIED: "Email address not verified",
} as const;
