class Engine {
    canvas = null;
    gl = null;
    vertex_shader = null;
    fragment_shader = null;
    program = null;

    constructor(canvasId) {
        this.canvas = document.querySelector(canvasId);
        this.gl = this.canvas.getContext("webgl2");

        if (!this.gl) {
            throw new Error("GL done goof, sorry!");
        }
    }
}

class GLProgram {
    constructor(glContext) {
        this.glContext = glContext
        this.vertex_shader = null;
        this.fragment_shader = null;
    }

    addShader(shaderSource, shaderType) {
        let shader;

        switch (shaderType) {
            case ("vert"):
                shader = this.glContext.createShader(this.glContext.VERTEX_SHADER);
                break;
            case ("frag"):
                shader = this.glContext.createShader(this.glContext.FRAGMENT_SHADER);
                break;
        }

        this.glContext.shaderSource(shader, shaderSource);
        this.glContext.compileShader(shader);
        const success = this.glContext.getShaderParameter(shader, this.glContext.COMPILE_STATUS);
        if (!success) {
            console.log(this.glContext.getShaderInfoLog(shader));
            this.glContext.deleteShader(shader);
        }
        switch (shaderType) {
            case ("vert"):
                this.vertex_shader = shader;
                break;
                case ("frag"):
                this.fragment_shader = shader;
                shader = this.glContext.createShader(this.glContext.FRAGMENT_SHADER);
                break;
        }
        return this;
    };

    compileProgram() {
        this.program = this.glContext.createProgram();
        this.glContext.attachShader(this.program, this.vertex_shader);
        this.glContext.attachShader(this.program, this.fragment_shader);
        this.glContext.linkProgram(this.program)
        const success = this.glContext.getProgramParameter(this.program, this.glContext.LINK_STATUS);
        if (!success) {
            console.log(this.glContext.getProgramInfoLog(this.program));
            this.glContext.deleteProgram(this.program);
        }
        return this;
    }
}