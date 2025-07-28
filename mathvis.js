"use strict";

// import { TrigOps } from "./math.js";
// import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
// import { Engine, GLProgram } from "./engine.js";

const engine = new Engine("#canvas");

function main() {
    const TPS = 1000 / 60;
    const FPS = 1000 / 60;
    let gameStart = true;

    // Create program from shaders
    const program = new GLProgram(engine.gl)
        .addShader(vertexShaderSource, "vert")
        .addShader(fragmentShaderSource, "frag")
        .compileProgram().program;

    engine.positionAttributeLocation = engine.gl.getAttribLocation(
        program,
        "a_position"
    );
    engine.colorAttributeLocation = engine.gl.getAttribLocation(
        program,
        "a_color"
    );
    engine.matrixLocation = engine.gl.getUniformLocation(program, "u_matrix");

    engine.setEventListeners();

    const gameLoop = () => {
        engine.Update();
        engine.Draw(program);

        window.requestAnimationFrame(gameLoop);
    }
    window.requestAnimationFrame(gameLoop);


}


main();
