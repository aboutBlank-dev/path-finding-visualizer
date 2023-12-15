import { Cell, CellType } from "./cellUtils";

interface MazeCell extends Cell {
  visited: boolean;
}

export function generateMaze(grid: Cell[][]): Cell[][] {
  const mazeGrid: MazeCell[][] = [];

  for (let x = 0; x < grid.length; x++) {
    mazeGrid[x] = [];
    for (let y = 0; y < grid[x].length; y++) {
      mazeGrid[x][y] = { x: x, y: y, type: CellType.Obstacle, visited: false };
    }
  }

  const stack: MazeCell[] = [];
  const start = mazeGrid[0][0];
  start.visited = true;
  start.type = CellType.Empty;

  stack.push(start);

  while (stack.length > 0) {
    const curr = stack.pop()!;

    const neighbors = getNeighbors(curr, mazeGrid);
    const unvisitedNeighbors = neighbors.filter(
      (cell) => mazeGrid[cell.x][cell.y].visited === false
    );

    if (unvisitedNeighbors.length > 0) {
      curr.type = CellType.Empty;
      stack.push(curr);

      const chosenNeighbor =
        unvisitedNeighbors[
          Math.floor(Math.random() * unvisitedNeighbors.length)
        ];

      // get the cell between the current cell and the chosen neighbor
      const wallX = (curr.x + chosenNeighbor.x) / 2;
      const wallY = (curr.y + chosenNeighbor.y) / 2;

      mazeGrid[wallX][wallY].type = CellType.Empty;

      chosenNeighbor.visited = true;

      stack.push(chosenNeighbor);
    }
  }

  return mazeGrid;
}

// For mazes, we want to get neighbors that are 2 cells away, since the walls are 1 cell thick
function getNeighbors(cell: MazeCell, grid: MazeCell[][]): MazeCell[] {
  const neighbors: MazeCell[] = [];

  const dirs = [
    [0, 2], //up
    [2, 0], //right
    [0, -2], //down
    [-2, 0], //left
  ];

  for (const dir of dirs) {
    const [dx, dy] = dir;
    const x = cell.x + dx;
    const y = cell.y + dy;

    if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length) continue;

    neighbors.push(grid[x][y]);
  }

  return neighbors;
}
