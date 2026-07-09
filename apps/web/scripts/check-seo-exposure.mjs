#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const canonicalUrl = "https://cosmos-cqa.org/";
const socialPreviewUrl = `${canonicalUrl}assets/social-preview.png`;
const socialPreviewAlt = "COSMOS-CQA research-only public portal for cosmology artifact QA evidence, provenance, and replay.";
const releaseRefreshDate = "2026-07-09";
const noIndexPages = new Set(["social-preview.html"]);
const failures = [];

const htmlPages = (await readdir(appRoot)).filter((entry) => entry.endsWith(".html")).sort();
const indexablePages = htmlPages.filter((entry) => !noIndexPages.has(entry));

await validatePages();
await validateSitemap();
await validateRobots();
await validateDocsAlignment();

if (failures.length > 0) {
  console.error("COSMOS-CQA SEO exposure check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`SEO exposure OK: ${indexablePages.length} indexable pages, sitemap lastmod, social metadata, and WebPage JSON-LD verified.`);
}

async function validatePages() {
  for (const page of indexablePages) {
    const html = await readText(`apps/web/${page}`);
    const label = page === "index.html" ? "portal root" : page;
    const expectedCanonical = page === "index.html" ? canonicalUrl : `${canonicalUrl}${page}`;
    const title = firstMatch(html, /<title>([^<]+)<\/title>/i);
    const description = firstMatch(html, /<meta name="description" content="([^"]+)"/i);

    requireOne(label, html, /<title>[^<]+<\/title>/gi, "title");
    requireOne(label, html, /<meta name="description" content="[^"]+"/gi, "meta description");
    requireOne(label, html, /<link rel="canonical" href="[^"]+"/gi, "canonical link");
    requireOne(label, html, /<meta name="robots" content="index,follow">/gi, "index robots meta");
    requireOne(label, html, /<h1\b/gi, "h1");

    assert(title.length >= 12 && title.length <= 70, `${label}: title length should stay search-snippet friendly.`);
    assert(description.length >= 70 && description.length <= 220, `${label}: meta description should be specific without becoming snippet-stuffed.`);
    assert(html.includes(`<link rel="canonical" href="${expectedCanonical}">`), `${label}: canonical URL must be ${expectedCanonical}.`);

    requireMeta(label, html, "property", "og:title");
    requireMeta(label, html, "property", "og:description");
    requireMeta(label, html, "property", "og:url", expectedCanonical);
    requireMeta(label, html, "property", "og:type", "website");
    requireMeta(label, html, "property", "og:image", socialPreviewUrl);
    requireMeta(label, html, "property", "og:image:alt", socialPreviewAlt);
    requireMeta(label, html, "property", "og:image:width", "1200");
    requireMeta(label, html, "property", "og:image:height", "630");

    requireMeta(label, html, "name", "twitter:card", "summary_large_image");
    requireMeta(label, html, "name", "twitter:title");
    requireMeta(label, html, "name", "twitter:description");
    requireMeta(label, html, "name", "twitter:image", socialPreviewUrl);
    requireMeta(label, html, "name", "twitter:image:alt", socialPreviewAlt);

    validateJsonLd(label, html, expectedCanonical, title, description);
  }

  const socialPreview = await readText("apps/web/social-preview.html");
  requirePhrase("social-preview.html", socialPreview, '<meta name="robots" content="noindex,nofollow">');
}

async function validateSitemap() {
  const sitemap = await readText("apps/web/sitemap.xml");
  requirePhrase("apps/web/sitemap.xml", sitemap, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const page of indexablePages) {
    const expectedCanonical = page === "index.html" ? canonicalUrl : `${canonicalUrl}${page}`;
    const block = sitemapBlock(sitemap, expectedCanonical);
    assert(Boolean(block), `apps/web/sitemap.xml: missing ${expectedCanonical}`);
    if (block) {
      requirePhrase(`sitemap block ${expectedCanonical}`, block, `<lastmod>${releaseRefreshDate}</lastmod>`);
      requirePhrase(`sitemap block ${expectedCanonical}`, block, "<changefreq>monthly</changefreq>");
      requirePhrase(`sitemap block ${expectedCanonical}`, block, "<priority>");
    }
  }

  for (const page of noIndexPages) {
    assert(!sitemap.includes(`${canonicalUrl}${page}`), `apps/web/sitemap.xml: noindex page must not be listed: ${page}`);
  }
}

