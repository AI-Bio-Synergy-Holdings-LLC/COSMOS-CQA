import { expect, test } from "@playwright/test";

import { ACCESSIBILITY_TARGETS, UI_POLISH_TARGETS } from "./fixtures/legacy-targets.mjs";
import { annotateTargets, blurActiveElement, cssValue, openWorkbench } from "./fixtures/workbench.mjs";

test("exposes the redesigned research workbench shell and default public workspace", async ({ page }) => {
  await openWorkbench(page);

  const workflow = page.getByRole("navigation", { name: "Workbench workflow" });
  await expect(workflow).toBeVisible();
  for (const label of ["Tiles", "Labels", "Core Pack", "Diagnostics", "Reports", "Provenance"]) {
    await expect(workflow.getByRole("link", { name: new RegExp(label) })).toBeVisible();
  }

  await expect(page.locator("#workspace-tiles")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Tile Viewer/ })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Research inspector" })).toBeVisible();
  await expect(page.locator("#workspace-core-pack")).toBeVisible();
  await expect(page.locator("#workspace-diagnostics")).toBeVisible();
  await expect(page.locator("#workspace-reports")).toBeVisible();
  await expect(page.locator("#workspace-provenance")).toBeVisible();
  await expect(page.getByRole("region", { name: "Evidence drawer" })).toBeVisible();

  await expect(page.locator("#truthTag")).toBeHidden();
  await expect(page.getByText("Research only - not for production use")).toBeVisible();
});

test("keeps the research console hierarchy and responsive visual system coherent", async ({ page }) => {
  await openWorkbench(page);

  await expect.poll(() => cssValue(page.locator(".research-shell"), "gridTemplateAreas")).toContain("rail main");
  await expect.poll(() => cssValue(page.locator(".research-shell"), "gridTemplateAreas")).toContain("rail inspector");
  await expect.poll(() => cssValue(page.locator(".viewer"), "display")).toBe("grid");

  const shellBackground = await cssValue(page.locator("body"), "backgroundImage");
  const railBackground = await cssValue(page.locator(".workflow-rail"), "backgroundColor");
  const inspectorBackground = await cssValue(page.locator(".research-inspector .card").first(), "backgroundColor");
  expect(shellBackground).not.toBe("none");
  expect(railBackground).not.toBe(inspectorBackground);

  const tileBox = await page.locator("#tileCanvas").boundingBox();
  const controlsBox = await page.locator(".controls").boundingBox();
  const inspectorBox = await page.locator(".research-inspector").boundingBox();
  expect(tileBox.width).toBeGreaterThan(360);
  expect(Math.abs(tileBox.width - tileBox.height)).toBeLessThan(2);
  expect(controlsBox.width).toBeGreaterThan(280);
  expect(inspectorBox.width).toBeGreaterThan(300);

  await page.setViewportSize({ width: 1500, height: 900 });
  await openWorkbench(page);
  await expect.poll(() => cssValue(page.locator(".research-shell"), "gridTemplateAreas")).toContain("rail main inspector");
  await expect.poll(() => cssValue(page.locator(".viewer"), "display")).toBe("grid");

  await page.setViewportSize({ width: 390, height: 800 });
  await openWorkbench(page);
  await expect.poll(() => cssValue(page.locator(".workflow-rail"), "flexDirection")).toBe("row");
  await expect.poll(() => cssValue(page.locator(".viewer"), "flexDirection")).toBe("column");
  await expect.poll(() => cssValue(page.locator(".hotkey-toggle"), "position")).toBe("static");

  const mobileCanvasBox = await page.locator("#tileCanvas").boundingBox();
  expect(mobileCanvasBox.width).toBeLessThanOrEqual(358);
  expect(Math.abs(mobileCanvasBox.width - mobileCanvasBox.height)).toBeLessThan(2);
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

  const canvasShadow = await cssValue(page.locator("#tileCanvas"), "boxShadow");
  await page.locator("#tileCanvas").hover();
  await page.waitForTimeout(250);
  await expect.poll(() => cssValue(page.locator("#tileCanvas"), "boxShadow")).not.toBe(canvasShadow);

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
