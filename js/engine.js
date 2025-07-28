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

class Engine {
    canvas = null;
    gl = null;
    vertex_shader = null;
    fragment_shader = null;
    translation = [0, 0, -1000];
    rotation = [
        TrigOps.degToRad(30),
        TrigOps.degToRad(-20),
        TrigOps.degToRad(0),
    ];
    // scale = [1, 1, 1];
    positionAttributeLocation;
    colorAttributeLocation;
    matrixLocation;

    fieldOfViewRadians = TrigOps.degToRad(60);

    lastPos = null;
    moving = false;
    movementType = null;
    panKeyHold = false;

    constructor(canvasId) {
        this.canvas = document.querySelector(canvasId);
        this.gl = this.canvas.getContext("webgl2");

        if (!this.gl) {
            throw new Error("GL done goof, sorry!");
        }
        // this.TRS = new TRS();
    }

    setEventListeners() {
        this.gl.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            let zoom =
                TrigOps.radToDeg(this.fieldOfViewRadians) + e.deltaY * -0.1;
            zoom = Math.min(Math.max(30, zoom), 120);

            this.fieldOfViewRadians = TrigOps.degToRad(zoom);
        });

        this.gl.canvas.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (this.panKeyHold) {
                this.movementType = "pan";
            }
            if (this.movementType === null) {
                this.movementType = "rotate";
            }
            this.startRotateOrPanCamera(e);
        });

        window.addEventListener("keydown", (e) => {
            // e.preventDefault();
            if (e.key === "Alt" && !this.panKeyHold) {
                this.panKeyHold = true;
                this.movementType = "pan";
            }
        });

        window.addEventListener("mouseup", () => {
            this.stopRotateOrPanCamera();
        });
        window.addEventListener("keyup", (e) => {
            if (e.key === "Alt" && this.panKeyHold) {
                this.panKeyHold = false;
                this.movementType = "rotate";
            }
        });

        window.addEventListener("mousemove", (e) => {
            this.rotateOrPanCamera(e);
        });

        this.gl.canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            this.startRotateOrPanCamera(e.touches[0]);
        });
        window.addEventListener("touchend", (e) => {
            this.stopRotateOrPanCamera(e.touches[0]);
        });
        window.addEventListener("touchmove", (e) => {
            this.rotateOrPanCamera(e.touches[0]);
        });
    }

    startRotateOrPanCamera(e) {
        this.lastPos = this.getRelativeMousePosition(e);
        this.moving = true;
    }

    rotateOrPanCamera(e) {
        if (this.moving) {
            const pos = this.getRelativeMousePosition(e);
            const size = [4 / this.gl.canvas.width, 4 / this.gl.canvas.height];

            // These 2 need to be replaced by math.js
            function sub(a, ...args) {
                const n = a.slice();
                [...args].forEach((p) => {
                    n[0] -= p[0];
                    n[1] -= p[1];
                });
                return n;
            }

            function mult(a, s) {
                if (Array.isArray(s)) {
                    let t = s;
                    s = a;
                    a = t;
                }
                if (Array.isArray(s)) {
                    return [a[0] * s[0], a[1] * s[1]];
                } else {
                    return [a[0] * s, a[1] * s];
                }
            }

            const delta = mult(sub(this.lastPos, pos), size);

            this.lastPos = pos;

            switch (this.movementType) {
                case "rotate":
                    this.rotation[0] += delta[1] * 5;
                    this.rotation[1] += delta[0] * 5;
                    break;

                case "pan":
                    this.translation[0] += delta[0] * -500;
                    this.translation[1] += delta[1] * 500;
                    break;
            }
        }
    }

    stopRotateOrPanCamera() {
        this.moving = false;
        this.movementType = null;
        this.lastPos = null;
    }

    getRelativeMousePosition(e) {
        const rect = this.gl.canvas.getBoundingClientRect();
        const x =
            ((e.clientX - rect.left) / (rect.right - rect.left)) *
            this.gl.canvas.width;
        const y =
            ((e.clientY - rect.top) / (rect.bottom - rect.top)) *
            this.gl.canvas.height;
        return [
            (x - this.gl.canvas.width / 2) / window.devicePixelRatio,
            (y - this.gl.canvas.height / 2) / window.devicePixelRatio,
        ];
    }

    Update() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;

        const projectionMatrix = MatrixOps.Create.perspective(
            this.fieldOfViewRadians,
            aspect,
            1,
            2000
        );

        // Compute the camera's matrix using look at.
        // Camera does nothing for now
        const cameraPosition = [0, 0, 100];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        const cameraMatrix = MatrixOps.Create.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        const viewMatrix = inverse(cameraMatrix);

        const viewProjectionMatrix = multiply(projectionMatrix, viewMatrix);

        this.matrix = translate(
            viewProjectionMatrix,
            this.translation[0],
            this.translation[1],
            this.translation[2]
        );

        this.matrix = MatrixOps.Rotate.X(this.matrix, this.rotation[0]);
        this.matrix = MatrixOps.Rotate.Y(this.matrix, this.rotation[1]);
        this.matrix = MatrixOps.Rotate.Z(this.matrix, this.rotation[2]);
    }
    Draw(program) {
        resizeCanvasToDisplaySize(this.gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear the canvas
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // turn on depth testing
        this.gl.enable(this.gl.DEPTH_TEST);

        // tell webgl to cull faces
        this.gl.enable(this.gl.CULL_FACE);

        // Create a vertex array object (attribute state)
        let vao = this.gl.createVertexArray();
        // Bind the attribute/buffer set we want.
        this.gl.bindVertexArray(vao);

        // Create a position and color buffers
        const positionBuffer = this.gl.createBuffer();
        const colorBuffer = this.gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        //
        // THIS IS FOR TESTING
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                // left column front
                0, 0, 0, 0, 0, 200, 0, 0, 0, 0, 200, 0, 0, 0, 0, 200, 0, 0,
            ]),
            this.gl.STATIC_DRAW
        );
        //
        //

        // Tell the attributes how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 3; // 3 components per iteration
        let type = this.gl.FLOAT; // the data is 32bit floats
        let normalize = false; // don't normalize the data
        const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0; // start at the beginning of the buffer

        this.gl.vertexAttribPointer(
            this.positionAttributeLocation,
            size,
            type,
            normalize,
            stride,
            offset
        );
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);

        // bind color buffer and set the data
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);

        //
        // THIS IS FOR TESTING
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Uint8Array([
                250, 0, 0, 250, 0, 0, 0, 0, 250, 0, 0, 250, 0, 250, 0, 0, 250,
                0,
            ]),
            this.gl.STATIC_DRAW
        );

        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER), size, stride and offset are reused.
        type = this.gl.UNSIGNED_BYTE; // the data is 8bit unsigned bytes
        normalize = true; // convert from 0-255 to 0.0-1.0

        this.gl.vertexAttribPointer(
            this.colorAttributeLocation,
            size,
            type,
            normalize,
            stride,
            offset
        );
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);

        this.gl.useProgram(program);
        this.gl.uniformMatrix4fv(this.matrixLocation, false, this.matrix);

        // Draw the geometry.
        const primitiveType = this.gl.LINES;
        offset = 0;
        const count = 6;
        this.gl.drawArrays(primitiveType, offset, count);
    }
}

