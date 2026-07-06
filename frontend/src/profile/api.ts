import { API_BASE_URL, ApiError, parseErrorDetail } from "../apiClient";

export { ApiError };

export interface UserProfile {
  id: number;
  username: string;
  level: number;
  avatar_path: string | null;
}

export interface Friend extends UserProfile {
  online: boolean;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function getMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users/me`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de récupérer le profil"));
  }
  return res.json();
}

export async function updateUsername(token: string, username: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de mettre à jour le pseudo"));
  }
  return res.json();
}

export async function uploadAvatar(token: string, file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de mettre à jour l'avatar"));
  }
  return res.json();
}

export async function listFriends(token: string): Promise<Friend[]> {
  const res = await fetch(`${API_BASE_URL}/users/friends`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de récupérer la liste d'amis"));
  }
  return res.json();
}

export async function addFriend(token: string, username: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/friends/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible d'ajouter cet ami"));
  }
}

export async function removeFriend(token: string, friendId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/friends/${friendId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de supprimer cet ami"));
  }
}
