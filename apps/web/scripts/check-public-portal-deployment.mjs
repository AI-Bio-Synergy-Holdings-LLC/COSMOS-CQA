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
const publicPagePaths = [
  "demo-workbook.html",
  "research-experiment.html",
  "docs.html",
  "releases.html",
  "citation.html",
  "license.html",
  "governance.html",
  "ownership-and-use.html",
  "story.html",
  "safety.html",
  "copyright.html",
  "user-data.html",
  "contact.html",
];
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
  const workbenchHtml = await readText("apps/web/workbench.html");
  const cname = (await readText("apps/web/CNAME")).trim();
  const robots = await readText("apps/web/robots.txt");
  const sitemap = await readText("apps/web/sitemap.xml");
  const citation = await readText("CITATION.cff");
  const quickstart = await readText("docs/quickstart.md");
  const publicPortalDoc = await readText("docs/public-portal.md");
  const deploymentDoc = await readText("docs/public-portal-deployment-validation.md");
  const publicSafetyDoc = await readText("docs/public-safety.md");
  const domainDoc = await readText("docs/domain-identity.md");
  const pagesWorkflow = await readText(".github/workflows/pages.yml");
  const artifactPrepScript = await readText("apps/web/scripts/prepare-pages-artifact.mjs");
  const pagesDnsScript = await readText("apps/web/scripts/check-pages-dns.mjs");
  const releaseIndex = await readText("docs/releases/README.md");
  const validationReport = JSON.parse(await readText(`docs/releases/${releaseId}-validation-report.json`));
  const sbom = JSON.parse(await readText(`docs/releases/${releaseId}-sbom.json`));

  assert(cname === canonicalHost, "apps/web/CNAME must contain only the canonical public domain.");
  await requireReadable("apps/web/assets/favicon.svg");
  await requireReadable("apps/web/social-preview.html");
  await requireReadable("apps/web/assets/social-preview.png");
  for (const pagePath of publicPagePaths) {
    await requireReadable(`apps/web/${pagePath}`);
  }

  requirePhrases("apps/web/index.html", portalHtml, [
    "<title>COSMOS-CQA Public Research Portal</title>",
    `<meta name="description" content="COSMOS-CQA is a research-only public portal and browser workbench for cosmology artifact quality assurance evidence, provenance, and replay.">`,
    `<meta name="author" content="${owner}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">`,
    `<link rel="sitemap" type="application/xml" title="Sitemap" href="${canonicalUrl}sitemap.xml">`,
    `<meta property="og:site_name" content="COSMOS-CQA">`,
    `<meta property="og:title" content="COSMOS-CQA Public Research Portal">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:image" content="${canonicalUrl}assets/social-preview.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${canonicalUrl}assets/social-preview.png">`,
    `"@type": "SoftwareSourceCode"`,
    `"codeRepository": "https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA"`,
    "Research-only public use",
    "Not a production decision system.",
    "Not an OSI open-source release.",
    "COSMOS-CQA Research-Only Public License",
    owner,
    "./docs.html",
    "./demo-workbook.html",
    "./research-experiment.html",
    "./releases.html",
    "./story.html",
    "./safety.html",
    "./contact.html",
    "./copyright.html",
    "./user-data.html",
    "./governance.html",
    "./ownership-and-use.html",
    "./workbench.html?demo=core-pack#workspace-core-pack",
  ]);

  requirePhrases("apps/web/workbench.html", workbenchHtml, [
    "<title>COSMOS-CQA Research Workbench</title>",
    `<link rel="canonical" href="${canonicalUrl}workbench.html">`,
    `<meta property="og:url" content="${canonicalUrl}workbench.html">`,
    `<meta property="og:image" content="${canonicalUrl}assets/social-preview.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    "Core Pack intake",
    "deterministic replay",
    "Optional audio starts only when Play is selected.",
    "./safety.html",
    owner,
  ]);

  requirePhrases("apps/web/robots.txt", robots, [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${canonicalUrl}sitemap.xml`,
  ]);

  requirePhrases("apps/web/sitemap.xml", sitemap, [
    "<urlset",
    `<loc>${canonicalUrl}</loc>`,
    `<loc>${canonicalUrl}workbench.html</loc>`,
    `<loc>${canonicalUrl}demo-workbook.html</loc>`,
    `<loc>${canonicalUrl}research-experiment.html</loc>`,
    `<loc>${canonicalUrl}docs.html</loc>`,
    `<loc>${canonicalUrl}releases.html</loc>`,
    `<loc>${canonicalUrl}story.html</loc>`,
    `<loc>${canonicalUrl}safety.html</loc>`,
    `<loc>${canonicalUrl}contact.html</loc>`,
  ]);

  requirePhrases("CITATION.cff", citation, [
    `url: "${canonicalUrl.slice(0, -1)}"`,
    'license: "LicenseRef-COSMOS-CQA-Research-Only"',
    owner,
  ]);

  requirePhrases("docs/quickstart.md", quickstart, [
    "https://cosmos-cqa.org",
    "demo workbook",
    "sample Core Pack workflow",
    "https://cosmos-cqa.org/safety.html",
    "Export Validation Report JSON",
    "npm --prefix apps/web run check",
    "npm --prefix apps/web run check:portal-deploy",
    "not an OSI open-source release",
  ]);

  requirePhrases("docs/public-portal.md", publicPortalDoc, [
    canonicalUrl.slice(0, -1),
    "apps/web/CNAME",
    "GitHub Pages",
    "npm --prefix apps/web run check:portal-deploy",
    "npm --prefix apps/web run pages:prepare",
    "COSMOS_CQA_PORTAL_BASE_URL",
    "COSMOS_CQA_STATIC_ROOT",
    "http://127.0.0.1:4173",
    "public portal release/deployment validation",
    "SEO, social preview, accessibility, and usability baseline",
    "copyright",
    "user data",
    "demo-workbook.html",
    "research-experiment.html",
    "safety.html",
    "docs/public-safety.md",
  ]);

  requirePhrases("docs/public-portal-deployment-validation.md", deploymentDoc, [
    "Public Portal Release/Deployment Validation",
    "canonical URL metadata",
    "social preview metadata",
    "robots.txt",
    "sitemap.xml",
    "public resource pages",
    "safety",
    "optional audio sonification",
    "structured data",
    "research-only license notice",
    "release artifact links",
    "SBOM",
    "validation report",
    "hosted demo route",
    "GitHub Pages",
    "apps/web/dist-pages",
    "actions/deploy-pages",
    "post-deploy",
    "HTTPS enforcement",
    "AI-Bio Synergy Holdings LLC",
  ]);

  requirePhrases("docs/public-safety.md", publicSafetyDoc, [
    "Public Safety And Use Boundaries",
    "audio sonification treated as the first-class risk surface",
    "avoid autoplay",
    "looping off by default",
    "180 Hz to 600 Hz",
    "output gain: 0.04",
    "device volume",
    "not legal, medical, audiology, or regulatory advice",
    "therapeutic sound",
    "diagnostic",
  ]);

  requirePhrases("docs/domain-identity.md", domainDoc, [
    "GitHub Pages DNS Handoff",
    "cosmos-cqa.org",
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
    "AI-Bio-Synergy-Holdings-LLC.github.io",
    "HTTPS enforcement",
  ]);

  requirePhrases(".github/workflows/pages.yml", pagesWorkflow, [
    "Deploy Public Portal",
    "actions/configure-pages@v6",
    "actions/upload-pages-artifact@v5",
    "actions/deploy-pages@v5",
    "apps/web/dist-pages",
    "pages: write",
    "id-token: write",
    "pages:check-dns",
    "COSMOS_CQA_PORTAL_BASE_URL",
    "COSMOS_CQA_STATIC_ROOT",
  ]);

  requirePhrases("apps/web/scripts/prepare-pages-artifact.mjs", artifactPrepScript, [
    "apps/web/dist-pages",
    "topLevelHtmlFiles",
    "CNAME",
    "robots.txt",
    "sitemap.xml",
    "assets",
    "packages",
    "examples",
    ".nojekyll",
  ]);

  requirePhrases("apps/web/scripts/check-pages-dns.mjs", pagesDnsScript, [
    "cosmos-cqa.org",
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
    "ai-bio-synergy-holdings-llc.github.io",
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
      path: "/robots.txt",
      label: "robots file",
      phrases: [`Sitemap: ${canonicalUrl}sitemap.xml`],
    },
    {
      path: "/sitemap.xml",
      label: "sitemap",
      phrases: [
        canonicalUrl,
        `${canonicalUrl}workbench.html`,
        `${canonicalUrl}demo-workbook.html`,
        `${canonicalUrl}research-experiment.html`,
        `${canonicalUrl}story.html`,
        `${canonicalUrl}safety.html`,
        `${canonicalUrl}contact.html`,
      ],
    },
    {
      path: "/assets/favicon.svg",
      label: "favicon asset",
      phrases: ["COSMOS-CQA mark"],
    },
    {
      path: "/social-preview.html",
      label: "social preview source",
      phrases: ["portalSignalCanvas", "COSMOS-CQA social preview"],
    },
    {
      path: "/assets/social-preview.png",
      label: "social preview image",
      minBytes: 10_000,
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

  for (const pagePath of publicPagePaths) {
    routes.push({
      path: `/${pagePath}`,
      label: `public page ${pagePath}`,
      phrases: ["COSMOS-CQA", "https://cosmos-cqa.org/assets/social-preview.png"],
    });
  }

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

  if (route.minBytes) {
    const body = await response.arrayBuffer();
    if (body.byteLength < route.minBytes) {
      failures.push(`${route.label}: expected at least ${route.minBytes} bytes for ${url}, got ${body.byteLength}`);
    }
    return;
  }

  const body = await response.text();
  requirePhrases(`${route.label} (${route.path})`, body, route.phrases || []);
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
