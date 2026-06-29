import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { assertContract } from "../../../packages/schemas/src/index.js";
import {
  assertCorePackManifest,
  validateCorePackManifest,
} from "../../../packages/core/src/core-pack/index.js";
import {
  DIAGNOSTIC_CONCEPTS,
  createDiagnosticPlaceholders,
  diagnosticRefsForCorePack,
} from "../../../packages/core/src/diagnostics/index.js";
import { parseResearchArtifactPayload } from "../../../packages/core/src/research-artifacts/index.js";
import { createProvenanceHash, sha256Text } from "../../../packages/core/src/provenance/index.js";
import { createSbom, createSbomReference, createValidationReport } from "../../../packages/core/src/reports/index.js";

const manifest = JSON.parse(
  await readFile(new URL("../../../examples/core-pack/core-pack.manifest.json", import.meta.url), "utf8"),
);

test("sample Core Pack manifest satisfies schema and intake validation", () => {
  assertContract("corePackManifest", manifest);
  assertCorePackManifest(manifest);

  const result = validateCorePackManifest(manifest);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.summary, {
    manifest_id: "corepack_demo-v0.1.0-intake",
    tile_count: 2,
    sbom_ref_count: 1,
    evidence_ref_count: 5,
    diagnostic_ref_count: 2,
  });
});

test("diagnostic references remain concept-only and caveated", () => {
  assert.deepEqual(
    manifest.diagnostic_refs.map((concept) => concept.diagnostic_id),
    DIAGNOSTIC_CONCEPTS.map((concept) => concept.diagnostic_id),
  );
  assert.deepEqual(manifest.diagnostic_refs, diagnosticRefsForCorePack());

  for (const concept of manifest.diagnostic_refs) {
    assert.equal(concept.implementation_state, "documentation-only");
    assert.match(concept.caveat, /not a validated/i);
    assert.ok(concept.blocked_until.length >= 4);
    assert.ok(concept.claim_boundary_refs.includes("docs/claim-boundaries.md"));
  }
});

test("Core Pack validator blocks executable or under-caveated diagnostics during intake", () => {
  const unsafe = structuredClone(manifest);
  unsafe.diagnostic_refs[0] = {
    ...unsafe.diagnostic_refs[0],
    implementation_state: "planned",
    caveat: "Too short.",
  };

  const result = validateCorePackManifest(unsafe);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("caveat must be explicit")));
  assert.ok(result.errors.some((error) => error.includes("executable diagnostic implementations are blocked")));
});

