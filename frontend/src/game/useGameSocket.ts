import { useEffect, useRef, useState, useCallback } from "react";
import type { Game } from "../lobby/api";
import { connectGameSocket, sendMove, sendChat, type ServerMessage, type ChatMessage } from "./socket";

export function useGameSocket(gameId: number, token: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = connectGameSocket(gameId, token);
    socketRef.current = socket;
    setMessages([]);

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);
      if (data.type === "sync" || data.type === "game_update") {
        setGame(data.game);
        setError(null);
      } else if (data.type === "error") {
        setError(data.message);
      } else if (data.type === "chat") {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [gameId, token]);

  const playMove = useCallback((fromCell: string, toCell: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendMove(socketRef.current, fromCell, toCell);
    }
  }, []);

  const sendChatMessage = useCallback((content: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendChat(socketRef.current, content);
    }
  }, []);

  return { game, error, connected, messages, playMove, sendChatMessage };
}
