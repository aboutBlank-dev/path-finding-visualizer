import { useEffect, useState } from "react";
import GridCanvas, { GridCell } from "./components/GridCanvas";
import { aStar } from "./utils/path-finding-algorithms/aStar";

enum NodeType {
  StartPosition,
  EndPosition,
  Obstacle,
  Empty,
  Path,
}

type NodeCell = {
  x: number;
  y: number;
  type: NodeType;
};

function App() {
  const [currentNodeType, setCurrentNodeType] = useState<NodeType>(
    NodeType.Empty
  );
  const [cells, setCells] = useState<NodeCell[][]>([]);
  const [cellSize, setCellSize] = useState<number>(50);
  const [startPosition, setStartPosition] = useState<GridCell | null>(null);
  const [endPosition, setEndPosition] = useState<GridCell | null>(null);

  const drawCell = (
    gridCell: GridCell,
    ctx: CanvasRenderingContext2D,
    xPos: number,
    yPos: number,
    cellSize: number
  ) => {
    const cell = cells[gridCell.x]?.[gridCell.y];

    if (cell) {
      ctx.fillStyle = getColorForMode(cell.type);
    } else {
      ctx.fillStyle = "white";
    }

    ctx.fillRect(xPos, yPos, cellSize, cellSize);

    //tell the grid canvas that we handled drawing the cell
    return true;
  };

  const getColorForMode = (mode: NodeType) => {
    switch (mode) {
      case NodeType.Empty:
        return "white";
      case NodeType.StartPosition:
        return "green";
      case NodeType.EndPosition:
        return "blue";
      case NodeType.Obstacle:
        return "red";
      case NodeType.Path:
        return "yellow";
    }
  };

  const onCellClicked = (x: number, y: number) => {
    const cell = cells[x]?.[y];
    if (!cell) {
      console.log("clicked cell is null");
      return;
    }

    switch (currentNodeType) {
      case NodeType.StartPosition:
        if (startPosition) {
          const oldCell = cells[startPosition.x]?.[startPosition.y];
          if (oldCell) oldCell.type = NodeType.Empty;
        }
        cell.type = NodeType.StartPosition;
        setStartPosition(cell);
        break;

      case NodeType.EndPosition:
        if (endPosition) {
          const oldCell = cells[endPosition.x]?.[endPosition.y];
          if (oldCell) oldCell.type = NodeType.Empty;
        }
        cell.type = NodeType.EndPosition;
        setEndPosition(cell);
        break;

      default:
        if (
          cell.type === NodeType.StartPosition ||
          cell.type === NodeType.EndPosition
        )
          break;
        cell.type = currentNodeType;
        break;
    }
    setCells([...cells]);
  };

  const onVisibleGridIndexesChanged = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    setCells((cells) => {
      return changeGridSize(cells, endX + 1, endY + 1);
    });

    if (startPosition && (endX < startPosition.x || endY < startPosition.y))
      setStartPosition(null);

    if (endPosition && (endX < endPosition.x || endY < endPosition.y))
      setEndPosition(null);
  };

  const setAStarPath = () => {
    //set all old path nodes to empty
    for (let x = 0; x < cells.length; x++) {
      for (let y = 0; y < cells[x].length; y++) {
        const cell = cells[x][y];
        if (cell.type === NodeType.Path) {
          cell.type = NodeType.Empty;
        }
      }
    }

    if (!startPosition || !endPosition) return;
    const startNode = cells[startPosition.x]?.[startPosition.y];
    const endNode = cells[endPosition.x]?.[endPosition.y];
    if (!startNode || !endNode) return;

    const path = aStar(startNode, endNode, cells);
    for (let i = 1; i < path.length - 1; i++) {
      const node = path[i];
      const cell = cells[node.x]?.[node.y];
      cell.type = NodeType.Path;
    }

    setCells([...cells]);
  };

  useEffect(() => {
    setAStarPath();
  }, [startPosition, endPosition]);

  return (
    <div className='flex flex-col h-screen w-screen'>
      <div className='grow'>
        <GridCanvas
          draggable={false}
          cellSize={cellSize}
          drawCell={drawCell}
          onCellClicked={onCellClicked}
          onVisibleGridIndexesChanged={onVisibleGridIndexesChanged}
        ></GridCanvas>
        ;
      </div>
      <div className='flex flex-row space-x-8 w-full p-4 bg-slate-400'>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setCurrentNodeType(NodeType.StartPosition)}
        >
          Start Node
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setCurrentNodeType(NodeType.EndPosition)}
        >
          End Node
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setCurrentNodeType(NodeType.Obstacle)}
        >
          Obstacle
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setCurrentNodeType(NodeType.Empty)}
        >
          Empty
        </button>
        <label
          htmlFor='grid-size-range'
          className='text-white font-bold py-2 px-4'
        >
          Grid Size
        </label>
        <input
          id='grid-size-range'
          type='range'
          min='25'
          max='100'
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          step='1'
          className='rotate-180 w-16 h-2 my-auto bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
        />
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setAStarPath()}
        >
          Get A* Path
        </button>
      </div>
    </div>
  );
}

export default App;

function makeEmptyGrid(width: number, height: number): NodeCell[][] {
  const cells: NodeCell[][] = [];

  for (let x = 0; x < width; x++) {
    cells[x] = [];

    for (let y = 0; y < height; y++) {
      cells[x][y] = { x, y, type: NodeType.Empty };
    }
  }

  return cells;
}

function changeGridSize(cells: NodeCell[][], width: number, height: number) {
  const newCells: NodeCell[][] = [];

  for (let x = 0; x < width; x++) {
    newCells[x] = [];

    for (let y = 0; y < height; y++) {
      const cell = cells[x]?.[y];

      if (cell) {
        newCells[x][y] = cell;
      } else {
        newCells[x][y] = { x, y, type: NodeType.Empty };
      }
    }
  }

  return newCells;
}
