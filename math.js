export class Vector {
    constructor(...components) {
        this.components = components;
    }

    add({ components }) {
        return new Vector(
            ...components.map(
                (component, index) => this.components[index] + component
            )
        );
    }

    sub({ components }) {
        return new Vector(
            ...components.map(
                (component, index) => this.components[index] - component
            )
        );
    }

    scl(scalar) {
        return new Vector(
            ...this.components.map((component) => component * scalar)
        );
    }

    len() {
        return Math.hypot(...this.components);
    }

    dot({ components }) {
        return components.reduce(
            (acc, component, index) => acc + component * this.components[index],
            0
        );
    }
}

export const MatrixOps = {
    // from: https://rikyperdana.medium.com/matrix-operations-in-functional-js-e3463f36b160
    withAs: (obj, cb) => cb(obj),
    sum: (arr) => arr.reduce((a, b) => a + b),
    mul: (arr) => arr.reduce((a, b) => a * b),
    sub: (arr) => arr.splice(1).reduce((a, b) => a - b, arr[0]),
    deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
    shifter: (arr, step) => [
        ...arr.splice(step),
        ...arr.splice(arr.length - step),
    ],
    makeArray: (n, cb) => [...Array(n).keys()].map((i) => (cb ? cb(i) : i)),
    makeMatrix: (len, wid, fill) =>
        MatrixOps.makeArray(len).map((i) =>
            MatrixOps.makeArray(wid, (j) => (fill ? fill(i, j) : 0))
        ),
    matrixRandom: (len, wid, min = 0, max = 100) =>
        MatrixOps.makeMatrix(
            len,
            wid,
            (x) => Math.round(Math.random() * (max - min)) + min
        ),
    matrixSize: (matrix) => [matrix.length, matrix[0].length],
    arr2mat: (len, wid, arr) =>
        MatrixOps.makeArray(len).map((i) => arr.slice(i * wid, i * wid + wid)),
    matrixMap: (matrix, cb) =>
        MatrixOps.deepClone(matrix).map((i, ix) =>
            i.map((j, jx) => cb({ i, ix, j, jx, matrix }))
        ),
    matrixScalar: (n, matrix) => MatrixOps.matrixMap(matrix, ({ j }) => n * j),

    matrixAdd: (matrices) =>
        matrices.reduce(
            (acc, inc) =>
                MatrixOps.matrixMap(acc, ({ j, ix, jx }) => j + inc[ix][jx]),
            MatrixOps.makeMatrix(...MatrixOps.matrixSize(matrices[0]))
        ),
    matrixSub: (matrices) =>
        matrices
            .splice(1)
            .reduce(
                (acc, inc) =>
                    MatrixOps.matrixMap(
                        acc,
                        ({ j, ix, jx }) => j - inc[ix][jx]
                    ),
                matrices[0]
            ),
    matrixMul: (m1, m2) =>
        MatrixOps.makeMatrix(m1.length, m2[0].length, (i, j) =>
            MatrixOps.sum(m1[i].map((k, kx) => k * m2[kx][j]))
        ),
    matrixMuls: (matrices) =>
        MatrixOps.deepClone(matrices)
            .splice(1)
            .reduce(
                (acc, inc) =>
                    MatrixOps.makeMatrix(acc.length, inc[0].length, (ix, jx) =>
                        MatrixOps.sum(acc[ix].map((k, kx) => k * inc[kx][jx]))
                    ),
                MatrixOps.deepClone(matrices[0])
            ),
    matrixTrans: (matrix) =>
        MatrixOps.makeMatrix(
            ...MatrixOps.shifter(MatrixOps.matrixSize(matrix), 1),
            (i, j) => matrix[j][i]
        ),
};

export const TrigOps = {
    radToDeg: (r) => (r * 180) / Math.PI,
    degToRad: (d) => (d * Math.PI) / 180,
};
