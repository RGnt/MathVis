"use strict";

import { TrigOps } from "./math.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";
import { Engine, GLProgram } from "./engine.js";

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

    const animationLoop = () => {
        engine.Update();
        engine.Draw(program);
        requestAnimationFrame(animationLoop);
    };

    requestAnimationFrame(animationLoop);
}

main();

function setEventListeners() {
    engine.gl.canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        console.log("event caught");
        console.log(e.deltaY);

        let zoom =
            TrigOps.radToDeg(engine.fieldOfViewRadians) + e.deltaY * -0.1;
        zoom = Math.min(Math.max(30, zoom), 120);
        console.log(zoom);

        engine.fieldOfViewRadians = TrigOps.degToRad(zoom);
    });

    let lastPos;
    let moving = false;

    engine.gl.canvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        startRotateCamera(e);
    });

    window.addEventListener("mouseup", stopRotateCamera);
    window.addEventListener("mousemove", rotateCamera);

    engine.gl.canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startRotateCamera(e.touches[0]);
    });
    window.addEventListener("touchend", (e) => {
        stopRotateCamera(e.touches[0]);
    });
    window.addEventListener("touchmove", (e) => {
        rotateCamera(e.touches[0]);
    });

    function startRotateCamera(e) {
        lastPos = getRelativeMousePosition(engine.gl.canvas, e);
        moving = true;
    }

    function rotateCamera(e) {
        if (moving) {
            const pos = getRelativeMousePosition(engine.gl.canvas, e);
            const size = [
                4 / engine.gl.canvas.width,
                4 / engine.gl.canvas.height,
            ];
            const delta = v2.mult(v2.sub(lastPos, pos), size);

            engine.rotation[0] += delta[1] * 5;
            engine.rotation[1] += delta[0] * 5;

            lastPos = pos;
        }
    }

    function stopRotateCamera() {
        moving = false;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function getRelativeMousePosition(canvas, e) {
        const rect = canvas.getBoundingClientRect();
        const x =
            ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
        const y =
            ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
        return [
            (x - canvas.width / 2) / window.devicePixelRatio,
            (y - canvas.height / 2) / window.devicePixelRatio,
        ];
    }
}
const v2 = (function () {
    // adds 1 or more v2s
    function add(a, ...args) {
        const n = a.slice();
        [...args].forEach((p) => {
            n[0] += p[0];
            n[1] += p[1];
        });
        return n;
    }

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

    function lerp(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }

    function min(a, b) {
        return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
    }

    function max(a, b) {
        return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    }

    // compute the distance squared between a and b
    function distanceSq(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        return dx * dx + dy * dy;
    }

    // compute the distance between a and b
    function distance(a, b) {
        return Math.sqrt(distanceSq(a, b));
    }

    // compute the distance squared from p to the line segment
    // formed by v and w
    function distanceToSegmentSq(p, v, w) {
        const l2 = distanceSq(v, w);
        if (l2 === 0) {
            return distanceSq(p, v);
        }
        let t =
            ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) /
            l2;
        t = Math.max(0, Math.min(1, t));
        return distanceSq(p, lerp(v, w, t));
    }

    // compute the distance from p to the line segment
    // formed by v and w
    function distanceToSegment(p, v, w) {
        return Math.sqrt(distanceToSegmentSq(p, v, w));
    }

    return {
        add: add,
        sub: sub,
        max: max,
        min: min,
        mult: mult,
        lerp: lerp,
        distance: distance,
        distanceSq: distanceSq,
        distanceToSegment: distanceToSegment,
        distanceToSegmentSq: distanceToSegmentSq,
    };
})();

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
