import { CONTRACT_SCHEMA_VERSION, assertContract } from "../contracts/index.js";
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

export function createValidationReport({ build = createBuildInfo(), labels = [], feedErrors = [], checks = [] } = {}) {
  const normalizedChecks = checks.map((check) => ({
    name: check.name,
    status: check.status,
    detail: check.detail || "",
  }));
  const passCount = normalizedChecks.filter((check) => check.status === "pass").length;
  const failCount = normalizedChecks.filter((check) => check.status === "fail").length;

  return assertContract("validationReport", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    report_id: `rpt_${Date.now().toString(36)}`,
    generated_at: new Date().toISOString(),
    build,
    summary: {
      label_count: labels.length,
      feed_error_count: feedErrors.length,
      pass_count: passCount,
      fail_count: failCount,
    },
    checks: normalizedChecks,
  });
}

export function downloadBlob({ contents, type, filename }) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(data, filename) {
  downloadBlob({
    contents: JSON.stringify(data, null, 2),
    type: "application/json",
    filename,
  });
}

export function downloadCsv(csv, filename) {
  downloadBlob({
    contents: csv,
    type: "text/csv",
    filename,
  });
}
