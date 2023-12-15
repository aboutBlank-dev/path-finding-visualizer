import {
  Cell,
  CellType,
  Position,
  getDistance,
  getNeighbors,
} from "../cellUtils";

class AStarNode {
  constructor(
    public x: number,
    public y: number,
    public f: number = 0,
    public g: number = 0,
    public h: number = 0,
    public parent: AStarNode | undefined = undefined
  ) {}
}

export function aStar(
  start: Position,
  end: Position,
  grid: Cell[][]
): Position[] {
  const openSet: AStarNode[] = [];
  const closedSet: Position[] = [];
  const path: Position[] = [];

  const startNode: AStarNode = new AStarNode(start.x, start.y);
  const endNode: AStarNode = new AStarNode(end.x, end.y);

  openSet.push(startNode);

  while (openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    let currNodeIndex = lowestIndex;
    const currNode = openSet[currNodeIndex];

    if (currNode.x === endNode.x && currNode.y === endNode.y) {
      let temp = { x: currNode.x, y: currNode.y, parent: currNode.parent };
      path.push({ x: temp.x, y: temp.y });
      while (temp.parent) {
        path.push({ x: temp.parent.x, y: temp.parent.y });
        temp = temp.parent;
      }

      // return the traced path
      return path;
    }

    openSet.splice(currNodeIndex, 1);
    closedSet.push({ x: currNode.x, y: currNode.y });

    const neighbors = getNeighbors(currNode, grid);

    for (const neighbor of neighbors) {
      if (
        closedSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)
      )
        continue;

      if (grid[neighbor.x][neighbor.y].type === CellType.Obstacle) {
        closedSet.push({ x: neighbor.x, y: neighbor.y });
        continue;
      }

      const gScore = currNode.g + getDistance(neighbor, currNode);
      const hScore = getDistance(neighbor, endNode);
      const fScore = gScore + hScore;

      if (
        openSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)
      ) {
        const openNode = openSet.find(
          (node) => node.x === neighbor.x && node.y === neighbor.y
        )!;

        if (fScore >= openNode.f) continue;
      }

      const finalNode = new AStarNode(
        neighbor.x,
        neighbor.y,
        fScore,
        gScore,
        hScore,
        currNode
      );
      openSet.push(finalNode);
    }
  }

  return [];
}
