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

test("visualizes pinned observation evidence in reports and bundles", async ({ page }) => {
  await openWorkbench(page);

  const canvas = page.locator("#tileCanvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box.width * 0.42, y: box.height * 0.21 } });
  await page.locator("#note").fill("faint vertical band in top center zone for evidence map test");
  await expect(page.locator("#submitBtn")).toBeEnabled();
  await page.locator("#submitBtn").click();

  await expect(page.locator("#evidenceWorkspaceStatus")).toContainText("1 tile observation");
  await expect(page.locator("#evidenceObservationMap .observation-zone-cell.active")).toHaveCount(1);
  await expect(page.locator("#evidenceObservationMap .observation-zone-cell.active")).toContainText("top center");
  await expect(page.locator("#evidenceObservationSummary")).toContainText("Dominant zone");
  await expect(page.locator("#evidenceObservationSummary")).toContainText("top center");
  await expect(page.locator("#evidenceObservations")).toContainText("radial=mid-field");
  await expect(page.locator("#reportSummary")).toContainText("Tile observations");
  await expect(page.locator("#reportObservationSummary")).toContainText("Row bands");
  await expect(page.locator("#reportObservations")).toContainText("Zone top center");

  const preview = await page.evaluate(() => window.COSMOS_CQA_APP.state.validationReportPreview);
  expect(preview.summary).toMatchObject({
    label_count: 1,
    observation_count: 1,
    observed_tile_count: 1,
    observed_zone_count: 1,
    observation_note_count: 1,
  });
  expect(preview.observation_summary).toMatchObject({
    observation_count: 1,
    dominant_zone_label: "top center",
  });

  const bundle = await page.evaluate(() => window.COSMOS_CQA_APP.buildEvidenceBundle({ generatedAt: "2026-06-29T00:00:00.000Z" }));
  expect(bundle.summary).toMatchObject({
    observation_count: 1,
    observed_tile_count: 1,
    observed_zone_count: 1,
    observation_note_count: 1,
  });
  expect(bundle.observation_summary.zone_counts[0]).toMatchObject({ key: "r1c2", label: "top center", count: 1 });
});
