import './style.css';

// ============================================================
// Sketch Registry
// Keep your existing sketch names and file paths.
// ============================================================

const sketchMap = {
  // 2D Sketches
  'pink-square': () => import('./2d/00-pink-square.js'),
  grid: () => import('./2d/01-grid.js'),
  'grid-margin': () => import('./2d/02-grid-margin.js'),
  'grid-random': () => import('./2d/03-grid-random.js'),
  'grid-colors': () => import('./2d/04-grid-colors.js'),
  'grid-konami': () => import('./2d/05-grid-konami.js'),
  'grid-painting': () => import('./2d/06-grid-painting.js'),
  'advanced-wall-drawing': () =>
    import('./2d/07-advanced-wall-drawing.js'),
  'grid-animation': () => import('./2d/08-grid-animation.js'),
  'noise-lines': () => import('./2d/09-noise-lines.js'),
  'pie-charts': () => import('./2d/10-pie-charts.js'),

  // Presentation Slides
  'computational-fur': () =>
    import('./slides/computational-fur.js'),
  'slides-background-penplotter': () =>
    import('./slides/slides-background-penplotter.js'),
  'slides-background': () =>
    import('./slides/slides-background.js'),
  'sol-lewitt-wall-drawing-273': () =>
    import('./slides/sol-lewitt-wall-drawing-273.js'),
  'three-concepts-meshes': () =>
    import('./slides/three-concepts-meshes.js'),
  'three-concepts-two-meshes': () =>
    import('./slides/three-concepts-two-meshes.js'),
  'three-concepts': () =>
    import('./slides/three-concepts.js'),

  // WebGL / Three.js Sketches
  cube: () => import('./webgl/00-cube.js'),
  isometric: () => import('./webgl/01-isometric.js'),
  cubes: () => import('./webgl/02-cubes.js'),
  'cubes-lighting': () =>
    import('./webgl/03-cubes-lighting.js'),
  'cubes-animation': () =>
    import('./webgl/04-cubes-animation.js'),
  'seamless-loop': () =>
    import('./webgl/05-seamless-loop.js'),
  shader: () => import('./webgl/06-shader.js'),
  'shader-noise': () =>
    import('./webgl/07-shader-noise.js'),
  'vertex-shader': () =>
    import('./webgl/08-vertex-shader.js'),
  blob: () => import('./webgl/09-blob.js'),

  // Add future sketches here.
};

// ============================================================
// State
// ============================================================

const STORAGE_KEY = 'current-sketch';
const DEFAULT_SKETCH = 'shader-noise';

let activeCleanup = null;
let sketchTransition = Promise.resolve();
let statusIsError = false;
let loadVersion = 0;

// Cleanup functions registered by the active sketch.
let cleanupCallbacks = [];

// ============================================================
// Sidebar
// ============================================================

const sidebar = document.getElementById('sketch-sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const workspace = document.getElementById('sketch-workspace');
const sketchStatus = document.getElementById('sketch-status');
const selectMenu = document.getElementById('sketch-selector');
const sketchList = document.getElementById('sketch-list');
const previousButton = document.getElementById('sketch-previous');
const nextButton = document.getElementById('sketch-next');

function syncSketchListSelection() {
  sketchList?.querySelectorAll('.sketch-option').forEach((button) => {
    const selected = button.dataset.sketch === selectMenu?.value;
    button.setAttribute('aria-pressed', String(selected));
  });
}

function renderSketchList() {
  if (!selectMenu || !sketchList) return;

  const groups = Array.from(selectMenu.children).filter(
    (element) => element.tagName === 'OPTGROUP',
  );

  sketchList.replaceChildren(
    ...groups.map((group, groupIndex) => {
      const section = document.createElement('section');
      const heading = document.createElement('h2');
      const headingId = `sketch-group-${groupIndex}`;

      section.className = 'sketch-group';
      section.setAttribute('role', 'group');
      section.setAttribute('aria-labelledby', headingId);
      heading.className = 'sketch-group-heading';
      heading.id = headingId;
      heading.textContent = group.label;
      section.append(heading);

      Array.from(group.children).forEach((option) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sketch-option';
        button.dataset.sketch = option.value;
        button.textContent = option.textContent.trim().replace(/\s+/g, ' ');
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          selectMenu.value = option.value;
          selectMenu.dispatchEvent(new Event('change', { bubbles: true }));
        });
        section.append(button);
      });

      return section;
    }),
  );

  syncSketchListSelection();
}

