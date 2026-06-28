import { expect, test } from "@playwright/test";

const TILE_NAVIGATION_TARGETS = [
  "legacy-v3.manual.1-tile-navigation-display.001",
  "legacy-v3.manual.1-tile-navigation-display.002",
  "legacy-v3.manual.1-tile-navigation-display.003",
  "legacy-v3.manual.1-tile-navigation-display.004",
  "legacy-v3.manual.1-tile-navigation-display.005",
  "legacy-v3.manual.1-tile-navigation-display.006",
];

const LABEL_WORKFLOW_TARGETS = [
  "legacy-v3.manual.4-classification-submission.001",
  "legacy-v3.manual.4-classification-submission.002",
  "legacy-v3.manual.4-classification-submission.003",
  "legacy-v3.manual.4-classification-submission.004",
  "legacy-v3.manual.4-classification-submission.005",
  "legacy-v3.manual.4-classification-submission.006",
  "legacy-v3.manual.4-classification-submission.007",
  "legacy-v3.manual.4-classification-submission.008",
];

const BOOKMARK_TARGETS = [
  "legacy-v3.manual.8-data-import-export.001",
  "legacy-v3.manual.8-data-import-export.002",
  "legacy-v3.bridge.bookmark-created",
  "legacy-v3.bridge.bookmark-roundtrip",
];

const TRUTH_POLICY_TARGETS = [
  "legacy-v3.manual.1-tile-navigation-display.007",
  "legacy-v3.bridge.truth-hidden-public",
];

const OVERLAY_PALETTE_TARGETS = [
  "legacy-v3.manual.2-overlays-visualization.001",
  "legacy-v3.manual.2-overlays-visualization.002",
  "legacy-v3.manual.2-overlays-visualization.003",
  "legacy-v3.manual.2-overlays-visualization.004",
  "legacy-v3.manual.2-overlays-visualization.005",
  "legacy-v3.manual.2-overlays-visualization.006",
  "legacy-v3.manual.2-overlays-visualization.007",
];

const METRICS_CHART_TARGETS = [
  "legacy-v3.manual.7-live-metrics-charts.001",
  "legacy-v3.manual.7-live-metrics-charts.002",
  "legacy-v3.manual.7-live-metrics-charts.003",
  "legacy-v3.manual.7-live-metrics-charts.004",
  "legacy-v3.manual.7-live-metrics-charts.005",
  "legacy-v3.manual.7-live-metrics-charts.006",
  "legacy-v3.manual.7-live-metrics-charts.007",
  "legacy-v3.manual.7-live-metrics-charts.008",
  "legacy-v3.manual.7-live-metrics-charts.009",
];

const CSV_EXPORT_TARGETS = [
  "legacy-v3.manual.8-data-import-export.003",
  "legacy-v3.manual.8-data-import-export.004",
];

const DATA_IMPORT_TARGETS = [
  "legacy-v3.manual.8-data-import-export.007",
  "legacy-v3.manual.8-data-import-export.008",
  "legacy-v3.manual.8-data-import-export.009",
];

const ACCESSIBILITY_TARGETS = [
  "legacy-v3.manual.11-accessibility.001",
  "legacy-v3.manual.11-accessibility.002",
  "legacy-v3.manual.11-accessibility.003",
  "legacy-v3.manual.11-accessibility.004",
  "legacy-v3.manual.11-accessibility.005",
  "legacy-v3.manual.11-accessibility.006",
  "legacy-v3.bridge.a11y-95",
];

const AUDIO_TARGETS = [
  "legacy-v3.manual.3-audio-sonification.001",
  "legacy-v3.manual.3-audio-sonification.002",
  "legacy-v3.manual.3-audio-sonification.003",
  "legacy-v3.manual.3-audio-sonification.004",
  "legacy-v3.manual.3-audio-sonification.005",
  "legacy-v3.manual.3-audio-sonification.006",
  "legacy-v3.manual.3-audio-sonification.007",
  "legacy-v3.manual.3-audio-sonification.008",
  "legacy-v3.bridge.audio-deterministic",
];

