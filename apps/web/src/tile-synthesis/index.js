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

export function makeNoise(size = 256, random = Math.random) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);

  for (let i = 0; i < image.data.length; i += 4) {
    const value = (random() * 60 + 98) | 0;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function addVerticalStripes(source, freq = 8, amp = 55) {
  const size = source.width;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const add = Math.sin((2 * Math.PI * x) / freq) * amp;
      const value = Math.max(0, Math.min(255, data[offset] + add));
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function addDipole(source, strength = 0.8) {
  const size = source.width;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const add = (x / size - 0.5) * 256 * strength;
      const value = Math.max(0, Math.min(255, data[offset] + add));
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function addRinging(source, rings = 7, amp = 45) {
  const size = source.width;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  const center = size / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const radius = Math.hypot(x - center, y - center);
      const add = Math.sin((2 * Math.PI * radius) / (size / rings)) * amp;
      const value = Math.max(0, Math.min(255, data[offset] + add));
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function addPoints(source, count = 12, radius = 2, random = Math.random) {
  const size = source.width;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);
  ctx.fillStyle = "#fff";

  for (let i = 0; i < count; i += 1) {
    const x = radius + random() * (size - 2 * radius);
    const y = radius + random() * (size - 2 * radius);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

export function asinhStretch(source, factor = 0.02) {
  const size = source.width;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  let mean = 0;

  for (let i = 0; i < data.length; i += 4) {
    mean += data[i];
  }

  mean /= data.length / 4;

  let min = Infinity;
  let max = -Infinity;
  const stretched = new Float32Array(data.length / 4);

  for (let i = 0, j = 0; i < data.length; i += 4, j += 1) {
    const value = Math.asinh(factor * (data[i] - mean));
    stretched[j] = value;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  for (let i = 0, j = 0; i < data.length; i += 4, j += 1) {
    const value = ((stretched[j] - min) / (max - min + 1e-6)) * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function synthTile(truth, random = Math.random) {
  let base = makeNoise(256, random);

  if (truth.class === "stripe") {
    base = addVerticalStripes(base, 8, 55);
  } else if (truth.class === "dipole") {
    base = addDipole(base, 0.8);
  } else if (truth.class === "ringing") {
    base = addRinging(base, 7, 45);
  } else if (truth.class === "point") {
    base = addPoints(base, 10, 2, random);
  }

  return asinhStretch(base, 0.02);
}

export function createDemoTiles({ count = 32, seed = 12648430 } = {}) {
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

    return { meta, canvas: synthTile(meta.truth, random) };
  });
}

export function getTileGrayscale(tile, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(tile.canvas, 0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size).data;
  const grayscale = new Float32Array(size * size);

  for (let i = 0, j = 0; i < image.length; i += 4, j += 1) {
    grayscale[j] = (image[i] + image[i + 1] + image[i + 2]) / 3;
  }

  return { grayscale, size };
}

