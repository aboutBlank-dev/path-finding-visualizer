import { Cell, CellType, getDistance, getNeighbors } from "../cellUtils";

class DijkstraNode {
  constructor(
    public x: number,
    public y: number,
    public distance: number = Infinity,
    public parent: DijkstraNode | undefined = undefined,
    public isWall: boolean = false
  ) {}
}

export function dijkstra(
  start: Cell,
  end: Cell,
  cells: Cell[][]
): [Cell[], Cell[][]] {
  const startNode: DijkstraNode = new DijkstraNode(start.x, start.y, 0);
  const queue: DijkstraNode[] = [];

  for (let x = 0; x < cells.length; x++) {
    for (let y = 0; y < cells[x].length; y++) {
      if (x === start.x && y === start.y) {
        queue.push(startNode);
      }
      const isWall = cells[x][y].type === CellType.Obstacle;
      queue.push(new DijkstraNode(x, y, Infinity, undefined, isWall));
    }
  }

  while (queue.length > 0) {
    let lowstDistanceIndex = 0;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].distance < queue[lowstDistanceIndex].distance) {
        lowstDistanceIndex = i;
      }
    }

    const u = queue[lowstDistanceIndex];
    if (u.x === end.x && u.y === end.y) {
      const path: Cell[] = [];
      let temp = { x: u.x, y: u.y, parent: u.parent };
      path.push(cells[temp.x][temp.y]);
      while (temp.parent) {
        path.push(cells[temp.parent.x][temp.parent.y]);
        temp = temp.parent;
      }
      return [path.reverse(), []];
    }

    queue.splice(lowstDistanceIndex, 1);

    const neighbors = getNeighbors(u, cells);
    for (const neighbor of neighbors) {
      const alt = u.distance + getDistance(u, neighbor);
      const v = queue.find(
        (node) => node.x === neighbor.x && node.y === neighbor.y
      );

      if (!v) {
        continue;
      }
      if (v.isWall) continue;

      if (alt < v.distance) {
        v.distance = alt;
        v.parent = u;
      }
    }
  }
  return [[], []];
}
