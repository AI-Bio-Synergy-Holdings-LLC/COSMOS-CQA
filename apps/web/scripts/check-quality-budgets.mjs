#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../..");
const appRoot = resolve(repoRoot, "apps/web");
const budgetPath = resolve(appRoot, "quality-budgets.json");
const budget = JSON.parse(await readFile(budgetPath, "utf8"));
const failures = [];
const routeHtml = new Map();

await validateStaticAssets();
await validateRouteContracts();
await validateContrastBudgets();
await validateDocsAlignment();

if (failures.length > 0) {
  console.error("COSMOS-CQA quality budget check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Quality budgets OK: ${budget.performance.static_assets.length} static assets, ${budget.performance.routes.length} routes, ${budget.accessibility.contrast_pairs.length} contrast pairs.`,
  );
}

async function validateStaticAssets() {
  for (const asset of budget.performance.static_assets) {
    const absolutePath = resolve(repoRoot, asset.path);
    try {
      const stats = await stat(absolutePath);
      if (stats.size > asset.max_bytes) {
        failures.push(`${asset.path}: ${stats.size} bytes exceeds budget ${asset.max_bytes}`);
      }
    } catch (error) {
      failures.push(`${asset.path}: ${error.message}`);
    }
  }
}

async function validateRouteContracts() {
  for (const route of budget.performance.routes) {
    const relativePath = route.path === "/" ? "index.html" : route.path.replace(/^\//, "").replace(/\?.*$/, "");
    const label = `${route.label} (${route.path})`;
    const html = await readRouteHtml(relativePath, label);

    if (!html) {
      continue;
    }

    routeHtml.set(route.path, html);
    requirePhrase(label, html, "<!doctype html>");
    requirePhrase(label, html, '<html lang="en">');
    requirePhrase(label, html, '<meta name="viewport" content="width=device-width, initial-scale=1">');
    requirePhrase(label, html, '<link rel="canonical" href="https://cosmos-cqa.org');
    requirePhrase(label, html, '<meta name="description" content=');
    requirePhrase(label, html, 'href="#main"');
    requirePhrase(label, html, 'id="main"');

    if (countMatches(html, /<title>[^<]+<\/title>/gi) !== 1) {
      failures.push(`${label}: expected exactly one non-empty title`);
    }

    if (countMatches(html, /<h1\b/gi) !== 1) {
      failures.push(`${label}: expected exactly one h1`);
    }

    const scripts = countMatches(html, /<script\b/gi);
    if (scripts > route.max_scripts) {
      failures.push(`${label}: ${scripts} script tags exceeds budget ${route.max_scripts}`);
    }

    const stylesheets = countMatches(html, /<link\b[^>]+rel="stylesheet"/gi);
    if (stylesheets > route.max_stylesheets) {
      failures.push(`${label}: ${stylesheets} stylesheet links exceeds budget ${route.max_stylesheets}`);
    }

    const canvases = html.match(/<canvas\b[^>]*>/gi) || [];
    for (const canvas of canvases) {
      if (!/aria-hidden="true"|aria-label="[^"]+"/i.test(canvas)) {
        failures.push(`${label}: canvas must be hidden from assistive tech or have an aria-label`);
      }
    }

    if (html.includes('property="og:image"') && !html.includes('property="og:image:alt"')) {
      failures.push(`${label}: social preview image metadata must include og:image:alt`);
    }
  }

  for (const href of budget.usability.required_public_links) {
    const linked = [...routeHtml.values()].some((html) => html.includes(`href="${href}"`));
    if (!linked) {
      failures.push(`required public link missing from budgeted routes: ${href}`);
    }
  }

  const combinedHtml = [...routeHtml.values()].join("\n").toLowerCase();
  for (const phrase of budget.usability.claim_boundary_phrases) {
    if (!combinedHtml.includes(phrase.toLowerCase())) {
      failures.push(`budgeted public routes missing claim-boundary phrase: ${phrase}`);
    }
  }

  const portalCss = await readText("apps/web/src/portal.css");
  const workbenchCss = await readText("apps/web/src/styles.css");
  requirePhrase("apps/web/src/portal.css", portalCss, "prefers-reduced-motion");
  requirePhrase("apps/web/src/styles.css", workbenchCss, "prefers-reduced-motion");
  requirePhrase("apps/web/src/portal.css", portalCss, ":focus-visible");
  requirePhrase("apps/web/src/styles.css", workbenchCss, ":focus-visible");
}

async function validateContrastBudgets() {
  for (const pair of budget.accessibility.contrast_pairs) {
    const ratio = contrastRatio(pair.foreground, pair.background);
    if (ratio < pair.minimum_ratio) {
      failures.push(`${pair.label}: contrast ${ratio.toFixed(2)} is below ${pair.minimum_ratio}`);
    }
  }
}

async function validateDocsAlignment() {
  const baseline = await readText("docs/seo-social-accessibility-baseline.md");
  const deployment = await readText("docs/public-portal-deployment-validation.md");
  const publicPortal = await readText("docs/public-portal.md");

  requirePhrase("docs/seo-social-accessibility-baseline.md", baseline, "Quality Budgets");
  requirePhrase("docs/seo-social-accessibility-baseline.md", baseline, "apps/web/quality-budgets.json");
  requirePhrase("docs/seo-social-accessibility-baseline.md", baseline, "npm --prefix apps/web run check:quality-budgets");
  requirePhrase("docs/public-portal-deployment-validation.md", deployment, "quality budgets");
  requirePhrase("docs/public-portal.md", publicPortal, "quality budgets");

  const heuristicSection = sectionText(
    baseline,
    "## Nielsen Norman Group Heuristic Baseline",
    "## Verification Commands",
  );
  const heuristicRows = heuristicSection
    .split("\n")
    .filter((line) => /^\| [^|-]/.test(line))
    .slice(1);

  if (heuristicRows.length !== budget.usability.nng_heuristics_required) {
    failures.push(
      `docs/seo-social-accessibility-baseline.md: expected ${budget.usability.nng_heuristics_required} NN/g heuristic rows, found ${heuristicRows.length}`,
    );
  }
}

async function readRouteHtml(relativePath, label) {
  const html = await readText(`apps/web/${relativePath}`);
  if (!html) {
    failures.push(`${label}: route file is empty or unreadable`);
  }
  return html;
}

async function readText(relativePath) {
  try {
    return await readFile(resolve(repoRoot, relativePath), "utf8");
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

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function contrastRatio(foreground, background) {
  const fg = relativeLuminance(hexToRgb(foreground));
  const bg = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance({ r, g, b }) {
  const [red, green, blue] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexToRgb(value) {
  const match = /^#?([a-f0-9]{6})$/i.exec(value);
  if (!match) {
    throw new Error(`Unsupported color value: ${value}`);
  }
  const numeric = Number.parseInt(match[1], 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
}

function sectionText(text, startHeading, endHeading) {
  const start = text.indexOf(startHeading);
  const end = text.indexOf(endHeading);
  if (start === -1 || end === -1 || end <= start) {
    return "";
  }
  return text.slice(start, end);
}
