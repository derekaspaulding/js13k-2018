import { PLAYERS } from "./gameLogic";

export default class HexGrid {

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.gridWidth = (width * 2) + 1;
    this.gridHeight = (height * 2) + 1;
    this.grid = [];
    this.hexes = [];
    for(let x = 0; x < this.width; x++) {
      for(let y = 0; y < this.height; y++) {
        this.hexes[(this.width * y) + x] = new Hex(this, x, y);
      }
    }


    const start1 = {
      x: Math.floor(Math.random() * this.width),
      y: 0,
    }

    const start2 = {
      x: Math.floor(Math.random() * this.width),
      y: this.height - 1,
    }

    this.getHex(start1.x, start1.y).getEdges()[DIRECTIONS.NW].owner = PLAYERS.PLAYER1;
    this.getHex(start2.x, start2.y).getEdges()[DIRECTIONS.SW].owner = PLAYERS.PLAYER2;
  }

  getHex(x, y) {
    return this.hexes[(this.width * y) + x]
  }

  isValidMove(x, y, direction) {
    const { x: eX, y: eY } = this.calcEdgeGridCoordinates(x, y, direction);
    const connectedEdges = this._getConnectedEdges(eX, eY, direction);
    return connectedEdges.some(edge => edge.owner === PLAYERS.PLAYER1);
  }

  _calcGridCoordinates(x, y) {
    return {
      x: (2 * x) + 1,
      y: (2 * y) + 1,
    };
  }

  _calcEdgeGridCoordinates(x, y, direction) {
    const { x: hX, y: hY } = this._calcGridCoordinates(x, y);
    const isOddColumn = (Math.floor(hX / 2) % 2) === 1;
    if (direction === DIRECTIONS.N) {
      return {x: hX, y: hY - 1};
    }

    if (direction === DIRECTIONS.S) {
      return {x: hX, y: hY + 1};
    }

    const eX = (direction === DIRECTIONS.NW || direction === DIRECTIONS.SW) ?
      hX - 1 :
      hX + 1;
    let eY = (direction === DIRECTIONS.NW  || direction === DIRECTIONS.NE) ?
    hY - 1 :
    hY;

    if (isOddColumn) {
      eY = eY + 1;
    }

    return { x: eX, y: eY };
  }

  _getConnectedEdges(eX, eY) {
    const isValidCoordinate = ({ x, y }) => {
      const isSpecialCase = (x === 0 && y === 20) || (x === 20 && y === 0);
      return !isSpecialCase && x >= 0 && y >= 0 && x < this.gridWidth && y < this.gridWidth
    }
    const xIsOdd = eX % 2 === 1;
    const yIsOdd = eY % 2 === 1;
    let edgeCoordinates;
    if (xIsOdd && !yIsOdd) {
      const isOddColumn = Math.floor(eX / 2) % 2 === 1;
      const y2 = isOddColumn ? eY + 1 : eY - 1;
      edgeCoordinates = [
        { x: eX + 1, y: eY },
        { x: eX + 1, y: y2 },
        { x: eX - 1, y: eY },
        { x: eX - 1, y: y2 },
      ];
    } else if (!xIsOdd && yIsOdd) {
      const isOddColumn = Math.floor(eX / 2) % 2 === 1;
      edgeCoordinates = [
        { x: eX, y: eY + 1 },
        { x: eX, y: eY - 1 },
        { x: eX - 1, y: isOddColumn ? eY + 1 : eY - 1 },
        { x: eX + 1, y: isOddColumn ? eY - 1 : eY + 1 },
      ]
    } else {
      edgeCoordinates = [
        { x: eX, y: eY + 1 },
        { x: eX, y: eY - 1 },
        { x: eX - 1, y: eY },
        { x: eX + 1, y: eY },
      ]
    }

    return edgeCoordinates.filter(isValidCoordinate).map(({ x, y }) => {
      return this.grid[(y * this.gridWidth) + x]
    });
  }
}

class Hex {
  constructor(hexGrid, x, y) {
    this.type = TYPES.HEX;
    this.hexGrid = hexGrid;
    this.x = x;
    this.y = y;
    Object.keys(DIRECTIONS).forEach((directionKey) => {
      const { x: eX, y: eY } = this.hexGrid._calcEdgeGridCoordinates(this.x, this.y, DIRECTIONS[directionKey]);
      let edge = this.hexGrid.grid[(this.hexGrid.gridWidth * eY) + eX];
      if (edge && edge.type === TYPES.EDGE) {
        edge.hexes.push(this);
      } else {
        this.hexGrid.grid[(this.hexGrid.gridWidth * eY) + eX] = new Edge(this);
      }
    });

    const { x: hX, y: hY } = this.hexGrid._calcGridCoordinates(this.x, this.y);
    this.hexGrid.grid[(this.hexGrid.gridWidth * hY) + hX] = this;
  }

  getEdges() {
    return Object.keys(DIRECTIONS).reduce((edges, directionKey) => {
      const { x: eX, y: eY } = this.hexGrid._calcEdgeGridCoordinates(this.x, this.y, DIRECTIONS[directionKey]);
      return Object.assign(
        {},
        edges,
        { [DIRECTIONS[directionKey]]: this.hexGrid.grid[(this.hexGrid.gridWidth * eY) + eX] }
      );
    }, {});
  }

  getConnectedEdges(direction) {
    const { x: eX, y: eY } = this.hexGrid._calcEdgeGridCoordinates(this.x, this.y, direction);
    return this.hexGrid._getConnectedEdges(eX, eY);
  }
}

class Edge {
  constructor(hex) {
    this.type = TYPES.EDGE;
    this.hexes = [hex];
    this.owner = null;
  }

  setOwner(newOwner) {
    this.owner = newOwner;
  }


}

export const DIRECTIONS = {
  NW: 'NW',
  N: 'N',
  NE: 'NE',
  SE: 'SE',
  S: 'S',
  SW: 'SW',
}

const TYPES = {
  EDGE: 'EDGE',
  HEX: 'HEX',
  VERTEX: 'VERTEX',
}