const CALIBRATION_TARGETS = [
  "legacy-v3.manual.5-calibration-wizard.001",
  "legacy-v3.manual.5-calibration-wizard.002",
  "legacy-v3.manual.5-calibration-wizard.003",
  "legacy-v3.manual.5-calibration-wizard.004",
  "legacy-v3.manual.5-calibration-wizard.005",
  "legacy-v3.manual.5-calibration-wizard.006",
  "legacy-v3.manual.5-calibration-wizard.007",
  "legacy-v3.manual.5-calibration-wizard.008",
  "legacy-v3.manual.5-calibration-wizard.009",
  "legacy-v3.bridge.irr-alpha-ok",
];

const EXPERT_QUEUE_TARGETS = [
  "legacy-v3.manual.6-expert-queue.001",
  "legacy-v3.manual.6-expert-queue.002",
  "legacy-v3.manual.6-expert-queue.003",
  "legacy-v3.manual.6-expert-queue.004",
  "legacy-v3.manual.6-expert-queue.005",
  "legacy-v3.manual.6-expert-queue.006",
  "legacy-v3.manual.6-expert-queue.007",
];

const SBOM_TARGETS = [
  "legacy-v3.manual.8-data-import-export.005",
  "legacy-v3.manual.8-data-import-export.006",
  "legacy-v3.bridge.sbom-exported",
];

const BUILT_IN_TEST_TARGETS = [
  "legacy-v3.manual.9-built-in-tests.001",
  "legacy-v3.manual.9-built-in-tests.002",
  "legacy-v3.manual.9-built-in-tests.003",
  "legacy-v3.manual.9-built-in-tests.004",
  "legacy-v3.manual.9-built-in-tests.005",
  "legacy-v3.manual.9-built-in-tests.006",
];

const UI_POLISH_TARGETS = [
  "legacy-v3.manual.10-ui-ux-polish.001",
  "legacy-v3.manual.10-ui-ux-polish.002",
  "legacy-v3.manual.10-ui-ux-polish.003",
  "legacy-v3.manual.10-ui-ux-polish.004",
  "legacy-v3.manual.10-ui-ux-polish.005",
  "legacy-v3.manual.10-ui-ux-polish.006",
  "legacy-v3.manual.10-ui-ux-polish.007",
  "legacy-v3.manual.10-ui-ux-polish.008",
  "legacy-v3.manual.10-ui-ux-polish.009",
  "legacy-v3.manual.10-ui-ux-polish.010",
];

test("migrates tracked tile navigation targets into browser automation", async ({ page }) => {
  annotateTargets(TILE_NAVIGATION_TARGETS);
  await openWorkbench(page);

  await expect(page.locator("#tileCanvas")).toBeVisible();
  await expect(page.locator("#tileSelect option")).toHaveCount(32);
  await expect(page.locator("#tileId")).toHaveText("tile_001");
  expect(await canvasHasSignal(page)).toBe(true);

  await page.locator("#nextBtn").click();
  await expect(page.locator("#tileId")).toHaveText("tile_002");
  await expect(page.locator("#tileSelect")).toHaveValue("1");

  await page.locator("#prevBtn").click();
  await expect(page.locator("#tileId")).toHaveText("tile_001");
  await expect(page.locator("#tileSelect")).toHaveValue("0");

  await page.keyboard.press("Control+ArrowRight");
  await expect(page.locator("#tileId")).toHaveText("tile_002");

  await page.keyboard.press("Control+ArrowLeft");
  await expect(page.locator("#tileId")).toHaveText("tile_001");
});