function navigateSketch(offset) {
  if (!selectMenu) return;

  const options = Array.from(selectMenu.options);
  if (options.length < 2) return;

  const currentIndex = options.findIndex(
    (option) => option.value === selectMenu.value,
  );
  if (currentIndex < 0) return;

  const nextIndex = (currentIndex + offset + options.length) % options.length;

  selectMenu.value = options[nextIndex].value;
  selectMenu.dispatchEvent(new Event('change', { bubbles: true }));
}

function setSidebarOpen(open) {
  const wasOpen = document.body.classList.contains('sidebar-open');
  document.body.classList.toggle('sidebar-open', open);

  if (sidebarToggle) {
    sidebarToggle.setAttribute('aria-expanded', String(open));
    sidebarToggle.setAttribute(
      'aria-label',
      open ? 'Close quick navigation' : 'Quick navigation',
    );
    sidebarToggle.setAttribute(
      'title',
      open ? 'Close quick navigation' : 'Quick navigation (Shift)',
    );
  }

  if (sidebar) {
    sidebar.inert = !open;
  }

  if (open) {
    window.requestAnimationFrame(() => {
      const selectedButton = sketchList?.querySelector(
        '[aria-pressed="true"]',
      );

      selectedButton?.scrollIntoView({ block: 'nearest' });
      selectedButton?.focus({ preventScroll: true });
    });
  }

  if (!open && wasOpen) {
    sidebarToggle?.focus({ preventScroll: true });
  }
}

sidebarToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.contains('sidebar-open');
  setSidebarOpen(!isOpen);
});

sidebarBackdrop?.addEventListener('click', () => {
  setSidebarOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setSidebarOpen(false);
    return;
  }

  if (
    event.key === 'Shift' &&
    !document.body.classList.contains('sidebar-open')
  ) {
    setSidebarOpen(true);
    return;
  }

  if (
    !event.repeat &&
    (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    const target = event.target;
    const isEditing =
      target instanceof HTMLElement &&
      (target.isContentEditable || target.matches('input, textarea, select'));

    if (isEditing) return;

    event.preventDefault();
    navigateSketch(event.key === 'ArrowLeft' ? -1 : 1);
  }
});

previousButton?.addEventListener('click', () => navigateSketch(-1));
nextButton?.addEventListener('click', () => navigateSketch(1));

// Start with the sidebar closed.
setSidebarOpen(false);

// ============================================================
// Cleanup API
// ============================================================

/**
 * Register a cleanup function for the active sketch.
 *
 * Example:
 *
 * window.registerSketchCleanup(() => {
 *   cancelAnimationFrame(animationId);
 *   window.removeEventListener('resize', handleResize);
 *   renderer.dispose();
 * });
 */
function registerSketchCleanup(callback) {
  if (typeof callback !== 'function') {
    console.warn('registerSketchCleanup expects a function.');
    return;
  }

  cleanupCallbacks.push(callback);
}

// Expose cleanup API to sketches.
window.registerSketchCleanup = registerSketchCleanup;

// ============================================================
// DOM Cleanup
// ============================================================

function removeSketchDOM() {
  // Remove canvases left by canvas-sketch or other renderers.
  document.querySelectorAll('canvas').forEach((canvas) => {
    canvas.remove();
  });

  // Remove canvas-sketch wrappers, if present.
  document
    .querySelectorAll('.canvas-sketch-container')
    .forEach((container) => {
      container.remove();
    });
}

// ============================================================
// Stop Current Sketch
// ============================================================

async function stopCurrentSketch() {
  // Run cleanup returned by the active sketch, if available.
  if (typeof activeCleanup === 'function') {
    try {
      await activeCleanup();
    } catch (error) {
      console.error(
        'Error while cleaning up the active sketch:',
        error,
      );
    }
  }

  activeCleanup = null;

  // Run registered cleanup callbacks in reverse order.
  const callbacks = cleanupCallbacks.reverse();
  cleanupCallbacks = [];

  for (const cleanup of callbacks) {
    try {
      await cleanup();
    } catch (error) {
      console.error(
        'Error while running a sketch cleanup callback:',
        error,
      );
    }
  }

  removeSketchDOM();
}

// ============================================================
// Load Sketch
// ============================================================

