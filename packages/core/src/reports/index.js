import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";
import { summarizeTileObservations } from "../observations/index.js";
import { createBuildInfo } from "../provenance/index.js";

export const VALIDATION_REPORT_LICENSE = "Research-only public use; all other rights reserved.";
export const VALIDATION_REPORT_LIMITATIONS = [
  "Validation reports are research artifacts, not production decision-system certifications.",
  "Diagnostic entries may include caveated placeholders and must not be treated as validated scientific results.",
  "External datasets, SBOM references, and source artifacts remain subject to their own terms and provenance limits.",
];

export function createSbom({ generatedAt = new Date().toISOString(), extraComponents = [] } = {}) {
  return assertContract("cycloneDxSbom", {
    bomFormat: "CycloneDX",
    specVersion: "1.4",
    version: 1,
    metadata: {
      timestamp: generatedAt,
      component: {
        type: "application",
        name: "COSMOS-CQA Research Workbench",
        version: "0.0.0-source-split",
      },
    },
    components: [
      {
        type: "library",
        name: "Chart.js",
        version: "4.4.1",
        purl: "pkg:npm/chart.js@4.4.1",
        licenses: [{ license: { id: "MIT" } }],
      },
      ...extraComponents,
    ],
  });
}

export function createSbomReference({
  sbom,
  path = "sbom.json",
  checksum,
  generatedAt = sbom?.metadata?.timestamp || new Date().toISOString(),
  sbomId = `sbom_${safeId(sbom?.metadata?.component?.version || "source-split")}`,
} = {}) {
  return assertContract("sbomReference", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    sbom_id: sbomId,
    format: "CycloneDX",
    spec_version: sbom?.specVersion || "1.4",
    path,
    checksum,
    generated_at: generatedAt,
    component_name: sbom?.metadata?.component?.name || "COSMOS-CQA Research Workbench",
  });
}

export function createValidationReport({
  build = createBuildInfo(),
  labels = [],
  feedErrors = [],
  checks = [],
  artifacts = [],
  observations = [],
  observationReviewEvents = [],
  sbomRefs = [],
  provenanceHashes = [],
  diagnostics = [],
  license = VALIDATION_REPORT_LICENSE,
  limitations = VALIDATION_REPORT_LIMITATIONS,
  generatedAt = new Date().toISOString(),
  reportId = `rpt_${Date.now().toString(36)}`,
} = {}) {
  const normalizedChecks = checks.map((check) => ({
    name: check.name,
    status: check.status,
    detail: check.detail || "",
  }));
  const passCount = normalizedChecks.filter((check) => check.status === "pass").length;
  const failCount = normalizedChecks.filter((check) => check.status === "fail").length;
  const observationSummary = observations.length || observationReviewEvents.length ? summarizeTileObservations(observations, observationReviewEvents) : null;

  const report = {
    schema_version: CONTRACT_SCHEMA_VERSION,
    report_id: reportId,
    generated_at: generatedAt,
    build,
    license,
    limitations,
    summary: {
      label_count: labels.length,
      feed_error_count: feedErrors.length,
      pass_count: passCount,
      fail_count: failCount,
    },
    checks: normalizedChecks,
  };

  if (artifacts.length) {
    report.artifacts = artifacts;
  }
  if (observationSummary) {
    report.summary.observation_count = observationSummary.observation_count;
    report.summary.observed_tile_count = observationSummary.observed_tile_count;
    report.summary.observed_zone_count = observationSummary.observed_zone_count;
    report.summary.observation_note_count = observationSummary.note_count;
    report.summary.observation_review_event_count = observationSummary.review_event_count;
    report.observation_summary = observationSummary;
  }
  if (observationReviewEvents.length) {
    report.observation_review_events = observationReviewEvents;
  }
  if (sbomRefs.length) {
    report.sbom_refs = sbomRefs;
  }
  if (provenanceHashes.length) {
    report.provenance_hashes = provenanceHashes;
  }
  if (diagnostics.length) {
    report.diagnostics = diagnostics;
  }

  return assertContract("validationReport", report);
}

function safeId(value) {
  return String(value).replace(/[^A-Za-z0-9._:-]+/g, "_");
}