test("migrates tracked label submit and undo targets into browser automation", async ({ page }) => {
  annotateTargets(LABEL_WORKFLOW_TARGETS);
  await openWorkbench(page);
  await page.evaluate(() => {
    window.COSMOS_CQA_APP.state.simDisabled = true;
  });

  await expect(page.locator("#classSel option")).toHaveCount(6);
  await page.locator("#classSel").selectOption("dipole");
  await page.locator("#sevSel").selectOption("high");
  await page.locator("#note").fill("browser automation label workflow ".repeat(12));
  await page.locator("#submitBtn").click();

  await expect(page.locator("#caption")).toContainText("Submitted: dipole (high).");
  await expect.poll(() => labelCount(page)).toBe(1);
  expect(await firstStoredLabel(page)).toMatchObject({
    clazz: "dipole",
    severity: "high",
    tile_id: "tile_001",
  });
  expect((await firstStoredLabel(page)).note).toHaveLength(240);

  await page.locator("#undoBtn").click();
  await expect(page.locator("#caption")).toContainText("Undid last label.");
  await expect.poll(() => labelCount(page)).toBe(0);

  await blurActiveElement(page);
  await page.keyboard.press("s");
  await expect.poll(() => labelCount(page)).toBe(1);

  await blurActiveElement(page);
  await page.keyboard.press("Control+z");
  await expect.poll(() => labelCount(page)).toBe(0);
});

test("migrates tracked bookmark creation and reload targets into browser automation", async ({ context, page }) => {
  annotateTargets(BOOKMARK_TARGETS);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:4173" });
  await openWorkbench(page);

  await page.locator("#tileSelect").selectOption("4");
  await expect(page.locator("#tileId")).toHaveText("tile_005");
  await page.locator("#overlaySel").selectOption("rings");
  await page.locator("#paletteSel").selectOption("cividis");
  await page.locator("#rateSel").selectOption("1.5");
  await page.locator("#loopBtn").click();
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
  await page.locator("#captionsChk").setChecked(false);

  await page.locator("#bookmarkBtn").click();
  await expect.poll(() => readClipboard(page)).toContain("#state=");
  const bookmarkUrl = await readClipboard(page);
  const payload = decodeBookmarkPayload(bookmarkUrl);

  expect(payload.schema_version).toBe("cosmos-cqa.contracts.v0.1.0");
  expect(payload.dataset).toMatchObject({
    name: "DEMO_SIM_T",
    release: "v0",
  });
  expect(payload.tile.id).toBe("tile_005");
  expect(payload.overlay).toBe("rings");
  expect(payload.palette).toBe("cividis");
  expect(payload.env.audio).toMatchObject({
    map: "dft32_rowmeans",
    rate: 1.5,
    loop: false,
  });

  await openWorkbench(page, bookmarkUrl);
  await expect(page.locator("#tileId")).toHaveText("tile_005");
  await expect(page.locator("#tileSelect")).toHaveValue("4");
  await expect(page.locator("#overlaySel")).toHaveValue("rings");
  await expect(page.locator("#paletteSel")).toHaveValue("cividis");
  await expect(page.locator("#rateSel")).toHaveValue("1.5");
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
  await expect(page.locator("#captionsChk")).not.toBeChecked();
});

test("migrates public truth-label hiding into browser automation", async ({ page }) => {
  annotateTargets(TRUTH_POLICY_TARGETS);
  await openWorkbench(page);

  await expect(page.locator("#truthTag")).toBeHidden();
  await expect(page.locator("#tileSelect option").first()).toHaveText("tile_001");

  await openWorkbench(page, "/?dev=1");
  await expect(page.locator("#truthTag")).toBeVisible();
  await expect(page.locator("#truthTag")).toHaveText("truth: stripe");
  await expect(page.locator("#tileSelect option").first()).toHaveText("tile_001 - stripe");
});

test("migrates overlay and palette rendering targets into browser automation", async ({ page }) => {
  annotateTargets(OVERLAY_PALETTE_TARGETS);
  await openWorkbench(page);

  await page.locator("#overlaySel").selectOption("none");
  await page.locator("#paletteSel").selectOption("gray");
  const grayBase = await canvasSignature(page);
  expect(grayBase.redGreenDelta).toBeLessThan(2);

  await page.locator("#overlaySel").selectOption("gradient");
  const gradient = await canvasSignature(page);
  expect(gradient.hash).not.toBe(grayBase.hash);

  await page.locator("#overlaySel").selectOption("rings");
  const rings = await canvasSignature(page);
  expect(rings.hash).not.toBe(grayBase.hash);
  expect(rings.hash).not.toBe(gradient.hash);

  await page.locator("#overlaySel").selectOption("wavelet");
  const wavelet = await canvasSignature(page);
  expect(wavelet.hash).not.toBe(grayBase.hash);
  expect(wavelet.hash).not.toBe(rings.hash);

  await page.locator("#overlaySel").selectOption("none");
  await page.locator("#paletteSel").selectOption("viridis");
  const viridis = await canvasSignature(page);
  expect(viridis.hash).not.toBe(grayBase.hash);
  expect(viridis.redGreenDelta).toBeGreaterThan(10);

  await page.locator("#paletteSel").selectOption("cividis");
  const cividis = await canvasSignature(page);
  expect(cividis.hash).not.toBe(grayBase.hash);
  expect(cividis.hash).not.toBe(viridis.hash);
  await expect(page.locator("#paletteSel")).toHaveValue("cividis");
});

