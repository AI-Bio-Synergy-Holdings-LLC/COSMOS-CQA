export const ARTIFACT_CLASSES = ["stripe", "dipole", "ringing", "point", "clean"];

export function createSeededRandom(seed = 1) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createNoisePixels(size = 256, random = Math.random) {
  const pixels = new Uint8ClampedArray(size * size);
  for (let i = 0; i < pixels.length; i += 1) {
    pixels[i] = (random() * 60 + 98) | 0;
  }
  return pixels;
}

export function addVerticalStripesPixels(source, size, freq = 8, amp = 55) {
  const pixels = new Uint8ClampedArray(source);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = y * size + x;
      const add = Math.sin((2 * Math.PI * x) / freq) * amp;
      pixels[offset] = clampPixel(pixels[offset] + add);
    }
  }
  return pixels;
}

export function addDipolePixels(source, size, strength = 0.8) {
  const pixels = new Uint8ClampedArray(source);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = y * size + x;
      const add = (x / size - 0.5) * 256 * strength;
      pixels[offset] = clampPixel(pixels[offset] + add);
    }
  }
  return pixels;
}

export function addRingingPixels(source, size, rings = 7, amp = 45) {
  const pixels = new Uint8ClampedArray(source);
  const center = size / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = y * size + x;
      const radius = Math.hypot(x - center, y - center);
      const add = Math.sin((2 * Math.PI * radius) / (size / rings)) * amp;
      pixels[offset] = clampPixel(pixels[offset] + add);
    }
  }
  return pixels;
}

export function addPointsPixels(source, size, count = 12, radius = 2, random = Math.random) {
  const pixels = new Uint8ClampedArray(source);
  const radiusSquared = radius * radius;

  for (let i = 0; i < count; i += 1) {
    const centerX = radius + random() * (size - 2 * radius);
    const centerY = radius + random() * (size - 2 * radius);
    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(size - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(size - 1, Math.ceil(centerY + radius));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if ((x - centerX) ** 2 + (y - centerY) ** 2 <= radiusSquared) {
          pixels[y * size + x] = 255;
        }
      }
    }
  }

  return pixels;
}

export function asinhStretchPixels(source, factor = 0.02) {
  const pixels = new Uint8ClampedArray(source);
  let mean = 0;

  for (const value of pixels) {
    mean += value;
  }

  mean /= pixels.length;

  let min = Infinity;
  let max = -Infinity;
  const stretched = new Float32Array(pixels.length);

  for (let i = 0; i < pixels.length; i += 1) {
    const value = Math.asinh(factor * (pixels[i] - mean));
    stretched[i] = value;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  for (let i = 0; i < pixels.length; i += 1) {
    pixels[i] = clampPixel(((stretched[i] - min) / (max - min + 1e-6)) * 255);
  }

  return pixels;
}

export function synthTilePixels(truth, random = Math.random, { size = 256 } = {}) {
  let pixels = createNoisePixels(size, random);

  if (truth.class === "stripe") {
    pixels = addVerticalStripesPixels(pixels, size, 8, 55);
  } else if (truth.class === "dipole") {
    pixels = addDipolePixels(pixels, size, 0.8);
  } else if (truth.class === "ringing") {
    pixels = addRingingPixels(pixels, size, 7, 45);
  } else if (truth.class === "point") {
    pixels = addPointsPixels(pixels, size, 10, 2, random);
  }

  return asinhStretchPixels(pixels, 0.02);
}

export function makeNoise(size = 256, random = Math.random) {
  return canvasFromGrayscalePixels(createNoisePixels(size, random), size);
}

export function addVerticalStripes(source, freq = 8, amp = 55) {
  const { pixels, size } = canvasToGrayscalePixels(source);
  return canvasFromGrayscalePixels(addVerticalStripesPixels(pixels, size, freq, amp), size);
}

export function addDipole(source, strength = 0.8) {
  const { pixels, size } = canvasToGrayscalePixels(source);
  return canvasFromGrayscalePixels(addDipolePixels(pixels, size, strength), size);
}

export function addRinging(source, rings = 7, amp = 45) {
  const { pixels, size } = canvasToGrayscalePixels(source);
  return canvasFromGrayscalePixels(addRingingPixels(pixels, size, rings, amp), size);
}

export function addPoints(source, count = 12, radius = 2, random = Math.random) {
  const { pixels, size } = canvasToGrayscalePixels(source);
  return canvasFromGrayscalePixels(addPointsPixels(pixels, size, count, radius, random), size);
}

export function asinhStretch(source, factor = 0.02) {
  const { pixels, size } = canvasToGrayscalePixels(source);
  return canvasFromGrayscalePixels(asinhStretchPixels(pixels, factor), size);
}

export function synthTile(truth, random = Math.random) {
  return canvasFromGrayscalePixels(synthTilePixels(truth, random, { size: 256 }), 256);
}

export function createDemoTileRecords({ count = 32, seed = 12648430, size = 256 } = {}) {
  const random = createSeededRandom(seed);

  return Array.from({ length: count }).map((_, index) => {
    const truthClass = ARTIFACT_CLASSES[index % ARTIFACT_CLASSES.length];
    const meta = {
      tile_id: `tile_${String(index + 1).padStart(3, "0")}`,
      dataset: "DEMO_SIM_T",
      band: "T",
      ra: (random() * 360).toFixed(3),
      dec: (-90 + random() * 180).toFixed(3),
      truth: {
        class: truthClass,
        severity: ["low", "medium", "high"][index % 3],
      },
      checksum: `sha256:demo-${seed.toString(16)}-${String(index + 1).padStart(3, "0")}`,
    };

    return { meta, pixels: synthTilePixels(meta.truth, random, { size }), size };
  });
}

export function createDemoTiles({ count = 32, seed = 12648430 } = {}) {
  return createDemoTileRecords({ count, seed, size: 256 }).map((record) => ({
    meta: record.meta,
    canvas: canvasFromGrayscalePixels(record.pixels, record.size),
  }));
}

export function getTileGrayscale(tile, size = 256) {
  if (tile.pixels) {
    const sourceSize = tile.size || size;
    const grayscale = new Float32Array(tile.pixels.length);
    for (let i = 0; i < tile.pixels.length; i += 1) {
      grayscale[i] = tile.pixels[i];
    }
    return { grayscale, size: sourceSize };
  }

  const { pixels } = canvasToGrayscalePixels(tile.canvas, size);
  const grayscale = new Float32Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 1) {
    grayscale[i] = pixels[i];
  }
  return { grayscale, size };
}

export function canvasFromGrayscalePixels(pixels, size, documentRef = document) {
  const canvas = documentRef.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const image = ctx.createImageData(size, size);

  for (let i = 0, j = 0; i < image.data.length; i += 4, j += 1) {
    const value = pixels[j];
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function canvasToGrayscalePixels(source, targetSize = source.width) {
  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, targetSize, targetSize);
  const image = ctx.getImageData(0, 0, targetSize, targetSize).data;
  const pixels = new Uint8ClampedArray(targetSize * targetSize);

  for (let i = 0, j = 0; i < image.length; i += 4, j += 1) {
    pixels[j] = (image[i] + image[i + 1] + image[i + 2]) / 3;
  }

  return { pixels, size: targetSize };
}

function clampPixel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}
