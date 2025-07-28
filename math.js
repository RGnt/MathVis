class Vector {
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

const VectorOps = {
    len: (vec) => Math.hypot(...vec),
    sub: (vec1, vec2) => vec1.map((dim, i) => dim - vec2[i]),
    normalize: (vec) => VectorOps.len(vec) > 0.0000001 ? vec.map(dim => dim / VectorOps.len(vec)) : vec,
    cross: (vec1, vec2) => [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0]
    ],
}

const MatrixOps = {
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
    Create: {
        perspective: (fovRad, aspect, near, far) => {
            const fov = Math.tan(Math.PI * 0.5 - 0.5 * fovRad);
            const rangeInv = 1.0 / (near - far);

            return [
                fov / aspect, 0, 0, 0,
                0, fov, 0, 0,
                0, 0, (near + far) * rangeInv, -1,
                0, 0, near * far * rangeInv * 2, 0
            ];
        },
        lookAt: (camPos, tar, up) => {

            const zAxis = VectorOps.normalize(VectorOps.sub(camPos, tar));
            const xAxis = VectorOps.normalize(VectorOps.cross(up, zAxis));
            const yAxis = VectorOps.normalize(VectorOps.cross(zAxis, xAxis));
            return [
                ...xAxis, 0,
                ...yAxis, 0,
                ...zAxis, 0,
                ...camPos, 1
            ]
        }
    },
    Rotate: {
        X: (mat, radAng) => {
            const cosine = Math.cos(radAng);
            const sine = Math.sin(radAng);

            return [
                mat[0], mat[1], mat[2], mat[3],
                cosine * mat[4] + sine * mat[8],
                cosine * mat[5] + sine * mat[9],
                cosine * mat[6] + sine * mat[10],
                cosine * mat[7] + sine * mat[11],
                cosine * mat[8] - sine * mat[4],
                cosine * mat[9] - sine * mat[5],
                cosine * mat[10] - sine * mat[6],
                cosine * mat[11] - sine * mat[7],
                mat[12], mat[13], mat[14], mat[15]
            ];
        },
        Y: (mat, radAng) => {
            const cosine = Math.cos(radAng);
            const sine = Math.sin(radAng);

            return [
                cosine * mat[0] - sine * mat[8],
                cosine * mat[1] - sine * mat[9],
                cosine * mat[2] - sine * mat[10],
                cosine * mat[3] - sine * mat[11],
                mat[4], mat[5], mat[6], mat[7],
                cosine * mat[8] + sine * mat[0],
                cosine * mat[9] + sine * mat[1],
                cosine * mat[10] + sine * mat[2],
                cosine * mat[11] + sine * mat[3],
                mat[12], mat[13], mat[14], mat[15]
            ]
        },
        Z: (mat, radAng) => {
            const cosine = Math.cos(radAng);
            const sine = Math.sin(radAng);
            return [
                cosine * mat[0] + sine * mat[4],
                cosine * mat[1] + sine * mat[5],
                cosine * mat[2] + sine * mat[6],
                cosine * mat[3] + sine * mat[7],

                cosine * mat[4] - sine * mat[0],
                cosine * mat[5] - sine * mat[1],
                cosine * mat[6] - sine * mat[2],
                cosine * mat[7] - sine * mat[3],
                mat[8], mat[9], mat[10], mat[11],
                mat[12], mat[13], mat[14], mat[15]
            ]
        },
    }
};

const TrigOps = {
    radToDeg: (r) => (r * 180) / Math.PI,
    degToRad: (d) => (d * Math.PI) / 180,
};
