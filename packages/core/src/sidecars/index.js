import { getTileGrayscale } from "../tile-synthesis/index.js";

export function rowMeans(grayscale, size) {
  const means = new Float32Array(size);
  for (let y = 0; y < size; y += 1) {
    let sum = 0;
    for (let x = 0; x < size; x += 1) {
      sum += grayscale[y * size + x];
    }
    means[y] = sum / size;
  }
  return means;
}

export function dftMagnitude(signal, bins = 32) {
  const length = signal.length;
  const mags = new Float32Array(bins);

  for (let k = 0; k < bins; k += 1) {
    let real = 0;
    let imaginary = 0;
    for (let n = 0; n < length; n += 1) {
      const angle = (-2 * Math.PI * k * n) / length;
      real += signal[n] * Math.cos(angle);
      imaginary += signal[n] * Math.sin(angle);
    }
    mags[k] = Math.hypot(real, imaginary) / length;
  }

  return mags;
}

export function makeAudioMapForTile(tile) {
  const { grayscale, size } = getTileGrayscale(tile, 256);
  const means = rowMeans(grayscale, size);
  const mags = Array.from(dftMagnitude(means));
  const max = Math.max(1, ...mags);
  const frames = 120;

  return Array.from({ length: frames }).map((_, index) => {
    const bin = Math.floor((index / frames) * mags.length);
    const ratio = max ? mags[bin] / max : 0;
    return {
      freq: 180 + 420 * ratio,
      gain: 0.05 + 0.25 * ratio,
    };
  });
}
