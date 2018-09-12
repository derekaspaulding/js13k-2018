import { DIRECTIONS } from "./hexgrid";
import { PLAYERS } from "./gameLogic";

export default class Canvas {

    constructor(containerClassName, canvasClassName, gridWidth, gridHeight, clickCallback) {
        // Number of hexes to draw in the grid
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.radius = 0;

        // initialize hex centers to empty array. This will be populated by drawGrid().
        this.hexCenters = [];

        // initialize mouse position to (0,0)
        this.mousePosition = {
            x: 0,
            y: 0,
        }

        // initialize hoveredEdge to empty array
        this.hoveredEdge = [];

        // Set up the canvas and set the height
        const container = document.querySelector(`.${containerClassName}`);

        if (this.containerElement === null) {
            throw new Error('Element not found');
        }

        const canvas = document.createElement('canvas')

        canvas.className = canvasClassName;
        this.canvasElement = canvas;
        container.appendChild(canvas);

        this.ctx = this.canvasElement.getContext('2d');
        this.setDimensions();

        canvas.addEventListener("mousemove", this.setMousePosition(canvas).bind(this));
        canvas.addEventListener("mousedown", () => {
            const { x, y } = this.mousePosition;
            const edge = this.getNearestEdgesByCanvasCoordinates(x, y);
            clickCallback(edge);
        })
    }

    setMousePosition(canvas) {
        return (evt) => {
            var rect = canvas.getBoundingClientRect();
            this.mousePosition = {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        };
    }

    calculateColor(owner, isHover) {
        let r, g, b;
        if (owner === null) {
            r = g = b = isHover ? 255 : 155;
        } else if (owner === PLAYERS.PLAYER1) {
            r = 226;
            g = 122;
            b = 36;
        } else {
            r = isHover ? 34 : 20;
            g = isHover ? 131 : 77;
            b = isHover ? 249: 147;
        }

        return `rgb(${r}, ${g}, ${b})`;
    }

    drawHex(x, y, radius, hexData) {
        const width = 2 * radius;
        const height = Math.sqrt(3) * radius;
        const center = this.getHexCenter(x, y, radius);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`(${x}, ${y})`, center.x, center.y);

        Object.keys(DIRECTIONS).forEach((directionKey) => {
            const direction = DIRECTIONS[directionKey];
            const [pointA, pointB] = this.getEdgePoints(center, height, width, direction);
            const edgeOwner = hexData.getEdges()[direction].owner;
            const edgeIsHovered = this.hoveredEdge.some((edge) => {
                return (
                    x === edge.x && y === edge.y && direction === edge.direction
                )
            });
            const color = this.calculateColor(edgeOwner, edgeIsHovered);
            this.drawEdge(pointA, pointB, color);
        });
    }

    getHexCenter(x, y, radius) {
        const width = 2 * radius;
        const height = Math.sqrt(3) * radius;
        return {
            x: (x * width) + (width / 2) - (x * (width / 4)) + this.widthPadding,
            y: (y * height) + (height / 2) + ((height / 2) * (x % 2)) + this.heightPadding,
        }
    }

    getEdgePoints(center, height, width, direction) {
        switch (direction) {
            case DIRECTIONS.NW:
                return [
                    {
                        x: center.x - (width / 4),
                        y: center.y - (height / 2),
                    },
                    {
                        x: center.x - (width / 2),
                        y: center.y,
                    },
                ];

            case DIRECTIONS.N:
                return [
                    {
                        x: center.x + (width / 4),
                        y: center.y - (height / 2),
                    },
                    {
                        x: center.x - (width / 4),
                        y: center.y - (height / 2),
                    },
                ];

            case DIRECTIONS.NE:
                return [
                    {
                        x: center.x + (width / 2),
                        y: center.y,
                    },
                    {
                        x: center.x + (width / 4),
                        y: center.y - (height / 2),
                    },
                ]

            case DIRECTIONS.SE:
                return [
                    {
                        x: center.x + (width / 4),
                        y: center.y + (height / 2),
                    },
                    {
                        x: center.x + (width / 2),
                        y: center.y,
                    },
                ]

            case DIRECTIONS.S:
                return [
                    {
                        x: center.x - (width / 4),
                        y: center.y + (height / 2),
                    },
                    {
                        x: center.x + (width / 4),
                        y: center.y + (height / 2),
                    }
                ]

            case DIRECTIONS.SW:
                return [
                    {
                        x: center.x - (width / 2),
                        y: center.y,
                    },
                    {
                        x: center.x - (width / 4),
                        y: center.y + (height / 2),
                    }
                ]
        }
    }

