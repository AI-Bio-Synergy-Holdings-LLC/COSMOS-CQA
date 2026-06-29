import { expect, test } from "@playwright/test";

import { openWorkbench } from "./fixtures/workbench.mjs";

const publicPages = [
  { path: "/demo-workbook.html", title: /Demo Workbook \| COSMOS-CQA/, text: "Demo workbook for the public Core Pack workflow." },
  { path: "/research-experiment.html", title: /Research Experiment \| COSMOS-CQA/, text: "What the COSMOS-CQA workbench is testing." },
  { path: "/docs.html", title: /Docs \| COSMOS-CQA/, text: "Research infrastructure docs." },
  { path: "/releases.html", title: /Releases \| COSMOS-CQA/, text: "Research alpha release evidence." },
  { path: "/citation.html", title: /Citation \| COSMOS-CQA/, text: "Cite the repository and release evidence." },
  { path: "/license.html", title: /Research-Only License \| COSMOS-CQA/, text: "Public research use, reserved rights." },
  { path: "/governance.html", title: /Governance \| COSMOS-CQA/, text: "Stewarded public research infrastructure." },
  { path: "/ownership-and-use.html", title: /Ownership and Use \| COSMOS-CQA/, text: "Owned and stewarded by AI-Bio Synergy Holdings LLC." },
  { path: "/story.html", title: /Story Behind the Research \| COSMOS-CQA/, text: "From artifact intuition to public research infrastructure." },
  { path: "/safety.html", title: /Safety and Use Boundaries \| COSMOS-CQA/, text: "Safety boundaries for public research use." },
  { path: "/copyright.html", title: /Copyright Notice \| COSMOS-CQA/, text: "Copyright, notices, and third-party boundaries." },
  { path: "/user-data.html", title: /User Data Notice \| COSMOS-CQA/, text: "Local-first research workflow data." },
  { path: "/contact.html", title: /Contact \| COSMOS-CQA/, text: "Developer and public research route." },
];

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
  for (const label of ["Demo", "Workbook", "Experiment", "Docs", "Releases", "Story", "Safety", "Contact"]) {
    await expect(nav.getByRole("link", { name: new RegExp(`^${label}$`) })).toBeVisible();
  }

  await expect(nav.getByRole("link", { name: /^Demo$/ })).toHaveAttribute("href", "./workbench.html?demo=core-pack#workspace-core-pack");
  await expect(nav.getByRole("link", { name: /^Workbook$/ })).toHaveAttribute("href", "./demo-workbook.html");
  await expect(nav.getByRole("link", { name: /^Experiment$/ })).toHaveAttribute("href", "./research-experiment.html");
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://cosmos-cqa.org/");
  await expect(page.getByRole("link", { name: "Docs Quickstart, contracts, evidence bundles, deployment validation, and scope references." })).toHaveAttribute("href", "./docs.html");
  await expect(page.getByRole("link", { name: "Demo Workbook Step-by-step public walkthrough for the sample Core Pack workflow and evidence exports." })).toHaveAttribute(
    "href",
    "./demo-workbook.html",
  );
  await expect(page.getByRole("link", { name: "Research Experiment Scientific framing, engine fundamentals, sonic loop boundaries, and citizen participation benefits." })).toHaveAttribute(
    "href",
    "./research-experiment.html",
  );
  await expect(page.getByRole("link", { name: "Citation CITATION.cff fields, canonical URL, release tag guidance, and citation boundaries." })).toHaveAttribute(
    "href",
    "./citation.html",
  );
  await expect(page.getByRole("link", { name: "Release Artifacts Release notes, validation report, SBOM path, known limitations, and evidence checks." })).toHaveAttribute(
    "href",
    "./releases.html",
  );
  await expect(page.getByRole("link", { name: "Story Behind the Research Origin concept, public science references, and the path to a citable research workbench." })).toHaveAttribute("href", "./story.html");
  await expect(page.getByRole("link", { name: "Safety and Use Boundaries Audio sonification limits, visual review cautions, local-first data, and public non-claims." })).toHaveAttribute("href", "./safety.html");
  await expect(page.getByRole("link", { name: "Contact Developer route for public research questions, accessibility feedback, and issue routing." })).toHaveAttribute("href", "./contact.html");

  const signature = await page.evaluate(() => window.COSMOS_CQA_PORTAL.signalSignature());
  expect(signature.activePixels).toBeGreaterThan(0);

  const heroTitleBox = await page.locator("#portal-title").boundingBox();
  const viewportWidth = page.viewportSize().width;
  expect(heroTitleBox.x + heroTitleBox.width).toBeLessThanOrEqual(viewportWidth);
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);

  const markerAfterContent = await page.locator(".portal-brand-mark").first().evaluate((element) => getComputedStyle(element, "::after").content);
  expect(["none", "normal"].includes(markerAfterContent)).toBe(true);
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
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://cosmos-cqa.org/workbench.html");
  expect(sitemapText).toContain("https://cosmos-cqa.org/demo-workbook.html");
  expect(sitemapText).toContain("https://cosmos-cqa.org/research-experiment.html");
  expect(sitemapText).toContain("https://cosmos-cqa.org/story.html");
  expect(sitemapText).toContain("https://cosmos-cqa.org/safety.html");
  expect(sitemapText).toContain("https://cosmos-cqa.org/contact.html");

  const previewSource = await request.get("/social-preview.html");
  expect(previewSource.ok()).toBe(true);
  expect(await previewSource.text()).toContain("portalSignalCanvas");

  const favicon = await request.get("/assets/favicon.svg");
  expect(favicon.ok()).toBe(true);
  expect(await favicon.text()).not.toContain('cx="44"');

  const preview = await request.get("/assets/social-preview.png");
  expect(preview.ok()).toBe(true);
  expect((await preview.body()).byteLength).toBeGreaterThan(10_000);
});

