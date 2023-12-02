import { getIndex, createEmptyGrid } from "./utils.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");

const gameButton = document.getElementById("gameButton");
const resetButton = document.getElementById("resetButton");
const randomizeButton = document.getElementById("randomizeButton");
const updateGridButton = document.getElementById("updateGridButton");

const generationTimeContainer = document.getElementById("generation-time");

let cellSize = 16,
    rows = 28,
    cols = 28,
    gameIsRunning = false,
    grid = createEmptyGrid(rows, cols),
    gridLen = rows * cols,
    animationFrameId;

// mouse action
function setGenByMouse(event) {
    gameButton.disabled = false;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const clickedRow = Math.floor(mouseY / cellSize);
    const clickedCol = Math.floor(mouseX / cellSize);

    const index = getIndex(clickedRow, clickedCol, cols);
    grid[index] = 1 - grid[index]; // Toggle cell state
    drawCell(clickedRow, clickedCol);
}

// button actions
function toggleGame() {
    gameIsRunning = !gameIsRunning;
    gameIsRunning ? startGame() : stopGame();
}

function startGame() {
    gameIsRunning = true;
    gameButton.textContent = "Stop";
    animate();
}

function stopGame() {
    gameIsRunning = false;
    gameButton.textContent = "Start";
    cancelAnimationFrame(animationFrameId);
}

function resetGame() {
    stopGame();
    generationTimeContainer.textContent = "--";
    gameButton.disabled = true;
    grid = createEmptyGrid(rows, cols);
    drawGrid();
}

function randomizeGrid() {
    gameButton.disabled = false;
    grid = createEmptyGrid(rows, cols);
    for (let i = 0; i < gridLen; i++) {
        grid[i] = Math.random() > 0.5 ? 1 : 0;
    }
    drawGrid();
}

function updateGrid() {
    rows = parseInt(rowsInput.value);
    cols = parseInt(colsInput.value);
    gridLen = rows * cols;
    grid = createEmptyGrid(rows, cols);
    drawGrid();
}

function animate() {
    createNewGeneration();
    animationFrameId = requestAnimationFrame(animate);
}

// game logic
function createNewGeneration() {
    const startTime = performance.now();
    const newGrid = new Uint8Array(rows * cols);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const neighbors = countNeighbors(i, j);
            const index = getIndex(i, j, cols);

            if (grid[index] === 1) {
                newGrid[index] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
                newGrid[index] = neighbors === 3 ? 1 : 0;
            }
        }
    }
    grid = newGrid;
    drawGrid();

    const endTime = performance.now();
    const generationTime = endTime - startTime;
    generationTimeContainer.textContent = generationTime.toFixed(2);
}

function countNeighbors(row, col) {
    let count = 0;

    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            const ni = (i + rows) % rows; // Torus grid behavior
            const nj = (j + cols) % cols; // Torus grid behavior

            if (!(ni === row && nj === col)) {
                count += grid[getIndex(ni, nj, cols)];
            }
        }
    }
    return count;
}

// drawing
function drawGrid() {
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    const imageData = ctx.createImageData(cols * cellSize, rows * cellSize);
    const data = imageData.data;
    console.log(data)

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const index = getIndex(i, j, cols);
            const color = grid[index] === 1 ? 0 : 255;

            for (let ii = 0; ii < cellSize; ii++) {
                for (let jj = 0; jj < cellSize; jj++) {
                    const dataIndex =
                        ((i * cellSize + ii) * cols * cellSize +
                            (j * cellSize + jj)) *
                        4;
                    data[dataIndex] = color;
                    data[dataIndex + 1] = color;
                    data[dataIndex + 2] = color;
                    data[dataIndex + 3] = 255;
                    
                    

                    if (
                        ii === 0 ||
                        ii === cellSize - 1 ||
                        jj === 0 ||
                        jj === cellSize - 1
                    ) {
                        data[dataIndex] = 0; 
                        data[dataIndex + 1] = 0;
                        data[dataIndex + 2] = 0;
                    }
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawCell(row, col) {
    const x = col * cellSize;
    const y = row * cellSize;
    const index = getIndex(row, col, cols);
    const color = grid[index] === 1 ? 0 : 255;

    const imageData = ctx.getImageData(x, y, cellSize, cellSize);
    const data = new Uint8ClampedArray(imageData.data.buffer);

    for (let i = 0; i < cellSize; i++) {
        for (let j = 0; j < cellSize; j++) {
            const dataIndex = (i * cellSize + j) * 4;
            data[dataIndex] = color;
            data[dataIndex + 1] = color;
            data[dataIndex + 2] = color;

            if (
                i === 0 ||
                i === cellSize - 1 ||
                j === 0 ||
                j === cellSize - 1
            ) {
                data[dataIndex] = 0; 
                data[dataIndex + 1] = 0;
                data[dataIndex + 2] = 0;
            }
        }
    }

    ctx.putImageData(new ImageData(data, cellSize, cellSize), x, y);
}

// event listeners
canvas.addEventListener("click", setGenByMouse);
gameButton.addEventListener("click", toggleGame);
resetButton.addEventListener("click", resetGame);
randomizeButton.addEventListener("click", randomizeGrid);
updateGridButton.addEventListener("click", updateGrid);

// init
addEventListener("DOMContentLoaded", drawGrid);