    drawEdge(pointA, pointB, color = '#fff') {
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(pointA.x, pointA.y);
        this.ctx.lineTo(pointB.x, pointB.y);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    /**
     * Sets the width, height, and padding
     */
    setDimensions() {
        const oldHeight = this.height;
        const oldWidth = this.width;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        if(this.height !== oldHeight || this.width !== oldWidth) {
            // initialize padding to 3%
            this.widthPadding = this.width * 0.03;
            this.heightPadding = this.height * 0.03;
    
            this.canvasElement.width = this.width;
            this.canvasElement.height = this.height;
    
            // width and height without padding
            const width = this.width - (2 * this.widthPadding);
            const height = this.height - (2 * this.heightPadding);
    
    
            // Calculate radius based on the canvas width
            let maxRadiusByWidth = 0.5 * (width / (0.75 + (0.75 * this.gridWidth)))
            let maxRadiusByHeight = (1 / Math.sqrt(3)) * (height / (0.5 + this.gridHeight));
            maxRadiusByWidth = Math.floor(maxRadiusByWidth);
            maxRadiusByHeight = Math.floor(maxRadiusByHeight);
    
            this.radius = Math.min(maxRadiusByHeight, maxRadiusByWidth);
    
    
            // Center vertically and horizontally. We calculate the radius based on our ideal padding,
            // but it might not be perfect. Also one of the directions likely has a lot of extra space.
            const tileHeight = this.radius * Math.sqrt(3);
            const hexGridHeight = (0.5 * tileHeight) + (this.gridHeight * tileHeight)
            this.heightPadding = (this.height - hexGridHeight) / 2;
    
            const tileWidth = this.radius * 2;
            const hexGridWidth = (0.25 * tileWidth) + (0.75 * this.gridWidth * tileWidth)
            this.widthPadding = (this.width - hexGridWidth) / 2;
            for(let x = 0; x < this.gridWidth; x++) {
                for(let y = 0; y < this.gridHeight; y++) {
                    this.hexCenters[x * this.gridWidth + y] = this.getHexCenter(x, y, this.radius);
                }
            }
        }

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    getHexByCanvasCoordinates(x, y) {
        let index = -1;
        let minDistance = Infinity;
        this.hexCenters.forEach((centerCoordinate, i) => {
            const { x: cx, y: cy } = centerCoordinate;
            const distanceToCenter = Math.abs(Math.sqrt(Math.pow((x - cx), 2) + Math.pow((y - cy), 2)));
            if (distanceToCenter < minDistance) {
                minDistance = distanceToCenter;
                index = i;
            }
        })

        return {
            x: Math.floor(index / this.gridWidth),
            y: index % this.gridWidth
        }
    }

    getNearestEdgesByCanvasCoordinates(canvasX, canvasY) {
        const { x: hX, y: hY} = this.getHexByCanvasCoordinates(canvasX, canvasY);
        const isOddColumn = hX % 2 === 1;
        const { x: centerX, y: centerY } = this.hexCenters[(hX * this.gridWidth) + hY];
        let theta = Math.atan2(canvasY - centerY, canvasX - centerX) * (180 / Math.PI);
        if (theta < 0) {
            theta += 360;
        }
        let edge;
        let borderHex;
        let borderEdge;
        switch (true) {
            case theta >= 0 && theta < 60:
                edge = DIRECTIONS.SE;
                borderEdge = DIRECTIONS.NW;
                borderHex = { x: hX + 1, y: isOddColumn ? hY + 1 : hY};
                break;

            case theta >= 60 && theta < 120:
                edge = DIRECTIONS.S;
                borderEdge = DIRECTIONS.N;
                borderHex = { x: hX, y: hY + 1};
                break;

            case theta >= 120 && theta < 180:
                edge = DIRECTIONS.SW;
                borderEdge = DIRECTIONS.NE;
                borderHex = { x: hX - 1, y: isOddColumn ? hY + 1 : hY};
                break;

            case theta >= 180 && theta < 240:
                edge = DIRECTIONS.NW;
                borderEdge = DIRECTIONS.SE;
                borderHex = { x: hX - 1, y: isOddColumn ? hY : hY - 1};
                break;

            case theta >= 240 && theta < 300:
                edge = DIRECTIONS.N;
                borderEdge = DIRECTIONS.S;
                borderHex = { x: hX, y: hY - 1};
                break;

            default:
                edge = DIRECTIONS.NE;
                borderEdge = DIRECTIONS.SW;
                borderHex = { x: hX + 1, y: isOddColumn ? hY : hY - 1};
                break;
        }

        if(
            borderHex.x >= 0 && 
            borderHex.y >= 0 && 
            borderHex.x < this.gridWidth && 
            borderHex.y < this.gridHeight
        ) {
            return [
                { x: hX, y: hY, direction: edge },
                { x: borderHex.x, y: borderHex.y, direction: borderEdge},
            ];
        }

        return [{ x: hX, y: hY, direction: edge}];
    }
}