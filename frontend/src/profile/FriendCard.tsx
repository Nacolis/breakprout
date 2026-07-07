import { SERVER_ORIGIN } from "../apiClient";
import type { Friend } from "./api";

interface FriendCardProps {
  friend: Friend;
  onRemove: () => void;
}

export default function FriendCard({ friend, onRemove }: FriendCardProps) {
  return (
    <li className="flex w-full items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2.5 text-sm text-ink">
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2">
          {friend.avatar_path ? (
            <img
              src={`${SERVER_ORIGIN}${friend.avatar_path}`}
              alt={friend.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold">{friend.username.slice(0, 2).toUpperCase()}</span>
          )}
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-card ${
              friend.online ? "bg-status-active" : "bg-status-finished"
            }`}
            aria-hidden="true"
          />
        </span>
        <span>{friend.username}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Supprimer ${friend.username} de la liste d'amis`}
        className="cursor-pointer rounded-md border border-edge bg-transparent px-2 py-1 text-xs text-ink"
      >
        Retirer
      </button>
    </li>
  );
}
