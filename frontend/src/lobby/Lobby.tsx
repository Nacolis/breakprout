import { useEffect, useState, useCallback } from "react";
import { listGames, joinGame, ApiError, type Game } from "./api";
import GameCard from "./GameCard";
import CreateGameForm from "./CreateGameForm";
import FriendsPlaceholder from "./FriendsPlaceholder";
import { decodeJwtUserId } from "../jwt";
import SearchBar from "./SearchBar";

interface LobbyProps {
  token: string;
  onLogout: () => void;
  onOpenGame: (gameId: number) => void;
}

export default function Lobby({ token, onLogout, onOpenGame }: LobbyProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("")
  const myUserId = decodeJwtUserId(token);

  const refresh = useCallback(async () => {
    try {
      const allGames = await listGames(token);
      setGames(allGames);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleJoin(gameId: number) {
    try {
      await joinGame(token, gameId);
      onOpenGame(gameId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  const ongoing = games.filter((g) => g.status === "PENDING" || g.status === "ACTIVE");
  const history = games.filter((g) => g.status === "FINISHED");
  const filteredOngoing = ongoing.filter((g) => {
      if (search)
        return g.id.toString().includes(search.trim());
      return true;
    }
  );

  return (
    <div className="w-[min(960px,92vw)] py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="m-0 text-2xl font-bold">Breakprout</h1>
        <button
          type="button"
          onClick={onLogout}
          className="cursor-pointer rounded-md border border-edge bg-transparent px-4 py-2 text-ink"
        >
          Se déconnecter
        </button>
      </header>

      {error && <p className="m-0 text-sm text-error">{error}</p>}

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Créer une partie</h2>
          <CreateGameForm
            token={token}
            onCreated={(game) => {
              refresh();
              onOpenGame(game.id);
            }}
          />
        </div>

        <div className="rounded-xl bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Parties en cours</h2>
          {ongoing.length === 0 ? (
            <p>Aucune partie en cours.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                <SearchBar
                  value={search}
                  onSearch={setSearch}
                />
              {filteredOngoing.map((g) => (
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

        <div className="rounded-xl bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Historique</h2>
          {history.length === 0 ? (
            <p>Aucune partie terminée.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {history.map((g) => (
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

        <FriendsPlaceholder />
      </div>
    </div>
  );
}
