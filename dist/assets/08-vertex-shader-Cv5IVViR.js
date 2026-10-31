import{a as e}from"./rolldown-runtime-BWaJ3C7D.js";import{t}from"./canvas-sketch.umd-umRQusgK.js";import{T as n,_ as r,c as i,f as a,s as o,t as s,w as c}from"./three.module-C_TJGL5M.js";var l=e(t(),1),u={dimensions:[2048,2048],animate:!0,context:`webgl2`,attributes:{antialias:!0}},d=`

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

float permute(float x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);

  vec4 p;
  vec4 s;

  p.xyz = floor(fract(j * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);

  s = vec4(lessThan(p, vec4(0.0)));

  p.xyz += (s.xyz * 2.0 - 1.0) * s.www;

  return p;
}

float snoise(vec4 v) {
  const vec2 C = vec2(
    0.138196601125011,
    0.309016994374947451
  );

  // First corner
  vec4 i = floor(v + dot(v, vec4(C.y)));
  vec4 x0 = v - i + dot(i, vec4(C.x));

  // Rank sorting
  vec4 i0;

  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);

  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // Offsets for the remaining corners
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);

  vec4 x1 = x0 - i1 + C.x;
  vec4 x2 = x0 - i2 + 2.0 * C.x;
  vec4 x3 = x0 - i3 + 3.0 * C.x;
  vec4 x4 = x0 - 1.0 + 4.0 * C.x;

  // Permutations
  i = mod289(i);

  float j0 = permute(
    permute(
      permute(
        permute(i.w) + i.z
      ) + i.y
    ) + i.x
  );

  vec4 j1 = permute(
    permute(
      permute(
        permute(
          i.w + vec4(i1.w, i2.w, i3.w, 1.0)
        ) + i.z + vec4(i1.z, i2.z, i3.z, 1.0)
      ) + i.y + vec4(i1.y, i2.y, i3.y, 1.0)
    ) + i.x + vec4(i1.x, i2.x, i3.x, 1.0)
  );

  // Gradients
  vec4 ip = vec4(
    1.0 / 294.0,
    1.0 / 49.0,
    1.0 / 7.0,
    0.0
  );

  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

  // Normalize gradients
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

  p4 *= taylorInvSqrt(vec4(dot(p4, p4))).x;

  // Contribution from each corner
  vec3 m0 = max(
    0.6 - vec3(
      dot(x0, x0),
      dot(x1, x1),
      dot(x2, x2)
    ),
    0.0
  );

  vec2 m1 = max(
    0.6 - vec2(
      dot(x3, x3),
      dot(x4, x4)
    ),
    0.0
  );

  m0 *= m0;
  m1 *= m1;

  return 49.0 * (
    dot(
      m0 * m0,
      vec3(
        dot(p0, x0),
        dot(p1, x1),
        dot(p2, x2)
      )
    ) +
    dot(
      m1 * m1,
      vec2(
        dot(p3, x3),
        dot(p4, x4)
      )
    )
  );
}



uniform float time;

out vec2 vUv;

void main() {
  vUv = uv;

  vec3 transformed = position;

  // Preserve the original 4D simplex-noise displacement.
  float offset = 0.0;

  offset += 0.5 * (
    snoise(vec4(normal.xyz * 1.0, time * 0.25)) * 0.5 + 0.5
  );

  transformed += normal * offset;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(transformed, 1.0);
}
`,f=`
in vec2 vUv;

uniform float time;

out vec4 fragColor;

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

  float m = l - c * 0.5;

  return rgb + vec3(m);
}

void main() {
  // Preserve the original animated hue.
  vec3 color = hsl2rgb(
    mod(vUv.y * 0.1 + time * 0.1, 1.0),
    0.5,
    0.5
  );

  // Preserve the original darker back faces.
  if (!gl_FrontFacing) {
    color *= 0.25;
  }

  fragColor = vec4(color, 1.0);
}
`,p=({context:e})=>{let t=new s({context:e,antialias:!0});t.setClearColor(`hsl(0, 0%, 0%)`,1);let l=new r,u=new c,p=new o(1,0);p.index!==null&&(p=p.toNonIndexed()),p.computeVertexNormals();let m=new n({glslVersion:i,side:2,vertexShader:d,fragmentShader:f,uniforms:{time:{value:0}}}),h=new a(p,m);return u.add(h),{resize:({pixelRatio:e,viewportWidth:n,viewportHeight:r})=>{t.setPixelRatio(e),t.setSize(n,r);let i=n/r;l.left=-2*i,l.right=2*i,l.top=2,l.bottom=-2,l.near=-100,l.far=100,l.position.set(2,2,2),l.lookAt(0,0,0),l.updateProjectionMatrix()},render:({time:e})=>{h.rotation.z=.1*e,m.uniforms.time.value=e,t.render(u,l)},unload:()=>{p.dispose(),m.dispose(),t.dispose()}}};function m(){return(0,l.default)(p,{...u,parent:document.getElementById(`sketch-workspace`)||document.body,scaleToFit:!0,scaleToFitPadding:36})}export{m as start};
//# sourceMappingURL=08-vertex-shader-Cv5IVViR.js.map