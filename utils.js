export function getIndex(x, y, cols) {
    return y * cols + x;
}

export function createEmptyGrid(rows, cols) {
    return new Uint8Array(rows * cols);
}