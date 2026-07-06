import { useEffect, useState, useCallback } from "react";
import Modal from "../ui/Modal";
import { listGames, joinGame, ApiError, type Game } from "./api";
import CreateGameForm from "./CreateGameForm";
import GameCard from "./GameCard";
import SearchBar from "./SearchBar";
import StatusFilter, { type StatusFilterValue } from "./StatusFilter";
import { decodeJwtUserId } from "../jwt";

interface PlayModalProps {
  token: string | null;
  onClose: () => void;
  onOpenGame: (gameId: number) => void;
}

export default function PlayModal({ token, onClose, onOpenGame }: PlayModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const myUserId = token ? decodeJwtUserId(token) : null;

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      const allGames = await listGames(token);
      setGames(allGames);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleJoin(gameId: number) {
    if (!token) return;
    try {
      await joinGame(token, gameId);
      onOpenGame(gameId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  const filteredGames = games.filter((g) => {
    if (g.status === "FINISHED") return false;
    const matchesSearch = search ? g.id.toString().includes(search.trim()) : true;
    const matchesStatus = statusFilter === "ALL" ? true : g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Modal title="Jouer" onClose={onClose}>
      {!token ? (
        <p className="m-0 text-sm text-status-finished">
          Connecte-toi pour créer ou rejoindre une partie.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {error && <p className="m-0 text-sm text-error">{error}</p>}

          <div>
            <h3 className="mb-3 text-base font-bold">Créer une partie</h3>
            <CreateGameForm token={token} onCreated={(game) => onOpenGame(game.id)} />
          </div>

          <div>
            <h3 className="mb-3 text-base font-bold">Rejoindre une partie</h3>
            <div className="flex flex-wrap items-center gap-2">
              <SearchBar value={search} onSearch={setSearch} />
              <StatusFilter value={statusFilter} onChange={setStatusFilter} />
              <button
                type="button"
                onClick={refresh}
                disabled={isRefreshing}
                aria-label="Rafraîchir la liste des parties"
                title="Rafraîchir la liste des parties"
                className="cursor-pointer rounded-md border border-edge bg-transparent px-3 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={isRefreshing ? "inline-block animate-spin" : "inline-block"}>↻</span>
              </button>
            </div>
            {filteredGames.length === 0 ? (
              <p className="mt-3 text-sm text-status-finished">Aucune partie en cours.</p>
            ) : (
              <ul className="m-0 mt-3 flex max-h-56 list-none flex-col gap-2 overflow-y-auto p-0">
                {filteredGames.map((g) => (
                  <GameCard
                    key={g.id}
                    game={g}
                    myUserId={myUserId}
                    onOpen={() => onOpenGame(g.id)}
                    onJoin={() => handleJoin(g.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
