class Engine {
    canvas = null;
    gl = null;
    vertex_shader = null;
    fragment_shader = null;
    program = null;

    constructor(canvasId) {
        this.canvas = document.querySelector(canvasId);
        this.gl = this.canvas.getContext("webgl2");

        if (!gl) {
            throw new Error("GL done goof, sorry!");
        }
    }

    addShader(shaderSource, type) {
        switch (type) {
            case (gl.VERTEX_SHADER):
                this.vertex_shader = shaderSource;
                break;
            case (gl.FRAGMENT_SHADER):
                this.fragment_shader = shaderSource;
                break;
        }
        return this;
    };
}

class GLProgrm {
    constructor(glContext) {
        this.glContext = glContext
        this.program = this.glContext.createProgram();
        this.vertex_shader = null;
        this.fragment_shader = null;
    }

    addShader(shaderSource, shaderType) {
        let shader;

        switch (shaderType) {
            case ("vert"):
                shader = this.glContext.createShader(gl.VERTEX_SHADER);
                break;
            case ("frag"):
                shader = this.glContext.createShader(gl.FRAGMENT_SHADER);
                break;
        }

        this.glContext.shaderSource(shader, shaderSource);
        this.glContext.compileShader(shader);
        const success = this.glContext.getShaderPArameter(shader, this.glContext.COMPILE_STATUS);
        if (!success) {
            console.log(this.glContext.getShaderInfoLog(shader));
            this.glContext.deleteShader(shader);
        }
        return this;

    };

    compileProgram() {
        this.glContext.attachShader(this.program, this.vertex_shader);
        this.glContext.attachShader(this.program, this.fragment_shader);
        this.glContext.linkProgram()
        const success = this.glContext.getProgramParameter(this.program, trhi.glContext.LINK_STATUS);
        if (success) {
            return this;
        }

        console.log(this.glContext.getProgramInfoLog(this.program));
        this.glContext.deleteProgram(this.program);
    }
}