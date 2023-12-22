import { useEffect, useMemo, useState } from "react";
import GridCanvas, { GridCell } from "./components/GridCanvas";
import { aStar } from "./utils/path-finding-algorithms/aStar";
import { Cell, CellType, Position } from "./utils/cellUtils";
import { generateMaze } from "./utils/mazeUtils";
import { dijkstra } from "./utils/path-finding-algorithms/dijkstra";
import Dropdown from "./components/Dropdown";
import { dfs } from "./utils/path-finding-algorithms/dfs";
import { bfs } from "./utils/path-finding-algorithms/bfs";

enum PathFindingAlgorithms {
  AStar = "A*",
  Dijkstra = "Dijkstra",
  DFS = "Depth First Search",
  BFS = "Breadth First Search",
}

export default App;
function App() {
  const [currentCellType, setCurrentCellType] = useState<CellType>(
    CellType.Empty
  );
  const [cells, setCells] = useState<Cell[][]>([]);
  const [cellSize, setCellSize] = useState<number>(50);
  const [startPosition, setStartPosition] = useState<GridCell | null>(null);
  const [endPosition, setEndPosition] = useState<GridCell | null>(null);
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  const [visualizationSpeed, setVisualizationSpeed] = useState<number>(10);
  const [iterationStep, setIterationStep] = useState<number>(0);
  const [pathFindingAlgorithm, setPathFindingAlgorithm] =
    useState<PathFindingAlgorithms>(PathFindingAlgorithms.Dijkstra);

  //Visualization
  const calculateNewPath = (): [Position[], Position[][]] => {
    if (!isVisualizing) return [[], []];

    if (!startPosition || !endPosition) return [[], []];

    const startNode = cells[startPosition.x]?.[startPosition.y];
    const endNode = cells[endPosition.x]?.[endPosition.y];

    if (!startNode || !endNode) return [[], []];

    switch (pathFindingAlgorithm) {
      case PathFindingAlgorithms.AStar:
        return aStar(startNode, endNode, cells);
      case PathFindingAlgorithms.Dijkstra:
        return dijkstra(startNode, endNode, cells);
      case PathFindingAlgorithms.DFS:
        return dfs(startNode, endNode, cells);
      case PathFindingAlgorithms.BFS:
        return bfs(startNode, endNode, cells);
      default:
        return [[], []];
    }
  };

  const [path, explored] = useMemo(calculateNewPath, [
    startPosition,
    endPosition,
    cells,
    pathFindingAlgorithm,
    isVisualizing,
  ]);

  useEffect(() => {
    if (!isVisualizing) return;

    const simulate = () => {
      setIterationStep((prev) => prev + 1);
      visualize();
    };
    const interval = setInterval(simulate, visualizationSpeed);
    return () => clearInterval(interval);
  });

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
      case CellType.Explored:
        return "#ff00ff";
      default:
        return "white";
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
        if (
          cell.type === CellType.StartPosition ||
          cell.type === CellType.EndPosition ||
          cell.type === CellType.Obstacle
        )
          break; //Can only place on empty and path cells

        if (startPosition) {
          const oldCell = cells[startPosition.x]?.[startPosition.y];
          if (oldCell) oldCell.type = CellType.Empty;
        }
        cell.type = CellType.StartPosition;
        setStartPosition(cell);
        break;

      case CellType.EndPosition:
        if (
          cell.type === CellType.StartPosition ||
          cell.type === CellType.EndPosition ||
          cell.type === CellType.Obstacle
        )
          break;

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
    setCells([...cells]);
    stopVisualization();
  };

  const onVisibleGridIndexesChanged = (
    _startX: number,
    _startY: number,
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

  const refreshMaze = () => {
    const [maze, start, end] = generateMaze(cells);
    setStartPosition(start);
    setEndPosition(end);
    maze[start.x][start.y].type = CellType.StartPosition;
    maze[end.x][end.y].type = CellType.EndPosition;
    setCells(maze);
    setIterationStep(0);
    setIsVisualizing(false);
  };

  const clearGrid = () => {
    setStartPosition(null);
    setEndPosition(null);
    setCells(makeEmptyGrid(cells.length, cells[0].length));
  };

  const visualize = () => {
    //animate the explored nodes
    if (iterationStep < explored.length) {
      const index = Math.min(iterationStep, explored.length - 1);
      const exploredNodes = explored[index];

      for (let i = 0; i < exploredNodes.length; i++) {
        const node = exploredNodes[i];
        const cell = cells[node.x]?.[node.y];
        if (
          cell.type !== CellType.StartPosition &&
          cell.type !== CellType.EndPosition &&
          cell.type !== CellType.Obstacle
        )
          cell.type = CellType.Explored;
      }
    } else {
      //animate the final path
      const maxIndex = Math.min(
        iterationStep - explored.length,
        path.length - 1
      );
      for (let i = 0; i < maxIndex; i++) {
        const node = path[i];
        const cell = cells[node.x]?.[node.y];
        if (
          cell.type !== CellType.StartPosition &&
          cell.type !== CellType.EndPosition
        )
          cell.type = CellType.Path;
      }
    }
  };

  const startVisualization = () => {
    setIsVisualizing(true);
    setIterationStep(0);
  };

  const stopVisualization = () => {
    setIsVisualizing(false);
    setIterationStep(0);
    resetVisualization();
  };

  const resetVisualization = () => {
    //Stop showing all Paths and Explored Cells
    for (let x = 0; x < cells.length; x++) {
      for (let y = 0; y < cells[x].length; y++) {
        const cell = cells[x][y];
        if (cell.type === CellType.Path || cell.type === CellType.Explored) {
          cell.type = CellType.Empty;
        }
      }
    }
    setCells([...cells]);
  };

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
        <button
          className='select-none bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded'
          onClick={() => refreshMaze()}
        >
          Maze
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
        <label
          htmlFor='grid-size-range'
          className='text-white font-bold py-2 px-4'
        >
          Simulation Speed
        </label>
        <input
          id='visualization-speed-range'
          type='range'
          min='10'
          max='50'
          value={visualizationSpeed}
          onChange={(e) => setVisualizationSpeed(Number(e.target.value))}
          step='1'
          className='rotate-180 w-16 h-2 my-auto bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
        />
        <button
          className={`select-none ${
            isVisualizing
              ? "bg-red-500 border-red-700 hover:bg-red-400 hover:border-red-500"
              : "bg-blue-500 border-blue-700 hover:bg-blue-400 hover:border-blue-500"
          }  text-white font-bold py-2 px-4 border-b-4 rounded`}
          onClick={() =>
            isVisualizing ? stopVisualization() : startVisualization()
          }
        >
          Visualize
        </button>
        <Dropdown
          id={"path-finding-algorithm"}
          options={Object.values(PathFindingAlgorithms)}
          defaultSelected={pathFindingAlgorithm}
          onSelectedChange={(selected) => {
            const algorithm = Object.values(PathFindingAlgorithms).find(
              (value) => value === selected
            );
            setPathFindingAlgorithm(
              algorithm || PathFindingAlgorithms.Dijkstra
            );
            stopVisualization();
          }}
        ></Dropdown>
      </div>
    </div>
  );
}

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
