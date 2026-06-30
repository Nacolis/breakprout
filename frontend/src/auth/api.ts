import { API_BASE_URL, ApiError, parseErrorDetail } from "../apiClient";

export { ApiError };

export async function register(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de l'inscription"));
  }
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Échec de la connexion"));
  }
  const data = await res.json();
  return data.access_token as string;
}
