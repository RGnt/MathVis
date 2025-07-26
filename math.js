
export class Vector {
    constructor(...components) {
        this.components = components
    }

    add({ components }) {
        return new Vector(
            ...components.map((component, index) => this.components[index] + component)
        )
    }

    sub({ components }) {
        return new Vector(
            ...components.map((component, index) => this.components[index] - component)
        )
    }

    scl(scalar) {
        return new Vector(...this.components.map(component => component * scalar));
    }

    len() {
        return Math.hypot(...this.components);
    }

    dot({ components }) {
        return components.reduce((acc, component, index) => acc + component * this.components[index], 0);
    }
};

export const MatrixOps = {
    // from: https://rikyperdana.medium.com/matrix-operations-in-functional-js-e3463f36b160
    withAs: (obj, cb) => cb(obj),
    sum: (arr) => arr.reduce((a, b) => a + b),
    mul: (arr) => arr.reduce((a, b) => a * b),
    sub: (arr) => arr.splice(1).reduce((a, b) => a - b, arr[0]),
    deepClone: obj => JSON.parse(JSON.stringify(obj)),
    shifter: (arr, step) => [
        ...arr.splice(step),
        ...arr.splice(arr.length - step)
    ],
    makeArray: (n, cb) =>
        [...Array(n).keys()].map(
            i => cb ? cb(i) : i
        ),
    makeMatrix: (len, wid, fill) =>
        Matrix.makeArray(len).map(i => Matrix.makeArray(
            wid, j => fill ? fill(i, j) : 0
        )),
    matrixRandom: (len, wid, min = 0, max = 100) =>
        Matrix.makeMatrix(len, wid, (x) => Math.round(
            Math.random() * (max - min)
        ) + min),
    matrixSize: (matrix) => [
        matrix.length, matrix[0].length
    ],
    arr2mat: (len, wid, arr) =>
        Matrix.makeArray(len).map(i => arr.slice(
            i * wid, i * wid + wid
        )),
    matrixMap: (matrix, cb) => Matrix.deepClone(matrix).map((i, ix) => i.map((j, jx) => cb({ i, ix, j, jx, matrix }))),
    matrixScalar: (n, matrix) => Matrix.matrixMap(matrix, ({ j }) => n * j),

    matrixAdd: (matrices) => matrices.reduce((acc, inc) => Matrix.matrixMap(acc, ({ j, ix, jx }) => j + inc[ix][jx]), Matrix.makeMatrix(...Matrix.matrixSize(matrices[0]))),
    matrixSub: (matrices) => matrices.splice(1).reduce((acc, inc) => Matrix.matrixMap(acc, ({ j, ix, jx }) => j - inc[ix][jx]), matrices[0]),
    matrixMul: (m1, m2) => Matrix.makeMatrix(
        m1.length, m2[0].length, (i, j) => Matrix.sum(
            m1[i].map((k, kx) => k * m2[kx][j])
        )
    ),
    matrixMuls: (matrices) => Matrix.deepClone(matrices).splice(1).reduce((acc, inc) => Matrix.makeMatrix(acc.length, inc[0].length, (ix, jx) => Matrix.sum(acc[ix].map((k, kx) => k * inc[kx][jx]))), Matrix.deepClone(matrices[0])),
    matrixTrans: (matrix) => Matrix.makeMatrix(...Matrix.shifter(Matrix.matrixSize(matrix), 1), (i, j) => matrix[j][i]),
}
