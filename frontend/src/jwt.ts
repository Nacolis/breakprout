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
