import { useState } from "react";
import GridCanvas, { GridCell } from "./components/GridCanvas";
import { aStar } from "./utils/path-finding-algorithms/aStar";
import { Cell, CellType } from "./utils/cellUtils";
import { generateMaze } from "./utils/mazeUtils";

function App() {
  const [currentCellType, setCurrentCellType] = useState<CellType>(
    CellType.Empty
  );
  const [cells, setCells] = useState<Cell[][]>([]);
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
      ctx.fillStyle = getStyleForCell(cell.type);
      ctx.fillRect(xPos, yPos, cellSize, cellSize);
    }

    //tell the grid canvas that we handled drawing the cell
    return true;
  };

  const getStyleForCell = (cellType: CellType) => {
    switch (cellType) {
      case CellType.Empty:
        return "white";
      case CellType.StartPosition:
        return "green";
      case CellType.EndPosition:
        return "blue";
      case CellType.Obstacle:
        return "black";
      case CellType.Path:
        return "yellow";
    }
  };

  const onCellClicked = (x: number, y: number) => {
    const cell = cells[x]?.[y];
    if (!cell) {
      console.log("clicked cell is null");
      return;
    }

    switch (currentCellType) {
      case CellType.StartPosition:
        if (cell.type !== CellType.Empty && cell.type !== CellType.Path) break; //Can only place on empty and path cells

        if (startPosition) {
          const oldCell = cells[startPosition.x]?.[startPosition.y];
          if (oldCell) oldCell.type = CellType.Empty;
        }
        cell.type = CellType.StartPosition;
        setStartPosition(cell);
        break;

      case CellType.EndPosition:
        if (cell.type !== CellType.Empty && cell.type !== CellType.Path) break; //Can only place on empty and path cells

        if (endPosition) {
          const oldCell = cells[endPosition.x]?.[endPosition.y];
          if (oldCell) oldCell.type = CellType.Empty;
        }
        cell.type = CellType.EndPosition;
        setEndPosition(cell);
        break;

      default:
        if (
          cell.type === CellType.StartPosition ||
          cell.type === CellType.EndPosition
        )
          break;
        cell.type = currentCellType;
        break;
    }

    refreshPath();
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

  const refreshPath = () => {
    setAStarPath();
    setCells([...cells]);
  };

  const refreshMaze = () => {
    const [maze, start, end] = generateMaze(cells);
    setStartPosition(start);
    setEndPosition(end);
    maze[start.x][start.y].type = CellType.StartPosition;
    maze[end.x][end.y].type = CellType.EndPosition;
    setCells(maze);
  };

  const clearGrid = () => {
    setStartPosition(null);
    setEndPosition(null);
    setCells(makeEmptyGrid(cells.length, cells[0].length));
  };

  const setAStarPath = () => {
    //set all old path nodes to empty
    for (let x = 0; x < cells.length; x++) {
      for (let y = 0; y < cells[x].length; y++) {
        const cell = cells[x][y];
        if (cell.type === CellType.Path) {
          cell.type = CellType.Empty;
        }
      }
    }

    if (!startPosition || !endPosition) return;
    const startNode = cells[startPosition.x]?.[startPosition.y];
    const endNode = cells[endPosition.x]?.[endPosition.y];
    if (!startNode || !endNode) return;

    const path = aStar(startNode, endNode, cells);
    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      const cell = cells[node.x]?.[node.y];
      if (
        cell.type !== CellType.StartPosition &&
        cell.type !== CellType.EndPosition
      )
        cell.type = CellType.Path;
    }
  };

  setAStarPath();
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
          onClick={() => setCurrentCellType(CellType.StartPosition)}
        >
          Start Node
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setCurrentCellType(CellType.EndPosition)}
        >
          End Node
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setCurrentCellType(CellType.Obstacle)}
        >
          Obstacle
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => setCurrentCellType(CellType.Empty)}
        >
          Empty
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => clearGrid()}
        >
          Clear Grid
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
          onClick={() => refreshPath()}
        >
          Get A* Path
        </button>
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => refreshMaze()}
        >
          Generate Maze
        </button>
      </div>
    </div>
  );
}

export default App;

function makeEmptyGrid(width: number, height: number): Cell[][] {
  const cells: Cell[][] = [];

  for (let x = 0; x < width; x++) {
    cells[x] = [];

    for (let y = 0; y < height; y++) {
      cells[x][y] = { x, y, type: CellType.Empty };
    }
  }

  return cells;
}

function changeGridSize(cells: Cell[][], width: number, height: number) {
  const newCells: Cell[][] = [];

  for (let x = 0; x < width; x++) {
    newCells[x] = [];

    for (let y = 0; y < height; y++) {
      const cell = cells[x]?.[y];

      if (cell) {
        newCells[x][y] = cell;
      } else {
        newCells[x][y] = { x, y, type: CellType.Empty };
      }
    }
  }

  return newCells;
}
