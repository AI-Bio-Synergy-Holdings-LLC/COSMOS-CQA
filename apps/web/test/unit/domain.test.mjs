import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calculateAccessibilityCoverage,
  calculateReliability,
  ema,
  prAUC,
} from "../../../../packages/core/src/metrics/index.js";
import {
  AUDIO_SAFETY_LIMITS,
  clampAudioFrequency,
  clampPlaybackRate,
  getAudioContourDurationMs,
  makeAudioMapForTile,
} from "../../../../packages/core/src/sidecars/index.js";
import { createDemoTileRecords } from "../../../../packages/core/src/tile-synthesis/index.js";
import { getTestBridgeTargetOrigin, notifyTestBridge } from "../../src/provenance/index.js";
import { formatTileOptionLabel, truthTagDisplay } from "../../src/ui/index.js";

test("promotes metric and accessibility assertions into unit coverage", () => {
  assert.equal(ema(null, 4, 0.3), 4);
  assert.equal(ema(10, 20, 0.25), 12.5);
  assert.equal(
    prAUC([
      { thresh: 0.9, p: 1, r: 0.5 },
      { thresh: 0.4, p: 0.5, r: 1 },
    ]),
    0.625,
  );

  const reliability = calculateReliability(
    [
      { clazz: "stripe", _truth: { class: "stripe" } },
      { clazz: "clean", _truth: { class: "clean" } },
    ],
    0.85,
  );
  assert.deepEqual(reliability, { kappa: 1, alpha: 0.68 });

  assert.equal(calculateAccessibilityCoverage({ captions: true, usedKeyboard: true, palette: "cividis" }), 1);
  assert.equal(calculateAccessibilityCoverage({ captions: true, usedKeyboard: false, palette: "gray" }), 1 / 3);
});

test("promotes deterministic tile and audio assertions into unit coverage", () => {
  const [firstTile] = createDemoTileRecords({ count: 1, seed: 12648430, size: 32 });
  const replayTile = createDemoTileRecords({ count: 1, seed: 12648430, size: 32 })[0];

  assert.deepEqual(firstTile.meta, replayTile.meta);
  assert.deepEqual(Array.from(firstTile.pixels.slice(0, 12)), Array.from(replayTile.pixels.slice(0, 12)));

  const audio = makeAudioMapForTile(firstTile);
  assert.equal(audio.length, 120);
  assert.deepEqual(audio.slice(0, 5), makeAudioMapForTile(replayTile).slice(0, 5));
  assert.ok(
    audio.every(
      (frame) =>
        frame.freq >= AUDIO_SAFETY_LIMITS.minFrequencyHz &&
        frame.freq <= AUDIO_SAFETY_LIMITS.maxFrequencyHz &&
        frame.gain >= AUDIO_SAFETY_LIMITS.minPreviewGain &&
        frame.gain <= AUDIO_SAFETY_LIMITS.maxPreviewGain,
    ),
  );
});

test("keeps shared audio safety limits bounded for public playback", () => {
  assert.equal(AUDIO_SAFETY_LIMITS.defaultLooping, false);
  assert.equal(AUDIO_SAFETY_LIMITS.outputGain, 0.04);
  assert.equal(clampAudioFrequency(20), AUDIO_SAFETY_LIMITS.minFrequencyHz);
  assert.equal(clampAudioFrequency(20_000), AUDIO_SAFETY_LIMITS.maxFrequencyHz);
  assert.equal(clampPlaybackRate(0.1), AUDIO_SAFETY_LIMITS.minPlaybackRate);
  assert.equal(clampPlaybackRate(8), AUDIO_SAFETY_LIMITS.maxPlaybackRate);
  assert.equal(getAudioContourDurationMs(1), AUDIO_SAFETY_LIMITS.baseContourDurationMs);
  assert.equal(getAudioContourDurationMs(2), AUDIO_SAFETY_LIMITS.baseContourDurationMs / 2);
});

test("promotes public truth-label display policy into unit coverage", () => {
  const meta = { tile_id: "tile_001", truth: { class: "stripe" } };

  assert.equal(formatTileOptionLabel(meta, { dev: false }), "tile_001");
  assert.equal(formatTileOptionLabel(meta, { dev: true }), "tile_001 - stripe");
  assert.equal(truthTagDisplay({ dev: false }), "none");
  assert.equal(truthTagDisplay({ dev: true }), "");
});

test("restricts test bridge messages to same-origin openers", () => {
  const messages = [];
  const windowRef = fakeWindow({
    origin: "http://127.0.0.1:4173",
    opener: {
      location: { origin: "http://127.0.0.1:4173" },
      postMessage(message, targetOrigin) {
        messages.push({ message, targetOrigin });
      },
    },
  });

  assert.equal(getTestBridgeTargetOrigin(windowRef), "http://127.0.0.1:4173");
  notifyTestBridge("validationReport.exported", { report_id: "rpt_test" }, windowRef);

  assert.deepEqual(messages, [
    {
      message: {
        channel: "cosmos-test-bridge",
        type: "validationReport.exported",
        detail: { report_id: "rpt_test" },
      },
      targetOrigin: "http://127.0.0.1:4173",
    },
  ]);
});

test("does not send test bridge messages to cross-origin or opaque openers", () => {
  const crossOriginMessages = [];
  const crossOriginWindow = fakeWindow({
    origin: "http://127.0.0.1:4173",
    opener: {
      location: { origin: "https://example.invalid" },
      postMessage(message, targetOrigin) {
        crossOriginMessages.push({ message, targetOrigin });
      },
    },
  });

  assert.equal(getTestBridgeTargetOrigin(crossOriginWindow), "");
  notifyTestBridge("validationReport.exported", { report_id: "rpt_test" }, crossOriginWindow);
  assert.deepEqual(crossOriginMessages, []);

  const opaqueOriginMessages = [];
  const opaqueWindow = fakeWindow({
    origin: "null",
    href: "about:blank",
    opener: {
      location: { origin: "null", href: "about:blank" },
      postMessage(message, targetOrigin) {
        opaqueOriginMessages.push({ message, targetOrigin });
      },
    },
  });

  assert.equal(getTestBridgeTargetOrigin(opaqueWindow), "");
  notifyTestBridge("validationReport.exported", { report_id: "rpt_test" }, opaqueWindow);
  assert.deepEqual(opaqueOriginMessages, []);
});

test("fails closed when opener origin cannot be verified", () => {
  const messages = [];
  const windowRef = fakeWindow({
    origin: "http://127.0.0.1:4173",
    opener: {
      location: {
        get origin() {
          throw new Error("cross-origin access denied");
        },
      },
      postMessage(message, targetOrigin) {
        messages.push({ message, targetOrigin });
      },
    },
  });

  assert.equal(getTestBridgeTargetOrigin(windowRef), "");
  notifyTestBridge("validationReport.exported", { report_id: "rpt_test" }, windowRef);
  assert.deepEqual(messages, []);
});

function fakeWindow({ origin, href = `${origin}/workbench.html`, opener }) {
  return {
    location: { origin, href },
    opener,
  };
}
