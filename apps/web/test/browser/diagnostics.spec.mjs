import { expect, test } from "@playwright/test";

import { AUDIO_TARGETS, CALIBRATION_TARGETS, METRICS_CHART_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  audioEvents,
  audioPreview,
  blurActiveElement,
  chartSignals,
  disableSimulation,
  installMockAudio,
  openWorkbench,
  progressWidth,
} from "./fixtures/workbench.mjs";

async function expectSelectorsInViewport(page, selectors) {
  await expect
    .poll(() =>
      page.evaluate((targetSelectors) => {
        return targetSelectors.map((selector) => {
          const element = document.querySelector(selector);
          if (!element) {
            return { selector, visible: false };
          }
          const rect = element.getBoundingClientRect();
          return {
            selector,
            visible: rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth,
          };
        });
      }, selectors),
    )
    .toEqual(selectors.map((selector) => ({ selector, visible: true })));
}

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

  await expect(page.locator("#audioSafetyNotice")).toContainText("Optional audio starts only when Play is selected.");
  await expect(page.locator("#audioSafetyNotice")).toContainText("not a diagnostic or therapeutic signal");
  await expect(page.getByRole("link", { name: "Audio safety" })).toHaveAttribute("href", "./safety.html");
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
  await expect(page.locator("#loopBtn")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => audioEvents(page).then((events) => events.filter((event) => event.type === "oscillator.start").length)).toBe(0);

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
  const playbackEvents = await audioEvents(page);
  const gainValues = playbackEvents.filter((event) => event.type === "param:gain").map((event) => event.value);
  const frequencyValues = playbackEvents.filter((event) => event.type === "param:frequency").map((event) => event.value);
  expect(playbackEvents.filter((event) => event.type === "oscillator.start")).toHaveLength(1);
  expect(gainValues.length).toBeGreaterThan(0);
  expect(frequencyValues.length).toBeGreaterThan(0);
  expect(Math.max(...gainValues)).toBeLessThanOrEqual(0.04);
  expect(Math.min(...frequencyValues)).toBeGreaterThanOrEqual(180);
  expect(Math.max(...frequencyValues)).toBeLessThanOrEqual(600);

  await page.locator("#playBtn").click();
  await expect(page.locator("#playBtn")).toHaveText("Play");
  await expect(page.locator("#playBtn")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => audioEvents(page).then((events) => events.some((event) => event.type === "oscillator.stop"))).toBe(true);

  await page.locator("#loopBtn").click();
  await expect(page.locator("#loopBtn")).toHaveText("Loop: on");
  await expect(page.locator("#loopBtn")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#loopBtn").click();
  await expect(page.locator("#loopBtn")).toHaveText("Loop: off");
  await expect(page.locator("#loopBtn")).toHaveAttribute("aria-pressed", "false");

  await blurActiveElement(page);
  await page.keyboard.press("Space");
  await expect(page.locator("#playBtn")).toHaveText("Pause");
  await blurActiveElement(page);
  await page.keyboard.press("Space");
  await expect(page.locator("#playBtn")).toHaveText("Play");

  await blurActiveElement(page);
  await page.keyboard.press("l");
  await expect(page.locator("#loopBtn")).toHaveText("Loop: on");
});

test("migrates calibration wizard targets into browser automation", async ({ page }) => {
  annotateTargets(CALIBRATION_TARGETS);
  await openWorkbench(page);

  await expect(page.getByText("3-step wizard plus inline mini-quiz")).toBeVisible();
  await expect(page.getByText("Start guided calibration to review three gold tiles")).toBeVisible();
  await expect(page.locator("#nextStep")).toHaveCount(1);
  await expect(page.locator("#calibDrawerSummary")).toContainText("controlled from the Tile Viewer label workflow");
  await page.locator("#calibBtn").click();
  await expect(page.locator("body")).toHaveClass(/calibration-active/);
  await expect(page.locator("#calibrationTileBanner")).toBeVisible();
  await expect(page.locator("#calibrationTileBannerText")).toContainText("classify the gold tile");
  await expect(page.locator("#calibrationWorkspace")).toBeFocused();
  await expect(page.locator("#calibStep")).toHaveText("1/3");
  await expect(page.locator("#calibHint")).toContainText("Hint:");
  await expect(page.locator("#exitCalib")).toBeEnabled();
  await expect(page.locator("#calibDrawerSummary")).toContainText("Guided calibration active in the Tile Viewer workflow");
  await expectSelectorsInViewport(page, ["#tileCanvas", "#classSel", "#note", "#submitBtn", "#calibHint", "#calibExplain", "#nextStep"]);

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
  await expect(page.locator("#calibrationWorkspace")).toBeFocused();
  await expect(page.locator("#calibStep")).toHaveText("1/3");
  await page.keyboard.press("c");
  await expect(page.locator("#calibrationWorkspace")).toBeFocused();
});

test("keeps guided calibration usable at narrow widths", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWorkbench(page);

  await blurActiveElement(page);
  await page.keyboard.press("c");

  await expect(page.locator("body")).toHaveClass(/calibration-active/);
  await expect(page.locator("#calibrationWorkspace")).toBeFocused();
  await expect(page.locator("#calibrationTileBanner")).toBeVisible();
  await expect(page.locator("#classSel")).toBeVisible();
  await expect(page.locator("#note")).toBeVisible();
  await expect(page.locator("#submitBtn")).toBeVisible();
  await expect(page.locator("#calibHint")).toContainText("Hint:");
  await expect(page.locator("#nextStep")).toBeEnabled();

  await page.locator("#exitCalib").click();
  await expect(page.locator("body")).not.toHaveClass(/calibration-active/);
  await expect(page.locator("#calibDrawerSummary")).toContainText("controlled from the Tile Viewer label workflow");
});