test("migrates metrics and chart render/update targets into browser automation", async ({ page }) => {
  annotateTargets(METRICS_CHART_TARGETS);
  await openWorkbench(page);
  await page.evaluate(() => {
    window.COSMOS_CQA_APP.state.simDisabled = true;
  });

  const initialCharts = await chartSignals(page);
  expect(initialCharts.prChart.hasSignal).toBe(true);
  expect(initialCharts.opsChart.hasSignal).toBe(true);
  expect(initialCharts.confChart.hasSignal).toBe(true);

  for (const [index, clazz] of ["stripe", "clean", "dipole"].entries()) {
    await page.locator("#tileSelect").selectOption(String(index));
    await page.locator("#classSel").selectOption(clazz);
    await page.locator("#submitBtn").click();
  }

  await expect(page.locator("#kpiAUC")).not.toHaveText("-");
  await expect(page.locator("#kpiPR")).not.toHaveText("-");
  await expect(page.locator("#kpiIRR")).not.toHaveText("-");
  await expect(page.locator("#kpiLatency")).toContainText("s");
  await blurActiveElement(page);
  await page.keyboard.press("l");
  await page.locator("#paletteSel").selectOption("cividis");
  await expect(page.locator("#kpiA11y")).toHaveText("100%");

  const afterLabels = await chartSignals(page);
  expect(afterLabels.prChart.hash).not.toBe(initialCharts.prChart.hash);
  expect(afterLabels.opsChart.hash).not.toBe(initialCharts.opsChart.hash);

  await page.locator("#expertBtn").click();
  await page.locator("#expertPane button[data-d='confirm']").first().click();
  await expect.poll(() => chartSignals(page).then((signals) => signals.liveChart.hasSignal)).toBe(true);
  const afterExpert = await chartSignals(page);
  expect(afterExpert.confChart.hash).not.toBe(initialCharts.confChart.hash);
  expect(afterExpert.liveChart.hash).not.toBe(initialCharts.liveChart.hash);
});

test("migrates CSV export download targets into browser automation", async ({ page }) => {
  annotateTargets(CSV_EXPORT_TARGETS);
  await openWorkbench(page);
  await page.evaluate(() => {
    window.COSMOS_CQA_APP.state.simDisabled = true;
  });

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
  await expect(page.locator("#feedStatus")).toContainText("Loaded 2 feed object(s) from JSON");
  await expect(page.locator("#tileId")).toHaveText("external_001");
  await expect(page.locator("#overlaySel")).toHaveValue("rings");
  await expect(page.locator("#tileSelect option")).toHaveCount(33);

  await page.locator("#loadSample").click();
  await expect(page.locator("#feedStatus")).toHaveText("Loaded public sample: 4 demo tiles.");
  await expect(page.locator("#tileId")).toHaveText("sample_001");
  await expect(page.locator("#tileSelect option")).toHaveCount(37);
});

