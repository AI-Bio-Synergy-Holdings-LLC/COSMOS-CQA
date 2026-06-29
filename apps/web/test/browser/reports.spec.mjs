import { expect, test } from "@playwright/test";

import { BUILT_IN_TEST_TARGETS, SBOM_TARGETS } from "./fixtures/legacy-targets.mjs";
import { annotateTargets, openWorkbench, readStreamText } from "./fixtures/workbench.mjs";

test("migrates SBOM download targets into browser automation", async ({ page }) => {
  annotateTargets(SBOM_TARGETS);
  await openWorkbench(page);
  await page.locator("#loadSample").click();
  await expect(page.locator("#diagnosticSummary")).toContainText("2 caveated diagnostic placeholder(s)");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportSBOM").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sbom.json");
  const sbom = JSON.parse(await download.createReadStream().then(readStreamText));

  expect(sbom.bomFormat).toBe("CycloneDX");
  expect(sbom.specVersion).toBe("1.4");
  expect(sbom.metadata.component.name).toBe("COSMOS-CQA Research Workbench");
  expect(sbom.components).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Chart.js",
        version: "4.4.1",
        licenses: expect.arrayContaining([expect.objectContaining({ license: { id: "MIT" } })]),
      }),
    ]),
  );
  await expect(page.locator("#caption")).toContainText("SBOM exported.");

  const reportDownloadPromise = page.waitForEvent("download");
  await page.locator("#exportReport").click();
  const reportDownload = await reportDownloadPromise;
  expect(reportDownload.suggestedFilename()).toBe("validation-report.json");
  const report = JSON.parse(await reportDownload.createReadStream().then(readStreamText));
  expect(report.license).toContain("Research-only public use");
  expect(report.limitations).toEqual(expect.arrayContaining([expect.stringContaining("not production")]));
  expect(report.sbom_refs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        format: "CycloneDX",
        checksum: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      }),
    ]),
  );
  expect(report.provenance_hashes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        subject: "download:sbom.json",
        value: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      }),
    ]),
  );
  expect(report.diagnostics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        diagnostic_id: "diag_kappa_y_crosscheck",
        status: "placeholder",
        caveat: expect.stringContaining("not a validated cosmology diagnostic"),
        limitations: expect.arrayContaining([expect.stringContaining("synthetic Core Pack manifest")]),
      }),
      expect.objectContaining({
        diagnostic_id: "diag_eb_residual_placeholder",
        status: "placeholder",
        caveat: expect.stringContaining("not a validated weak-lensing diagnostic"),
        limitations: expect.arrayContaining([expect.stringContaining("synthetic Core Pack manifest")]),
      }),
    ]),
  );
  expect(report.checks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "diagnostic placeholders",
        status: "pass",
        detail: expect.stringContaining("not scientific results"),
      }),
    ]),
  );
});

test("previews validation report data before JSON export", async ({ page }) => {
  await openWorkbench(page);
  await page.locator("#loadSample").click();
  await expect(page.locator("#diagnosticSummary")).toContainText("2 caveated diagnostic placeholder(s)");

  const sbomDownloadPromise = page.waitForEvent("download");
  await page.locator("#exportSBOM").click();
  await sbomDownloadPromise;
  await expect(page.locator("#reportViewerStatus")).toContainText("Export uses this preview source");
  await expect(page.locator("#reportSummary")).toContainText("cosmos-cqa.contracts.v0.1.0");
  await expect(page.locator("#reportSummary")).toContainText("Research-only public use");
  await expect(page.locator("#reportChecks")).toContainText("diagnostic placeholders [pass]");
  await expect(page.locator("#reportChecks")).toContainText("not scientific results");
  await expect(page.locator("#reportArtifacts")).toContainText("artifact_core-pack");
  await expect(page.locator("#reportDiagnostics")).toContainText("Kappa-y cross-correlation review placeholder");
  await expect(page.locator("#reportDiagnostics")).toContainText("not a validated cosmology diagnostic");
  await expect(page.locator("#reportDiagnostics")).toContainText("Limitations:");
  await expect(page.locator("#reportSbomRefs")).toContainText("sbom_");
  await expect(page.locator("#reportSbomRefs")).toContainText("CycloneDX 1.4");
  await expect(page.locator("#reportProvenanceHashes")).toContainText("download:sbom.json");
  await expect(page.locator("#reportLimitations")).toContainText("Research-only license");
  await expect(page.locator("#reportLimitations")).toContainText("Diagnostic placeholders");

  const preview = await page.evaluate(() => window.COSMOS_CQA_APP.state.validationReportPreview);
  expect(preview).toEqual(
    expect.objectContaining({
      report_id: expect.stringMatching(/^rpt_/),
      diagnostics: expect.arrayContaining([
        expect.objectContaining({
          diagnostic_id: "diag_kappa_y_crosscheck",
          status: "placeholder",
        }),
      ]),
      sbom_refs: expect.arrayContaining([
        expect.objectContaining({
          format: "CycloneDX",
        }),
      ]),
      provenance_hashes: expect.arrayContaining([
        expect.objectContaining({
          subject: "download:sbom.json",
        }),
      ]),
    }),
  );

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportReport").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("validation-report.json");
  const exported = JSON.parse(await download.createReadStream().then(readStreamText));
  expect(exported).toEqual(preview);
  await expect(page.locator("#caption")).toContainText("Validation report JSON exported.");
});

test("migrates built-in self-check targets into browser automation", async ({ page }) => {
  annotateTargets(BUILT_IN_TEST_TARGETS);
  await openWorkbench(page);

  const selfChecks = page.locator("details").filter({ has: page.locator("#runTests") });
  await selfChecks.locator("summary").click();
  await page.locator("#runTests").click();

  await expect(page.locator("#testLog")).toContainText("OK CSV builder");
  await expect(page.locator("#testLog")).toContainText("OK PR-AUC");
  await expect(page.locator("#testLog")).toContainText("OK Tile synth");
  await expect(page.locator("#testLog")).toContainText("OK EMA");
  await expect(page.locator("#testLog")).toContainText("4/4 passed.");
});
