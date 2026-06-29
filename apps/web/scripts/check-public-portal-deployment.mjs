#!/usr/bin/env node

import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const canonicalUrl = "https://cosmos-cqa.org/";
const canonicalHost = "cosmos-cqa.org";
const owner = "AI-Bio Synergy Holdings LLC";
const releaseId = "v0.1.0-research-alpha";
const failures = [];

await validateStaticContract();
await validateHttpSurface();

if (failures.length > 0) {
  console.error("Public portal deployment validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  const httpMode = process.env.COSMOS_CQA_PORTAL_BASE_URL ? " with HTTP smoke checks" : "";
  console.log(`Public portal deployment validation OK${httpMode}.`);
}

async function validateStaticContract() {
  const portalHtml = await readText("apps/web/index.html");
  const cname = (await readText("apps/web/CNAME")).trim();
  const citation = await readText("CITATION.cff");
  const quickstart = await readText("docs/quickstart.md");
  const publicPortalDoc = await readText("docs/public-portal.md");
  const deploymentDoc = await readText("docs/public-portal-deployment-validation.md");
  const releaseIndex = await readText("docs/releases/README.md");
  const validationReport = JSON.parse(await readText(`docs/releases/${releaseId}-validation-report.json`));
  const sbom = JSON.parse(await readText(`docs/releases/${releaseId}-sbom.json`));

  assert(cname === canonicalHost, "apps/web/CNAME must contain only the canonical public domain.");

  requirePhrases("apps/web/index.html", portalHtml, [
    "<title>COSMOS-CQA Public Research Portal</title>",
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    "Research-only public use",
    "Not a production decision system.",
    "Not an OSI open-source release.",
    "COSMOS-CQA Research-Only Public License",
    owner,
    "https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA/releases",
    "docs/releases/README.md",
    "./workbench.html?demo=core-pack#workspace-core-pack",
  ]);

  requirePhrases("CITATION.cff", citation, [
    `url: "${canonicalUrl.slice(0, -1)}"`,
    'license: "LicenseRef-COSMOS-CQA-Research-Only"',
    owner,
  ]);

  requirePhrases("docs/quickstart.md", quickstart, [
    "https://cosmos-cqa.org",
    "sample Core Pack workflow",
    "Export Validation Report JSON",
    "npm --prefix apps/web run check",
    "npm --prefix apps/web run check:portal-deploy",
    "not an OSI open-source release",
  ]);

  requirePhrases("docs/public-portal.md", publicPortalDoc, [
    canonicalUrl.slice(0, -1),
    "apps/web/CNAME",
    "npm --prefix apps/web run check:portal-deploy",
    "COSMOS_CQA_PORTAL_BASE_URL",
    "http://127.0.0.1:4173",
    "public portal release/deployment validation",
  ]);

  requirePhrases("docs/public-portal-deployment-validation.md", deploymentDoc, [
    "Public Portal Release/Deployment Validation",
    "canonical URL metadata",
    "research-only license notice",
    "release artifact links",
    "SBOM",
    "validation report",
    "hosted demo route",
    "AI-Bio Synergy Holdings LLC",
  ]);

  requirePhrases("docs/releases/README.md", releaseIndex, [
    "Release Artifact Index",
    `${releaseId}.md`,
    `${releaseId}-validation-report.json`,
    `${releaseId}-sbom.json`,
    "known limitations",
    canonicalUrl.slice(0, -1),
    "COSMOS-CQA Research-Only Public License",
  ]);

  for (const artifactPath of extractLocalReleaseLinks(releaseIndex)) {
    await requireReadable(`docs/releases/${artifactPath}`);
  }

  assert(validationReport.build?.dev === false, "release validation report must record a public, non-dev build.");
  assert(Array.isArray(validationReport.checks), "release validation report must include checks.");
  assert(
    validationReport.checks.every((check) => check.status === "pass"),
    "release validation report must not publish failing checks.",
  );
  requireReleaseCheck(validationReport, "research-only license notice");
  requireReleaseCheck(validationReport, "sbom artifact");
  requireReleaseCheck(validationReport, "canonical public URL");

  assert(sbom.bomFormat === "CycloneDX", "release SBOM must use CycloneDX format.");
  assert(Boolean(sbom.specVersion), "release SBOM must include a specVersion.");
  assert(Array.isArray(sbom.components) && sbom.components.length > 0, "release SBOM must include at least one component.");
}

async function validateHttpSurface() {
  const baseUrl = process.env.COSMOS_CQA_PORTAL_BASE_URL;
  if (!baseUrl) {
    return;
  }

  const routes = [
    {
      path: "/",
      label: "portal root",
      phrases: ["COSMOS-CQA Public Research Portal", canonicalUrl, "Research-only public use"],
    },
    {
      path: "/workbench.html?demo=core-pack",
      label: "hosted demo workbench shell",
      phrases: ["COSMOS-CQA Research Workbench", "Hosted demo mode is loading the public sample Core Pack.", "Export Validation Report JSON"],
    },
    {
      path: "/CNAME",
      label: "canonical domain file",
      phrases: [canonicalHost],
    },
    {
      path: "/src/portal.js",
      label: "portal module",
      phrases: ["COSMOS_CQA_PORTAL"],
    },
    {
      path: "/src/main.js",
      label: "workbench module",
      phrases: ["COSMOS_CQA_APP"],
    },
    {
      path: "/examples/core-pack/core-pack.manifest.json",
      label: "sample Core Pack manifest",
      phrases: ["corepack_demo-v0.1.0-intake", "demo_corepack_tile_001"],
    },
    {
      path: "/packages/schemas/src/index.js",
      label: "shared schema entrypoint",
      phrases: ["CONTRACT_SCHEMA_VERSION", "schemas"],
    },
    {
      path: "/packages/core/src/index.js",
      label: "shared core entrypoint",
      phrases: ["./labels/index.js", "./reports/index.js"],
    },
  ];

  for (const route of routes) {
    await validateHttpRoute(baseUrl, route);
  }
}

async function validateHttpRoute(baseUrl, route) {
  const url = new URL(route.path, baseUrl).toString();
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    failures.push(`${route.label}: failed to fetch ${url}: ${error.message}`);
    return;
  }

  if (!response.ok) {
    failures.push(`${route.label}: expected HTTP 200 for ${url}, got ${response.status}`);
    return;
  }

  const body = await response.text();
  requirePhrases(`${route.label} (${route.path})`, body, route.phrases);
}

function requirePhrases(label, text, phrases) {
  const normalizedText = normalize(text);
  for (const phrase of phrases) {
    if (!normalizedText.includes(normalize(phrase))) {
      failures.push(`${label}: missing "${phrase}"`);
    }
  }
}

function requireReleaseCheck(report, name) {
  assert(
    report.checks.some((check) => check.name === name && check.status === "pass"),
    `release validation report must include passing check "${name}".`,
  );
}

function extractLocalReleaseLinks(markdown) {
  const links = [];
  const linkPattern = /\]\((v0\.1\.0-research-alpha[^)]+)\)/g;
  let match = linkPattern.exec(markdown);

  while (match) {
    links.push(match[1]);
    match = linkPattern.exec(markdown);
  }

  return links;
}

async function requireReadable(relativePath) {
  try {
    await access(path.join(repoRoot, relativePath), constants.R_OK);
  } catch {
    failures.push(`${relativePath}: linked release artifact is missing or unreadable`);
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

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function normalize(value) {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}
