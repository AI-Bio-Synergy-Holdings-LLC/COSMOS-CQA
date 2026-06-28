import assert from "node:assert/strict";
import { test } from "node:test";

import { CONTRACT_SCHEMA_VERSION, assertContract, validateContract } from "../src/contracts/index.js";
import { normalizeFeedEvent, parseFeedPayload, validateFeedEvent } from "../src/feeds/index.js";
import { buildCSV, createVolunteerLabel, labelsToRows } from "../src/labels/index.js";
import {
  createBookmarkPayload,
  createBookmarkUrl,
  createBuildInfo,
  decodeBookmarkPayload,
  encodeBookmarkPayload,
} from "../src/provenance/index.js";
import { createSbom, createValidationReport } from "../src/reports/index.js";

const tile = {
  meta: {
    tile_id: "tile_001",
    dataset: "DEMO_SIM_T",
    release: "v0",
    doi: "doi:10.0000/demo",
    url: "https://example.test/tile_001.png",
    truth: { class: "stripe", severity: "medium" },
    checksum: "sha256:test-001",
  },
};

const controls = {
  classSelect: { value: "stripe" },
  severitySelect: { value: "medium" },
  noteInput: { value: "n".repeat(300) },
};

const state = {
  volunteerId: "vol_contract",
  weight: 0.85,
};

test("label records and CSV export rows satisfy contracts", () => {
  const label = createVolunteerLabel({ tile, state, controls });
  assert.equal(label.note.length, 240);
  assertContract("labelRecord", label);

  const rows = labelsToRows([label], [tile], [
    {
      tile_id: "tile_001",
      expert_class: "residual",
      expert_confidence: 0.9,
      latency_s: 1.25,
    },
  ]);
  assert.equal(rows.length, 1);
  assertContract("labelExportRow", rows[0]);

  const csv = buildCSV(rows, ["tile_id", "dataset", "volunteer_id", "clazz", "severity"]);
  assert.match(csv, /^tile_id,dataset,volunteer_id,clazz,severity\n/);
  assert.match(csv, /"tile_001","DEMO_SIM_T","vol_contract","stripe","medium"/);
});

test("label contract rejects invalid classes with pathful errors", () => {
  const label = createVolunteerLabel({ tile, state, controls });
  const result = validateContract("labelRecord", { ...label, clazz: "not-a-class" });
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].path, "labelRecord.clazz");
});

test("feed parser accepts JSON arrays and normalizes event values", () => {
  const payload = JSON.stringify([
    {
      type: "tile",
      tile_id: "tile_002",
      dataset: "DEMO_SIM_T",
      checksum: "sha256:test-002",
      png: "data:image/png;base64,iVBORw0KGgo=",
      ra: "120.5",
      dec: "-10.25",
      overlay: "gradient",
    },
    {
      type: "expert",
      tile_id: "tile_002",
      expert_class: "residual",
      expert_confidence: "0.92",
      latency_s: "2.4",
    },
  ]);

  const parsed = parseFeedPayload(payload);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.events.length, 2);
  assert.equal(parsed.events[0].ra, 120.5);
  assert.equal(parsed.events[1].expert_confidence, 0.92);
  assertContract("feedTileEvent", parsed.events[0]);
  assertContract("feedExpertEvent", parsed.events[1]);
});

test("feed parser accepts NDJSON and reports contract errors", () => {
  const lines = [
    JSON.stringify({
      type: "expert",
      tile_id: "tile_003",
      expert_class: "clean",
      expert_confidence: 0.7,
      latency_s: 3.1,
    }),
    JSON.stringify({
      type: "expert",
      tile_id: "tile_004",
      expert_class: "residual",
      expert_confidence: 1.7,
      latency_s: 0.5,
    }),
  ].join("\n");

  const parsed = parseFeedPayload(lines);
  assert.equal(parsed.events.length, 1);
  assert.equal(parsed.errors.length, 1);
  assert.match(parsed.errors[0].message, /expert_confidence/);
});

test("raw feed event validation remains strict before normalization", () => {
  const event = normalizeFeedEvent({
    type: "expert",
    tile_id: "tile_005",
    expert_class: "residual",
    expert_confidence: 0.6,
    latency_s: 1,
  });
  assert.equal(validateFeedEvent(event).valid, true);

  const missingRequired = validateFeedEvent({ type: "expert", tile_id: "tile_006" });
  assert.equal(missingRequired.valid, false);
  assert.ok(missingRequired.errors.some((error) => error.path === "feedExpertEvent.expert_class"));
});

test("bookmark payloads are versioned and round-trip through base64", () => {
  const payload = createBookmarkPayload({
    tile,
    overlay: "gradient",
    palette: "cividis",
    rate: 1.5,
    loop: true,
    captions: true,
    seed: 12648430,
  });
  assert.equal(payload.schema_version, CONTRACT_SCHEMA_VERSION);
  assertContract("bookmarkPayload", payload);

  const encoded = encodeBookmarkPayload(payload);
  const decoded = decodeBookmarkPayload(encoded);
  assert.deepEqual(decoded, payload);

  const url = createBookmarkUrl(payload, { origin: "https://example.test", pathname: "/cosmos/" });
  assert.match(url, /^https:\/\/example\.test\/cosmos\/#state=/);
});

test("report exports satisfy SBOM and validation report contracts", () => {
  const sbom = createSbom({ generatedAt: "2026-06-28T00:00:00.000Z" });
  assertContract("cycloneDxSbom", sbom);
  assert.equal(sbom.components[0].name, "Chart.js");

  const label = createVolunteerLabel({ tile, state, controls });
  const report = createValidationReport({
    build: createBuildInfo({ dev: false }),
    labels: [label],
    feedErrors: [{ message: "bad feed" }],
    checks: [
      { name: "label schema", status: "pass", detail: "label contract valid" },
      { name: "feed schema", status: "fail", detail: "one feed event rejected" },
    ],
  });

  assertContract("validationReport", report);
  assert.equal(report.summary.label_count, 1);
  assert.equal(report.summary.feed_error_count, 1);
  assert.equal(report.summary.pass_count, 1);
  assert.equal(report.summary.fail_count, 1);
});

test("validation report rejects unsupported check statuses", () => {
  assert.throws(
    () =>
      createValidationReport({
        checks: [{ name: "unknown status", status: "skip" }],
      }),
    /Invalid validationReport contract/,
  );
});
