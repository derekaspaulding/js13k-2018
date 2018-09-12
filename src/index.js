import Canvas from './canvas';
import HexGrid from './hexgrid';
import GameLogic from './gameLogic';



const clickCallback = (nearestEdges) => {
  const { x: hX, y: hY, direction } = nearestEdges[0];
  const hex = hexGrid.getHex(hX, hY);
  const edge = hex.getEdges()[direction];
  const connectedEdges = hex.getConnectedEdges(direction);
  if (gameLogic.isValidMove(edge, connectedEdges)) {
    const currentPlayer = gameLogic.getCurrentPlayer();
    const edge = hex.getEdges()[direction]
    edge.setOwner(currentPlayer);
    gameLogic.switchPlayer();
  }
}

const canvas = new Canvas('container', 'game-canvas', 10, 10, clickCallback);
const hexGrid = new HexGrid(10, 10);
const gameLogic = new GameLogic();
window.hexGrid = hexGrid;
window.canvas = canvas;
window.gameLogic = gameLogic;

function drawGrid() {
  canvas.setDimensions();

  const nearestEdges = canvas.getNearestEdgesByCanvasCoordinates(canvas.mousePosition.x, canvas.mousePosition.y);
  const { x: hX, y: hY, direction } = nearestEdges[0];
  const hex = hexGrid.getHex(hX, hY);
  const edge = hex.getEdges()[direction];
  const connectedEdges = hex.getConnectedEdges(direction);
  if (gameLogic.isValidMove(edge, connectedEdges)) {
      canvas.hoveredEdge = nearestEdges;
  } else {
      canvas.hoveredEdge = [];
  }

  // Draw edges
  for(let x = 0; x < canvas.gridWidth; x++) {
    for(let y = 0; y < canvas.gridHeight; y++) {
        canvas.drawHex(x, y, canvas.radius, hexGrid.getHex(x, y));
    }
  }
}

function frame() {
  drawGrid();
  requestAnimationFrame(frame); // request the next frame
}

requestAnimationFrame(frame); // start the first frame
