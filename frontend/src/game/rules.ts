import { coordsToCell } from "./notation";

function cellToCoords(cell: string): [number, number] {
  const col = cell.charCodeAt(0) - 65;
  const row = Number(cell.slice(1)) - 1;
  return [row, col];
}

export function getLegalDestinations(
  boardState: (string | null)[][],
  fromCell: string,
  color: string,
): string[] {
  const gridSize = boardState.length;
  const [fromRow, fromCol] = cellToCoords(fromCell);
  const rowDiff = color === "WHITE" ? 1 : -1;
  const toRow = fromRow + rowDiff;
  if (toRow < 0 || toRow >= gridSize) return [];

  const destinations: string[] = [];
  for (const colDiff of [-1, 0, 1]) {
    const toCol = fromCol + colDiff;
    if (toCol < 0 || toCol >= gridSize) continue;

    const target = boardState[toRow][toCol];
    if (colDiff === 0) {
      if (target === null) destinations.push(coordsToCell(toRow, toCol));
    } else {
      if (target === null || target !== color) destinations.push(coordsToCell(toRow, toCol));
    }
  }
  return destinations;
}
