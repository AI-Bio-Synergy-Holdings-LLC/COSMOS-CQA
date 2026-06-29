const canvas = document.getElementById("portalSignalCanvas");
const context = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: 0.72, y: 0.42 };

function resizeCanvas() {
  const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(bounds.width * ratio));
  const height = Math.max(1, Math.floor(bounds.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: bounds.width, height: bounds.height };
}

function fieldValue(x, y, phase) {
  const waveA = Math.sin(x * 0.018 + phase * 1.7) * 0.34;
  const waveB = Math.cos(y * 0.023 - phase * 1.2) * 0.28;
  const ridge = Math.sin((x + y) * 0.011 + phase) * 0.18;
  const residual = Math.cos((x - y) * 0.028) * 0.12;
  return waveA + waveB + ridge + residual;
}

function colorFor(value) {
  const normalized = Math.max(0, Math.min(1, (value + 0.92) / 1.84));
  const red = Math.round(18 + normalized * 108 + Math.max(0, normalized - 0.68) * 120);
  const green = Math.round(34 + normalized * 174);
  const blue = Math.round(48 + (1 - normalized) * 98 + normalized * 64);
  return `rgb(${red}, ${green}, ${blue})`;
}

function drawScene(time = 0) {
  const { width, height } = resizeCanvas();
  const phase = reduceMotion ? 0.35 : time * 0.00018;
  const cell = Math.max(8, Math.min(18, width / 88));

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#071014";
  context.fillRect(0, 0, width, height);

  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      const dx = x / width - pointer.x;
      const dy = y / height - pointer.y;
      const focus = Math.max(0, 1 - Math.hypot(dx, dy) * 1.7);
      const value = fieldValue(x, y, phase) + focus * 0.36;
      context.fillStyle = colorFor(value);
      context.globalAlpha = 0.64 + focus * 0.22;
      context.fillRect(x, y, cell + 1, cell + 1);
    }
  }

  context.globalAlpha = 0.18;
  context.strokeStyle = "#f0c96a";
  context.lineWidth = 1;
  for (let index = 0; index < 10; index += 1) {
    const centerX = width * (0.56 + index * 0.038);
    const centerY = height * (0.26 + index * 0.031);
    context.beginPath();
    context.arc(centerX, centerY, 42 + index * 34, 0, Math.PI * 2);
    context.stroke();
  }

  context.globalAlpha = 0.32;
  context.strokeStyle = "#43d6c5";
  context.lineWidth = 1.5;
  for (let line = 0; line < 8; line += 1) {
    const y = height * (0.18 + line * 0.09);
    context.beginPath();
    for (let x = width * 0.48; x < width; x += 18) {
      const offset = Math.sin(x * 0.018 + line + phase * 2) * 16;
      if (x === width * 0.48) {
        context.moveTo(x, y + offset);
      } else {
        context.lineTo(x, y + offset);
      }
    }
    context.stroke();
  }

  context.globalAlpha = 0.62;
  context.strokeStyle = "#ff7d8f";
  context.lineWidth = 2;
  context.strokeRect(width * 0.63, height * 0.31, width * 0.14, height * 0.22);
  context.strokeRect(width * 0.78, height * 0.55, width * 0.11, height * 0.17);

  context.globalAlpha = 1;
  if (!reduceMotion) {
    window.requestAnimationFrame(drawScene);
  }
}

canvas.addEventListener("pointermove", (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = (event.clientX - bounds.left) / bounds.width;
  pointer.y = (event.clientY - bounds.top) / bounds.height;
  if (reduceMotion) {
    drawScene();
  }
});

window.addEventListener("resize", () => drawScene());
window.COSMOS_CQA_PORTAL = {
  drawScene,
  signalSignature() {
    const sample = context.getImageData(0, 0, Math.min(64, canvas.width), Math.min(64, canvas.height)).data;
    let activePixels = 0;
    let hash = 2166136261;
    for (let index = 0; index < sample.length; index += 16) {
      const value = sample[index] + sample[index + 1] + sample[index + 2] + sample[index + 3];
      if (value > 0) {
        activePixels += 1;
      }
      hash ^= value;
      hash = Math.imul(hash, 16777619);
    }
    return { activePixels, hash: String(hash >>> 0) };
  },
};

drawScene();
