import canvasSketch from "canvas-sketch";

const settings = {
  dimensions: [2048, 2048],
  exportPixelRatio: 2,
  context: "webgl2",
  animate: true,
  attributes: {
    alpha: false,
    antialias: true
  },
};

const vert = `#version 300 es
precision highp float;

in vec2 position;
out vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const frag = `#version 300 es
precision highp float;

uniform float time;
uniform float aspect;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 center = vUv - vec2(0.5);
  center.x *= aspect;

  float dist = length(center);

  // Preserve the original circular mask.
  float mask = 1.0 - smoothstep(0.2, 0.2025, dist);

  vec3 color = 0.5 + 0.5 * cos(
    time + vUv.xyx + vec3(0.0, 2.0, 4.0)
  );

  // Composite over the original light-gray background.
  vec3 background = vec3(0.95);

  outColor = vec4(
    mix(background, color, mask),
    1.0
  );
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed:\n${message}`);
  }

  return shader;
}

function createProgram(gl) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vert);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, frag);

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking failed:\n${message}`);
  }

  return program;
}

const sketch = ({ gl }) => {
  const program = createProgram(gl);

  const positionLocation = gl.getAttribLocation(program, "position");
  const timeLocation = gl.getUniformLocation(program, "time");
  const aspectLocation = gl.getUniformLocation(program, "aspect");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      gl.viewport(
        0,
        0,
        Math.round(viewportWidth * pixelRatio),
        Math.round(viewportHeight * pixelRatio)
      );

      // Activate the program before updating its uniforms.
      gl.useProgram(program);
      gl.uniform1f(aspectLocation, viewportWidth / viewportHeight);
      gl.useProgram(null);
    },

    render({ time, viewportWidth, viewportHeight, pixelRatio = 1 }) {
      gl.viewport(
        0,
        0,
        Math.round(viewportWidth * pixelRatio),
        Math.round(viewportHeight * pixelRatio)
      );

      gl.clearColor(0.95, 0.95, 0.95, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform1f(timeLocation, time);
      gl.uniform1f(aspectLocation, viewportWidth / viewportHeight);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.bindVertexArray(null);
      gl.useProgram(null);
    },

    unload() {
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
};

export function start() {
  return canvasSketch(sketch, {
    ...settings,
    parent: document.getElementById('sketch-workspace') || document.body,
    scaleToFit: true,
    scaleToFitPadding: 36,
  });
}
