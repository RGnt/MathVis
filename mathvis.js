"use strict";

// import { TrigOps } from "./math.js";
// import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { Engine, GLProgram } from "./engine.js";

const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a varying the color to the fragment shader
out vec4 v_color;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

// the varied color passed from the vertex shader
in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

const engine = new Engine("#canvas");

function main() {
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

    setEventListeners();

    const gameLoop = () => {
        let matrix = engine.Update();
        engine.Draw(program, matrix);
        requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
}

main();

function setEventListeners() {
    //     // THIS SHOULD ACTUALLY ZOOM IN OR OUT INSTEAD OF SCALING

    engine.gl.canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        console.log("event caught");
        console.log(e.deltaY);

        engine.zooming = true;
        engine.fieldOfView += Math.min(
            Math.max(60, engine.fieldOfView + e.deltaY * -0.1),
            120
        );
    });
}
// let lastPos;
// let moving = false;

// engine.gl.canvas.addEventListener("mousedown", (e) => {
//     e.preventDefault();
//     startRotateCamera(e);
// });

// window.addEventListener("mouseup", stopRotateCamera);
// window.addEventListener("mousemove", rotateCamera);

// engine.gl.canvas.addEventListener("touchstart", (e) => {
//     e.preventDefault();
//     startRotateCamera(e.touches[0]);
// });
// window.addEventListener("touchend", (e) => {
//     stopRotateCamera(e.touches[0]);
// });
// window.addEventListener("touchmove", (e) => {
//     rotateCamera(e.touches[0]);
// });

// function startRotateCamera(e) {
//     lastPos = getRelativeMousePosition(engine.gl.canvas, e);
//     moving = true;
// }

// function rotateCamera(e) {
//     if (moving) {
//         const pos = getRelativeMousePosition(engine.gl.canvas, e);
//         const size = [
//             4 / engine.gl.canvas.width,
//             4 / engine.gl.canvas.height,
//         ];
//         const delta = v2.mult(v2.sub(lastPos, pos), size);

//         // this is bad but it works for a basic case so phffttt
//         worldMatrix = m4.multiply(m4.xRotation(delta[1] * 5), worldMatrix);
//         worldMatrix = m4.multiply(m4.yRotation(delta[0] * 5), worldMatrix);

//         lastPos = pos;

//         engine.Draw(program, matrixLocation);
//     }
// }

// function stopRotateCamera() {
//     moving = false;
// }

// function lerp(a, b, t) {
//     return a + (b - a) * t;
// }

// function getRelativeMousePosition(canvas, e) {
//     const rect = canvas.getBoundingClientRect();
//     const x =
//         ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
//     const y =
//         ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
//     return [
//         (x - canvas.width / 2) / window.devicePixelRatio,
//         (y - canvas.height / 2) / window.devicePixelRatio,
//     ];
// }
