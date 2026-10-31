import canvasSketch from 'canvas-sketch';
import { lerp } from 'canvas-sketch-util/math';
import random from 'canvas-sketch-util/random';

const settings = {
  dimensions: [2048, 2048],
  animate: false,
};

const sketch = async () => {
  const count = 20;
  const characters = '←↑→↓AB'.split('');
  const background = 'hsl(0, 0%, 96%)';
  const palette = ['hsl(0, 0%, 10%)'];

  const createGrid = () => {
    const points = [];

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = x / (count - 1);
        const v = y / (count - 1);

        const character = random.pick(characters);
        const isLetter = /[AB]/i.test(character);

        const r = isLetter ? 25 : 50;
        const e = isLetter ? 10 : 20;

        points.push({
          color: random.pick(palette),
          radius: Math.abs(r + e * random.gaussian()),
          position: [u, v],
          character,
        });
      }
    }

    return points;
  };

  // Randomly select approximately half of the grid points.
  const points = createGrid().filter(() => random.chance(0.5));

  // Fonts are served from public/assets/fonts/.
  const fontUrl = `${import.meta.env.BASE_URL}assets/fonts/SpaceGrotesk-Medium.woff`;

  const font = new FontFace(
    'SpaceGrotesk-Medium',
    `url("${fontUrl}")`,
  );

  try {
    await font.load();
    document.fonts.add(font);
  } catch (error) {
    console.warn(
      'Could not load SpaceGrotesk-Medium. Using a fallback font.',
      error,
    );
  }

  return ({ context, width, height }) => {
    const margin = width * 0.175;

    // Background
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    // Typography
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    for (const { position, radius, color, character } of points) {
      const x = lerp(margin, width - margin, position[0]);
      const y = lerp(margin, height - margin, position[1]);

      context.fillStyle = color;
      context.font = `${radius}px "SpaceGrotesk-Medium", sans-serif`;

      context.fillText(character, x, y);
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