test("serves public resource pages with canonical metadata and notices", async ({ page }) => {
  for (const publicPage of publicPages) {
    await page.goto(publicPage.path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(publicPage.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(publicPage.text);
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", `https://cosmos-cqa.org${publicPage.path}`);
    await expect(page.locator("meta[property='og:image']")).toHaveAttribute("content", "https://cosmos-cqa.org/assets/social-preview.png");
    await expect(page.locator("body")).not.toContainText("scientifically validated diagnostics");
  }

  await page.goto("/contact.html", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "cosmos-cqa-developer@ai-biosynergyholdings.com" })).toHaveAttribute(
    "href",
    /mailto:cosmos-cqa-developer@ai-biosynergyholdings\.com/,
  );

  await page.goto("/story.html", { waitUntil: "domcontentloaded" });
  for (const source of ["ESA Planck Legacy Archive", "NASA LAMBDA WMAP data products", "Dark Energy Survey Data Release 2", "Galaxy Zoo / Zooniverse"]) {
    await expect(page.getByRole("link", { name: source })).toBeVisible();
  }

  await page.goto("/demo-workbook.html", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Open Demo Workbench" })).toHaveAttribute("href", "./workbench.html?demo=core-pack#workspace-core-pack");
  await expect(page.getByText("Public truth labels remain hidden in the visible workflow and public DOM text.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Research Experiment" })).toHaveAttribute("href", "./research-experiment.html");
  await expect(page.getByRole("link", { name: "Safety and Use Boundaries" })).toHaveAttribute("href", "./safety.html");

  await page.goto("/research-experiment.html", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("What experiment is this workbench modeling?")).toBeVisible();
  await expect(page.getByText("What does the current prototype demonstrate?")).toBeVisible();
  await expect(page.getByText("How researchers and citizens benefit")).toBeVisible();
  await expect(page.getByText("What is explicitly not claimed yet?")).toBeVisible();
  await expect(page.getByText("It does not decide the label.")).toBeVisible();
  await expect(page.getByText("Browser code can limit frequency and software gain")).toBeVisible();
  for (const source of ["NASA Chandra Data Sonification", "The Sonification Handbook"]) {
    await expect(page.getByRole("link", { name: source })).toBeVisible();
  }

  await page.goto("/safety.html", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Audio-first safety boundary")).toBeVisible();
  await expect(page.getByText("Browser code cannot control device or headphone volume.")).toBeVisible();
  await expect(page.getByText("not a medical, therapeutic, diagnostic")).toBeVisible();
});

test("keeps public page inline action buttons visually aligned", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });

  for (const path of ["/releases.html", "/story.html", "/research-experiment.html"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const inlineListRows = await page.locator(".portal-inline-list").evaluateAll((lists) =>
      lists.map((list) =>
        [...list.querySelectorAll("a")].map((link) => {
          const rect = link.getBoundingClientRect();
          const style = getComputedStyle(link);
          return {
            alignItems: style.alignItems,
            top: Math.round(rect.top),
          };
        }),
      ),
    );

    for (const row of inlineListRows) {
      expect(row.length).toBeGreaterThan(1);
      expect(new Set(row.map((item) => item.alignItems))).toEqual(new Set(["center"]));
      const visualRows = groupByVisualRow(row);
      for (const visualRow of visualRows) {
        const tops = visualRow.map((item) => item.top);
        expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
      }
    }
  }
});

function groupByVisualRow(items) {
  return items
    .toSorted((left, right) => left.top - right.top)
    .reduce((rows, item) => {
      const currentRow = rows.find((row) => Math.abs(row[0].top - item.top) <= 1);
      if (currentRow) {
        currentRow.push(item);
      } else {
        rows.push([item]);
      }
      return rows;
    }, []);
}

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
