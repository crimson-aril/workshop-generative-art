import canvasSketch from "canvas-sketch";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import simplex4D from "glsl-noise/simplex/4d.glsl?raw";

const settings = {
  dimensions: "A4",
  orientation: "landscape",
  animate: true,
  context: "webgl2",
  attributes: {
    antialias: true,
    alpha: false,
  },
};

// Use the actual Ashima Arts 4D simplex-noise implementation.
// Remove the glslify directive because Vite is loading the file as raw text.
const noise4D = simplex4D.replace(
  /^\s*#pragma glslify: export\(snoise\)\s*$/gm,
  "",
);

const vertexShader = /* glsl */ `
${noise4D}

uniform float time;

out vec2 vUv;

void main() {
  vUv = uv;

  vec3 transformed = position;

  float offset = 0.0;

  offset += 0.5 * snoise(
    vec4(position.xyz * 0.5, time * 0.25)
  );

  offset += 0.25 * snoise(
    vec4(position.xyz * 1.5, time * 0.25)
  );

  transformed += normal * offset;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(transformed, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float time;

in vec2 vUv;

layout(location = 0) out vec4 outColor;

vec3 hsl2rgb(vec3 hsl) {
  vec3 p = abs(
    fract(hsl.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0
  );

  vec3 rgb = clamp(p - 1.0, 0.0, 1.0);

  return hsl.z + hsl.y * (rgb - 0.5) *
    (1.0 - abs(2.0 * hsl.z - 1.0));
}

void main() {
  float hue = mix(
    0.2,
    0.5,
    sin(vUv.x * 3.14)
  );

  vec3 color = hsl2rgb(
    vec3(hue, 0.5, vUv.y)
  );

  outColor = vec4(color, 1.0);
}
`;

const sketch = ({ context }) => {
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
    context,
    antialias: true,
  });

  renderer.setClearColor("#e8e8e8", 1);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);

  camera.position.set(2, 2, -4);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true;

  const geometry = new THREE.SphereGeometry(1, 64, 64);

  const material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,

    uniforms: {
      time: {
        value: 0,
      },
    },

    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);

      const aspect = viewportWidth / viewportHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      // Keep the displaced sphere inside the frame on narrow screens.
      const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
      const horizontalHalfFov = Math.atan(
        Math.tan(verticalHalfFov) * aspect,
      );
      const requiredDistance = 1.85 / Math.sin(
        Math.min(verticalHalfFov, horizontalHalfFov),
      );
      const cameraOffset = camera.position.clone().sub(controls.target);

      if (cameraOffset.length() < requiredDistance) {
        camera.position.copy(
          controls.target.clone().addScaledVector(
            cameraOffset.normalize(),
            requiredDistance,
          ),
        );
      }

      controls.minDistance = requiredDistance;
    },

    render({ time }) {
      material.uniforms.time.value = time;
      mesh.rotation.y = time;
      controls.update();
      renderer.render(scene, camera);
    },

    unload() {
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
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
