import { useState, type FormEvent } from "react";
import type { Friend } from "../profile/api";
import type { DirectMessage } from "./useGlobalSocket";
import BracketButton from "../ui/BracketButton";

interface ChatWidgetProps {
  friends: Friend[];
  onlineStatus: Record<number, boolean>;
  messages: DirectMessage[];
  onSend: (toUserId: number, content: string) => void;
  error: string | null;
}

export default function ChatWidget({ friends, onlineStatus, messages, onSend, error }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [content, setContent] = useState("");

  const selectedFriend = friends.find((f) => f.id === selectedId) ?? null;
  const isSelectedOnline = selectedId !== null && (onlineStatus[selectedId] ?? false);
  const thread = messages.filter((m) => m.peerId === selectedId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || selectedId === null) return;
    onSend(selectedId, trimmed);
    setContent("");
  }

  if (!open) {
    return (
      <BracketButton onClick={() => setOpen(true)} className="fixed bottom-40 right-6 z-40 bg-card shadow-overlay">
        Messages
      </BracketButton>
    );
  }

  return (
    <div className="fixed bottom-40 right-6 z-40 flex h-96 w-80 flex-col overflow-hidden rounded-xl bg-card shadow-overlay">
      <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <h3 className="m-0 text-sm font-bold">Messages</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer"
          className="cursor-pointer rounded-md border border-edge bg-transparent px-2 py-1 text-xs text-ink"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ul className="m-0 w-28 shrink-0 list-none overflow-y-auto border-r border-edge p-0">
          {friends.length === 0 ? (
            <li className="p-2 text-xs text-status-finished">Aucun ami</li>
          ) : (
            friends.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  className={`flex w-full cursor-pointer items-center gap-1.5 px-2 py-2 text-left text-xs ${
                    selectedId === f.id ? "bg-surface" : "bg-transparent"
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      onlineStatus[f.id] ? "bg-status-active" : "bg-status-finished"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{f.username}</span>
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex flex-1 flex-col p-2">
          {!selectedFriend ? (
            <p className="m-0 text-xs text-status-finished">Choisis un ami pour discuter.</p>
          ) : (
            <>
              <ul className="m-0 mb-2 flex flex-1 list-none flex-col justify-end gap-1.5 overflow-y-auto p-0">
                {thread.map((m, i) => (
                  <li
                    key={i}
                    className={`max-w-[85%] break-words rounded-lg px-2 py-1 text-xs ${
                      m.self ? "self-end bg-brand text-white" : "self-start bg-surface"
                    }`}
                  >
                    {m.content}
                  </li>
                ))}
              </ul>
              {!isSelectedOnline && (
                <p className="m-0 mb-1.5 text-xs text-status-finished">
                  {selectedFriend.username} est hors ligne.
                </p>
              )}
              <form className="flex gap-1.5" onSubmit={handleSubmit}>
                <input
                  className="min-w-0 flex-1 rounded-md border border-edge bg-surface p-1.5 text-xs text-ink"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Message..."
                />
                <button
                  type="submit"
                  disabled={!isSelectedOnline}
                  className="cursor-pointer rounded-md bg-brand px-2.5 py-1.5 text-xs font-semibold text-white disabled:cursor-default disabled:opacity-60"
                >
                  Envoyer
                </button>
              </form>
            </>
          )}
          {error && <p className="m-0 mt-1.5 text-xs text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
