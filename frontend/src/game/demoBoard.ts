export function buildStartingBoard(gridSize = 8): (string | null)[][] {
  return [...Array(gridSize).keys()].map(() =>
    [...Array(gridSize).keys()].map((col) => {
      if (col < 2) return "BLACK";
      if (col >= gridSize - 2) return "WHITE";
      return null;
    }),
  );
}
