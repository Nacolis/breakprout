const API_BASE_URL = "http://localhost:8000/api/v1";

export class ApiError extends Error {}

export async function register(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.detail ?? "Échec de l'inscription");
  }
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.detail ?? "Échec de la connexion");
  }
  const data = await res.json();
  return data.access_token as string;
}
