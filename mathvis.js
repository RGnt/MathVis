"use strict";

var vertexShaderSource = `#version 300 es

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

var fragmentShaderSource = `#version 300 es

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

  let worldMatrix = m4.identity();
  //   let projectionMatrix;
  //   let extents;
  //   let bufferInfo;
  //   let vao;
  const program = new GLProgram(engine.gl).addShader(vertexShaderSource, "vert").addShader(fragmentShaderSource, "frag").compileProgram().program;


  // look up where the vertex data needs to go.
  var positionAttributeLocation = engine.gl.getAttribLocation(program, "a_position");
  var colorAttributeLocation = engine.gl.getAttribLocation(program, "a_color");

  // look up uniform locations
  var matrixLocation = engine.gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  var positionBuffer = engine.gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = engine.gl.createVertexArray();

  // and make it the one we're currently working with
  engine.gl.bindVertexArray(vao);

  // Turn on the attribute
  engine.gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  engine.gl.bindBuffer(engine.gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  setGeometry(engine.gl);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = engine.gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  engine.gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  // create the color buffer, make it the current ARRAY_BUFFER
  // and copy in the color values
  var colorBuffer = engine.gl.createBuffer();
  engine.gl.bindBuffer(engine.gl.ARRAY_BUFFER, colorBuffer);
  setColors(engine.gl);

  // Turn on the attribute
  engine.gl.enableVertexAttribArray(colorAttributeLocation);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = engine.gl.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  engine.gl.vertexAttribPointer(
    colorAttributeLocation, size, type, normalize, stride, offset);


  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  // First let's make some variables
  // to hold the translation,

  console.log(engine.gl.canvas.width)
  var translation = [canvas.clientWidth / 2, canvas.clientHeight / 2, 0];
  var rotation = [degToRad(30), degToRad(315), degToRad(0)];
  var scale = [1, 1, 1];

  drawScene();

  //   // Setup a ui.
  //   webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), max: engine.gl.canvas.width });
  //   webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), max: engine.gl.canvas.height});
  //   webglLessonsUI.setupSlider("#z",      {value: translation[2], slide: updatePosition(2), max: engine.gl.canvas.height});
  //   webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360});
  //   webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360});
  //   webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360});
  //   webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: 0.1, max: 5, step: 0.01, precision: 2});
  //   webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: 0.1, max: 5, step: 0.01, precision: 2});
  //   webglLessonsUI.setupSlider("#scaleZ", {value: scale[2], slide: updateScale(2), min: 0.1, max: 5, step: 0.01, precision: 2});

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateRotation(index) {
    return function (event, ui) {
      var angleInDegrees = ui.value;
      var angleInRadians = degToRad(angleInDegrees);
      rotation[index] = angleInRadians;
      drawScene();
    };
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  // Draw the scene.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(engine.gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    engine.gl.viewport(0, 0, engine.gl.canvas.width, engine.gl.canvas.height);

    // Clear the canvas
    engine.gl.clearColor(0, 0, 0, 0);
    engine.gl.clear(engine.gl.COLOR_BUFFER_BIT | engine.gl.DEPTH_BUFFER_BIT);

    // turn on depth testing
    engine.gl.enable(engine.gl.DEPTH_TEST);

    // tell webgl to cull faces
    engine.gl.enable(engine.gl.CULL_FACE);

    // Tell it to use our program (pair of shaders)
    engine.gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    engine.gl.bindVertexArray(vao);

    // Compute the matrix
    var matrix = m4.orthographic(0, engine.gl.canvas.clientWidth, 0, engine.gl.canvas.clientHeight, 400, -400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
    matrix = m4.multiply(matrix, worldMatrix);

    // Set the matrix.
    engine.gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = engine.gl.LINES;
    var offset = 0;
    var count = 6;
    engine.gl.drawArrays(primitiveType, offset, count);
  }

  // THIS SHOULD ACTUALLY ZOOM IN OR OUT INSTEAD OF SCALING
  engine.gl.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale[0] = Math.min(Math.max(0.1, scale[0] + e.deltaY * -0.01), 5);
    scale[1] = Math.min(Math.max(0.1, scale[1] + e.deltaY * -0.01), 5);
    scale[2] = Math.min(Math.max(0.1, scale[2] + e.deltaY * -0.01), 5);
    drawScene();
  })

  engine.gl.canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startRotateCamera(e);
  });
  window.addEventListener('mouseup', stopRotateCamera);
  window.addEventListener('mousemove', rotateCamera);
  engine.gl.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startRotateCamera(e.touches[0]);
  });
  window.addEventListener('touchend', (e) => {
    stopRotateCamera(e.touches[0]);
  });
  window.addEventListener('touchmove', (e) => {
    rotateCamera(e.touches[0]);
  });

  let lastPos;
  let moving;
  function startRotateCamera(e) {
    lastPos = getRelativeMousePosition(engine.gl.canvas, e);
    moving = true;
  }

  function rotateCamera(e) {
    if (moving) {
      const pos = getRelativeMousePosition(engine.gl.canvas, e);
      const size = [4 / engine.gl.canvas.width, 4 / engine.gl.canvas.height];
      const delta = v2.mult(v2.sub(lastPos, pos), size);

      // this is bad but it works for a basic case so phffttt
      worldMatrix = m4.multiply(m4.xRotation(delta[1] * 5), worldMatrix);
      worldMatrix = m4.multiply(m4.yRotation(delta[0] * 5), worldMatrix);

      lastPos = pos;

      drawScene();
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
    const x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    return [
      (x - canvas.width / 2) / window.devicePixelRatio,
      (y - canvas.height / 2) / window.devicePixelRatio,
    ];
  }
}

// Fill the current ARRAY_BUFFER buffer
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // left column front
      0, 0, 0,
      0, 0, 200,
      0, 0, 0,
      0, 200, 0,
      0, 0, 0,
      200, 0, 0,
    ]),
    gl.STATIC_DRAW);
}

// Fill the current ARRAY_BUFFER buffer with colors for the 'F'.
function setColors(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint8Array([
      250, 0, 0,
      250, 0, 0,
      0, 0, 250,
      0, 0, 250,
      0, 250, 0,
      0, 250, 0,
    ]),
    gl.STATIC_DRAW);
}


const v2 = (function () {
  // adds 1 or more v2s
  function add(a, ...args) {
    const n = a.slice();
    [...args].forEach(p => {
      n[0] += p[0];
      n[1] += p[1];
    });
    return n;
  }

  function sub(a, ...args) {
    const n = a.slice();
    [...args].forEach(p => {
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
      return [
        a[0] * s[0],
        a[1] * s[1],
      ];
    } else {
      return [a[0] * s, a[1] * s];
    }
  }

  function lerp(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];
  }

  function min(a, b) {
    return [
      Math.min(a[0], b[0]),
      Math.min(a[1], b[1]),
    ];
  }

  function max(a, b) {
    return [
      Math.max(a[0], b[0]),
      Math.max(a[1], b[1]),
    ];
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
    let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
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
}());



main();
