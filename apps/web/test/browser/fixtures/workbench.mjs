import { test } from "@playwright/test";

export async function openWorkbench(page, url = "/") {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_APP));
}

export async function disableSimulation(page) {
  await page.evaluate(() => {
    window.COSMOS_CQA_APP.state.simDisabled = true;
  });
}

export async function canvasHasSignal(page) {
  return page.locator("#tileCanvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, 64, 64);
    let min = 255;
    let max = 0;
    let alphaPixels = 0;

    for (let index = 0; index < data.length; index += 4) {
      min = Math.min(min, data[index]);
      max = Math.max(max, data[index]);
      if (data[index + 3] > 0) {
        alphaPixels += 1;
      }
    }

    return alphaPixels > 0 && max > min;
  });
}

export async function canvasSignature(page) {
  return page.locator("#tileCanvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let hash = 2166136261;
    let red = 0;
    let green = 0;
    let blue = 0;
    let samples = 0;

    for (let index = 0; index < data.length; index += 256) {
      hash ^= data[index] + data[index + 1] * 3 + data[index + 2] * 7 + data[index + 3] * 11;
      hash = Math.imul(hash, 16777619);
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      samples += 1;
    }

    return {
      hash: String(hash >>> 0),
      redMean: red / samples,
      greenMean: green / samples,
      blueMean: blue / samples,
      redGreenDelta: Math.abs(red - green) / samples,
    };
  });
}

export async function chartSignals(page) {
  return page.evaluate(() => {
    const ids = ["prChart", "opsChart", "confChart", "liveChart"];
    return Object.fromEntries(ids.map((id) => [id, canvasSignal(document.getElementById(id))]));

    function canvasSignal(canvas) {
      const context = canvas.getContext("2d");
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let hash = 2166136261;
      let activePixels = 0;

      for (let index = 0; index < data.length; index += 16) {
        const value = data[index] + data[index + 1] + data[index + 2] + data[index + 3];
        if (value > 0) {
          activePixels += 1;
        }
        hash ^= value;
        hash = Math.imul(hash, 16777619);
      }

      return {
        hash: String(hash >>> 0),
        activePixels,
        hasSignal: activePixels > 0,
      };
    }
  });
}

export async function labelCount(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("labels") || "[]").length);
}

export async function firstStoredLabel(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("labels") || "[]")[0]);
}

export async function blurActiveElement(page) {
  await page.evaluate(() => document.activeElement?.blur());
}

export async function readClipboard(page) {
  return page.evaluate(() => navigator.clipboard.readText());
}

export async function installMockAudio(page) {
  await page.addInitScript(() => {
    class MockOscillator {
      constructor() {
        this.frequency = { value: 0 };
        this.type = "sine";
      }
      connect() {}
      disconnect() {}
      start() {}
      stop() {}
    }

    class MockGain {
      constructor() {
        this.gain = { value: 0 };
      }
      connect() {}
      disconnect() {}
    }

    class MockAudioContext {
      constructor() {
        this.destination = {};
      }
      createOscillator() {
        return new MockOscillator();
      }
      createGain() {
        return new MockGain();
      }
    }

    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
  });
}

export async function audioPreview(page) {
  return page.evaluate(() => window.COSMOS_CQA_APP.audioPreview());
}

export async function progressWidth(page) {
  return page.locator("#prog").evaluate((element) => parseFloat(element.style.width || "0"));
}

export async function cssValue(locator, property) {
  return locator.evaluate((element, name) => {
    const styles = getComputedStyle(element);
    return styles.getPropertyValue(name) || styles[name];
  }, property);
}

export async function createPngDataUrl(page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const context = canvas.getContext("2d");
    const image = context.createImageData(8, 8);
    for (let index = 0; index < image.data.length; index += 4) {
      const value = (index / 4) % 2 === 0 ? 230 : 40;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png");
  });
}

export async function readStreamText(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function decodeBookmarkPayload(url) {
  const encoded = new URL(url).hash.slice("#state=".length);
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
}

export function annotateTargets(targets) {
  test.info().annotations.push({
    type: "legacy-targets",
    description: targets.join(", "),
  });
}
