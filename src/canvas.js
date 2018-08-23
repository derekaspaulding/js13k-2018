import { DIRECTIONS } from "./hexgrid";

export default class Canvas {

    constructor(containerClassName, canvasClassName, gridWidth, gridHeight) {
        // Number of hexes to draw in the grid
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;


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
    }

    drawGrid() {
        this.setDimensions();
        // width and height without padding
        const width = this.width - (2 * this.widthPadding);
        const height = this.height - (2 * this.heightPadding);


        // Calculate radius based on the canvas width
        let maxRadiusByWidth = 0.5 * (width / (0.75 + (0.75 * this.gridWidth)))
        let maxRadiusByHeight = (1 / Math.sqrt(3)) * (height / (0.5 + this.gridHeight));
        maxRadiusByWidth = Math.floor(maxRadiusByWidth);
        maxRadiusByHeight = Math.floor(maxRadiusByHeight);

        const radius = Math.min(maxRadiusByHeight, maxRadiusByWidth);


        // Center vertically and horizontally. We calculate the radius based on our ideal padding,
        // but it might not be perfect. Also one of the directions likely has a lot of extra space.
        const tileHeight = radius * Math.sqrt(3);
        const hexGridHeight = (0.5 * tileHeight) + (this.gridHeight * tileHeight)
        this.heightPadding = (this.height - hexGridHeight) / 2;

        const tileWidth = radius * 2;
        const hexGridWidth = (0.25 * tileWidth) + (0.75 * this.gridWidth * tileWidth)
        this.widthPadding = (this.width - hexGridWidth) / 2;

        // Draw all of the hexes
        for(let x = 0; x < this.gridWidth; x++) {
            for(let y = 0; y < this.gridHeight; y++) {
                this.drawHex(x, y, radius);
            }
        }
    }

    drawHex(x, y, radius) {
        const width = 2 * radius;
        const height = Math.sqrt(3) * radius;
        const center = {
            x: (x * width) + (width / 2) - (x * (width / 4)) + this.widthPadding,
            y: (y * height) + (height / 2) + ((height / 2) * (x % 2)) + this.heightPadding,
        }

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`(${x}, ${y})`, center.x, center.y);

        const NW = this.getEdgePoints(center, height, width, DIRECTIONS.NW);
        const N = this.getEdgePoints(center, height, width, DIRECTIONS.N);
        const NE = this.getEdgePoints(center, height, width, DIRECTIONS.NE);
        const SE = this.getEdgePoints(center, height, width, DIRECTIONS.SE);
        const S = this.getEdgePoints(center, height, width, DIRECTIONS.S);
        const SW = this.getEdgePoints(center, height, width, DIRECTIONS.SW);

        this.drawEdge(NW[0], NW[1], 'red');
        this.drawEdge(N[0], N[1], 'white');
        this.drawEdge(NE[0], NE[1], 'blue');
        this.drawEdge(SE[0], SE[1], 'green');
        this.drawEdge(S[0], S[1], 'orange');
        this.drawEdge(SW[0], SW[1], 'pink');

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

    drawEdge(pointA, pointB, color = '#aaaaaa') {
        this.ctx.beginPath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(pointA.x, pointA.y);
        this.ctx.lineTo(pointB.x, pointB.y);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    getRandomColor() {
        const getRandomHexVal = () => Math.floor(Math.random() * 15).toString(16);
        let randColor = '#';
        for(let i = 0; i < 6; i++) {
            randColor = `${randColor}${getRandomHexVal()}`;
        }
        return randColor;
    }

    /**
     * Sets the width, height, and padding
     */
    setDimensions() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // initialize padding to 3%
        this.widthPadding = this.width * 0.03;
        this.heightPadding = this.height * 0.03;

        this.canvasElement.width = this.width;
        this.canvasElement.height = this.height;

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

}