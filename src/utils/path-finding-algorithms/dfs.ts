import { Cell, CellType, Position, getNeighbors } from "../cellUtils";

class DFSNode {
  constructor(
    public position: Position,
    public parent: DFSNode | null = null,
    public visited: boolean = false
  ) {}
}

export function dfs(
  start: Position,
  end: Position,
  cells: Cell[][]
): [Position[], Position[][]] {
  const s: DFSNode[] = [];
  const nodes: DFSNode[][] = [];
  const totalVisited: Position[][] = [];

  for (let x = 0; x < cells.length; x++) {
    nodes.push([]);
    for (let y = 0; y < cells[x].length; y++) {
      nodes[x].push(new DFSNode({ x, y }));
    }
  }

  const startNode = new DFSNode(start);
  s.push(startNode);

  while (s.length > 0) {
    const current = s.pop()!;
    const visited: Position[] = [];

    if (current.position.x === end.x && current.position.y === end.y) {
      current.visited = true;
      break;
    }

    if (current.visited) continue;
    current.visited = true;
    visited.push(current.position);

    const neighbors = getNeighbors(current.position, cells);
    for (const neighbor of neighbors) {
      if (cells[neighbor.x][neighbor.y].type === CellType.Obstacle) continue;

      const neighborNode = nodes[neighbor.x][neighbor.y];
      if (neighborNode.visited) continue;

      neighborNode.parent = current;
      s.push(neighborNode);
    }

    totalVisited.push(visited);
  }

  const path: Position[] = [];
  const endNode = nodes[end.x][end.y];

  if (endNode.parent === null) return [[], totalVisited];

  let current: DFSNode | null = endNode;
  while (current !== null) {
    path.push(current.position);
    current = current.parent;
  }
  path.reverse();

  return [path, totalVisited];
}