test("Core Pack CLI validator accepts the sample manifest", () => {
  const script = fileURLToPath(new URL("../scripts/validate-core-pack.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Core Pack manifest OK/);
  assert.match(result.stdout, /diagnostic_refs=2/);
});

test("research artifact loader classifies Core Pack manifests with provenance hashes", async () => {
  const text = JSON.stringify(manifest);
  const result = await parseResearchArtifactPayload(text, {
    source: "examples/core-pack/core-pack.manifest.json",
    generatedAt: "2026-06-28T00:00:00.000Z",
  });

  assert.equal(result.kind, "core-pack");
  assert.equal(result.artifact.kind, "core-pack");
  assert.equal(result.artifact.manifest_id, manifest.manifest_id);
  assert.equal(result.artifact.record_count, 2);
  assert.equal(result.errors.length, 0);
  assert.equal(result.provenanceHash.algorithm, "sha256");
  assert.match(result.provenanceHash.value, /^sha256:[a-f0-9]{64}$/);
});

test("research artifact loader classifies feed payloads with contract errors", async () => {
  const feedText = JSON.stringify([
    {
      type: "expert",
      tile_id: "demo_corepack_tile_001",
      expert_class: "residual",
      expert_confidence: 0.9,
      latency_s: 1.25,
    },
    {
      type: "expert",
      tile_id: "demo_corepack_tile_002",
      expert_class: "residual",
      expert_confidence: 1.5,
      latency_s: 1,
    },
  ]);
  const result = await parseResearchArtifactPayload(feedText, {
    source: "file:expert-feed.json",
    generatedAt: "2026-06-28T00:00:00.000Z",
  });

  assert.equal(result.kind, "feed");
  assert.equal(result.events.length, 1);
  assert.equal(result.errors.length, 1);
  assert.equal(result.artifact.record_count, 1);
  assert.equal(result.artifact.error_count, 1);
  assert.match(result.artifact.source_sha256, /^sha256:[a-f0-9]{64}$/);
});

test("diagnostic placeholders are deterministic, caveated, and schema-valid", () => {
  const generatedAt = "2026-06-28T00:00:00.000Z";
  const diagnostics = createDiagnosticPlaceholders({ manifest, generatedAt });

  assert.equal(diagnostics.length, 2);
  assert.deepEqual(
    diagnostics.map((diagnostic) => diagnostic.diagnostic_id),
    ["diag_kappa_y_crosscheck", "diag_eb_residual_placeholder"],
  );
  assert.deepEqual(createDiagnosticPlaceholders({ manifest, generatedAt }), diagnostics);

  for (const diagnostic of diagnostics) {
    assertContract("diagnosticResult", diagnostic);
    assert.equal(diagnostic.status, "placeholder");
    assert.equal(diagnostic.implementation_state, "placeholder");
    assert.match(diagnostic.caveat, /not a validated/i);
    assert.match(diagnostic.caveat, /must not be used/i);
    assert.ok(diagnostic.limitations.length >= 3);
    assert.ok(diagnostic.claim_boundary_refs.includes("docs/claim-boundaries.md"));
  }

  assert.deepEqual(
    diagnostics.map((diagnostic) => diagnostic.outputs.map((output) => [output.key, output.value])),
    [
      [
        ["placeholder_score", 0.31061],
        ["coordinate_component", 0.021638],
        ["latitude_component", 0.15405],
        ["checksum_component", 0.134922],
      ],
      [
        ["placeholder_score", 0.627477],
        ["residual_tile_fraction", 0.5],
        ["parity_component", 0.285674],
        ["checksum_component", 0.341803],
      ],
    ],
  );
});

test("validation reports carry artifacts, SBOM references, and provenance hashes", async () => {
  const generatedAt = "2026-06-28T00:00:00.000Z";
  const corePack = await parseResearchArtifactPayload(JSON.stringify(manifest), {
    source: "examples/core-pack/core-pack.manifest.json",
    generatedAt,
  });
  const sbom = createSbom({ generatedAt });
  const sbomText = JSON.stringify(sbom, null, 2);
  const sbomHash = createProvenanceHash({
    subject: "download:sbom.json",
    sha256: await sha256Text(sbomText),
    generatedAt,
  });
  const sbomRef = createSbomReference({
    sbom,
    path: "sbom.json",
    checksum: sbomHash.value,
    generatedAt,
  });
  const report = createValidationReport({
    generatedAt,
    reportId: "rpt_core_pack_intake_artifacts",
    artifacts: [corePack.artifact],
    sbomRefs: [sbomRef],
    provenanceHashes: [corePack.provenanceHash, sbomHash],
    diagnostics: createDiagnosticPlaceholders({ manifest, generatedAt }),
    checks: [
      { name: "Core Pack manifest", status: "pass", detail: "sample manifest loaded" },
      { name: "report JSON", status: "pass", detail: "generated before PDF" },
    ],
  });

  assertContract("validationReport", report);
  assert.equal(report.artifacts[0].manifest_id, manifest.manifest_id);
  assert.equal(report.sbom_refs[0].checksum, sbomHash.value);
  assert.equal(report.provenance_hashes.length, 2);
  assert.equal(report.diagnostics.length, 2);
  assert.equal(report.diagnostics[0].diagnostic_id, "diag_kappa_y_crosscheck");
  assert.match(report.license, /Research-only public use/);
  assert.ok(report.limitations.some((limitation) => limitation.includes("validated scientific results")));
});
