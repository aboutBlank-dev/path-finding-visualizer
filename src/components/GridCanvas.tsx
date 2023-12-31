import React, { useEffect, useRef, useState } from "react";

export interface GridCell {
  x: number;
  y: number;
}

type Props = {
  cellSize: number;
  draggable: boolean;
  onCellClicked?: (x: number, y: number) => void;
  onVisibleGridIndexesChanged?: (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => void;
  drawCell?: (
    cell: GridCell,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    cellSize: number
  ) => boolean;
};

//also allow the parent to pass in the html id of the canvas
function Canvas({
  cellSize,
  draggable,
  onCellClicked,
  onVisibleGridIndexesChanged,
  drawCell,
}: Props) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasContainerDimensions, setCanvasContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //For Panning/Dragging
  const isMouseDown = useRef(false);
  const mouseMoved = useRef(false);
  const startMousePosition = useRef({ x: 0, y: 0 });
  const canvasOffset = useRef({ x: 0, y: 0 });
  const minDragDistance = 5;

  // Set canvas container dimensions on mount
  useEffect(() => {
    setCanvasContainerDimensions({
      width: canvasContainerRef.current?.clientWidth || 0,
      height: canvasContainerRef.current?.clientHeight || 0,
    });
  }, [canvasContainerRef]);

  // Set canvas container dimensions on resize and draw grid
  useEffect(() => {
    //This is called after the first render
    const updateCanvasContainerDimensions = () => {
      setCanvasContainerDimensions({
        width: canvasContainerRef.current?.clientWidth || 0,
        height: canvasContainerRef.current?.clientHeight || 0,
      });
    };

    drawGrid();

    window.addEventListener("resize", updateCanvasContainerDimensions);

    return () => {
      window.removeEventListener("resize", updateCanvasContainerDimensions);
    };
  });

  useEffect(() => {
    const offsetX = canvasOffset.current.x;
    const offsetY = canvasOffset.current.y;

    let startX = Math.floor(-offsetX / cellSize);
    let startY = Math.floor(-offsetY / cellSize);
    startX = startX === 0 ? 0 : startX; //prevent -0
    startY = startY === 0 ? 0 : startY; //prevent -0

    const endX = Math.floor(
      (canvasContainerDimensions.width - offsetX) / cellSize
    );
    const endY = Math.floor(
      (canvasContainerDimensions.height - offsetY) / cellSize
    );

    if (onVisibleGridIndexesChanged)
      onVisibleGridIndexesChanged(startX, startY, endX - 1, endY - 1);
  }, [canvasContainerDimensions, cellSize, canvasOffset.current]);

  const drawGrid = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || !canvasContainerDimensions) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = canvasOffset.current.x;
    const offsetY = canvasOffset.current.y;

    //Only draw cells that are visible.
    //Find all the hypothetical cells that are visible based on the offset
    let startX = Math.floor(-offsetX / cellSize);
    let startY = Math.floor(-offsetY / cellSize);
    startX = startX === 0 ? 0 : startX; //prevent -0
    startY = startY === 0 ? 0 : startY; //prevent -0

    const endX = Math.floor(
      (canvasContainerDimensions.width - offsetX) / cellSize
    );
    const endY = Math.floor(
      (canvasContainerDimensions.height - offsetY) / cellSize
    );

    //Draw only cells that are visible
    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const cellX = x * cellSize + offsetX;
        const cellY = y * cellSize + offsetY;

        if (drawCell) {
          if (drawCell({ x, y }, ctx, cellX, cellY, cellSize)) {
            continue;
          } else {
            ctx.fillStyle = "white";
            ctx.fillRect(cellX, cellY, cellSize, cellSize);
          }
        }
      }
    }

    //height and width of the grid based on how many cells fit in the canvas container
    const height =
      Math.floor(canvasContainerDimensions.height / cellSize) * cellSize;
    const width =
      Math.floor(canvasContainerDimensions.width / cellSize) * cellSize;

    //Draw infinite vertical lines based on the panning
    ctx.beginPath();
    const gridOffsetX = offsetX % cellSize;
    const gridOffsetY = offsetY % cellSize;

    //grid lines
    for (let x = gridOffsetX; x <= width; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = gridOffsetY; y <= height; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mouseMoved.current) {
      mouseMoved.current = false;
      return;
    }

    const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

    const offsetX = canvasOffset.current.x;
    const offsetY = canvasOffset.current.y;

    //Only check the cells that are visible
    let startX = Math.floor(-offsetX / cellSize);
    let startY = Math.floor(-offsetY / cellSize);
    startX = startX === 0 ? 0 : startX;
    startY = startY === 0 ? 0 : startY;

    const endX = Math.ceil(
      (canvasContainerDimensions.width - offsetX) / cellSize
    );
    const endY = Math.ceil(
      (canvasContainerDimensions.height - offsetY) / cellSize
    );

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (
          mouseX >= x * cellSize + offsetX &&
          mouseX <= x * cellSize + cellSize + offsetX &&
          mouseY >= y * cellSize + offsetY &&
          mouseY <= y * cellSize + cellSize + offsetY
        ) {
          if (onCellClicked) onCellClicked(x, y);
          return;
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggable) return;

    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    startMousePosition.current = {
      x: e.clientX - canvasRef.current!.getBoundingClientRect().left,
      y: e.clientY - canvasRef.current!.getBoundingClientRect().top,
    };

    isMouseDown.current = true;
  };

  const handleDragStop = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggable) return;

    e.preventDefault();
    e.stopPropagation();

    //Make sure that the grid offset is a multiple of the cell size
    const offsetX = canvasOffset.current.x;
    const offsetY = canvasOffset.current.y;

    const gridOffsetX = offsetX % cellSize;
    const gridOffsetY = offsetY % cellSize;

    canvasOffset.current = {
      x: offsetX - gridOffsetX,
      y: offsetY - gridOffsetY,
    };
    isMouseDown.current = false;

    drawGrid();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggable) return;

    // only do this code if the mouse is down
    if (!isMouseDown.current) {
      return;
    }

    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    const mouseX = e.clientX - canvasRef.current!.getBoundingClientRect().left;
    const mouseY = e.clientY - canvasRef.current!.getBoundingClientRect().top;

    // dx & dy are the distance the mouse has moved since
    // the last mousemove event
    var change = {
      x: mouseX - startMousePosition.current.x,
      y: mouseY - startMousePosition.current.y,
    };

    //prevent tiny accidental drags when the mouse is clicked
    if (
      Math.abs(change.x) < minDragDistance &&
      Math.abs(change.y) < minDragDistance
    )
      return;

    mouseMoved.current = true;

    // reset the vars for next mousemove
    startMousePosition.current = {
      x: mouseX,
      y: mouseY,
    };

    // accumulate the net panning done
    canvasOffset.current = {
      x: canvasOffset.current.x + change.x,
      y: canvasOffset.current.y + change.y,
    };

    // redraw the scene with the new panning
    drawGrid();
  };

  drawGrid();
  const finalWidth =
    Math.floor(canvasContainerDimensions.width / cellSize) * cellSize;
  const finalHeight =
    Math.floor(canvasContainerDimensions.height / cellSize) * cellSize;
  return (
    <div className='relative w-full h-full' ref={canvasContainerRef}>
      <canvas
        className='absolute inset-0 my-auto mx-auto'
        ref={canvasRef}
        width={finalWidth}
        height={finalHeight}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragStop}
        onMouseOut={handleDragStop}
      />
    </div>
  );
}

export default Canvas;
