import { Cell, CellType, Position, getNeighbors } from "../cellUtils";

class BFSNode {
  constructor(
    public position: Position,
    public parent: BFSNode | null = null,
    public visited: boolean = false
  ) {}
}

export function bfs(
  start: Position,
  end: Position,
  cells: Cell[][]
): [Position[], Position[][]] {
  const q: BFSNode[] = [];
  const nodes: BFSNode[][] = [];
  const totalVisited: Position[][] = [];

  for (let x = 0; x < cells.length; x++) {
    nodes.push([]);
    for (let y = 0; y < cells[x].length; y++) {
      nodes[x].push(new BFSNode({ x, y }));
    }
  }

  const startNode = new BFSNode(start);
  q.push(startNode);

  while (q.length > 0) {
    const visited: Position[] = [];
    const current = q[0];

    if (current.position.x === end.x && current.position.y === end.y) {
      current.visited = true;
      break;
    }

    q.splice(0, 1);

    if (current.visited) continue;
    current.visited = true;
    visited.push(current.position);

    const neighbors = getNeighbors(current.position, cells);
    for (const neighbor of neighbors) {
      if (cells[neighbor.x][neighbor.y].type === CellType.Obstacle) continue;

      const neighborNode = nodes[neighbor.x][neighbor.y];
      if (neighborNode.visited) continue;

      neighborNode.parent = current;
      q.push(neighborNode);
    }

    totalVisited.push(visited);
  }

  const path: Position[] = [];
  const endNode = nodes[end.x][end.y];

  if (endNode.parent === null) return [[], totalVisited];

  let current: BFSNode | null = endNode;
  while (current !== null) {
    path.push(current.position);
    current = current.parent;
  }
  path.reverse();

  return [path, totalVisited];
}
