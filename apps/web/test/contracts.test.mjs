import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { CONTRACT_SCHEMA_VERSION, assertContract, validateContract } from "../../../packages/schemas/src/index.js";
import { createDiagnosticPlaceholders } from "../../../packages/core/src/diagnostics/index.js";
import {
  createEvidenceBundle,
  createResearchSession,
  parseEvidenceBundleJson,
  serializeEvidenceBundle,
  summarizeResearchSession,
  validateEvidenceBundleJson,
} from "../../../packages/core/src/evidence/index.js";
import { normalizeFeedEvent, parseFeedPayload, validateFeedEvent } from "../../../packages/core/src/feeds/index.js";
import { buildCSV, createVolunteerLabel, labelsToRows } from "../../../packages/core/src/labels/index.js";
import {
  DEFAULT_VIEWER_TRANSFORM,
  adjudicateTileObservationReview,
  createObservationReviewEvent,
  createTileObservation,
  createTileObservationTaxonomy,
  createViewerTransformMatrix,
  getTileObservationZone,
  normalizeViewerTransform,
  summarizeTileObservations,
  transformSourceToViewportPoint,
  transformViewportPointToSource,
  updateTileObservationReview,
} from "../../../packages/core/src/observations/index.js";
import { parseResearchArtifactPayload } from "../../../packages/core/src/research-artifacts/index.js";
import {
  createBookmarkPayload,
  createBookmarkUrl,
  createBuildInfo,
  decodeBookmarkPayload,
  encodeBookmarkPayload,
} from "../../../packages/core/src/provenance/index.js";
import { createSbom, createSbomReference, createValidationReport } from "../../../packages/core/src/reports/index.js";
import {
  createReviewIntakeEnvelope,
  createReviewReturnEnvelope,
  createReviewerIdentityClaim,
  parseReviewIntakeEnvelopeJson,
  serializeReviewIntakeEnvelope,
  serializeReviewReturnEnvelope,
  validateReviewReturnEnvelopeJson,
} from "../../../packages/core/src/review-intake/index.js";
import { TARGET_COVERAGE, expectedBrowserTargetIds } from "./browser/fixtures/legacy-targets.mjs";

const legacyChecklistTargets = JSON.parse(
  await readFile(new URL("../../../tests/evidence/legacy-v3-checklist-targets.json", import.meta.url), "utf8"),
);
const researchSessionFixture = JSON.parse(
  await readFile(new URL("../../../examples/evidence-bundle/research-session.json", import.meta.url), "utf8"),
);
const evidenceBundleFixture = JSON.parse(
  await readFile(new URL("../../../examples/evidence-bundle/evidence-bundle.json", import.meta.url), "utf8"),
);
const computationalReferenceFixture = JSON.parse(
  await readFile(
    new URL("../../../examples/computational-references/synthetic-computational-reference.json", import.meta.url),
    "utf8",
  ),
);
const legacyChecklistSource = await readFile(
  new URL("../../../archive/original-materials/legacy-v3/COSMOS_TEST_CHECKLIST_v3.html", import.meta.url),
  "utf8",
);
const expectedBrowserCoveredTargets = expectedBrowserTargetIds();

