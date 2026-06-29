import { expect, test } from "@playwright/test";

import { openWorkbench } from "./fixtures/workbench.mjs";

test("shows a clear empty evidence workspace before artifact import", async ({ page }) => {
  await openWorkbench(page);

  await expect(page.locator("#workspace-provenance")).toBeVisible();
  await expect(page.locator("#provenance-title")).toHaveText("Evidence Workspace");
  await expect(page.locator("#evidenceWorkspaceStatus")).toContainText("No imported or exported evidence artifacts yet");
  await expect(page.locator("#evidenceSummary")).toContainText("Artifacts");
  await expect(page.locator("#evidenceSummary")).toContainText("Provenance hashes");
  await expect(page.locator("#evidenceSummary")).toContainText("SBOM refs");
  await expect(page.locator("#evidenceArtifacts")).toContainText("No references declared.");
  await expect(page.locator("#evidenceProvenanceHashes")).toContainText("No references declared.");
  await expect(page.locator("#evidenceSbomRefs")).toContainText("No references declared.");
  await expect(page.locator("#evidenceValidationChecks")).toContainText("No references declared.");
});

test("lists populated evidence artifacts hashes SBOM refs diagnostics and validation checks", async ({ page }) => {
  await openWorkbench(page);

  await page.locator("#loadSample").click();
  await expect(page.locator("#feedStatus")).toContainText("Loaded Core Pack corepack_demo-v0.1.0-intake");
  await expect(page.locator("#evidenceWorkspaceStatus")).toContainText("1 artifact(s)");
  await expect(page.locator("#evidenceWorkspaceStatus")).toContainText("1 provenance hash(es)");
  await expect(page.locator("#evidenceWorkspaceStatus")).toContainText("1 SBOM reference(s)");
  await expect(page.locator("#evidenceSummary")).toContainText("Validation report");
  await expect(page.locator("#evidenceArtifacts")).toContainText("artifact_core-pack");
  await expect(page.locator("#evidenceArtifacts")).toContainText("kind=core-pack");
  await expect(page.locator("#evidenceArtifacts")).toContainText("source=examples/core-pack/core-pack.manifest.json");
  await expect(page.locator("#evidenceArtifacts")).toContainText("records=2");
  await expect(page.locator("#evidenceArtifacts")).toContainText("errors=0");
  await expect(page.locator("#evidenceArtifacts")).toContainText("report=rpt_");
  await expect(page.locator("#evidenceProvenanceHashes")).toContainText("examples/core-pack/core-pack.manifest.json");
  await expect(page.locator("#evidenceProvenanceHashes")).toContainText("sha256:");
  await expect(page.locator("#evidenceSbomRefs")).toContainText("sbom_v0.1.0-research-alpha");
  await expect(page.locator("#evidenceSbomRefs")).toContainText("CycloneDX 1.4");
  await expect(page.locator("#evidenceSbomRefs")).toContainText("report=rpt_");
  await expect(page.locator("#evidenceCorePacks")).toContainText("corepack_demo-v0.1.0-intake");
  await expect(page.locator("#evidenceCorePacks")).toContainText("tiles=2");
  await expect(page.locator("#evidenceDiagnostics")).toContainText("Kappa-y cross-correlation review placeholder");
  await expect(page.locator("#evidenceDiagnostics")).toContainText("not a validated cosmology diagnostic");
  await expect(page.locator("#evidenceValidationChecks")).toContainText("Core Pack manifest [pass]");
  await expect(page.locator("#evidenceValidationChecks")).toContainText("Report: rpt_");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportSBOM").click();
  await downloadPromise;

  await expect(page.locator("#evidenceWorkspaceStatus")).toContainText("2 provenance hash(es)");
  await expect(page.locator("#evidenceProvenanceHashes")).toContainText("download:sbom.json");
  await expect(page.locator("#evidenceSbomRefs")).toContainText("sbom_");
  await expect(page.locator("#evidenceValidationChecks")).toContainText("SBOM references [pass]");
});
