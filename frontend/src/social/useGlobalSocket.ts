import { useEffect, useRef, useState, useCallback } from "react";
import {
  connectGlobalSocket,
  sendPrivateMessage as sendPrivateMessageRaw,
  type GlobalServerMessage,
} from "./socket";
import { decodeJwtUserId } from "../jwt";

export interface DirectMessage {
  peerId: number;
  content: string;
  self: boolean;
}

function cacheKey(userId: number): string {
  return `bp_dm_cache_${userId}`;
}

function loadCachedMessages(userId: number): DirectMessage[] {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedMessages(userId: number, messages: DirectMessage[]): void {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(messages));
  } catch {
    // Ignore storage quota/availability errors; cache is best-effort.
  }
}

export function useGlobalSocket(token: string | null) {
  const [onlineStatus, setOnlineStatus] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const userId = decodeJwtUserId(token);
    userIdRef.current = userId;
    setMessages(userId !== null ? loadCachedMessages(userId) : []);

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

  useEffect(() => {
    if (userIdRef.current !== null) {
      saveCachedMessages(userIdRef.current, messages);
    }
  }, [messages]);

  const sendMessage = useCallback((toUserId: number, content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendPrivateMessageRaw(socketRef.current, toUserId, content);
      setMessages((prev) => [...prev, { peerId: toUserId, content, self: true }]);
    }
  }, []);

  const syncOnlineStatus = useCallback((statuses: Record<number, boolean>) => {
    setOnlineStatus((prev) => ({ ...prev, ...statuses }));
  }, []);

  return { onlineStatus, messages, sendMessage, error, syncOnlineStatus };
}