class GLProgram {
    constructor(glContext) {
        this.glContext = glContext;
        this.vertex_shader = null;
        this.fragment_shader = null;
    }

    addShader(shaderSource, shaderType) {
        let shader;

        switch (shaderType) {
            case "vert":
                shader = this.glContext.createShader(
                    this.glContext.VERTEX_SHADER
                );
                break;
            case "frag":
                shader = this.glContext.createShader(
                    this.glContext.FRAGMENT_SHADER
                );
                break;
        }

        this.glContext.shaderSource(shader, shaderSource);
        this.glContext.compileShader(shader);
        const success = this.glContext.getShaderParameter(
            shader,
            this.glContext.COMPILE_STATUS
        );
        if (!success) {
            console.log(this.glContext.getShaderInfoLog(shader));
            this.glContext.deleteShader(shader);
        }
        switch (shaderType) {
            case "vert":
                this.vertex_shader = shader;
                break;
            case "frag":
                this.fragment_shader = shader;
                shader = this.glContext.createShader(
                    this.glContext.FRAGMENT_SHADER
                );
                break;
        }
        return this;
    }

    compileProgram() {
        this.program = this.glContext.createProgram();
        this.glContext.attachShader(this.program, this.vertex_shader);
        this.glContext.attachShader(this.program, this.fragment_shader);
        this.glContext.linkProgram(this.program);
        const success = this.glContext.getProgramParameter(
            this.program,
            this.glContext.LINK_STATUS
        );
        if (!success) {
            console.log(this.glContext.getProgramInfoLog(this.program));
            this.glContext.deleteProgram(this.program);
        }
        return this;
    }
}