async function validateRobots() {
  const robots = await readText("apps/web/robots.txt");
  requirePhrase("apps/web/robots.txt", robots, "User-agent: *");
  requirePhrase("apps/web/robots.txt", robots, "Allow: /");
  requirePhrase("apps/web/robots.txt", robots, `Sitemap: ${canonicalUrl}sitemap.xml`);
}

async function validateDocsAlignment() {
  const baseline = await readText("docs/seo-social-accessibility-baseline.md");
  const publicPortal = await readText("docs/public-portal.md");
  const deployment = await readText("docs/public-portal-deployment-validation.md");

  requirePhrase("docs/seo-social-accessibility-baseline.md", baseline, "SEO Exposure Gate");
  requirePhrase("docs/seo-social-accessibility-baseline.md", baseline, "npm --prefix apps/web run check:seo-exposure");
  requirePhrase("docs/public-portal.md", publicPortal, "check:seo-exposure");
  requirePhrase("docs/public-portal-deployment-validation.md", deployment, "check:seo-exposure");
}

function validateJsonLd(label, html, canonical, title, description) {
  const payloads = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/gi)].map((match) => match[1].trim());
  assert(payloads.length > 0, `${label}: missing JSON-LD structured data.`);

  const parsedPayloads = [];
  for (const payload of payloads) {
    try {
      parsedPayloads.push(JSON.parse(payload));
    } catch (error) {
      failures.push(`${label}: JSON-LD parse failed: ${error.message}`);
    }
  }

  const nodes = parsedPayloads.flatMap((payload) => (Array.isArray(payload["@graph"]) ? payload["@graph"] : [payload]));
  const pageNode = nodes.find((node) => node["@type"] === "WebPage" && node["@id"] === `${canonical}#webpage`);
  assert(Boolean(pageNode), `${label}: missing WebPage JSON-LD node for canonical URL.`);
  if (pageNode) {
    assert(pageNode.url === canonical, `${label}: WebPage JSON-LD url must match canonical URL.`);
    assert(pageNode.name === title, `${label}: WebPage JSON-LD name must match title.`);
    assert(pageNode.description === description, `${label}: WebPage JSON-LD description must match meta description.`);
    assert(pageNode.inLanguage === "en", `${label}: WebPage JSON-LD must set inLanguage to en.`);
  }

  if (label === "portal root") {
    assert(nodes.some((node) => node["@type"] === "Organization" && node["@id"] === `${canonicalUrl}#organization`), "portal root: missing Organization JSON-LD.");
    assert(nodes.some((node) => node["@type"] === "WebSite" && node["@id"] === `${canonicalUrl}#website`), "portal root: missing WebSite JSON-LD.");
    assert(nodes.some((node) => node["@type"] === "SoftwareSourceCode" && node["@id"] === `${canonicalUrl}#software`), "portal root: missing SoftwareSourceCode JSON-LD.");
  }
}

function sitemapBlock(sitemap, canonical) {
  const escaped = canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`<url>\\s*<loc>${escaped}</loc>[\\s\\S]*?</url>`, "i").exec(sitemap);
  return match?.[0] || "";
}

function requireMeta(label, html, attributeName, key, expectedValue) {
  const value = firstMatch(html, new RegExp(`<meta ${attributeName}="${escapeRegExp(key)}" content="([^"]+)"`, "i"));
  if (!value) {
    failures.push(`${label}: missing ${key} metadata.`);
    return;
  }
  if (expectedValue && value !== expectedValue) {
    failures.push(`${label}: ${key} must be "${expectedValue}".`);
  }
}

function requireOne(label, text, pattern, name) {
  const count = (text.match(pattern) || []).length;
  if (count !== 1) {
    failures.push(`${label}: expected exactly one ${name}, found ${count}.`);
  }
}

async function readText(relativePath) {
  try {
    return await readFile(path.join(repoRoot, relativePath), "utf8");
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`);
    return "";
  }
}

function requirePhrase(label, text, phrase) {
  if (!text.includes(phrase)) {
    failures.push(`${label}: missing "${phrase}"`);
  }
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function firstMatch(text, pattern) {
  return (pattern.exec(text)?.[1] || "").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
