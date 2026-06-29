import { expect, test } from "@playwright/test";

import { EXPERT_QUEUE_TARGETS, LABEL_WORKFLOW_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  blurActiveElement,
  disableSimulation,
  firstStoredObservation,
  firstStoredLabel,
  labelCount,
  observationCount,
  openWorkbench,
} from "./fixtures/workbench.mjs";

test("migrates tracked label submit and undo targets into browser automation", async ({ page }) => {
  annotateTargets(LABEL_WORKFLOW_TARGETS);
  await openWorkbench(page);
  await disableSimulation(page);

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

test("migrates expert queue targets into browser automation", async ({ page }) => {
  annotateTargets(EXPERT_QUEUE_TARGETS);
  await openWorkbench(page);
  await disableSimulation(page);

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

test("pins tile observation targets and requires notes before synced submission", async ({ page }) => {
  await openWorkbench(page);
  await disableSimulation(page);

  const canvas = page.locator("#tileCanvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box.width * 0.42, y: box.height * 0.21 } });

  await expect(page.locator("#tileObservationStatus")).toContainText("Pinned top center");
  await expect(page.locator("#clearObservationBtn")).toBeVisible();
  await expect(page.locator("#submitBtn")).toBeDisabled();
  await expect(page.locator(".observation-marker.pending")).toHaveCount(1);

  await page.locator("#note").fill("faint vertical band in top center zone; visible with gradient overlay");
  await expect(page.locator("#submitBtn")).toBeEnabled();
  await page.locator("#classSel").selectOption("stripe");
  await page.locator("#sevSel").selectOption("medium");
  await page.locator("#submitBtn").click();

  await expect(page.locator("#caption")).toContainText("Submitted: stripe (medium) at top center.");
  await expect.poll(() => labelCount(page)).toBe(1);
  await expect.poll(() => observationCount(page)).toBe(1);
  await expect(page.locator(".observation-marker.submitted")).toHaveCount(1);
  await expect(page.locator(".observation-marker.pending")).toHaveCount(0);

  const label = await firstStoredLabel(page);
  const observation = await firstStoredObservation(page);
  expect(observation).toMatchObject({
    label_id: label.label_id,
    tile_id: "tile_001",
    zone_id: "r1c2",
    zone_label: "top center",
    clazz: "stripe",
    severity: "medium",
  });
  expect(observation.x_norm).toBeGreaterThan(0.4);
  expect(observation.x_norm).toBeLessThan(0.44);
  expect(observation.y_norm).toBeGreaterThan(0.19);
  expect(observation.y_norm).toBeLessThan(0.23);
  expect(observation.note).toContain("top center zone");

  await page.locator("#undoBtn").click();
  await expect.poll(() => labelCount(page)).toBe(0);
  await expect.poll(() => observationCount(page)).toBe(0);
  await expect(page.locator(".observation-marker.submitted")).toHaveCount(0);
});
