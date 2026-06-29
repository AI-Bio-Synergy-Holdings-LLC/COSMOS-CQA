import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";
import { createBuildInfo } from "../provenance/index.js";

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
  sbomRefs = [],
  provenanceHashes = [],
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

  const report = {
    schema_version: CONTRACT_SCHEMA_VERSION,
    report_id: reportId,
    generated_at: generatedAt,
    build,
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
  if (sbomRefs.length) {
    report.sbom_refs = sbomRefs;
  }
  if (provenanceHashes.length) {
    report.provenance_hashes = provenanceHashes;
  }

  return assertContract("validationReport", report);
}

function safeId(value) {
  return String(value).replace(/[^A-Za-z0-9._:-]+/g, "_");
}