function setSketchLoading(key) {
  const option = selectMenu?.selectedOptions[0];
  const title = option?.textContent.trim() || key;

  statusIsError = false;
  document.body.classList.add('sketch-loading');
  workspace?.setAttribute('aria-busy', 'true');

  if (sketchStatus) {
    sketchStatus.textContent = `Loading ${title}...`;
    sketchStatus.hidden = false;
    sketchStatus.setAttribute('role', 'status');
    sketchStatus.setAttribute('aria-live', 'polite');
  }
}

function setSketchLoaded() {
  statusIsError = false;
  document.body.classList.remove('sketch-loading');
  workspace?.removeAttribute('aria-busy');

  if (sketchStatus) sketchStatus.hidden = true;
}

function setSketchError(key, error) {
  statusIsError = true;
  document.body.classList.remove('sketch-loading');
  workspace?.removeAttribute('aria-busy');

  if (sketchStatus) {
    sketchStatus.textContent = `Could not load ${key}. Choose another sketch to try again.`;
    sketchStatus.hidden = false;
    sketchStatus.setAttribute('role', 'alert');
    sketchStatus.setAttribute('aria-live', 'assertive');
  }

  console.error(`Execution error loading sketch "${key}":`, error);
}

function loadSketch(key) {
  if (!sketchMap[key]) {
    console.error(`Unknown sketch "${key}". Check the sketch registry and index.html.`);
    return Promise.resolve();
  }

  // Start downloading the next sketch while the active one remains visible.
  const thisLoadVersion = ++loadVersion;
  const modulePromise = sketchMap[key]();
  setSketchLoading(key);

  // Keep renderer cleanup and startup in order when users change selections quickly.
  sketchTransition = sketchTransition.catch(() => {}).then(async () => {
    try {
      const module = await modulePromise;
      if (thisLoadVersion !== loadVersion) return;

      if (activeCleanup) {
        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
      if (thisLoadVersion !== loadVersion) return;

      await stopCurrentSketch();
      if (thisLoadVersion !== loadVersion) return;

      let instance;
      if (typeof module.start === 'function') {
        instance = await module.start();
      } else if (typeof module.default === 'function') {
        instance = await module.default();
      }

      if (typeof instance === 'function') {
        activeCleanup = instance;
      } else if (typeof instance?.destroy === 'function') {
        activeCleanup = () => instance.destroy();
      }
    } catch (error) {
      if (thisLoadVersion === loadVersion) setSketchError(key, error);
      else console.error(`Execution error loading sketch "${key}":`, error);
    } finally {
      if (thisLoadVersion === loadVersion && !statusIsError) {
        setSketchLoaded();
      }
    }
  });

  return sketchTransition;
}
// ============================================================
// Sketch Selector
// ============================================================

function getInitialSketch() {
  const savedSketch = localStorage.getItem(STORAGE_KEY);

  if (savedSketch && sketchMap[savedSketch]) {
    return savedSketch;
  }

  return DEFAULT_SKETCH;
}

if (selectMenu) {
  const initialSketch = getInitialSketch();

  selectMenu.value = initialSketch;

  // Fall back if the saved sketch is not in the selector.
  if (selectMenu.value !== initialSketch) {
    selectMenu.value = DEFAULT_SKETCH;
  }

  renderSketchList();

  // Load the initial sketch.
  loadSketch(selectMenu.value);

  selectMenu.addEventListener('change', (event) => {
    const selectedSketch = event.target.value;

    if (!sketchMap[selectedSketch]) {
      console.error(
        `Unknown sketch selected: "${selectedSketch}"`,
      );
      return;
    }

    localStorage.setItem(STORAGE_KEY, selectedSketch);
    syncSketchListSelection();

    // Close the sidebar after selecting a sketch.
    setSidebarOpen(false);

    // Switch sketches without reloading the page.
    loadSketch(selectedSketch);
  });
} else {
  // Support pages without a sketch selector.
  loadSketch(getInitialSketch());
}

// ============================================================
// Page Lifecycle
// ============================================================

window.addEventListener('beforeunload', () => {
  // Run synchronous cleanup when the page is closing.
  if (typeof activeCleanup === 'function') {
    try {
      activeCleanup();
    } catch (error) {
      console.error(
        'Error during page-unload cleanup:',
        error,
      );
    }
  }

  for (const cleanup of cleanupCallbacks) {
    try {
      cleanup();
    } catch (error) {
      console.error(
        'Error during page-unload cleanup:',
        error,
      );
    }
  }
});
