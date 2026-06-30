import { coordsToCell } from "./notation";

interface BoardProps {
  boardState: (string | null)[][];
  selectedCell: string | null;
  legalCells: string[];
  onCellClick: (cell: string) => void;
}

export default function Board({ boardState, selectedCell, legalCells, onCellClick }: BoardProps) {
  const gridSize = boardState.length;
  const rows = [...Array(gridSize).keys()].reverse();

  return (
    <div
      className="grid aspect-square w-full overflow-hidden rounded-lg border-2 border-edge"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
    >
      {rows.map((r) =>
        [...Array(gridSize).keys()].map((c) => {
          const cell = coordsToCell(r, c);
          const piece = boardState[r][c];
          const isDark = (r + c) % 2 === 0;
          const isSelected = cell === selectedCell;
          const isLegal = legalCells.includes(cell);

          return (
            <button
              key={cell}
              type="button"
              className={[
                "flex cursor-pointer items-center justify-center border-0 p-0",
                isDark ? "bg-board-dark" : "bg-board-light",
                isSelected ? "outline outline-[3px] outline-brand [outline-offset:-3px]" : "",
                isLegal
                  ? "relative after:absolute after:h-[28%] after:w-[28%] after:rounded-full after:bg-brand/60 after:content-['']"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onCellClick(cell)}
            >
              {piece && (
                <span
                  className={
                    piece === "WHITE"
                      ? "h-[65%] w-[65%] rounded-full border-2 border-piece-white-edge bg-piece-white shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                      : "h-[65%] w-[65%] rounded-full border-2 border-piece-black-edge bg-piece-black shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                  }
                  title={cell}
                />
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
