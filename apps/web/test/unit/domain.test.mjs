import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calculateAccessibilityCoverage,
  calculateReliability,
  ema,
  prAUC,
} from "../../../../packages/core/src/metrics/index.js";
import { makeAudioMapForTile } from "../../../../packages/core/src/sidecars/index.js";
import { createDemoTileRecords } from "../../../../packages/core/src/tile-synthesis/index.js";
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
  assert.ok(audio.every((frame) => frame.freq >= 180 && frame.gain >= 0.05));
});

test("promotes public truth-label display policy into unit coverage", () => {
  const meta = { tile_id: "tile_001", truth: { class: "stripe" } };

  assert.equal(formatTileOptionLabel(meta, { dev: false }), "tile_001");
  assert.equal(formatTileOptionLabel(meta, { dev: true }), "tile_001 - stripe");
  assert.equal(truthTagDisplay({ dev: false }), "none");
  assert.equal(truthTagDisplay({ dev: true }), "");
});
