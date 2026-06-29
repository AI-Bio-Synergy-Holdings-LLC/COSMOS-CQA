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
import { parseResearchArtifactPayload } from "../../../packages/core/src/research-artifacts/index.js";
import {
  createBookmarkPayload,
  createBookmarkUrl,
  createBuildInfo,
  decodeBookmarkPayload,
  encodeBookmarkPayload,
} from "../../../packages/core/src/provenance/index.js";
import { createSbom, createSbomReference, createValidationReport } from "../../../packages/core/src/reports/index.js";
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

test("package entrypoints expose shared schema and core surfaces", () => {
  assert.equal(typeof assertContract, "function");
  assert.equal(typeof createVolunteerLabel, "function");
  assert.equal(typeof parseFeedPayload, "function");
  assert.equal(typeof parseResearchArtifactPayload, "function");
  assert.equal(typeof createBookmarkPayload, "function");
  assert.equal(typeof createResearchSession, "function");
  assert.equal(typeof createEvidenceBundle, "function");
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
    manifest_id: "corepack_demo-v0.1.0",
    name: "COSMOS-CQA Demo Core Pack",
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
