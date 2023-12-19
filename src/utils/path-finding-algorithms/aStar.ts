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
): [Position[], Position[][]] {
  const openSet: AStarNode[] = [];
  const closedSet: Position[] = [];
  const explored: Position[][] = [];

  const startNode: AStarNode = new AStarNode(start.x, start.y);
  const endNode: AStarNode = new AStarNode(end.x, end.y);

  openSet.push(startNode);

  while (openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f <= openSet[lowestIndex].f) {
        lowestIndex = i;
      } else if (openSet[i].f === openSet[lowestIndex].f) {
        if (openSet[i].h < openSet[lowestIndex].h) {
          lowestIndex = i;
        }
      }
    }

    let currNodeIndex = lowestIndex;
    const currNode = openSet[currNodeIndex];

    if (currNode.x === endNode.x && currNode.y === endNode.y) {
      const path: Position[] = [];
      let temp = { x: currNode.x, y: currNode.y, parent: currNode.parent };
      path.push({ x: temp.x, y: temp.y });
      while (temp.parent) {
        path.push({ x: temp.parent.x, y: temp.parent.y });
        temp = temp.parent;
      }

      // return the traced path
      return [path.reverse(), explored];
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
        continue;
      }

      var tempG = currNode.g + getDistance(currNode, neighbor);

      const existingNeighbor = openSet.find(
        (node) => node.x === neighbor.x && node.y === neighbor.y
      );

      if (!existingNeighbor) {
        const h = getDistance(neighbor, endNode);
        const f = tempG + h;
        const newNeighbor = new AStarNode(
          neighbor.x,
          neighbor.y,
          f,
          tempG,
          h,
          currNode
        );
        openSet.push(newNeighbor);
      } else if (tempG >= existingNeighbor.g) {
        continue;
      }
    }
    explored.push([...closedSet]);
  }

  return [[], explored];
}
