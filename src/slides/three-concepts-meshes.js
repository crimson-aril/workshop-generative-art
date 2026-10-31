import canvasSketch from "canvas-sketch";
import random from "canvas-sketch-util/random";
import palettesList from "nice-color-palettes/1000.json";
import * as THREE from "three";

const palettes = palettesList.slice(250);

const isometric = true;
const simplePalette = true;
const palette = simplePalette
  ? ["#efb3b3", "#a0d0e8"]
  : random.shuffle(random.pick(palettes)).slice(0, 2);

const settings = {
  dimensions: "A4",
  orientation: "landscape",
  exportPixelRatio: 2,
  scaleToView: true,
  animate: true,
  context: "webgl2",
  fps: 24,
  duration: 8,
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  random.setSeed(6);

  // Create a renderer passing the WebGL context provided by canvas-sketch
  const renderer = new THREE.WebGLRenderer({
    context,
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = isometric
    ? new THREE.OrthographicCamera()
    : new THREE.PerspectiveCamera(45, 1, 0.01, 100);

  // Setup your scene
  const scene = new THREE.Scene();

  const count = 10;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  for (let x = 0; x < count; x++) {
    for (let y = 0; y < count; y++) {
      const U = x / (count - 1);
      const V = y / (count - 1);
      const spacing = 1.25;
      const u = (U * 2 - 1) * spacing;
      const v = (V * 2 - 1) * spacing;

      const material = new THREE.MeshStandardMaterial({
        roughness: 0.75,
        metalness: 0.25,
        color: new THREE.Color(random.pick(palette)),
      });
      const mesh = new THREE.Mesh(geometry, material);

      const scaleX = random.gaussian();
      const scaleY = random.gaussian() * random.gaussian() * 2;
      const scaleZ = random.gaussian();
      mesh.scale
        .set(scaleX, scaleY, scaleZ)
        .multiplyScalar(0.25 * random.gaussian());

      mesh.position.set(u, 0, v);
      scene.add(mesh);
    }
  }

  // Add some light
  const light = new THREE.DirectionalLight("white", 4);
  light.position.set(-1, 4, 1);
  light.lookAt(new THREE.Vector3());
  scene.add(light);

  // draw each frame
  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      if (isometric) {
        const aspect = viewportWidth / viewportHeight;
        const zoom = 2.25;
        const offset = settings.animate ? 0.25 : 0.25;
        camera.left = -zoom * aspect;
        camera.right = zoom * aspect;
        camera.top = zoom + offset;
        camera.bottom = -zoom + offset;
        camera.near = -100;
        camera.far = 100;
        camera.position.set(zoom, zoom, zoom);
        camera.lookAt(new THREE.Vector3());
      } else {
        camera.aspect = viewportWidth / viewportHeight;
      }
      camera.updateProjectionMatrix();
    },
    render({ playhead, width, height }) {
      if (!isometric) {
        const orbit = Math.PI / 4 + playhead * Math.PI * 2;
        const radius = 4;
        const y = 4;
        const x = Math.cos(orbit) * radius;
        const z = Math.sin(orbit) * radius;
        camera.position.set(x, y, z);
        camera.lookAt(new THREE.Vector3());
      }

      if (settings.animate) {
        scene.rotation.y = playhead * Math.PI * 2;
      }
      camera.setViewOffset(width, height, 0, 25, width, height);
      renderer.render(scene, camera);
    },
    unload() {
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