const tile = {
  meta: {
    tile_id: "tile_001",
    dataset: "DEMO_SIM_T",
    release: "v0",
    doi: "",
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

test("tile observation records link normalized targets to labels", () => {
  const label = createVolunteerLabel({ tile, state, controls });
  const target = {
    x_norm: 0.42,
    y_norm: 0.21,
    ...getTileObservationZone({ xNorm: 0.42, yNorm: 0.21 }),
  };
  const observation = createTileObservation({
    tile,
    label,
    target,
    overlay: "gradient",
    palette: "cividis",
  });

  assertContract("tileObservation", observation);
  assert.equal(observation.label_id, label.label_id);
  assert.equal(observation.zone_id, "r1c2");
  assert.equal(observation.zone_label, "top center");
  assert.equal(observation.x_norm, 0.42);
  assert.equal(observation.y_norm, 0.21);
  assert.equal(observation.zone_taxonomy.row_band, "top");
  assert.equal(observation.zone_taxonomy.column_band, "center");
  assert.equal(observation.zone_taxonomy.radial_band, "mid-field");
  assert.match(observation.zone_taxonomy.interpretation, /not measured sky coordinates/);

  const taxonomy = createTileObservationTaxonomy({ xNorm: 0.12, yNorm: 0.88 });
  assert.equal(taxonomy.row_band, "bottom");
  assert.equal(taxonomy.column_band, "left");
  assert.equal(taxonomy.quadrant, "lower-left");

  const summary = summarizeTileObservations([observation]);
  assertContract("tileObservationSummary", summary);
  assert.equal(summary.observation_count, 1);
  assert.equal(summary.observed_tile_count, 1);
  assert.equal(summary.observed_zone_count, 1);
  assert.equal(summary.dominant_zone_label, "top center");
  assert.deepEqual(summary.tile_counts[0], { key: "tile_001", label: "tile_001", count: 1 });
  assert.deepEqual(summary.zone_counts[0], { key: "r1c2", label: "top center", count: 1 });
  assert.deepEqual(summary.tile_zone_counts[0], { key: "tile_001:r1c2", label: "tile_001 top center", count: 1 });
  assert.deepEqual(summary.note_status_counts[0], { key: "with_note", label: "with note", count: 1 });
  assert.deepEqual(summary.review_state_counts[0], { key: "submitted", label: "submitted", count: 1 });
  assert.deepEqual(summary.review_status_counts[0], { key: "pending-review", label: "pending-review", count: 1 });
  assert.deepEqual(summary.consensus_status_counts[0], { key: "not-assessed", label: "not-assessed", count: 1 });
  assert.equal(summary.review_event_count, 0);
  assert.equal(summary.average_reviewer_confidence, 0.85);
  assert.deepEqual(summary.tile_qa_metrics[0], {
    key: "tile_001",
    label: "tile_001",
    observation_count: 1,
    reviewed_count: 0,
    needs_adjudication_count: 0,
    ledger_event_count: 0,
    average_reviewer_confidence: 0.85,
  });

  const createEvent = createObservationReviewEvent({
    action: "create",
    observation,
    label,
    eventIndex: 0,
    eventTs: "2026-06-29T11:00:00.000Z",
    eventSummary: "contract create event",
  });
  assertContract("observationReviewEvent", createEvent);
  assert.equal(createEvent.action, "create");
  assert.equal(createEvent.active_after, true);
  assert.match(createEvent.claim_boundary, /not validated detections/);

  const review = updateTileObservationReview({
    observation,
    label,
    updates: {
      clazz: "dipole",
      severity: "high",
      note: "reviewed spatial target top center with stronger dipole interpretation",
      reviewStatus: "needs-adjudication",
      reviewerConfidence: 0.7,
    },
    updatedAt: "2026-06-29T12:00:00.000Z",
    updatedBy: "reviewer_contract",
  });
  assertContract("tileObservation", review.observation);
  assertContract("labelRecord", review.label);
  assert.equal(review.observation.review_revision, 1);
  assert.equal(review.observation.review_state, "edited");
  assert.equal(review.observation.review_status, "needs-adjudication");
  assert.equal(review.observation.reviewer_confidence, 0.7);
  assert.equal(review.observation.consensus_status, "needs-adjudication");
  assert.match(review.observation.adjudication_state, /adjudication placeholder/);
  assert.equal(review.label.clazz, "dipole");
  assert.equal(review.label.note, review.observation.note);
  assert.match(review.observation.edit_summary, /class stripe -> dipole/);
  const editEvent = createObservationReviewEvent({
    action: "edit",
    observation: review.observation,
    label: review.label,
    eventIndex: 1,
    eventTs: "2026-06-29T12:00:00.000Z",
    eventSummary: review.edit_summary,
  });
  const editedSummary = summarizeTileObservations([review.observation], [createEvent, editEvent]);
  assert.deepEqual(editedSummary.review_state_counts[0], { key: "edited", label: "edited", count: 1 });
  assert.deepEqual(editedSummary.review_status_counts[0], { key: "needs-adjudication", label: "needs-adjudication", count: 1 });
  assert.equal(editedSummary.review_event_count, 2);
  assert.equal(editedSummary.needs_adjudication_count, 1);
  assert.equal(editedSummary.zone_qa_metrics[0].ledger_event_count, 2);

  const adjudication = adjudicateTileObservationReview({
    observation: review.observation,
    label: review.label,
    decision: "mark-reviewed",
    note: "queue triage complete after independent reviewer routing placeholder",
    updatedAt: "2026-06-29T12:10:00.000Z",
    updatedBy: "reviewer_contract",
  });
  assertContract("tileObservation", adjudication.observation);
  assertContract("labelRecord", adjudication.label);
  assert.equal(adjudication.event_action, "adjudication-reviewed");
  assert.equal(adjudication.adjudication_decision, "mark-reviewed");
  assert.equal(adjudication.observation.review_revision, 2);
  assert.equal(adjudication.observation.review_status, "reviewed");
  assert.equal(adjudication.observation.consensus_status, "single-reviewer");
  assert.match(adjudication.observation.adjudication_state, /single-reviewer QA/);
  const adjudicationEvent = createObservationReviewEvent({
    action: adjudication.event_action,
    observation: adjudication.observation,
    label: adjudication.label,
    eventIndex: 2,
    eventTs: "2026-06-29T12:10:00.000Z",
    eventSummary: adjudication.event_summary,
    adjudicationDecision: adjudication.adjudication_decision,
  });
  assertContract("observationReviewEvent", adjudicationEvent);
  assert.equal(adjudicationEvent.adjudication_decision, "mark-reviewed");
  assert.equal(adjudicationEvent.review_status, "reviewed");
  assert.equal(adjudicationEvent.consensus_status, "single-reviewer");
  assert.throws(
    () => adjudicateTileObservationReview({ observation: review.observation, label: review.label, decision: "defer", note: "" }),
    /Adjudication note is required/,
  );

  const rows = labelsToRows([label], [tile], [], [observation]);
  assert.equal(rows[0].observation_id, observation.observation_id);
  assert.equal(rows[0].observation_zone_label, "top center");
  assert.equal(rows[0].observation_x_norm, 0.42);

  const invalid = validateContract("tileObservation", { ...observation, note: "" });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.path === "tileObservation.note"));
});

