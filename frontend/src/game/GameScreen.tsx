import { useState } from "react";
import { useGameSocket } from "./useGameSocket";
import Board from "./Board";
import Chat from "./Chat";
import { decodeJwtUserId } from "../jwt";
import { getLegalDestinations } from "./rules";

interface GameScreenProps {
  gameId: number;
  token: string;
  username: string;
  onBack: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente d'un adversaire",
  ACTIVE: "En cours",
  FINISHED: "Terminée",
};

export default function GameScreen({ gameId, token, username, onBack }: GameScreenProps) {
  const { game, error, connected, messages, playMove, sendChatMessage } = useGameSocket(
    gameId,
    token,
  );
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const myUserId = decodeJwtUserId(token);
  const myColor =
    game && myUserId === game.player_white_id
      ? "WHITE"
      : game && myUserId === game.player_black_id
        ? "BLACK"
        : null;
  const isMyTurn = !!game && game.status === "ACTIVE" && game.current_turn === myColor;

  const boardState = game?.board_state;
  const legalCells =
    selectedCell && boardState && myColor
      ? getLegalDestinations(boardState, selectedCell, myColor)
      : [];

  function cellHasMyPiece(cell: string): boolean {
    if (!boardState || !myColor) return false;
    const [row, col] = [Number(cell.slice(1)) - 1, cell.charCodeAt(0) - 65];
    return boardState[row][col] === myColor;
  }

  function handleCellClick(cell: string) {
    if (!isMyTurn || !boardState) return;

    if (!selectedCell) {
      if (cellHasMyPiece(cell)) setSelectedCell(cell);
      return;
    }
    if (selectedCell === cell) {
      setSelectedCell(null);
      return;
    }
    if (legalCells.includes(cell)) {
      playMove(selectedCell, cell);
      setSelectedCell(null);
      return;
    }
    if (cellHasMyPiece(cell)) {
      setSelectedCell(cell);
      return;
    }
    setSelectedCell(null);
  }

  function winnerMessage(): string {
    if (!game?.winner_id) return "Partie terminée";
    if (myColor) {
      return game.winner_id === myUserId ? "Tu as gagné !" : "Tu as perdu.";
    }
    const winnerColor = game.winner_id === game.player_white_id ? "Blanc" : "Noir";
    return `${winnerColor} a gagné !`;
  }

  return (
    <div className="w-[min(960px,92vw)] py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="m-0 text-2xl font-bold">Partie #{gameId}</h1>
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer rounded-md border border-edge bg-transparent px-4 py-2 text-ink"
        >
          Retour
        </button>
      </header>

      {!connected && <p>Connexion en cours...</p>}
      {error && <p className="m-0 text-sm text-error">{error}</p>}

      {game && (
        <div>
          <p className="mb-4">
            {STATUS_LABELS[game.status]}
            {game.status === "ACTIVE" &&
              (isMyTurn ? " — à toi de jouer" : " — en attente de l'adversaire")}
          </p>
          <div className="flex flex-wrap items-start gap-5">
            {boardState && (
              <div className="relative w-[min(560px,90vw)]">
                <Board
                  boardState={boardState}
                  selectedCell={selectedCell}
                  legalCells={legalCells}
                  onCellClick={handleCellClick}
                />
                {game.status === "FINISHED" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
                    <p className="m-0 rounded-[10px] bg-surface-2 px-8 py-4 text-center text-2xl font-bold shadow-overlay">
                      {winnerMessage()}
                    </p>
                  </div>
                )}
              </div>
            )}
            <Chat messages={messages} myUsername={username} onSend={sendChatMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
