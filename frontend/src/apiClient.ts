export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {}

export async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.detail ?? fallback;
}