test("migrates accessibility focus, captions, and audit targets into browser automation", async ({ page }) => {
  annotateTargets(ACCESSIBILITY_TARGETS);
  await openWorkbench(page);

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toHaveAttribute("href", "#main");
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);

  await expect(page.locator("#tileSelect")).toHaveAccessibleName("Choose tile");
  await expect(page.locator("#overlaySel")).toHaveAccessibleName("Overlay type");
  await expect(page.locator("#paletteSel")).toHaveAccessibleName("Color palette");
  await page.locator("#nextBtn").focus();
  const focusOutline = await page.locator("#nextBtn").evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(focusOutline).not.toBe("none");

  await page.locator("#captionsChk").setChecked(false);
  await page.locator("#loopBtn").click();
  await expect(page.locator("#caption")).toHaveText("");
  await page.locator("#captionsChk").setChecked(true);
  await expect(page.locator("#caption")).toHaveText("Captions on.");

  await page.keyboard.press("l");
  await page.locator("#paletteSel").selectOption("cividis");
  await expect(page.locator("#paletteSel")).toHaveValue("cividis");
  await expect(page.locator("#kpiA11y")).toHaveText("100%");
});

test("migrates audio control targets into browser automation", async ({ page }) => {
  annotateTargets(AUDIO_TARGETS);
  await installMockAudio(page);
  await openWorkbench(page);

  const firstPreview = await audioPreview(page);
  const secondPreview = await audioPreview(page);
  expect(firstPreview).toEqual(secondPreview);

  await page.locator("#rateSel").selectOption("2.0");
  await expect(page.locator("#caption")).toContainText("Rate 2x.");
  await expect.poll(() => page.evaluate(() => window.COSMOS_CQA_APP.state.rate)).toBe(2);

  await page.locator("#playBtn").click();
  await expect(page.locator("#playBtn")).toHaveText("Pause");
  await expect(page.locator("#playBtn")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => progressWidth(page)).toBeGreaterThan(0);

  await page.locator("#playBtn").click();
  await expect(page.locator("#playBtn")).toHaveText("Play");
  await expect(page.locator("#playBtn")).toHaveAttribute("aria-pressed", "false");

  await page.locator("#loopBtn").click();
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
  await page.locator("#loopBtn").click();
  await expect(page.locator("#loopBtn")).toHaveText("Loop: on");

  await blurActiveElement(page);
  await page.keyboard.press("Space");
  await expect(page.locator("#playBtn")).toHaveText("Pause");
  await blurActiveElement(page);
  await page.keyboard.press("Space");
  await expect(page.locator("#playBtn")).toHaveText("Play");

  await blurActiveElement(page);
  await page.keyboard.press("l");
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
});

test("migrates calibration wizard targets into browser automation", async ({ page }) => {
  annotateTargets(CALIBRATION_TARGETS);
  await openWorkbench(page);

  await page.locator("#calibBtn").click();
  await expect(page.locator("#calibStep")).toHaveText("1/3");
  await expect(page.locator("#calibHint")).toContainText("Hint:");

  await openWorkbench(page);
  await page.locator("#calibMode").selectOption("inline");
  await expect(page.locator("#calibMode")).toHaveValue("inline");
  await page.locator("#gatePolicy").selectOption("learning");
  await expect(page.locator("#gatePolicy")).toHaveValue("learning");

  await page.locator("#startCalib").click();
  await expect(page.locator("#calibStep")).toHaveText("1/3");
  await expect(page.locator("#calibHint")).toContainText("Hint:");

  for (const expectedStep of ["1/3", "2/3", "3/3"]) {
    await expect(page.locator("#calibStep")).toHaveText(expectedStep);
    await page.locator("#classSel").selectOption("clean");
    await page.locator("#submitBtn").click();
    await expect(page.locator("#calibExplain")).toContainText("Expected");
    await page.locator("#nextStep").click();
  }

  await expect(page.locator("#calibStep")).toHaveText("Done");
  await expect(page.locator("#calibStatus")).toHaveText(/Score: [0-3]\/3/);

  await openWorkbench(page);
  await blurActiveElement(page);
  await page.keyboard.press("c");
  await expect(page.locator("#calibStep")).toHaveText("1/3");
});

