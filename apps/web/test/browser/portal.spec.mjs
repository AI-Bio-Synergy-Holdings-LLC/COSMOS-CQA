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
  await expect(page.getByRole("link", { name: "Quickstart Local run, hosted sample Core Pack workflow, report export, and verification command." })).toHaveAttribute(
    "href",
    /docs\/quickstart\.md$/,
  );
  await expect(page.getByRole("link", { name: "Citation CITATION.cff fields, canonical URL, release tag guidance, and citation boundaries." })).toHaveAttribute(
    "href",
    /docs\/citation\.md$/,
  );
  await expect(page.getByRole("link", { name: "Release Artifacts Release notes, validation report, SBOM path, known limitations, and evidence checks." })).toHaveAttribute(
    "href",
    /docs\/releases\/README\.md$/,
  );

  const signature = await page.evaluate(() => window.COSMOS_CQA_PORTAL.signalSignature());
  expect(signature.activePixels).toBeGreaterThan(0);

  const heroTitleBox = await page.locator("#portal-title").boundingBox();
  const viewportWidth = page.viewportSize().width;
  expect(heroTitleBox.x + heroTitleBox.width).toBeLessThanOrEqual(viewportWidth);
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);
});

test("publishes SEO, social preview, and structured metadata", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("meta[name='description']")).toHaveAttribute(
    "content",
    "COSMOS-CQA is a research-only public portal and browser workbench for cosmology artifact quality assurance evidence, provenance, and replay.",
  );
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", "index,follow");
  await expect(page.locator("meta[name='theme-color']")).toHaveAttribute("content", "#090d10");
  await expect(page.locator("link[rel='icon']")).toHaveAttribute("href", "./assets/favicon.svg");
  await expect(page.locator("link[rel='sitemap']")).toHaveAttribute("href", "https://cosmos-cqa.org/sitemap.xml");
  await expect(page.locator("meta[property='og:title']")).toHaveAttribute("content", "COSMOS-CQA Public Research Portal");
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", "https://cosmos-cqa.org/assets/social-preview.png");
  await expect(page.locator("meta[property='og:image:width']")).toHaveAttribute("content", "1200");
  await expect(page.locator("meta[property='og:image:height']")).toHaveAttribute("content", "630");
  await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator("meta[name='twitter:image']")).toHaveAttribute("content", "https://cosmos-cqa.org/assets/social-preview.png");

  const structuredData = JSON.parse(await page.locator("script[type='application/ld+json']").textContent());
  expect(structuredData["@context"]).toBe("https://schema.org");
  expect(structuredData["@graph"].some((item) => item["@type"] === "SoftwareSourceCode" && item.name === "COSMOS-CQA")).toBe(true);

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap: https://cosmos-cqa.org/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("https://cosmos-cqa.org/workbench.html");

  const preview = await request.get("/assets/social-preview.png");
  expect(preview.ok()).toBe(true);
  expect((await preview.body()).byteLength).toBeGreaterThan(10_000);
});

test("keeps the research workbench discoverability metadata aligned with the portal", async ({ page }) => {
  await page.goto("/workbench.html", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle("COSMOS-CQA Research Workbench");
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://cosmos-cqa.org/workbench.html");
  await expect(page.locator("meta[name='description']")).toHaveAttribute(
    "content",
    /Core Pack intake, tile review, evidence bundles, provenance hashes, validation reports, and deterministic replay/,
  );
  await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content", "https://cosmos-cqa.org/workbench.html");
  await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", "https://cosmos-cqa.org/assets/social-preview.png");
  await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", "summary_large_image");
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
