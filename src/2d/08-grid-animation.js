import canvasSketch from "canvas-sketch";
import { lerp } from "canvas-sketch-util/math";

const settings = {
  animate: true,
  duration: 6,
  dimensions: [2048, 2048],
};

const sketch = () => {
  const count = 30;

  return ({ context, width, height, playhead }) => {
    // Elegant deep midnight backdrop
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, width, height);

    const margin = width * 0.15;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);

        // Distort coordinates using an interactive multi-phase sine wave calculation
        const angle = playhead * Math.PI * 2;
        const waveX = Math.sin(v * Math.PI * 2 + angle) * 0.05;
        const waveY = Math.cos(u * Math.PI * 2 + angle) * 0.05;

        // Map layout vector points into screen coordinates with margins
        const xPos = lerp(margin, width - margin, u + waveX);
        const yPos = lerp(margin, height - margin, v + waveY);

        // Calculate responsive radius based on position vectors
        const radius = Math.abs(Math.sin(u * Math.PI + angle) * 15) + 4;

        // Draw elegant glowing points
        context.beginPath();
        context.arc(xPos, yPos, radius, 0, Math.PI * 2);
        context.fillStyle = `hsl(${u * 360 + playhead * 360}, 75%, 70%)`;
        context.fill();
      }
    }
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
