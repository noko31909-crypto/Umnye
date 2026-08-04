/**
 * Vercel-compatible cookie options.
 * Vercel always serves over HTTPS, so we always use secure cookies.
 */
export function getSessionCookieOptionsVercel(): string {
  return [
    "HttpOnly",
    "Path=/",
    "SameSite=None",
    "Secure",
  ].join("; ");
}
