const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const API_BASE_URL = rawBaseUrl.startsWith("/")
  ? `${window.location.origin}${rawBaseUrl}`
  : rawBaseUrl;

export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export class ApiError extends Error {}

export async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.detail ?? fallback;
}