test("viewer transforms round-trip source tile observation coordinates", () => {
  const transform = normalizeViewerTransform({
    zoom: 1.5,
    panX: 32,
    panY: 32,
    rotationDeg: 90,
  });
  const viewport = transformSourceToViewportPoint({
    xNorm: 0.42,
    yNorm: 0.21,
    width: 512,
    height: 512,
    transform,
  });
  const source = transformViewportPointToSource({
    x: viewport.x,
    y: viewport.y,
    width: 512,
    height: 512,
    transform,
  });

  assert.deepEqual(transform, { zoom: 1.5, panX: 32, panY: 32, rotationDeg: 90 });
  assert.match(createViewerTransformMatrix({ width: 512, height: 512, transform }).css, /^matrix\(/);
  assert.equal(source.in_bounds, true);
  assert.equal(source.x_norm, 0.42);
  assert.equal(source.y_norm, 0.21);
  assert.deepEqual(normalizeViewerTransform({ zoom: 20, panX: 999, panY: -999, rotationDeg: -90 }), {
    zoom: 4,
    panX: 320,
    panY: -320,
    rotationDeg: 270,
  });
});

test("package entrypoints expose shared schema and core surfaces", () => {
  assert.equal(typeof assertContract, "function");
  assert.equal(typeof createVolunteerLabel, "function");
  assert.equal(typeof createTileObservation, "function");
  assert.equal(typeof createObservationReviewEvent, "function");
  assert.equal(typeof summarizeTileObservations, "function");
  assert.equal(typeof createViewerTransformMatrix, "function");
  assert.equal(typeof transformViewportPointToSource, "function");
  assert.equal(typeof updateTileObservationReview, "function");
  assert.equal(typeof adjudicateTileObservationReview, "function");
  assert.deepEqual(DEFAULT_VIEWER_TRANSFORM, { zoom: 1, panX: 0, panY: 0, rotationDeg: 0 });
  assert.equal(typeof parseFeedPayload, "function");
  assert.equal(typeof parseResearchArtifactPayload, "function");
  assert.equal(typeof createBookmarkPayload, "function");
  assert.equal(typeof createResearchSession, "function");
  assert.equal(typeof createEvidenceBundle, "function");
  assert.equal(typeof createReviewIntakeEnvelope, "function");
  assert.equal(typeof createReviewReturnEnvelope, "function");
  assert.equal(typeof createSbomReference, "function");
  assert.equal(typeof createValidationReport, "function");
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
  const observation = createTileObservation({
    tile,
    label,
    target: {
      x_norm: 0.42,
      y_norm: 0.21,
      ...getTileObservationZone({ xNorm: 0.42, yNorm: 0.21 }),
    },
  });
  const reviewEvent = createObservationReviewEvent({
    action: "create",
    observation,
    label,
    eventIndex: 0,
    eventTs: "2026-06-28T00:05:00.000Z",
    eventSummary: "report export create event",
  });
  const report = createValidationReport({
    build: createBuildInfo({ dev: false }),
    labels: [label],
    observations: [observation],
    observationReviewEvents: [reviewEvent],
    feedErrors: [{ message: "bad feed" }],
    checks: [
      { name: "label schema", status: "pass", detail: "label contract valid" },
      { name: "feed schema", status: "fail", detail: "one feed event rejected" },
    ],
  });

  assertContract("validationReport", report);
  assert.match(report.license, /Research-only public use/);
  assert.ok(report.limitations.some((limitation) => limitation.includes("research artifacts")));
  assert.equal(report.summary.label_count, 1);
  assert.equal(report.summary.feed_error_count, 1);
  assert.equal(report.summary.pass_count, 1);
  assert.equal(report.summary.fail_count, 1);
  assert.equal(report.summary.observation_count, 1);
  assert.equal(report.summary.observed_zone_count, 1);
  assert.equal(report.summary.observation_note_count, 1);
  assert.equal(report.summary.observation_review_event_count, 1);
  assert.equal(report.observation_review_events[0].event_id, reviewEvent.event_id);
  assert.equal(report.observation_summary.dominant_zone_label, "top center");
  assert.equal(report.observation_summary.review_event_count, 1);
});

test("tile passport and core pack manifests satisfy evidence contracts", () => {
  const generatedAt = "2026-06-28T00:00:00.000Z";
  const tilePassport = {
    schema_version: CONTRACT_SCHEMA_VERSION,
    tile_id: tile.meta.tile_id,
    dataset: tile.meta.dataset,
    release: tile.meta.release,
    doi: tile.meta.doi,
    band: "T",
    ra: 120.5,
    dec: -10.25,
    checksum: tile.meta.checksum,
    truth: tile.meta.truth,
    provenance: {
      source: "canonical-v3-import",
      source_url: tile.meta.url,
      archive_path: "archive/original-materials/legacy-v3/COSMOS_v3_public.html",
      generated_at: generatedAt,
      notes: "Demo tile passport for contract stability tests.",
    },
    sidecars: {
      audio_map: "dft32_rowmeans",
      overlay_modes: ["none", "gradient", "rings", "wavelet"],
      palette_modes: ["gray", "viridis", "cividis"],
      metrics: ["pr_auc", "median_latency"],
    },
  };

  const sbomReference = {
    schema_version: CONTRACT_SCHEMA_VERSION,
    sbom_id: "sbom_v0.1.0-research-alpha",
    format: "CycloneDX",
    spec_version: "1.4",
    path: "docs/releases/v0.1.0-research-alpha-sbom.json",
    checksum: "sha256:v0.1.0-research-alpha-sbom",
    generated_at: generatedAt,
    component_name: "COSMOS-CQA Research Workbench",
  };

  assertContract("tilePassport", tilePassport);
  assertContract("sbomReference", sbomReference);
  assertContract("corePackManifest", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    manifest_id: "corepack_synthetic-contract-v0.1.1",
    name: "COSMOS-CQA Synthetic Contract Core Pack Fixture",
    version: "v0.1.0-research-alpha",
    generated_at: generatedAt,
    license: "Research-only public use; all other rights reserved.",
    steward: "AI-Bio Synergy Holdings LLC",
    tiles: [tilePassport],
    sbom_refs: [sbomReference],
    evidence_refs: [
      {
        kind: "legacy-checklist-targets",
        path: "tests/evidence/legacy-v3-checklist-targets.json",
      },
    ],
  });
});