test("migrates expert queue targets into browser automation", async ({ page }) => {
  annotateTargets(EXPERT_QUEUE_TARGETS);
  await openWorkbench(page);
  await page.evaluate(() => {
    window.COSMOS_CQA_APP.state.simDisabled = true;
  });

  for (const [index, clazz] of ["stripe", "dipole"].entries()) {
    await page.locator("#tileSelect").selectOption(String(index));
    await page.locator("#classSel").selectOption(clazz);
    await page.locator("#submitBtn").click();
  }

  await page.locator("#expertBtn").click();
  await expect(page.locator("#expertDetails")).toHaveJSProperty("open", true);
  await expect(page.locator("#expertPane")).toContainText("residual:");
  await expect(page.locator("#expertPane")).toContainText("truth residual:");

  const rows = page.locator("#expertPane > div");
  await expect(rows.first()).toBeVisible();
  await rows.nth(0).locator('select[data-c="conf"]').selectOption("0.9");
  await rows.nth(0).locator('input[data-c="note"]').fill("confirm residual");
  await rows.nth(0).locator('button[data-d="confirm"]').click();

  await rows.nth(1).locator('select[data-c="conf"]').selectOption("0.6");
  await rows.nth(1).locator('input[data-c="note"]').fill("override clean");
  await rows.nth(1).locator('button[data-d="override"]').click();

  const expert = await page.evaluate(() => JSON.parse(localStorage.getItem("expert") || "[]"));
  expect(expert).toHaveLength(2);
  expect(expert[0]).toMatchObject({
    expert_class: "residual",
    expert_confidence: 0.9,
    note: "confirm residual",
  });
  expect(expert[1]).toMatchObject({
    expert_class: "clean",
    expert_confidence: 0.6,
    note: "override clean",
  });
});

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

test("migrates remaining UI polish and responsive targets into browser automation", async ({ page }) => {
  annotateTargets(UI_POLISH_TARGETS);
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = function requestFullscreen() {
      window.__fullscreenRequestedFor = this.tagName;
      return Promise.resolve();
    };
  });
  await openWorkbench(page);

  const buttonBorder = await cssValue(page.locator("#nextBtn"), "borderTopColor");
  await page.locator("#nextBtn").hover();
  await page.waitForTimeout(250);
  await expect.poll(() => cssValue(page.locator("#nextBtn"), "borderTopColor")).not.toBe(buttonBorder);

  await page.mouse.move(1, 1);
  await page.waitForTimeout(350);
  const polishCard = page.locator(".card").nth(1);
  const cardShadow = await cssValue(polishCard, "boxShadow");
  await polishCard.hover();
  await page.waitForTimeout(350);
  await expect.poll(() => cssValue(polishCard, "boxShadow")).not.toBe(cardShadow);

  const canvasTransform = await cssValue(page.locator("#tileCanvas"), "transform");
  await page.locator("#tileCanvas").hover();
  await page.waitForTimeout(250);
  await expect.poll(() => cssValue(page.locator("#tileCanvas"), "transform")).not.toBe(canvasTransform);

  const kpiTransform = await cssValue(page.locator(".kpi").first(), "transform");
  await page.locator(".kpi").first().hover();
  await page.waitForTimeout(250);
  await expect.poll(() => cssValue(page.locator(".kpi").first(), "transform")).not.toBe(kpiTransform);

  await expect(page.locator("#nextStep")).toBeDisabled();
  expect(Number(await cssValue(page.locator("#nextStep"), "opacity"))).toBeLessThan(1);

  const selfChecks = page.locator("details").filter({ has: page.locator("#runTests") });
  await expect(selfChecks).not.toHaveAttribute("open", "");
  const summaryColor = await cssValue(selfChecks.locator("summary"), "color");
  await selfChecks.locator("summary").hover();
  await page.waitForTimeout(250);
  await expect.poll(() => cssValue(selfChecks.locator("summary"), "color")).not.toBe(summaryColor);
  await selfChecks.locator("summary").click();
  await expect(selfChecks).toHaveAttribute("open", "");

  await expect(page.locator(".cmd-icon")).toHaveCount(5);
  for (const icon of await page.locator(".cmd-icon").all()) {
    await expect(icon).toBeVisible();
    expect((await icon.textContent()).trim()).not.toBe("");
  }

  await page.locator("#fullscreenBtn").click();
  await expect.poll(() => page.evaluate(() => window.__fullscreenRequestedFor)).toBe("HTML");

  await page.setViewportSize({ width: 390, height: 800 });
  await openWorkbench(page);
  await expect.poll(() => cssValue(page.locator(".viewer"), "flexDirection")).toBe("column");
  const canvasBox = await page.locator("#tileCanvas").boundingBox();
  expect(canvasBox.width).toBeLessThanOrEqual(358);
});

