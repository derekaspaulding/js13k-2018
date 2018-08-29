export default class HexGrid {

  constructor(width, height) {
    this.hexWidth = width;
    this.hexHeight = height;
    this.gridWidth = width * 2;
    this.gridHeight = height * 2;
    let grid = [];
    for(let x = 0; x < this.gridWidth; x++) {
      for(let y = 0; y < this.gridHeight; y++) {
        // create new hex
        if(x % 2 === 0) {
          grid[(x * this.gridWidth) + y] = new Hex(this, x, y);
        } else {
          grid[(x * this.gridWidth) + y] = new Edge(this, x, y);
        }
      }
    }
  }
}

class Hex {
  constructor(hexGrid, x, y) {
    this.hexGrid = hexGrid;
    this.x = x;
    this.y = y;
  }
}

class Edge {
  constructor(hexGrid, x, y) {
    this.hexGrid = hexGrid;
    this.x = x;
    this.y = y;
    this.owner = null;
  }
}

export const DIRECTIONS = {
  NW: 0,
  N: 1,
  NE: 2,
  SE: 3,
  S: 4,
  SW: 5,
}