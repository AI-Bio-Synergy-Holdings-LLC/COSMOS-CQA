import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const budgets = JSON.parse(readFileSync(new URL("../../quality-budgets.json", import.meta.url), "utf8"));

for (const route of budgets.performance.routes) {
  test(`keeps public quality budgets for ${route.label}`, async ({ page }) => {
    await openBudgetRoute(page, route.path);

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const firstPartyResources = performance.getEntriesByType("resource").filter((entry) => {
        try {
          return new URL(entry.name).origin === location.origin;
        } catch {
          return false;
        }
      });

      return {
        domNodes: document.getElementsByTagName("*").length,
        firstPartyResourceCount: firstPartyResources.length,
        loadMs: Math.round(Math.max(0, (navigation?.loadEventEnd || 0) - (navigation?.startTime || 0))),
        scriptCount: document.scripts.length,
        stylesheetCount: document.querySelectorAll('link[rel="stylesheet"]').length,
      };
    });

    expect(metrics.domNodes, `${route.label} DOM node budget`).toBeLessThanOrEqual(route.max_dom_nodes);
    expect(metrics.firstPartyResourceCount, `${route.label} first-party resource budget`).toBeLessThanOrEqual(route.max_first_party_resources);
    expect(metrics.loadMs, `${route.label} local load budget`).toBeLessThanOrEqual(route.max_local_load_ms);
    expect(metrics.scriptCount, `${route.label} script budget`).toBeLessThanOrEqual(route.max_scripts);
    expect(metrics.stylesheetCount, `${route.label} stylesheet budget`).toBeLessThanOrEqual(route.max_stylesheets);
  });
}

for (const routePath of budgets.accessibility.routes) {
  test(`keeps WCAG-oriented structure for ${routePath}`, async ({ page }) => {
    await openBudgetRoute(page, routePath);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", "width=device-width, initial-scale=1");
    await expect(page.locator("title")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('a[href="#main"]')).toHaveCount(1);
    await expect(page.locator("#main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveCount(1);

    const unlabeledCanvases = await page.locator("canvas").evaluateAll((canvases) =>
      canvases
        .filter((canvas) => canvas.getAttribute("aria-hidden") !== "true" && !canvas.getAttribute("aria-label"))
        .map((canvas) => canvas.id || canvas.className || "canvas"),
    );
    expect(unlabeledCanvases).toEqual([]);

    const undersizedTargets = await page.evaluate((minimumSize) => {
      const selectors = [
        ".portal-nav a",
        ".portal-action",
        ".workflow-link",
        ".mobile-review-mode-bar a",
        "button",
        "select",
        "textarea",
      ];

      return [...document.querySelectorAll(selectors.join(","))]
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            label: element.textContent.trim() || element.getAttribute("aria-label") || element.id || element.tagName,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })
        .filter((target) => target.width < minimumSize || target.height < minimumSize);
    }, budgets.accessibility.min_primary_target_size_css_px);

    expect(undersizedTargets).toEqual([]);
  });
}

for (const viewport of budgets.usability.viewport_checks) {
  for (const route of budgets.performance.routes) {
    test(`keeps first-viewport usability for ${route.label} at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openBudgetRoute(page, route.path);

      const layout = await page.evaluate(() => {
        const h1Box = document.querySelector("h1")?.getBoundingClientRect();
        return {
          horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
          h1Top: Math.round(h1Box?.top ?? 0),
        };
      });

      expect(layout.horizontalOverflowPx).toBeLessThanOrEqual(budgets.usability.max_horizontal_overflow_px);
      expect(layout.h1Top).toBeLessThanOrEqual(budgets.usability.first_viewport_h1_top_max_px);
    });
  }
}

async function openBudgetRoute(page, routePath) {
  await page.goto(routePath, { waitUntil: "load" });

  if (routePath === "/") {
    await page.waitForFunction(() => Boolean(window.COSMOS_CQA_PORTAL));
  }

  if (routePath.includes("workbench.html")) {
    await page.waitForFunction(() => Boolean(window.COSMOS_CQA_APP));
  }
}
