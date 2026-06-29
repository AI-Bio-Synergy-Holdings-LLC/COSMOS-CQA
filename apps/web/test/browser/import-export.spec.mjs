import { expect, test } from "@playwright/test";

import { CSV_EXPORT_TARGETS, DATA_IMPORT_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  createPngDataUrl,
  disableSimulation,
  labelCount,
  openWorkbench,
  readStreamText,
} from "./fixtures/workbench.mjs";

test("migrates CSV export download targets into browser automation", async ({ page }) => {
  annotateTargets(CSV_EXPORT_TARGETS);
  await openWorkbench(page);
  await disableSimulation(page);

  await page.locator("#classSel").selectOption("ringing");
  await page.locator("#sevSel").selectOption("high");
  await page.locator("#note").fill("csv export browser test");
  await page.locator("#submitBtn").click();

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportCSV").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("labels.csv");
  const contents = await download.createReadStream().then(readStreamText);

  expect(contents).toContain("tile_id,dataset,volunteer_id,clazz,severity,note,weight,ts,expert_class,expert_confidence,expert_latency");
  expect(contents).toContain('"tile_001","DEMO_SIM_T"');
  expect(contents).toContain('"ringing","high","csv export browser test"');
  await expect(page.locator("#caption")).toContainText("CSV exported.");
});

test("migrates data import and public sample targets into browser automation", async ({ page }) => {
  annotateTargets(DATA_IMPORT_TARGETS);
  await openWorkbench(page);

  await expect(page.locator("#fileInput")).toHaveAttribute("accept", /json/);
  await expect(page.locator("#feedMethod option")).toHaveText(["WebSocket", "HTTP (poll)"]);

  const feedPayload = [
    {
      type: "tile",
      tile_id: "external_001",
      dataset: "EXT_TEST",
      release: "v-test",
      doi: "doi:10.0000/ext-test",
      band: "T",
      ra: 12.5,
      dec: -4.25,
      overlay: "rings",
      checksum: "sha256:external-001",
      png: await createPngDataUrl(page),
    },
    {
      type: "expert",
      tile_id: "external_001",
      expert_class: "residual",
      expert_confidence: 0.9,
      latency_s: 1.25,
    },
  ];

  await page.locator("#fileInput").setInputFiles({
    name: "external-feed.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(feedPayload)),
  });
  await expect(page.locator("#feedStatus")).toContainText("Loaded 2 feed object(s) from research artifact");
  await expect(page.locator("#tileId")).toHaveText("external_001");
  await expect(page.locator("#overlaySel")).toHaveValue("rings");
  await expect(page.locator("#tileSelect option")).toHaveCount(33);

  await page.locator("#loadSample").click();
  await expect(page.locator("#feedStatus")).toHaveText("Loaded Core Pack corepack_demo-v0.1.0-intake: 2 tile passport(s).");
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_001");
  await expect(page.locator("#tileSelect option")).toHaveCount(35);
  await expect(page.locator("#diagnosticSummary")).toContainText("2 caveated diagnostic placeholder(s)");
  await expect(page.locator("#diagnosticSummary")).toContainText("Not validated scientific results");
  await expect(page.locator("#diagnosticList")).toContainText("Kappa-y cross-correlation review placeholder");
  await expect(page.locator("#diagnosticList")).toContainText("E/B residual review placeholder");
  await expect(page.locator("#diagnosticList")).toContainText("not a validated");
  await expect(page.locator("#diagnosticList")).toContainText("must not be used");
});

test("saves imports and deterministically reloads research sessions", async ({ page }) => {
  await openWorkbench(page);
  await disableSimulation(page);

  await page.locator("#loadSample").click();
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_001");
  await page.locator("#overlaySel").selectOption("gradient");
  await page.locator("#paletteSel").selectOption("cividis");
  await page.locator("#classSel").selectOption("stripe");
  await page.locator("#sevSel").selectOption("medium");
  await page.locator("#note").fill("session roundtrip browser test");
  await page.locator("#submitBtn").click();

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportSession").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("cosmos-cqa-session.json");
  const contents = await download.createReadStream().then(readStreamText);
  const exportedSession = JSON.parse(contents);

  expect(exportedSession.schema_version).toBe("cosmos-cqa.contracts.v0.1.0");
  expect(exportedSession.selected_tiles[0]).toMatchObject({
    tile_id: "demo_corepack_tile_001",
    overlay: "gradient",
    palette: "cividis",
  });
  expect(exportedSession.labels).toHaveLength(1);
  expect(exportedSession.artifacts).toHaveLength(1);
  expect(exportedSession.diagnostics).toHaveLength(2);
  expect(exportedSession.reports).toHaveLength(1);
  await expect(page.locator("#sessionStatus")).toContainText("Exported");

  await page.evaluate(() => localStorage.clear());
  await openWorkbench(page);
  await disableSimulation(page);
  expect(await labelCount(page)).toBe(0);

  await page.locator("#loadSample").click();
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_001");
  await page.locator("#nextBtn").click();
  await page.locator("#overlaySel").selectOption("none");
  await page.locator("#paletteSel").selectOption("gray");

  await page.locator("#sessionInput").setInputFiles({
    name: "cosmos-cqa-session.json",
    mimeType: "application/json",
    buffer: Buffer.from(contents),
  });

  await expect(page.locator("#sessionStatus")).toContainText(`Imported ${exportedSession.session_id}`);
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_001");
  await expect(page.locator("#overlaySel")).toHaveValue("gradient");
  await expect(page.locator("#paletteSel")).toHaveValue("cividis");
  await expect(page.locator("#diagnosticSummary")).toContainText("2 caveated diagnostic placeholder(s)");
  await expect(page.locator("#reportViewerStatus")).toContainText(exportedSession.reports[0].report_id);
  await expect(page.locator("#caption")).toContainText("Research session imported and restored.");
  expect(await labelCount(page)).toBe(1);

  const restoredState = await page.evaluate(() => ({
    artifactCount: window.COSMOS_CQA_APP.state.researchArtifacts.length,
    labelNote: window.COSMOS_CQA_APP.state.labels[0].note,
    diagnosticCount: window.COSMOS_CQA_APP.state.diagnostics.length,
    reportId: window.COSMOS_CQA_APP.state.validationReportPreview.report_id,
  }));
  expect(restoredState).toEqual({
    artifactCount: 1,
    labelNote: "session roundtrip browser test",
    diagnosticCount: 2,
    reportId: exportedSession.reports[0].report_id,
  });

  await page.locator("#sessionInput").setInputFiles({
    name: "bad-session.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schema_version":"cosmos-cqa.contracts.v0.1.0"}'),
  });

  await expect(page.locator("#sessionStatus")).toContainText("Session rejected");
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_001");
  expect(await labelCount(page)).toBe(1);
});
