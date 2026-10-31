import{a as e}from"./rolldown-runtime-BWaJ3C7D.js";import{t}from"./canvas-sketch.umd-umRQusgK.js";var n=e(t(),1),r={dimensions:[2048,2048],exportPixelRatio:2,context:`webgl2`,animate:!0,attributes:{alpha:!1,antialias:!0}},i=`#version 300 es
precision highp float;

in vec2 position;
out vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`,a=`#version 300 es
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
`;function o(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);throw e.deleteShader(r),Error(`Shader compilation failed:\n${t}`)}return r}function s(e){let t=o(e,e.VERTEX_SHADER,i),n=o(e,e.FRAGMENT_SHADER,a),r=e.createProgram();if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),e.deleteShader(t),e.deleteShader(n),!e.getProgramParameter(r,e.LINK_STATUS)){let t=e.getProgramInfoLog(r);throw e.deleteProgram(r),Error(`Program linking failed:\n${t}`)}return r}var c=({gl:e})=>{let t=s(e),n=e.getAttribLocation(t,`position`),r=e.getUniformLocation(t,`time`),i=e.getUniformLocation(t,`aspect`),a=e.createVertexArray();e.bindVertexArray(a);let o=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(n),e.vertexAttribPointer(n,2,e.FLOAT,!1,0,0),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),{resize({pixelRatio:n,viewportWidth:r,viewportHeight:a}){e.viewport(0,0,Math.round(r*n),Math.round(a*n)),e.useProgram(t),e.uniform1f(i,r/a),e.useProgram(null)},render({time:n,viewportWidth:o,viewportHeight:s,pixelRatio:c=1}){e.viewport(0,0,Math.round(o*c),Math.round(s*c)),e.clearColor(.95,.95,.95,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(t),e.bindVertexArray(a),e.uniform1f(r,n),e.uniform1f(i,o/s),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.bindVertexArray(null),e.useProgram(null)},unload(){e.deleteBuffer(o),e.deleteVertexArray(a),e.deleteProgram(t)}}};function l(){return(0,n.default)(c,{...r,parent:document.getElementById(`sketch-workspace`)||document.body,scaleToFit:!0,scaleToFitPadding:36})}export{l as start};
//# sourceMappingURL=06-shader-BkX2Usmm.js.map