async function openWorkbench(page, url = "/") {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_APP));
}

async function canvasHasSignal(page) {
  return page.locator("#tileCanvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, 64, 64);
    let min = 255;
    let max = 0;
    let alphaPixels = 0;

    for (let index = 0; index < data.length; index += 4) {
      min = Math.min(min, data[index]);
      max = Math.max(max, data[index]);
      if (data[index + 3] > 0) {
        alphaPixels += 1;
      }
    }

    return alphaPixels > 0 && max > min;
  });
}

async function canvasSignature(page) {
  return page.locator("#tileCanvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let hash = 2166136261;
    let red = 0;
    let green = 0;
    let blue = 0;
    let samples = 0;

    for (let index = 0; index < data.length; index += 256) {
      hash ^= data[index] + data[index + 1] * 3 + data[index + 2] * 7 + data[index + 3] * 11;
      hash = Math.imul(hash, 16777619);
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      samples += 1;
    }

    return {
      hash: String(hash >>> 0),
      redMean: red / samples,
      greenMean: green / samples,
      blueMean: blue / samples,
      redGreenDelta: Math.abs(red - green) / samples,
    };
  });
}

async function chartSignals(page) {
  return page.evaluate(() => {
    const ids = ["prChart", "opsChart", "confChart", "liveChart"];
    return Object.fromEntries(ids.map((id) => [id, canvasSignal(document.getElementById(id))]));

    function canvasSignal(canvas) {
      const context = canvas.getContext("2d");
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let hash = 2166136261;
      let activePixels = 0;

      for (let index = 0; index < data.length; index += 16) {
        const value = data[index] + data[index + 1] + data[index + 2] + data[index + 3];
        if (value > 0) {
          activePixels += 1;
        }
        hash ^= value;
        hash = Math.imul(hash, 16777619);
      }

      return {
        hash: String(hash >>> 0),
        activePixels,
        hasSignal: activePixels > 0,
      };
    }
  });
}

async function labelCount(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("labels") || "[]").length);
}

async function firstStoredLabel(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("labels") || "[]")[0]);
}

async function blurActiveElement(page) {
  await page.evaluate(() => document.activeElement?.blur());
}

async function readClipboard(page) {
  return page.evaluate(() => navigator.clipboard.readText());
}

async function installMockAudio(page) {
  await page.addInitScript(() => {
    class MockOscillator {
      constructor() {
        this.frequency = { value: 0 };
        this.type = "sine";
      }
      connect() {}
      disconnect() {}
      start() {}
      stop() {}
    }

    class MockGain {
      constructor() {
        this.gain = { value: 0 };
      }
      connect() {}
      disconnect() {}
    }

    class MockAudioContext {
      constructor() {
        this.destination = {};
      }
      createOscillator() {
        return new MockOscillator();
      }
      createGain() {
        return new MockGain();
      }
    }

    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
  });
}

async function audioPreview(page) {
  return page.evaluate(() => window.COSMOS_CQA_APP.audioPreview());
}

async function progressWidth(page) {
  return page.locator("#prog").evaluate((element) => parseFloat(element.style.width || "0"));
}

async function cssValue(locator, property) {
  return locator.evaluate((element, name) => {
    const styles = getComputedStyle(element);
    return styles.getPropertyValue(name) || styles[name];
  }, property);
}

async function createPngDataUrl(page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const context = canvas.getContext("2d");
    const image = context.createImageData(8, 8);
    for (let index = 0; index < image.data.length; index += 4) {
      const value = (index / 4) % 2 === 0 ? 230 : 40;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL("image/png");
  });
}

async function readStreamText(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function decodeBookmarkPayload(url) {
  const encoded = new URL(url).hash.slice("#state=".length);
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
}

function annotateTargets(targets) {
  test.info().annotations.push({
    type: "legacy-targets",
    description: targets.join(", "),
  });
}
