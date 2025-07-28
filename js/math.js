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
    arr2mat: (len, wid, arr) => MatrixOps.makeArray(len).map((i) => arr.slice(i * wid, i * wid + wid)),
    matrixMap: (matrix, cb) => {
        console.log(matrix[0].map(i => i));
        return MatrixOps.deepClone(matrix).map((i, ix) =>
            i.map((j, jx) => cb({ i, ix, j, jx, matrix }))
        )
    },
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

// import { MatrixOps, TrigOps } from "./math.js";
// import { TRS } from "./scenegraph.js";

/**
   * Resize a canvas to match the size its displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [multiplier] amount to multiply by.
   *    Pass in window.devicePixelRatio for native pixels.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:webgl-utils
   */
function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function translate(m, tx, ty, tz) {
    // This is the optimized version of
    // return multiply(m, translation(tx, ty, tz), dst);
    dst = MatrixOps.makeArray(16);

    var m00 = m[0];
    var m01 = m[1];
    var m02 = m[2];
    var m03 = m[3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];

    if (m !== dst) {
        dst[0] = m00;
        dst[1] = m01;
        dst[2] = m02;
        dst[3] = m03;
        dst[4] = m10;
        dst[5] = m11;
        dst[6] = m12;
        dst[7] = m13;
        dst[8] = m20;
        dst[9] = m21;
        dst[10] = m22;
        dst[11] = m23;
    }

    dst[12] = m00 * tx + m10 * ty + m20 * tz + m30;
    dst[13] = m01 * tx + m11 * ty + m21 * tz + m31;
    dst[14] = m02 * tx + m12 * ty + m22 * tz + m32;
    dst[15] = m03 * tx + m13 * ty + m23 * tz + m33;

    return dst;
}

function inverse(m) {
    dst = MatrixOps.makeArray(16);
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 =
        tmp_0 * m11 +
        tmp_3 * m21 +
        tmp_4 * m31 -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 =
        tmp_1 * m01 +
        tmp_6 * m21 +
        tmp_9 * m31 -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 =
        tmp_2 * m01 +
        tmp_7 * m11 +
        tmp_10 * m31 -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 =
        tmp_5 * m01 +
        tmp_8 * m11 +
        tmp_11 * m21 -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    dst[0] = d * t0;
    dst[1] = d * t1;
    dst[2] = d * t2;
    dst[3] = d * t3;
    dst[4] =
        d *
        (tmp_1 * m10 +
            tmp_2 * m20 +
            tmp_5 * m30 -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    dst[5] =
        d *
        (tmp_0 * m00 +
            tmp_7 * m20 +
            tmp_8 * m30 -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    dst[6] =
        d *
        (tmp_3 * m00 +
            tmp_6 * m10 +
            tmp_11 * m30 -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    dst[7] =
        d *
        (tmp_4 * m00 +
            tmp_9 * m10 +
            tmp_10 * m20 -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    dst[8] =
        d *
        (tmp_12 * m13 +
            tmp_15 * m23 +
            tmp_16 * m33 -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    dst[9] =
        d *
        (tmp_13 * m03 +
            tmp_18 * m23 +
            tmp_21 * m33 -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    dst[10] =
        d *
        (tmp_14 * m03 +
            tmp_19 * m13 +
            tmp_22 * m33 -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    dst[11] =
        d *
        (tmp_17 * m03 +
            tmp_20 * m13 +
            tmp_23 * m23 -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    dst[12] =
        d *
        (tmp_14 * m22 +
            tmp_17 * m32 +
            tmp_13 * m12 -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    dst[13] =
        d *
        (tmp_20 * m32 +
            tmp_12 * m02 +
            tmp_19 * m22 -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    dst[14] =
        d *
        (tmp_18 * m12 +
            tmp_23 * m32 +
            tmp_15 * m02 -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    dst[15] =
        d *
        (tmp_22 * m22 +
            tmp_16 * m02 +
            tmp_21 * m12 -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

    return dst;
}

function multiply(a, b) {
    dst = MatrixOps.makeArray(16);
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    dst[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    dst[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    dst[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    dst[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    dst[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    dst[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    dst[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    dst[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    dst[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    dst[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
    return dst;
}
