import { TrigOps } from "./math.js";
// import { TRS } from "./scenegraph.js";

export class Engine {
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

    zooming = false;
    fieldOfViewRadians = TrigOps.degToRad(60);

    constructor(canvasId) {
        this.canvas = document.querySelector(canvasId);
        this.gl = this.canvas.getContext("webgl2");
        this.lastTime = Date.now();

        if (!this.gl) {
            throw new Error("GL done goof, sorry!");
        }
        // this.TRS = new TRS();
    }

    Update() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;

        const projectionMatrix = m4.perspective(
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
        const cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        const viewMatrix = m4.inverse(cameraMatrix);

        const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
        this.matrix = m4.translate(
            viewProjectionMatrix,
            this.translation[0],
            this.translation[1],
            this.translation[2]
        );
        this.matrix = m4.xRotate(this.matrix, this.rotation[0]);
        this.matrix = m4.yRotate(this.matrix, this.rotation[1]);
        this.matrix = m4.zRotate(this.matrix, this.rotation[2]);
    }
    Draw(program) {
        webglUtils.resizeCanvasToDisplaySize(this.gl.canvas);

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

export class GLProgram {
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
