import type { Game } from "../lobby/api";

const WS_BASE_URL = "ws://localhost:8000/api/v1/ws";

export interface SyncMessage {
  type: "sync";
  game: Game;
}

export interface GameUpdateMessage {
  type: "game_update";
  event: string;
  game: Game;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export interface ChatMessage {
  type: "chat";
  username: string;
  content: string;
}

export type ServerMessage = SyncMessage | GameUpdateMessage | ErrorMessage | ChatMessage;

export function connectGameSocket(gameId: number, token: string): WebSocket {
  return new WebSocket(`${WS_BASE_URL}/game/${gameId}?token=${encodeURIComponent(token)}`);
}

export function sendMove(socket: WebSocket, fromCell: string, toCell: string): void {
  socket.send(JSON.stringify({ type: "move", from_cell: fromCell, to_cell: toCell }));
}

export function sendChat(socket: WebSocket, content: string): void {
  socket.send(JSON.stringify({ type: "chat", content }));
}
