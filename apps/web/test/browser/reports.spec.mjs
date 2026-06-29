import { expect, test } from "@playwright/test";

import { BUILT_IN_TEST_TARGETS, SBOM_TARGETS } from "./fixtures/legacy-targets.mjs";
import { annotateTargets, openWorkbench, readStreamText } from "./fixtures/workbench.mjs";

test("migrates SBOM download targets into browser automation", async ({ page }) => {
  annotateTargets(SBOM_TARGETS);
  await openWorkbench(page);

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
