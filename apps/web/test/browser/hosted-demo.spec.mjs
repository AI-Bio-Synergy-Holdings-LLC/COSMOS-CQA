import { expect, test } from "@playwright/test";

import { readStreamText } from "./fixtures/workbench.mjs";

test("hosted demo path preloads the sample Core Pack with public boundaries", async ({ page }) => {
  await page.goto("/workbench.html?demo=core-pack#workspace-core-pack", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.COSMOS_CQA_APP?.state?.corePacks?.length === 1);

  await expect(page.locator("#demoModeNotice")).toContainText("Hosted demo ready");
  await expect(page.locator("#feedStatus")).toHaveText("Loaded Core Pack corepack_demo-v0.1.0-intake: 2 tile passport(s).");
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_001");
  await expect(page.locator("#truthTag")).toBeHidden();
  await expect(page.locator("#truthTag")).toHaveText("");
  await expect(page.locator("body")).not.toContainText("truth: stripe");
  await expect(page.locator("#demoModeNotice").getByRole("link", { name: "Demo Workbook" })).toBeVisible();
  await expect(page.locator("#tileSelect option:checked")).toHaveText("demo_corepack_tile_001");
  await expect(page.locator("#tilePassportDetails")).toContainText("Public truth labels hidden");
  await expect(page.locator("#diagnosticSummary")).toContainText("2 caveated diagnostic placeholder(s)");
  await expect(page.locator("#reportViewerStatus")).toContainText("Export uses this preview source");
  await expect(page.locator("#reportSummary")).toContainText("Research-only public use");

  const publicBoundary = await page.evaluate(() => ({
    dev: window.__COSMOS_DEV__,
    buildDev: window.COSMOS_CQA_APP.state.validationReportPreview.build.dev,
  }));
  expect(publicBoundary).toEqual({ dev: false, buildDev: false });

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportReport").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("validation-report.json");
  const report = JSON.parse(await download.createReadStream().then(readStreamText));

  expect(report.license).toContain("Research-only public use");
  expect(report.limitations).toEqual(expect.arrayContaining([expect.stringContaining("research artifacts")]));
  expect(report.diagnostics).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        diagnostic_id: "diag_kappa_y_crosscheck",
        caveat: expect.stringContaining("not a validated cosmology diagnostic"),
        limitations: expect.arrayContaining([expect.stringContaining("synthetic Core Pack manifest")]),
      }),
      expect.objectContaining({
        diagnostic_id: "diag_eb_residual_placeholder",
        caveat: expect.stringContaining("not a validated weak-lensing diagnostic"),
        limitations: expect.arrayContaining([expect.stringContaining("synthetic Core Pack manifest")]),
      }),
    ]),
  );
  expect(report.provenance_hashes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        subject: "examples/core-pack/core-pack.manifest.json",
        value: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      }),
    ]),
  );
  expect(report.sbom_refs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        sbom_id: "sbom_v0.1.0-research-alpha",
        path: "docs/releases/v0.1.0-research-alpha-sbom.json",
        checksum: expect.stringMatching(/^sha256:/),
      }),
    ]),
  );
});

test("hosted demo deep link settles on the Core Pack lane at narrow widths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/workbench.html?demo=core-pack#workspace-core-pack", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.COSMOS_CQA_APP?.state?.corePacks?.length === 1);
  await page.waitForFunction(() => {
    const target = document.querySelector("#workspace-core-pack");
    if (!target) {
      return false;
    }
    const top = target.getBoundingClientRect().top;
    return top >= 80 && top <= 120;
  });

  await expect(page.locator("#workspace-core-pack")).toContainText("Core Pack Intake");
  await expect(page.locator("#workspace-core-pack")).toContainText("corepack_demo-v0.1.0-intake");

  const layout = await page.evaluate(() => {
    const inspectorStyle = getComputedStyle(document.querySelector(".research-inspector"));
    return {
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      inspectorPosition: inspectorStyle.position,
      inspectorOverflow: inspectorStyle.overflowY,
      inspectorMaxHeight: inspectorStyle.maxHeight,
    };
  });

  expect(layout).toEqual({
    horizontalOverflow: false,
    inspectorPosition: "static",
    inspectorOverflow: "visible",
    inspectorMaxHeight: "none",
  });
});
