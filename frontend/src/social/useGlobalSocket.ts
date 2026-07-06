import { useEffect, useRef, useState, useCallback } from "react";
import {
  connectGlobalSocket,
  sendPrivateMessage as sendPrivateMessageRaw,
  type GlobalServerMessage,
} from "./socket";

export interface DirectMessage {
  peerId: number;
  content: string;
  self: boolean;
}

export function useGlobalSocket(token: string | null) {
  const [onlineStatus, setOnlineStatus] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = connectGlobalSocket(token);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data: GlobalServerMessage = JSON.parse(event.data);
      if (data.type === "sync_friends") {
        const initial: Record<number, boolean> = {};
        for (const [id, friendStatus] of Object.entries(data.friends)) {
          initial[Number(id)] = friendStatus === "online";
        }
        setOnlineStatus(initial);
      } else if (data.type === "status_update") {
        setOnlineStatus((prev) => ({ ...prev, [data.user_id]: data.status === "online" }));
      } else if (data.type === "private_message") {
        setMessages((prev) => [...prev, { peerId: data.from_user_id, content: data.content, self: false }]);
      } else if (data.type === "error") {
        setError(data.message);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [token]);

  const sendMessage = useCallback((toUserId: number, content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendPrivateMessageRaw(socketRef.current, toUserId, content);
      setMessages((prev) => [...prev, { peerId: toUserId, content, self: true }]);
    }
  }, []);

  return { onlineStatus, messages, sendMessage, error };
}
