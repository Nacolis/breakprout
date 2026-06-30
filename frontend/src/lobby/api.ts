import { API_BASE_URL, ApiError, parseErrorDetail } from "../apiClient";

export { ApiError };

export interface Game {
  id: number;
  player_white_id: number | null;
  player_black_id: number | null;
  current_turn: string;
  status: "PENDING" | "ACTIVE" | "FINISHED";
  winner_id: number | null;
  grid_size: number;
  created_at: string;
  updated_at: string;
  board_state?: (string | null)[][] | null;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function listGames(token: string, status?: Game["status"]): Promise<Game[]> {
  const url = new URL(`${API_BASE_URL}/games/`);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de récupérer les parties"));
  }
  return res.json();
}

export async function joinGame(token: string, gameId: number): Promise<Game> {
  const res = await fetch(`${API_BASE_URL}/games/${gameId}/join`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de rejoindre la partie"));
  }
  return res.json();
}

export async function createGame(
  token: string,
  options: { grid_size?: number; vs_ai?: boolean },
): Promise<Game> {
  const res = await fetch(`${API_BASE_URL}/games/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(options),
  });
  if (!res.ok) {
    throw new ApiError(await parseErrorDetail(res, "Impossible de créer la partie"));
  }
  return res.json();
}
