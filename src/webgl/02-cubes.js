
import canvasSketch from "canvas-sketch";
import random from "canvas-sketch-util/random";
import palettes from "nice-color-palettes";
import * as THREE from "three";

const settings = {
  dimensions: [2048, 2048],
  animate: true,
  context: "webgl2",
  attributes: {
    antialias: true,
  },
};

const sketch = ({ context }) => {
  const renderer = new THREE.WebGLRenderer({
    context,
    antialias: true,
  });

  renderer.setClearColor("hsl(0, 0%, 95%)", 1);

  const camera = new THREE.OrthographicCamera();
  const scene = new THREE.Scene();

  // Pick one palette for this sketch instance.
  const palette = random.pick(palettes);

  const randomizeMesh = (mesh) => {
    // Random position in the original [-1, 1] range.
    const point = new THREE.Vector3(
      random.value() * 2 - 1,
      random.value() * 2 - 1,
      random.value() * 2 - 1
    );

    mesh.position.copy(point);
    mesh.originalPosition = mesh.position.clone();

    // Preserve the original second color assignment.
    // This overwrites the material's initial random color.
    mesh.material.color.set(random.pick(palette));

    // Original Gaussian scale.
    mesh.scale.set(
      random.gaussian(),
      random.gaussian(),
      random.gaussian()
    );

    if (random.chance(0.5)) {
      mesh.scale.x *= random.gaussian();
    }

    if (random.chance(0.5)) {
      mesh.scale.y *= random.gaussian();
    }

    if (random.chance(0.5)) {
      mesh.scale.z *= random.gaussian();
    }

    mesh.scale.multiplyScalar(random.gaussian() * 0.25);
  };

  const container = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const chunks = 50;

  const meshes = Array.from({ length: chunks }, () => {
    // Keep the original first color selection too.
    const material = new THREE.MeshBasicMaterial({
      depthTest: false,
      color: random.pick(palette),
    });

    const mesh = new THREE.Mesh(geometry, material);

    randomizeMesh(mesh);

    return mesh;
  });

  meshes.forEach((mesh) => {
    container.add(mesh);
  });

  scene.add(container);

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);

      const aspect = viewportWidth / viewportHeight;
      const zoom = 1.85;

      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      camera.near = -100;
      camera.far = 100;

      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      camera.updateProjectionMatrix();
    },

    render({ time }) {
      meshes.forEach((mesh) => {
        const f = 0.5;

        mesh.position.x =
          mesh.originalPosition.x +
          0.25 *
            random.noise3D(
              mesh.originalPosition.x * f,
              mesh.originalPosition.y * f,
              mesh.originalPosition.z * f,
              time * 0.25
            );
      });

      renderer.render(scene, camera);
    },

    unload() {
      geometry.dispose();

      meshes.forEach((mesh) => {
        mesh.material.dispose();
      });

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
