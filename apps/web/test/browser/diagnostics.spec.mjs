import { expect, test } from "@playwright/test";

import { AUDIO_TARGETS, CALIBRATION_TARGETS, METRICS_CHART_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  audioPreview,
  blurActiveElement,
  chartSignals,
  disableSimulation,
  installMockAudio,
  openWorkbench,
  progressWidth,
} from "./fixtures/workbench.mjs";

test("migrates metrics and chart render/update targets into browser automation", async ({ page }) => {
  annotateTargets(METRICS_CHART_TARGETS);
  await openWorkbench(page);
  await disableSimulation(page);

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
