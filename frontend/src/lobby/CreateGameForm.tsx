import { useState, type FormEvent } from "react";
import { createGame, ApiError, type Game } from "./api";

const AI_DIFFICULTIES = [
  { label: "Facile", depth: 2 },
  { label: "Moyen", depth: 4 },
  { label: "Difficile", depth: 6 },
];

interface CreateGameFormProps {
  token: string;
  onCreated: (game: Game) => void;
}

export default function CreateGameForm({ token, onCreated }: CreateGameFormProps) {
  const [gridSize, setGridSize] = useState(8);
  const [vsAi, setVsAi] = useState(false);
  const [aiDepth, setAiDepth] = useState(AI_DIFFICULTIES[1].depth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const game = await createGame(token, {
        grid_size: gridSize,
        vs_ai: vsAi,
        ai_depth: aiDepth,
      });
      onCreated(game);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1.5 text-sm">
        Taille de la grille
        <input
          className="rounded-md border border-edge bg-surface p-2 text-base text-ink"
          type="number"
          min={4}
          max={26}
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
        />
      </label>
      <label className="flex flex-row items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={vsAi}
          onChange={(e) => setVsAi(e.target.checked)}
        />
        Jouer contre l'IA
      </label>

      {vsAi && (
        <label className="flex flex-col gap-1.5 text-sm">
          Difficulté de l'IA
          <select
            className="rounded-md border border-edge bg-surface p-2 text-base text-ink"
            value={aiDepth}
            onChange={(e) => setAiDepth(Number(e.target.value))}
          >
            {AI_DIFFICULTIES.map(({ label, depth }) => (
              <option key={depth} value={depth}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && <p className="m-0 text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 cursor-pointer rounded-md bg-brand p-2.5 font-semibold text-white disabled:cursor-default disabled:opacity-60"
      >
        {loading ? "..." : "Créer une partie"}
      </button>
    </form>
  );
}
