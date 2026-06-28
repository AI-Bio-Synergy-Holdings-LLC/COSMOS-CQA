import { expect, test } from "@playwright/test";

import {
  OVERLAY_PALETTE_TARGETS,
  TILE_NAVIGATION_TARGETS,
  TRUTH_POLICY_TARGETS,
} from "./fixtures/legacy-targets.mjs";
import { annotateTargets, canvasHasSignal, canvasSignature, openWorkbench } from "./fixtures/workbench.mjs";

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
