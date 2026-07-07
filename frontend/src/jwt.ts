export function decodeJwtUserId(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const sub = JSON.parse(json).sub;
    return sub ? Number(sub) : null;
  } catch {
    return null;
  }
}

/**
 * Builds a placeholder token for sessions authenticated via the httpOnly
 * "access_token" cookie (e.g. after the 42 OAuth redirect), where the real
 * JWT isn't accessible to JS. The backend treats any token starting with
 * "cookie_auth" as a signal to fall back to the cookie. The fake payload
 * lets decodeJwtUserId keep working for components that rely on it.
 */
export function buildCookieAuthToken(userId: number): string {
  const payload = btoa(JSON.stringify({ sub: String(userId) }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `cookie_auth.${payload}.`;
}
