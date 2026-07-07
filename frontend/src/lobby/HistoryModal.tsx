import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { listGames, ApiError, type Game } from "./api";
import GameCard from "./GameCard";
import { decodeJwtUserId } from "../jwt";

interface HistoryModalProps {
  token: string | null;
  onClose: () => void;
  onOpenGame: (gameId: number) => void;
}

export default function HistoryModal({ token, onClose, onOpenGame }: HistoryModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const myUserId = token ? decodeJwtUserId(token) : null;

  useEffect(() => {
    if (!token) return;
    listGames(token, "FINISHED")
      .then(setGames)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Une erreur est survenue."));
  }, [token]);

  return (
    <Modal title="Historique" onClose={onClose}>
      {!token ? (
        <p className="m-0 text-sm text-status-finished">Connecte-toi pour voir ton historique.</p>
      ) : error ? (
        <p className="m-0 text-sm text-error">{error}</p>
      ) : games.length === 0 ? (
        <p className="m-0 text-sm text-status-finished">Aucune partie terminée.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              myUserId={myUserId}
              onOpen={() => onOpenGame(g.id)}
              onJoin={() => {}}
            />
          ))}
        </ul>
      )}
    </Modal>
  );
}
