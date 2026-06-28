export {
  dftMagnitude,
  makeAudioMapForTile,
  rowMeans,
} from "../../../../packages/core/src/sidecars/index.js";

const VIRIDIS_STOPS = [
  [68, 1, 84],
  [59, 82, 139],
  [33, 145, 140],
  [94, 201, 98],
  [253, 231, 37],
];

const CIVIDIS_STOPS = [
  [0, 34, 78],
  [39, 79, 137],
  [89, 117, 139],
  [151, 151, 119],
  [254, 232, 56],
];

export function applyPalette(ctx, palette, { width = 512, height = 512 } = {}) {
  if (palette === "gray") {
    return;
  }

  const stops = palette === "cividis" ? CIVIDIS_STOPS : VIRIDIS_STOPS;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;

  for (let index = 0; index < data.length; index += 4) {
    const value = (data[index] + data[index + 1] + data[index + 2]) / (3 * 255);
    const [red, green, blue] = samplePalette(stops, value);
    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
  }

  ctx.putImageData(image, 0, 0);
}

export function drawOverlay(ctx, type) {
  if (type === "none") {
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.7;

  if (type === "rings") {
    drawRings(ctx);
  } else if (type === "gradient") {
    drawGradient(ctx);
  } else if (type === "wavelet") {
    drawWavelet(ctx);
  }

  ctx.restore();
}

function samplePalette(stops, value) {
  const clamped = Math.max(0, Math.min(1, value));
  const scaled = clamped * (stops.length - 1);
  const low = Math.floor(scaled);
  const high = Math.min(stops.length - 1, low + 1);
  const ratio = scaled - low;

  return stops[low].map((channel, index) => Math.round(channel + (stops[high][index] - channel) * ratio));
}

function drawRings(ctx) {
  ctx.strokeStyle = "rgba(224,179,90,0.9)";
  for (let radius = 32; radius <= 256; radius += 32) {
    ctx.beginPath();
    ctx.arc(256, 256, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawGradient(ctx) {
  const width = 512;
  const height = 512;
  const source = ctx.getImageData(0, 0, width, height);
  const data = source.data;
  const out = new Uint8ClampedArray(data.length);
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const idx = (x, y) => (y * width + x) * 4;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let sx = 0;
      let sy = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const kernel = (ky + 1) * 3 + (kx + 1);
          const value = data[idx(x + kx, y + ky)];
          sx += gx[kernel] * value;
          sy += gy[kernel] * value;
        }
      }
      const mag = Math.min(255, Math.hypot(sx, sy) / 4);
      const offset = idx(x, y);
      out[offset] = mag;
      out[offset + 1] = mag;
      out[offset + 2] = mag;
      out[offset + 3] = 120;
    }
  }

  const overlay = document.createElement("canvas");
  overlay.width = width;
  overlay.height = height;
  overlay.getContext("2d").putImageData(new ImageData(out, width, height), 0, 0);
  ctx.drawImage(overlay, 0, 0);
}

function drawWavelet(ctx) {
  for (let y = 0; y < 512; y += 16) {
    for (let x = 0; x < 512; x += 16) {
      const value = (Math.sin(x * 0.05) + Math.cos(y * 0.07)) * 0.5 + 0.5;
      const channel = Math.floor(50 + value * 205);
      ctx.fillStyle = `rgba(${channel},${channel},${channel},0.15)`;
      ctx.fillRect(x, y, 16, 16);
    }
  }
}

export function createAudioController({ state, controls, getPalette, setCaption }) {
  let audioContext = null;
  let oscillator = null;
  let gain = null;
  let frameId = null;
  let startTime = null;

  function stop() {
    state.playing = false;
    controls.playButton.textContent = "Play";
    controls.playButton.setAttribute("aria-pressed", "false");
    controls.progressBar.style.width = "0";
    setCaption("Paused.");

    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }

    if (gain) {
      gain.disconnect();
      gain = null;
    }

    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function play() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    state.playing = true;
    controls.playButton.textContent = "Pause";
    controls.playButton.setAttribute("aria-pressed", "true");
    setCaption("Playing tile sonification.");

    oscillator = audioContext.createOscillator();
    gain = audioContext.createGain();
    oscillator.type = "sine";
    gain.gain.value = 0.06;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();

    startTime = performance.now();
    const duration = 6000 / state.rate;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const fraction = Math.min(1, elapsed / duration);
      const wobble = getPalette() === "cividis" ? 4 : 8;
      oscillator.frequency.value = 180 + 420 * fraction + Math.sin(elapsed * 0.02) * wobble;
      controls.progressBar.style.width = `${fraction * 100}%`;

      if (fraction >= 1) {
        if (state.looping) {
          startTime = performance.now();
        } else {
          stop();
          return;
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    animate();
  }

  function toggle() {
    if (state.playing) {
      stop();
    } else {
      play();
    }
  }

  return { play, stop, toggle };
}