test("computational reference fixture is synthetic, non-live, and non-diagnostic", () => {
  assertContract("computationalReference", computationalReferenceFixture);
  assert.equal(computationalReferenceFixture.synthetic_fixture, true);
  assert.equal(computationalReferenceFixture.live_api_call, false);
  assert.equal(computationalReferenceFixture.api_client_implemented, false);
  assert.equal(computationalReferenceFixture.mcp_config_included, false);
  assert.equal(computationalReferenceFixture.external_content_copied, false);
  assert.equal(computationalReferenceFixture.diagnostic_validation, false);
  assert.equal(computationalReferenceFixture.training_data_use, false);
  assert.equal(computationalReferenceFixture.provider_type, "synthetic");
  assert.equal(computationalReferenceFixture.review_state, "not-reviewed");
  assert.match(computationalReferenceFixture.claim_boundary, /not diagnostic validation/);

  const serializedFixture = JSON.stringify(computationalReferenceFixture);
  assert.doesNotMatch(serializedFixture, /wolfram|appid|api\.wolframalpha|mcpServers|podstate|subpod|plaintext/i);
  assert.doesNotMatch(serializedFixture, /https?:\/\//i);
});

test("computational reference contract rejects live clients and validation claims", () => {
  const liveApi = validateContract("computationalReference", {
    ...computationalReferenceFixture,
    live_api_call: true,
  });
  assert.equal(liveApi.valid, false);
  assert.ok(liveApi.errors.some((error) => error.path === "computationalReference.live_api_call"));

  const apiClient = validateContract("computationalReference", {
    ...computationalReferenceFixture,
    api_client_implemented: true,
  });
  assert.equal(apiClient.valid, false);
  assert.ok(apiClient.errors.some((error) => error.path === "computationalReference.api_client_implemented"));

  const mcpConfig = validateContract("computationalReference", {
    ...computationalReferenceFixture,
    mcp_config_included: true,
  });
  assert.equal(mcpConfig.valid, false);
  assert.ok(mcpConfig.errors.some((error) => error.path === "computationalReference.mcp_config_included"));

  const diagnosticClaim = validateContract("computationalReference", {
    ...computationalReferenceFixture,
    diagnostic_validation: true,
  });
  assert.equal(diagnosticClaim.valid, false);
  assert.ok(diagnosticClaim.errors.some((error) => error.path === "computationalReference.diagnostic_validation"));

  const copiedContent = validateContract("computationalReference", {
    ...computationalReferenceFixture,
    external_content_copied: true,
  });
  assert.equal(copiedContent.valid, false);
  assert.ok(copiedContent.errors.some((error) => error.path === "computationalReference.external_content_copied"));
});

test("legacy checklist targets are tracked as evidence contract data", () => {
  assertContract("checklistTestTargets", legacyChecklistTargets);
  const sourceSha256 = `sha256:${createHash("sha256").update(legacyChecklistSource).digest("hex").toUpperCase()}`;
  assert.equal(legacyChecklistTargets.legacy_claimed_total, 100);
  assert.equal(legacyChecklistTargets.source_sha256, sourceSha256);
  assert.equal(legacyChecklistTargets.manual_target_count, 86);
  assert.equal(legacyChecklistTargets.bridge_target_count, 7);
  assert.equal(legacyChecklistTargets.targets.length, 93);
  assert.equal(new Set(legacyChecklistTargets.targets.map((target) => target.id)).size, 93);
  assert.equal(legacyChecklistTargets.targets.filter((target) => target.mode === "manual").length, 86);
  assert.equal(legacyChecklistTargets.targets.filter((target) => target.mode === "bridge").length, 7);
  assert.equal(legacyChecklistTargets.targets.filter((target) => target.mode === "manual" && target.status === "migrated").length, 86);
  assert.equal(legacyChecklistTargets.targets.filter((target) => target.covered_by?.some((path) => path.startsWith("apps/web/test/browser/"))).length, 93);
  for (const targetId of expectedBrowserCoveredTargets) {
    const target = legacyChecklistTargets.targets.find((entry) => entry.id === targetId);
    assert.equal(target?.automation, "automated", targetId);
    assert.equal(target?.status, "migrated", targetId);
    assert.deepEqual(target?.covered_by, [TARGET_COVERAGE.get(targetId)], targetId);
  }
  assert.ok(legacyChecklistTargets.targets.every((target) => isAscii(target.label)));
  assert.ok(legacyChecklistTargets.targets.some((target) => target.data_testid === "sbom-exported"));
});

test("research session and evidence bundle fixtures satisfy evidence workspace contracts", () => {
  assertContract("researchSession", researchSessionFixture);
  assertContract("evidenceBundle", evidenceBundleFixture);
  const serializedBundle = serializeEvidenceBundle(evidenceBundleFixture);
  const bundleValidation = validateEvidenceBundleJson(serializedBundle);
  assert.deepEqual(evidenceBundleFixture.session, researchSessionFixture);
  assert.deepEqual(evidenceBundleFixture.summary, summarizeResearchSession(researchSessionFixture));
  assert.equal(bundleValidation.valid, true);
  assert.deepEqual(bundleValidation.bundle, evidenceBundleFixture);
  assert.deepEqual(parseEvidenceBundleJson(serializedBundle), evidenceBundleFixture);
  assert.equal(evidenceBundleFixture.steward, "AI-Bio Synergy Holdings LLC");
  assert.match(evidenceBundleFixture.license, /Research-only public use/);
  assert.ok(evidenceBundleFixture.limitations.some((limitation) => limitation.includes("not production")));
});

test("research session and evidence bundle helpers preserve report evidence counts", () => {
  const generatedAt = "2026-06-29T00:00:00.000Z";
  const diagnostics = createDiagnosticPlaceholders({
    manifest: {
      manifest_id: "corepack_contract_session",
      tiles: [tile.meta],
    },
    generatedAt,
  });
  const report = createValidationReport({
    build: createBuildInfo({ dev: false }),
    checks: [{ name: "diagnostic placeholders", status: "pass", detail: "caveated placeholders attached" }],
    diagnostics,
    generatedAt,
    reportId: "rpt_contract_session",
  });
  const session = createResearchSession({
    sessionId: "session_contract_session",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    build: createBuildInfo({ dev: false }),
    selectedTiles: [
      {
        tile_id: tile.meta.tile_id,
        dataset: tile.meta.dataset,
        checksum: tile.meta.checksum,
        selected_at: generatedAt,
        overlay: "gradient",
        palette: "cividis",
        review_state: "contract-test",
      },
    ],
    diagnostics,
    reports: [report],
  });
  const bundle = createEvidenceBundle({
    bundleId: "bundle_contract_session",
    generatedAt,
    session,
  });

  assertContract("researchSession", session);
  assertContract("evidenceBundle", bundle);
  assert.equal(session.reports[0].diagnostics.length, 2);
  assert.deepEqual(bundle.summary, {
    artifact_count: 0,
    selected_tile_count: 1,
    label_count: 0,
    diagnostic_count: 2,
    report_count: 1,
    provenance_hash_count: 0,
    sbom_ref_count: 0,
  });
  assert.ok(bundle.limitations.some((limitation) => limitation.includes("not production")));
});

test("research sessions preserve linked tile observations as additive evidence", () => {
  const generatedAt = "2026-06-29T00:00:00.000Z";
  const label = createVolunteerLabel({
    tile,
    state,
    controls: {
      classSelect: { value: "stripe" },
      severitySelect: { value: "medium" },
      noteInput: { value: "spatial target top center" },
    },
  });
  const observation = createTileObservation({
    tile,
    label,
    target: {
      x_norm: 0.4,
      y_norm: 0.2,
      ...getTileObservationZone({ xNorm: 0.4, yNorm: 0.2 }),
    },
    generatedAt,
  });
  const reviewEvent = createObservationReviewEvent({
    action: "create",
    observation,
    label,
    eventIndex: 0,
    eventTs: generatedAt,
    eventSummary: "session export create event",
  });
  const session = createResearchSession({
    sessionId: "session_observation_contract",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    labels: [label],
    observations: [observation],
    observationReviewEvents: [reviewEvent],
  });
  const bundle = createEvidenceBundle({
    bundleId: "bundle_observation_contract",
    generatedAt,
    session,
  });

  assertContract("researchSession", session);
  assertContract("evidenceBundle", bundle);
  assert.equal(session.observations[0].label_id, label.label_id);
  assert.equal(session.observation_review_events[0].event_id, reviewEvent.event_id);
  assert.equal(bundle.observation_review_events[0].event_id, reviewEvent.event_id);
  assert.equal(bundle.summary.observation_count, 1);
  assert.equal(bundle.summary.observation_review_event_count, 1);
  assert.equal(bundle.summary.observed_tile_count, 1);
  assert.equal(bundle.summary.observed_zone_count, 1);
  assert.equal(bundle.summary.observation_note_count, 1);
  assert.equal(bundle.observation_summary.zone_counts[0].label, "top center");
  assert.equal(bundle.observation_summary.review_event_count, 1);
  assert.equal(bundle.observation_summary.tile_qa_metrics[0].ledger_event_count, 1);
  assert.equal(summarizeResearchSession(session).observation_count, 1);
  assert.equal(summarizeResearchSession(session).observation_review_event_count, 1);
});

test("reviewer intake and return packets preserve local research boundaries", async () => {
  const generatedAt = "2026-06-30T14:00:00.000Z";
  const label = createVolunteerLabel({
    tile,
    state,
    controls: {
      classSelect: { value: "stripe" },
      severitySelect: { value: "medium" },
      noteInput: { value: "top center stripe candidate for reviewer packet contract" },
    },
  });
  const observation = createTileObservation({
    tile,
    label,
    target: {
      x_norm: 0.42,
      y_norm: 0.21,
      ...getTileObservationZone({ xNorm: 0.42, yNorm: 0.21 }),
    },
    generatedAt,
  });
  const reviewEvent = createObservationReviewEvent({
    action: "create",
    observation,
    label,
    eventIndex: 0,
    eventTs: generatedAt,
    eventSummary: "review packet create event",
  });
  const session = createResearchSession({
    sessionId: "session_reviewer_packet_contract",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    labels: [label],
    observations: [observation],
    observationReviewEvents: [reviewEvent],
  });
  const bundle = createEvidenceBundle({
    bundleId: "bundle_reviewer_packet_contract",
    generatedAt,
    session,
  });
  const reviewerIdentity = createReviewerIdentityClaim({
    reviewerId: "reviewer_contract",
    displayName: "Contract reviewer",
  });
  const intake = await createReviewIntakeEnvelope({
    bundle,
    reviewerIdentity,
    generatedAt,
  });

  assertContract("reviewIntakeEnvelope", intake);
  assert.equal(intake.packet_type, "review-intake");
  assert.equal(intake.authenticated_access, false);
  assert.equal(intake.network_submission, false);
  assert.equal(intake.transport_state, "local-export");
  assert.equal(intake.reviewer_identity.auth_state, "unauthenticated-local");
  assert.match(intake.reviewer_identity.claim_boundary, /metadata only/);
  assert.equal(intake.contributor_consent.contains_personal_data, false);
  assert.equal(intake.assignment.source_session_id, session.session_id);
  assert.equal(intake.assignment.source_bundle_id, bundle.bundle_id);
  assert.equal(intake.assignment.observation_ids[0], observation.observation_id);
  assert.match(intake.source_session_sha256, /^sha256:[a-f0-9]{64}$/);
  assert.match(intake.source_bundle_sha256, /^sha256:[a-f0-9]{64}$/);

  const intakeText = serializeReviewIntakeEnvelope(intake);
  assert.deepEqual(parseReviewIntakeEnvelopeJson(intakeText), intake);

  const returnPacket = await createReviewReturnEnvelope({
    session,
    assignment: intake.assignment,
    reviewerIdentity: intake.reviewer_identity,
    generatedAt: "2026-06-30T14:05:00.000Z",
  });
  const returnText = serializeReviewReturnEnvelope(returnPacket);
  const returnValidation = validateReviewReturnEnvelopeJson(returnText);

  assertContract("reviewReturnEnvelope", returnPacket);
  assert.equal(returnPacket.packet_type, "review-return");
  assert.equal(returnPacket.authenticated_access, false);
  assert.equal(returnPacket.network_submission, false);
  assert.equal(returnPacket.review_event_count, 1);
  assert.equal(returnPacket.research_session.observation_review_events[0].event_id, reviewEvent.event_id);
  assert.equal(returnValidation.valid, true);
  assert.deepEqual(returnValidation.envelope, returnPacket);

  const forgedAccess = validateContract("reviewIntakeEnvelope", { ...intake, authenticated_access: true });
  assert.equal(forgedAccess.valid, false);
  assert.ok(forgedAccess.errors.some((error) => error.path === "reviewIntakeEnvelope.authenticated_access"));
});

test("research session and evidence bundle reject malformed required fields", () => {
  const missingBuild = structuredClone(researchSessionFixture);
  delete missingBuild.build;
  const sessionResult = validateContract("researchSession", missingBuild);
  assert.equal(sessionResult.valid, false);
  assert.ok(sessionResult.errors.some((error) => error.path === "researchSession.build"));

  const badTile = structuredClone(researchSessionFixture);
  delete badTile.selected_tiles[0].checksum;
  const tileResult = validateContract("researchSession", badTile);
  assert.equal(tileResult.valid, false);
  assert.ok(tileResult.errors.some((error) => error.path === "researchSession.selected_tiles[0].checksum"));

  const missingLimitations = structuredClone(evidenceBundleFixture);
  delete missingLimitations.limitations;
  const bundleResult = validateContract("evidenceBundle", missingLimitations);
  assert.equal(bundleResult.valid, false);
  assert.ok(bundleResult.errors.some((error) => error.path === "evidenceBundle.limitations"));

  const malformedJson = validateEvidenceBundleJson('{"schema_version":"cosmos-cqa.contracts.v0.1.0"}');
  assert.equal(malformedJson.valid, false);
  assert.ok(malformedJson.errors.some((error) => error.includes("evidenceBundle.bundle_id")));
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

test("validation report rejects malformed diagnostic placeholder entries", () => {
  const diagnostics = createDiagnosticPlaceholders({
    manifest: {
      manifest_id: "corepack_contract_diag",
      tiles: [tile.meta],
    },
    generatedAt: "2026-06-28T00:00:00.000Z",
  });

  assert.throws(
    () =>
      createValidationReport({
        diagnostics: [{ ...diagnostics[0], caveat: "Too short." }],
      }),
    /Invalid validationReport contract/,
  );
});

function isAscii(value) {
  return [...value].every((char) => char.charCodeAt(0) <= 127);
}
