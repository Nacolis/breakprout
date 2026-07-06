const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const defaultWsUrl = window.location.host.includes("5173")
  ? "ws://localhost:8000/api/v1/ws"
  : `${wsProtocol}//${window.location.host}/api/v1/ws`;

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? defaultWsUrl;

export interface SyncFriendsMessage {
  type: "sync_friends";
  friends: Record<string, "online" | "offline">;
}

export interface StatusUpdateMessage {
  type: "status_update";
  user_id: number;
  username: string;
  status: "online" | "offline";
}

export interface PrivateMessageMessage {
  type: "private_message";
  from_user_id: number;
  from_username: string;
  content: string;
}

export interface GlobalErrorMessage {
  type: "error";
  message: string;
}

export interface PongMessage {
  type: "pong";
}

export type GlobalServerMessage =
  | SyncFriendsMessage
  | StatusUpdateMessage
  | PrivateMessageMessage
  | GlobalErrorMessage
  | PongMessage;

export function connectGlobalSocket(token: string): WebSocket {
  return new WebSocket(`${WS_BASE_URL}/global?token=${encodeURIComponent(token)}`);
}

export function sendPrivateMessage(socket: WebSocket, toUserId: number, content: string): void {
  socket.send(JSON.stringify({ type: "private_message", to_user_id: toUserId, content }));
}
