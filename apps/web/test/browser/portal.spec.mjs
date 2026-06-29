import { expect, test } from "@playwright/test";

import { openWorkbench } from "./fixtures/workbench.mjs";

test("serves the canonical public portal at the root route", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_PORTAL));

  await expect(page).toHaveTitle(/COSMOS-CQA Public Research Portal/);
  await expect(page.locator("h1")).toHaveText("COSMOS-CQA");
  await expect(page.getByText("Research-only public use", { exact: true })).toBeVisible();
  await expect(page.getByText("Not a production decision system.")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("OSI-approved");
  await expect(page.locator("body")).not.toContainText("scientifically validated diagnostics");

  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const label of ["Demo", "Docs", "Releases", "Citation", "License", "Stewardship"]) {
    await expect(nav.getByRole("link", { name: new RegExp(`^${label}$`) })).toBeVisible();
  }

  await expect(nav.getByRole("link", { name: /^Demo$/ })).toHaveAttribute("href", "./workbench.html?demo=core-pack#workspace-core-pack");
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://cosmos-cqa.org/");

  const signature = await page.evaluate(() => window.COSMOS_CQA_PORTAL.signalSignature());
  expect(signature.activePixels).toBeGreaterThan(0);
});

test("hands off from the public portal to the maintained research workbench", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Open Demo Workbench" }).click();
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_APP));

  await expect(page.locator("#tileCanvas")).toBeVisible();
  await expect(page.locator("#demoModeNotice")).toContainText("Hosted demo ready");
  await expect(page.locator("#tileId")).toHaveText("demo_corepack_tile_001");
});

test("keeps the portal usable on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.COSMOS_CQA_PORTAL));

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("link", { name: /^Demo$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Demo Workbench" })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);

  await openWorkbench(page);
  await expect(page.locator("#tileCanvas")).toBeVisible();
});
