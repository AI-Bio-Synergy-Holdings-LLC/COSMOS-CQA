import { expect, test } from "@playwright/test";

import { EXPERT_QUEUE_TARGETS, LABEL_WORKFLOW_TARGETS } from "./fixtures/legacy-targets.mjs";
import {
  annotateTargets,
  blurActiveElement,
  disableSimulation,
  firstStoredLabel,
  labelCount,
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
