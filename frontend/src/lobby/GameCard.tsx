import type { Game } from "./api";

const STATUS_LABELS: Record<Game["status"], string> = {
  PENDING: "En attente",
  ACTIVE: "En cours",
  FINISHED: "Terminée",
};

const STATUS_COLORS: Record<Game["status"], string> = {
  PENDING: "text-status-pending",
  ACTIVE: "text-status-active",
  FINISHED: "text-status-finished",
};

interface GameCardProps {
  game: Game;
  myUserId: number | null;
  playerWhiteMmr?: number;
  playerBlackMmr?: number;
  onOpen: () => void;
  onJoin: () => void;
}

export default function GameCard({
  game,
  myUserId,
  playerWhiteMmr,
  playerBlackMmr,
  onOpen,
  onJoin,
}: GameCardProps) {
  const isMine =
    game.player_white_id === myUserId || game.player_black_id === myUserId;
  const isJoinable = game.status === "PENDING" && !isMine;

  return (
    <li className="flex items-center justify-between gap-2">
      <button
        type="button"
        className="flex-1 text-left cursor-pointer items-center justify-between rounded-lg bg-surface px-3 py-2.5 text-sm text-ink flex"
        onClick={isJoinable ? onJoin : onOpen}
      >
        <span>Partie #{game.id}</span>
        <span className={`font-semibold ${STATUS_COLORS[game.status]}`}>
          {isJoinable ? "Rejoindre" : STATUS_LABELS[game.status]}
        </span>
        <span>{game.grid_size}×{game.grid_size}</span>
      </button>
      <div className="flex flex-col text-xs gap-0.5">
        {game.player_white_id && (
          <span className="mmr-badge">⚪ {playerWhiteMmr ?? "-"}</span>
        )}
        {game.player_black_id && (
          <span className="mmr-badge">⚫ {playerBlackMmr ?? "-"}</span>
        )}
      </div>
    </li>
  );
}
