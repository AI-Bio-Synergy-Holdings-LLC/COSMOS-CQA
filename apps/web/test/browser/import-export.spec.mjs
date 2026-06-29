import { expect, test } from "@playwright/test";

import { CSV_EXPORT_TARGETS, DATA_IMPORT_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  createPngDataUrl,
  disableSimulation,
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
});
