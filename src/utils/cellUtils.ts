interface Cell {
  x: number;
  y: number;
}

export function getNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
  const neighbors: Cell[] = [];

  const dirs = [
    [0, 1], //up
    [1, 0], //right
    [0, -1], //down
    [-1, 0], //left
  ];

  for (const dir of dirs) {
    const [dx, dy] = dir;
    const x = cell.x + dx;
    const y = cell.y + dy;

    if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length) continue;

    neighbors.push({ x, y });
  }

  return neighbors;
}

export function getDistance(cellA: Cell, cellB: Cell): number {
  const dx = Math.abs(cellA.x - cellB.x);
  const dy = Math.abs(cellA.y - cellB.y);

  return dx + dy;
}
