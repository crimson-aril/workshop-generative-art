import{a as e}from"./rolldown-runtime-BWaJ3C7D.js";import{t}from"./canvas-sketch.umd-umRQusgK.js";import{T as n,_ as r,b as i,c as a,f as o,t as s,w as c}from"./three.module-C_TJGL5M.js";var l=e(t(),1),u={dimensions:[2048,2048],animate:!0,context:`webgl2`,attributes:{antialias:!0,alpha:!0}},d=`

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(
    1.0 / 6.0,
    1.0 / 3.0
  );

  const vec4 D = vec4(
    0.0,
    0.5,
    1.0,
    2.0
  );

  vec3 i = floor(v + dot(v, C.yyy));

  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;

  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);

  vec4 p = permute(
    permute(
      permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0)
      ) +
      i.y + vec4(0.0, i1.y, i2.y, 1.0)
    ) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0)
  );

  float n_ = 0.142857142857;

  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;

  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;

  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(
    vec4(
      dot(p0, p0),
      dot(p1, p1),
      dot(p2, p2),
      dot(p3, p3)
    )
  );

  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(
    0.6 - vec4(
      dot(x0, x0),
      dot(x1, x1),
      dot(x2, x2),
      dot(x3, x3)
    ),
    0.0
  );

  m = m * m;

  return 42.0 * dot(
    m * m,
    vec4(
      dot(p0, x0),
      dot(p1, x1),
      dot(p2, x2),
      dot(p3, x3)
    )
  );
}


vec3 hsl2rgb(float h, float s, float l) {
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  float hp = h * 6.0;
  float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));

  vec3 rgb;

  if (hp < 1.0) {
    rgb = vec3(c, x, 0.0);
  } else if (hp < 2.0) {
    rgb = vec3(x, c, 0.0);
  } else if (hp < 3.0) {
    rgb = vec3(0.0, c, x);
  } else if (hp < 4.0) {
    rgb = vec3(0.0, x, c);
  } else if (hp < 5.0) {
    rgb = vec3(x, 0.0, c);
  } else {
    rgb = vec3(c, 0.0, x);
  }

  return rgb + vec3(l - c * 0.5);
}


uniform float time;
uniform float aspect;

in vec2 vUv;

out vec4 fragColor;

float circle(vec2 point) {
  vec2 pos = vUv - point;
  pos.x *= aspect;

  return length(pos);
}

void main() {
  // Original circular mask.
  float distFromCenter = circle(vec2(0.5));

  float mask = smoothstep(
    0.25,
    0.2475,
    distFromCenter
  );

  // Original aspect-corrected coordinates.
  vec2 q = vUv;
  q.x *= aspect;

  // Original two-layer animated 3D simplex noise.
  float d = 0.0;

  d += (
    snoise(vec3(q * 1.0, time * 0.5)) * 0.5 + 0.5
  ) * 0.5;

  d += (
    snoise(vec3(q * 0.25 + 0.5, time * 0.25)) * 0.5 + 0.5
  ) * 0.5;

  d = clamp(d, 0.0, 1.0);

  // Original animated HSL color.
  vec3 color = hsl2rgb(
    mod(time * 0.05, 1.0) + (0.5 + d * 0.5),
    0.5,
    0.5 + d * 0.25
  );

  fragColor = vec4(color, mask);
}
`,f=({context:e})=>{let t=new s({context:e,antialias:!0,alpha:!0});t.setClearColor(15921906,1);let l=new c,u=new r(-1,1,1,-1,.1,10);u.position.z=1;let f=new i(2,2),p=new n({glslVersion:a,vertexShader:`

      out vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position = vec4(position, 1.0);
      }
    `,fragmentShader:d,uniforms:{time:{value:0},aspect:{value:1}},transparent:!0,depthTest:!1,depthWrite:!1}),m=new o(f,p);return l.add(m),{resize:({pixelRatio:e,viewportWidth:n,viewportHeight:r})=>{t.setPixelRatio(e),t.setSize(n,r),p.uniforms.aspect.value=n/r},render:({time:e})=>{p.uniforms.time.value=e,t.render(l,u)},unload:()=>{f.dispose(),p.dispose(),t.dispose()}}};function p(){return(0,l.default)(f,{...u,parent:document.getElementById(`sketch-workspace`)||document.body,scaleToFit:!0,scaleToFitPadding:36})}export{p as start};
//# sourceMappingURL=07-shader-noise-CF6HXVZv.js.map