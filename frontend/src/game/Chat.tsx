import { useState, type FormEvent } from "react";
import type { ChatMessage } from "./socket";

interface ChatProps {
  messages: ChatMessage[];
  myUsername: string | null;
  onSend: (content: string) => void;
}

export default function Chat({ messages, myUsername, onSend }: ChatProps) {
  const [content, setContent] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent("");
  }

  return (
    <div className="flex h-[min(560px,90vw)] min-w-[240px] flex-1 flex-col rounded-xl bg-card p-4 shadow-card">
      <ul className="m-0 mb-3 flex flex-1 list-none flex-col gap-1.5 overflow-y-auto p-0">
        {messages.map((m, i) => (
          <li
            key={i}
            className={`break-words rounded-lg px-2.5 py-1.5 text-sm ${
              m.username === myUsername ? "self-end bg-brand" : "bg-surface"
            }`}
          >
            <span className="block text-xs font-semibold opacity-80">{m.username}</span>
            <span>{m.content}</span>
          </li>
        ))}
      </ul>
      <form className="flex flex-row gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 rounded-md border border-edge bg-surface p-2 text-base text-ink"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Message..."
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md border-0 bg-brand px-4 py-2 font-semibold text-white"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
