import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { validateCorePackManifest } from "../../../packages/core/src/core-pack/index.js";
import { createDiagnosticPlaceholders } from "../../../packages/core/src/diagnostics/index.js";
import {
  createResearchSessionReloadPlan,
  parseResearchSessionJson,
  serializeResearchSession,
  validateResearchSessionJson,
} from "../../../packages/core/src/evidence/index.js";
import { buildCSV, labelsToRows } from "../../../packages/core/src/labels/index.js";
import {
  createBookmarkPayload,
  createBuildInfo,
  decodeBookmarkPayload,
  encodeBookmarkPayload,
} from "../../../packages/core/src/provenance/index.js";
import { createSbom, createValidationReport } from "../../../packages/core/src/reports/index.js";
import { makeAudioMapForTile } from "../../../packages/core/src/sidecars/index.js";
import { createDemoTileRecords } from "../../../packages/core/src/tile-synthesis/index.js";
import { formatTileOptionLabel, truthTagDisplay } from "../src/ui/index.js";

const fixtureUrl = new URL("../../../examples/core-pack/replay-fixture.json", import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, "utf8"));
const manifestUrl = new URL("../../../examples/core-pack/core-pack.manifest.json", import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
const researchSessionUrl = new URL("../../../examples/evidence-bundle/research-session.json", import.meta.url);
const researchSessionFixture = JSON.parse(await readFile(researchSessionUrl, "utf8"));
const sessionRoundtripUrl = new URL("../../../examples/evidence-bundle/session-roundtrip.json", import.meta.url);
const sessionRoundtripFixture = JSON.parse(await readFile(sessionRoundtripUrl, "utf8"));

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => JSON.stringify(value);
const round = (value) => Number(value.toFixed(6));

function replayRecords() {
  return createDemoTileRecords({
    count: fixture.tile_count,
    seed: fixture.seed,
    size: fixture.tile_size,
  });
}

function replayAudio(tile) {
  return makeAudioMapForTile(tile).map((point) => ({
    freq: round(point.freq),
    gain: round(point.gain),
  }));
}

test("seeded tile synthesis matches golden pixel fixture", () => {
  const records = replayRecords();
  const first = records[0];

  assert.deepEqual(first.meta, fixture.first_tile.meta);
  assert.deepEqual(Array.from(first.pixels.slice(0, 16)), fixture.first_tile.pixel_sample);
  assert.equal(sha256(first.pixels), fixture.first_tile.pixel_sha256);
});

test("sidecar audio map generation matches golden replay fixture", () => {
  const [first] = replayRecords();
  const audio = replayAudio(first);

  assert.equal(audio.length, fixture.audio.frame_count);
  assert.deepEqual(audio.slice(0, 8), fixture.audio.first_frames);
  assert.equal(sha256(canonical(audio)), fixture.audio.sha256);
});

test("bookmark provenance encodes and decodes to the golden payload", () => {
  const [first] = replayRecords();
  const payload = createBookmarkPayload({
    tile: first,
    overlay: fixture.bookmark.payload.overlay,
    palette: fixture.bookmark.payload.palette,
    rate: fixture.bookmark.payload.env.audio.rate,
    loop: fixture.bookmark.payload.env.audio.loop,
    captions: fixture.bookmark.payload.captions,
    seed: fixture.seed,
  });

  assert.deepEqual(payload, fixture.bookmark.payload);
  assert.equal(encodeBookmarkPayload(payload), fixture.bookmark.encoded);
  assert.equal(sha256(canonical(decodeBookmarkPayload(fixture.bookmark.encoded))), fixture.bookmark.decoded_sha256);
});

test("label export CSV matches golden replay fixture", () => {
  const records = replayRecords();
  const label = {
    label_id: "lbl_replay1",
    tile_id: fixture.first_tile.meta.tile_id,
    dataset: fixture.first_tile.meta.dataset,
    volunteer_id: "vol_replay",
    _truth: fixture.first_tile.meta.truth,
    clazz: "stripe",
    severity: "medium",
    note: "golden replay label",
    weight: 0.85,
    ts: "2026-06-28T00:00:00.000Z",
  };
  const expert = {
    tile_id: fixture.first_tile.meta.tile_id,
    expert_class: "residual",
    expert_confidence: 0.9,
    latency_s: 1.25,
  };
  const rows = labelsToRows([label], records, [expert]);
  const csv = buildCSV(rows, fixture.labels.columns);

  assert.deepEqual(rows, fixture.labels.rows);
  assert.equal(csv, fixture.labels.csv);
  assert.equal(sha256(csv), fixture.labels.csv_sha256);
});

test("Core Pack validation and diagnostic placeholders match golden replay fixture", () => {
  const validation = validateCorePackManifest(manifest);
  const diagnostics = createDiagnosticPlaceholders({
    manifest,
    generatedAt: fixture.diagnostics.generated_at,
  });

  assert.equal(validation.valid, true);
  assert.deepEqual(validation.summary, fixture.core_pack.validation_summary);
  assert.deepEqual(
    diagnostics.map((diagnostic) => ({
      diagnostic_id: diagnostic.diagnostic_id,
      outputs: diagnostic.outputs.map((output) => [output.key, output.value]),
    })),
    fixture.diagnostics.output_values,
  );
  assert.equal(sha256(canonical(diagnostics)), fixture.diagnostics.sha256);
});

test("validation report and SBOM exports match golden replay fixture", () => {
  const label = {
    label_id: "lbl_replay1",
    tile_id: fixture.first_tile.meta.tile_id,
    dataset: fixture.first_tile.meta.dataset,
    volunteer_id: "vol_replay",
    _truth: fixture.first_tile.meta.truth,
    clazz: "stripe",
    severity: "medium",
    note: "golden replay label",
    weight: 0.85,
    ts: "2026-06-28T00:00:00.000Z",
  };
  const report = createValidationReport({
    build: createBuildInfo({ dev: false }),
    labels: [label],
    feedErrors: [{ message: "rejected example" }],
    checks: [
      { name: "label schema", status: "pass", detail: "label contract valid" },
      { name: "feed schema", status: "fail", detail: "one feed event rejected" },
    ],
    generatedAt: fixture.report.validation_report.generated_at,
    reportId: fixture.report.validation_report.report_id,
  });
  const sbom = createSbom({ generatedAt: fixture.report.sbom.metadata.timestamp });

  assert.deepEqual(report, fixture.report.validation_report);
  assert.equal(sha256(canonical(report)), fixture.report.validation_report_sha256);
  assert.deepEqual(sbom, fixture.report.sbom);
  assert.equal(sha256(canonical(sbom)), fixture.report.sbom_sha256);
});

test("research session save/import reload plan matches golden replay fixture", () => {
  const serialized = serializeResearchSession(researchSessionFixture);
  const imported = parseResearchSessionJson(serialized);
  const validation = validateResearchSessionJson(serialized);
  const reloadPlan = createResearchSessionReloadPlan(imported);

  assert.equal(sha256(serialized), sessionRoundtripFixture.serialized_sha256);
  assert.deepEqual(imported, researchSessionFixture);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.session, researchSessionFixture);
  assert.deepEqual(reloadPlan, sessionRoundtripFixture.reload_plan);

  const malformed = validateResearchSessionJson('{"schema_version":"cosmos-cqa.contracts.v0.1.0"}');
  assert.equal(malformed.valid, false);
  assert.match(malformed.errors[0], /researchSession\.session_id/);
});

test("public and dev UI truth-label policies match replay fixture", () => {
  const meta = fixture.first_tile.meta;

  assert.equal(formatTileOptionLabel(meta, { dev: false }), fixture.ui_policy.public_option);
  assert.equal(formatTileOptionLabel(meta, { dev: true }), fixture.ui_policy.dev_option);
  assert.equal(truthTagDisplay({ dev: false }), fixture.ui_policy.public_truth_display);
  assert.equal(truthTagDisplay({ dev: true }), fixture.ui_policy.dev_truth_display);
});
