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
      className="grid aspect-square w-full overflow-hidden rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        background: "#232326",
        boxShadow:
          "0 3px 0 #1c1c1e, 0 6px 0 #17171a, 0 9px 0 #121214, 0 12px 0 #0d0d0f, 0 20px 24px rgba(0,0,0,0.65), inset 0 0 0 2px rgba(0,0,0,0.5)",
      }}
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
                isSelected ? "outline outline-[3px] outline-brand [outline-offset:-3px]" : "",
                isLegal
                  ? "relative after:absolute after:h-[28%] after:w-[28%] after:rounded-full after:bg-brand/60 after:content-['']"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                background: isDark
                  ? "linear-gradient(155deg, #3d3d58 0%, #34344a 55%, #2a2a3d 100%)"
                  : "linear-gradient(155deg, #55557a 0%, #4a4a63 55%, #40405a 100%)",
                boxShadow: isDark
                  ? "inset 0 2px 2px rgba(255,255,255,0.06), inset 0 -3px 4px rgba(0,0,0,0.4)"
                  : "inset 0 2px 2px rgba(255,255,255,0.1), inset 0 -3px 4px rgba(0,0,0,0.3)",
              }}
              onClick={() => onCellClick(cell)}
            >
              {piece && (
                <span
                  className={
                    piece === "WHITE"
                      ? "h-[58%] w-[65%] rounded-[50%] border border-piece-white-edge"
                      : "h-[58%] w-[65%] rounded-[50%] border border-piece-black-edge"
                  }
                  style={{
                    transform: "translateY(-18%)",
                    background:
                      piece === "WHITE"
                        ? "radial-gradient(circle at 30% 25%, #ffffff 0%, #f4f4f8 40%, #d8d8e6 75%, #b9b9cc 100%)"
                        : "radial-gradient(circle at 30% 25%, #5a5a6a 0%, #232330 40%, #101014 75%, #000000 100%)",
                    boxShadow:
                      piece === "WHITE"
                        ? "inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -2px 3px rgba(0,0,0,0.15), 0 2px 0 #d3d3e2, 0 4px 0 #c3c3d6, 0 6px 0 #b3b3c8, 0 8px 0 #a3a3ba, 0 11px 10px rgba(0,0,0,0.55)"
                        : "inset 0 2px 3px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.5), 0 2px 0 #131318, 0 4px 0 #0d0d11, 0 6px 0 #08080b, 0 8px 0 #030304, 0 11px 10px rgba(0,0,0,0.65)",
                  }}
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
