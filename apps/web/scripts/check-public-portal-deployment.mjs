#!/usr/bin/env node

import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const canonicalUrl = "https://cosmos-cqa.org/";
const canonicalHost = "cosmos-cqa.org";
const owner = "AI-Bio Synergy Holdings LLC";
const releaseId = "v0.1.4-research-alpha";
const releaseVersion = "0.1.4-research-alpha";
const currentDoiReleaseId = releaseId;
const currentDoiReleaseVersion = releaseVersion;
const zenodoConceptDoi = "10.5281/zenodo.21112698";
const zenodoPriorReleaseDoi = "10.5281/zenodo.21112699";
const zenodoEarlierReleaseDoi = "10.5281/zenodo.21142690";
const zenodoPreviousReleaseDoi = "10.5281/zenodo.21285595";
const zenodoCurrentReleaseDoi = "10.5281/zenodo.21315776";
const citationMetaPhrases = [
  '<meta name="citation_title" content="COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts">',
  `<meta name="citation_author" content="${owner}">`,
  '<meta name="citation_publication_date" content="2026-07-11">',
  `<meta name="citation_doi" content="${zenodoCurrentReleaseDoi}">`,
  `<meta name="citation_software_version" content="${currentDoiReleaseVersion}">`,
  `<meta name="DC.identifier" content="https://doi.org/${zenodoCurrentReleaseDoi}">`,
  `<meta name="DC.relation" content="https://doi.org/${zenodoConceptDoi}">`,
];
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
  "partner-readiness.html",
  "safety.html",
  "security.html",
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
  const demoWorkbookPage = await readText("apps/web/demo-workbook.html");
  const cname = (await readText("apps/web/CNAME")).trim();
  const robots = await readText("apps/web/robots.txt");
  const sitemap = await readText("apps/web/sitemap.xml");
  const citation = await readText("CITATION.cff");
  const zenodoRaw = await readText(".zenodo.json");
  const zenodoMetadata = JSON.parse(zenodoRaw);
  const readme = await readText("README.md");
  const docsReadme = await readText("docs/README.md");
  const citationDoc = await readText("docs/citation.md");
  const citationPage = await readText("apps/web/citation.html");
  const docsPage = await readText("apps/web/docs.html");
  const releasesPage = await readText("apps/web/releases.html");
  const storyPage = await readText("apps/web/story.html");
  const partnerReadinessPage = await readText("apps/web/partner-readiness.html");
  const quickstart = await readText("docs/quickstart.md");
  const projectNotes = await readText("docs/project-notes.md");
  const publicPortalDoc = await readText("docs/public-portal.md");
  const publicSurfaceHardeningDoc = await readText("docs/public-surface-hardening.md");
  const seoAccessibilityBaseline = await readText("docs/seo-social-accessibility-baseline.md");
  const selectiveAccessDoc = await readText("docs/selective-access-application.md");
  const privateApplicationTransitionMap = await readText("docs/private-application-transition-map.md");
  const privateApplicationReadinessGates = await readText("docs/private-application-readiness-gates.md");
  const zenodoDoc = await readText("docs/zenodo-registration.md");
  const deploymentDoc = await readText("docs/public-portal-deployment-validation.md");
  const packageManifest = await readText("apps/web/package.json");
  const qualityBudgetsRaw = await readText("apps/web/quality-budgets.json");
  const qualityBudgets = JSON.parse(qualityBudgetsRaw);
  const publicSafetyDoc = await readText("docs/public-safety.md");
  const securityPolicy = await readText("SECURITY.md");
  const securityDisclosureDoc = await readText("docs/security-disclosure.md");
  const securityPage = await readText("apps/web/security.html");
  const dataGovernanceDoc = await readText("docs/data-governance.md");
  const userDataPage = await readText("apps/web/user-data.html");
  const issueTemplateConfig = await readText(".github/ISSUE_TEMPLATE/config.yml");
  const safetyIssueTemplate = await readText(".github/ISSUE_TEMPLATE/safety_report.md");
  const accessibilityIssueTemplate = await readText(".github/ISSUE_TEMPLATE/accessibility_report.md");
  const domainDoc = await readText("docs/domain-identity.md");
  const pagesWorkflow = await readText(".github/workflows/pages.yml");
  const artifactPrepScript = await readText("apps/web/scripts/prepare-pages-artifact.mjs");
  const pagesDnsScript = await readText("apps/web/scripts/check-pages-dns.mjs");
  const seoExposureScript = await readText("apps/web/scripts/check-seo-exposure.mjs");
  const releaseIndex = await readText("docs/releases/README.md");
  const releaseNotes = await readText(`docs/releases/${releaseId}.md`);
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
    ...citationMetaPhrases,
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
    `"version": "${currentDoiReleaseVersion}"`,
    `"propertyID": "Zenodo all-versions DOI"`,
    `"value": "${zenodoConceptDoi}"`,
    `"url": "https://doi.org/${zenodoConceptDoi}"`,
    `"propertyID": "Zenodo release DOI"`,
    `"value": "${zenodoCurrentReleaseDoi}"`,
    `"url": "https://doi.org/${zenodoCurrentReleaseDoi}"`,
    "https://zenodo.org/records/21315776",
    "Cite v0.1.4:",
    `https://doi.org/${zenodoCurrentReleaseDoi}`,
    "Research-only public use",
    "Not a production decision system.",
    "Not an OSI open-source release.",
    "Selective-access application planned.",
    "This public demo remains local-first and does not authenticate users, collect observations, or transmit review packets.",
    "COSMOS-CQA Research-Only Public License",
    owner,
    "./docs.html",
    "./demo-workbook.html",
    "./research-experiment.html",
    "./releases.html",
    "./story.html",
    "./partner-readiness.html",
    "./safety.html",
    "./security.html",
    "./contact.html",
    "./copyright.html",
    "./user-data.html",
    "./governance.html",
    "./ownership-and-use.html",
    "./workbench.html?demo=core-pack",
  ]);

  requirePhrases("apps/web/workbench.html", workbenchHtml, [
    "<title>COSMOS-CQA Research Workbench</title>",
    ...citationMetaPhrases,
    `<link rel="canonical" href="${canonicalUrl}workbench.html">`,
    `<meta property="og:url" content="${canonicalUrl}workbench.html">`,
    `<meta property="og:image" content="${canonicalUrl}assets/social-preview.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    "Core Pack intake",
    "deterministic replay",
    "Cite DOI",
    "Cite this demo release",
    zenodoCurrentReleaseDoi,
    zenodoConceptDoi,
    "Optional audio starts only when Play is selected.",
    "3-step wizard plus inline mini-quiz",
    "Start guided calibration to review three gold tiles",
    "Guided calibration is controlled from the Tile Viewer label workflow",
    "./safety.html",
    owner,
  ]);

  requirePhrases("apps/web/demo-workbook.html", demoWorkbookPage, [
    "<title>Demo Workbook | COSMOS-CQA</title>",
    ...citationMetaPhrases,
    `<link rel="canonical" href="${canonicalUrl}demo-workbook.html">`,
    "Cite this demo release:",
    zenodoCurrentReleaseDoi,
    zenodoConceptDoi,
    "For public notes or reproducibility review",
    "exported validation, SBOM, session, or evidence bundle artifacts",
    "Open Demo Workbench",
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
    `<loc>${canonicalUrl}partner-readiness.html</loc>`,
    `<loc>${canonicalUrl}safety.html</loc>`,
    `<loc>${canonicalUrl}security.html</loc>`,
    `<loc>${canonicalUrl}contact.html</loc>`,
    "<lastmod>2026-07-09</lastmod>",
  ]);

  requirePhrases("CITATION.cff", citation, [
    `doi: "${zenodoCurrentReleaseDoi}"`,
    `version: "${releaseVersion}"`,
    `url: "${canonicalUrl.slice(0, -1)}"`,
    'license: "LicenseRef-COSMOS-CQA-Research-Only"',
    "Zenodo DOI",
    zenodoConceptDoi,
    zenodoPriorReleaseDoi,
    zenodoEarlierReleaseDoi,
    zenodoPreviousReleaseDoi,
    zenodoCurrentReleaseDoi,
    "Canonical public portal",
    "Canonical public source repository",
    owner,
  ]);

  requirePhrases(".zenodo.json", zenodoRaw, [
    "COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts",
    owner,
    "https://cosmos-cqa.org",
    "https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA",
    "COSMOS-CQA Research-Only Public License",
    "other-closed",
    releaseVersion,
  ]);

  assert(zenodoMetadata.upload_type === "software", ".zenodo.json must identify COSMOS-CQA as software.");
  assert(zenodoMetadata.access_right === "open", ".zenodo.json must preserve public archive access.");
  assert(zenodoMetadata.license === "other-closed", ".zenodo.json must avoid implying OSI, CC, or commercial reuse rights.");
  assert(Array.isArray(zenodoMetadata.creators) && zenodoMetadata.creators.some((creator) => creator.name === owner), ".zenodo.json must name the steward as creator.");
  assert(Array.isArray(zenodoMetadata.keywords) && zenodoMetadata.keywords.includes("research-only license"), ".zenodo.json must include research-only license keywords.");
  assert(Array.isArray(zenodoMetadata.related_identifiers), ".zenodo.json must include related identifiers.");

  requirePhrases("README.md", readme, [
    "zenodo.org/badge/DOI/10.5281/zenodo.21112698.svg",
    zenodoConceptDoi,
    zenodoPriorReleaseDoi,
    zenodoEarlierReleaseDoi,
    zenodoPreviousReleaseDoi,
    currentDoiReleaseId,
    zenodoCurrentReleaseDoi,
    releaseId,
    "docs/zenodo-registration.md",
  ]);

  requirePhrases("docs/README.md", docsReadme, [
    "zenodo-registration.md",
    "controlled Zenodo metadata",
    "minted DOI record",
    "citation alignment responsibilities",
  ]);

  requirePhrases("docs/citation.md", citationDoc, [
    `Zenodo all-versions DOI: \`${zenodoConceptDoi}\``,
    `Zenodo \`v0.1.1-research-alpha\` release DOI: \`${zenodoPriorReleaseDoi}\``,
    `Zenodo \`v0.1.2-research-alpha\` release DOI: \`${zenodoEarlierReleaseDoi}\``,
    `Zenodo \`v0.1.3-research-alpha\` release DOI: \`${zenodoPreviousReleaseDoi}\``,
    `Zenodo \`${releaseId}\` release DOI: \`${zenodoCurrentReleaseDoi}\``,
    ".zenodo.json",
    `https://doi.org/${zenodoCurrentReleaseDoi}`,
    `https://doi.org/${zenodoPreviousReleaseDoi}`,
    `https://doi.org/${zenodoEarlierReleaseDoi}`,
    `https://doi.org/${zenodoPriorReleaseDoi}`,
    `https://doi.org/${zenodoConceptDoi}`,
  ]);

  requirePhrases("apps/web/citation.html", citationPage, [
    "Zenodo DOI active.",
    ...citationMetaPhrases,
    zenodoConceptDoi,
    zenodoPriorReleaseDoi,
    zenodoEarlierReleaseDoi,
    zenodoPreviousReleaseDoi,
    zenodoCurrentReleaseDoi,
    "Zenodo DOI record",
  ]);

  requirePhrases("apps/web/docs.html", docsPage, [
    "Zenodo DOI Record",
    "Controlled Zenodo metadata",
    "active all-versions DOI",
    "release DOI status",
    "Public Surface Hardening",
    "Repo identity, security, data, SBOM, release, and UI/UX sweep standard.",
    "Private Application Transition Map",
    "Control-level boundaries, architecture, identity, data governance, and research-partner onboarding plan.",
    "Private Application Readiness Gates",
    "Auditable stage gates and private-tracker seed required before implementation and real-data use.",
  ]);

  requirePhrases("apps/web/releases.html", releasesPage, [
    "v0.1.4 Research Alpha",
    "Zenodo DOI status: minted.",
    `${releaseId}-validation-report.json`,
    `${releaseId}-sbom.json`,
    "v0.1.3 Research Alpha",
    "Zenodo DOI status: minted.",
    "v0.1.2 Research Alpha",
    ...citationMetaPhrases,
    "Zenodo DOI status: minted.",
    zenodoEarlierReleaseDoi,
    zenodoPreviousReleaseDoi,
    zenodoCurrentReleaseDoi,
    "v0.1.1 Research Alpha",
    "v0.1.0 Research Alpha",
    zenodoConceptDoi,
    zenodoPriorReleaseDoi,
  ]);

  requirePhrases("apps/web/story.html", storyPage, [
    "Who COSMOS-CQA serves",
    "created to address a practical research gap",
    "For what",
    "For who",
    "Human pattern recognition can help surface possible artifacts",
    "Public visual review can lose essential context.",
    "pin a tile location",
    "require a note before submission",
    "make deterministic replay possible",
  ]);

  requirePhrases("apps/web/partner-readiness.html", partnerReadinessPage, [
    "<title>Partner Readiness | COSMOS-CQA</title>",
    `<link rel="canonical" href="${canonicalUrl}partner-readiness.html">`,
    `<meta property="og:url" content="${canonicalUrl}partner-readiness.html">`,
    `<meta property="og:image" content="${canonicalUrl}assets/social-preview.png">`,
    "Public demo boundary and future selective-access lane.",
    "No access promise is made here.",
    "not an application form, grant of access, institutional agreement, data-use agreement, timeline, or production capability statement",
    "What partners can evaluate today",
    "Public demo versus selective-access application",
    "Selective-access application would require",
    "Readiness gates before private sharing",
    "What is not offered through the public page",
    "No public account creation, researcher onboarding, institutional access, API keys, hosted reviewer queue, or live observation submission is available here.",
    "No timeline, partnership acceptance, funding commitment, data-use agreement, confidentiality, or support obligation is implied",
    "Start a Non-Confidential Conversation",
    "Transition Map",
    "Readiness Gates",
    "./contact.html",
    "./security.html",
    "./user-data.html",
    "./license.html",
  ]);

  requirePhrases("docs/quickstart.md", quickstart, [
    "https://cosmos-cqa.org",
    "demo workbook",
    "synthetic Core Pack fixture workflow",
    "https://cosmos-cqa.org/safety.html",
    "https://cosmos-cqa.org/partner-readiness.html",
    "Export Validation Report JSON",
    "npm --prefix apps/web run check",
    "npm --prefix apps/web run check:portal-deploy",
    "not an OSI open-source release",
    "docs/selective-access-application.md",
    "Calibration Wizard",
  ]);

  requirePhrases("docs/project-notes.md", projectNotes, [
    "Project Notes",
    "PR #51",
    "Harden public audio safety boundaries",
    "GitHub Pages deployment for PR #51 completed successfully",
    "privacy and user-data wording",
    "safety and accessibility issue-reporting templates",
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
    "check:seo-exposure",
    "quality budgets",
    "copyright",
    "user data",
    "demo-workbook.html",
    "research-experiment.html",
    "safety.html",
    "security.html",
    "partner-readiness.html",
    "docs/security-disclosure.md",
    "docs/public-safety.md",
    "selective-access application",
    "does not collect observations",
  ]);

  requirePhrases("docs/public-surface-hardening.md", publicSurfaceHardeningDoc, [
    "Public Surface Hardening",
    "COSMOS-CQA Research Edition",
    "GitHub CodeQL, Dependabot, and secret-scanning",
    "npm --prefix apps/web sbom --sbom-format cyclonedx --sbom-type application --json",
    "npm --prefix apps/web run check:seo-exposure",
    "npm --prefix apps/web run check:quality-budgets",
    "quality budgets",
    "Portal And Demo Polish",
    "Pass Criteria",
  ]);

  requirePhrases("docs/seo-social-accessibility-baseline.md", seoAccessibilityBaseline, [
    "Quality Budgets",
    "SEO Exposure Gate",
    "apps/web/quality-budgets.json",
    "Lighthouse-style release targets",
    "performance_score",
    "accessibility_score",
    "best_practices_score",
    "seo_score",
    "Nielsen Norman Group Heuristic Baseline",
    "npm --prefix apps/web run check:seo-exposure",
    "npm --prefix apps/web run check:quality-budgets",
  ]);

  requirePhrases("docs/selective-access-application.md", selectiveAccessDoc, [
    "Selective Access Application Notice",
    "verified researchers and institutions",
    "public demo remains local-first",
    "does not authenticate users, collect observations, or transmit review packets",
    "https://cosmos-cqa.org/partner-readiness.html",
    "not act as an application form, access grant, timeline, data-use agreement, confidentiality offer, or production capability statement",
    "should not publish deployment-specific backend internals, credentials, private topology, access promises, operational timelines, partnership acceptance decisions, or support commitments prematurely",
  ]);

  requirePhrases("docs/private-application-transition-map.md", privateApplicationTransitionMap, [
    "Private Application Transition Execution Map",
    "separate private repository",
    "modular monolith",
    "NIST SP 800-63-4",
    "OWASP ASVS 5.0.0",
    "Restricted or regulated",
    "Research Partner Onboarding",
    "not application code",
  ]);

  requirePhrases("docs/private-application-readiness-gates.md", privateApplicationReadinessGates, [
    "Private Application Readiness Gates",
    "Implementation may begin only after Gates 0 and 1 are approved",
    "Real partner data and a controlled research pilot are prohibited until Gate 6",
    "Private Tracker Seed",
    "Do not open implementation-detail issues in the public tracker",
    "Gate 6: Operational Pilot Readiness",
  ]);

  requirePhrases("docs/zenodo-registration.md", zenodoDoc, [
    "Zenodo Registration and DOI Record",
    "AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA",
    "other-closed",
    "The first Zenodo DOI has been minted",
    "https://zenodo.org/records/21315776",
    "https://zenodo.org/api/records/21315776",
    "Alignment Responsibilities",
    zenodoConceptDoi,
    zenodoPriorReleaseDoi,
    zenodoEarlierReleaseDoi,
    zenodoPreviousReleaseDoi,
    zenodoCurrentReleaseDoi,
    currentDoiReleaseId,
    releaseId,
    "v0.1.1-research-alpha",
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
    "security disclosure routing",
    "quality budgets",
    "check:quality-budgets",
    "Lighthouse scores",
    "WCAG conformance",
    "Zenodo DOI",
  ]);

  requirePhrases("apps/web/package.json", packageManifest, [
    "\"check:quality-budgets\"",
    "\"check:seo-exposure\"",
    "check-public-portal-deployment.mjs",
    "check-quality-budgets.mjs",
    "check-seo-exposure.mjs",
    "check:portal-deploy && npm run check:seo-exposure && npm run check:quality-budgets",
  ]);

  requirePhrases("apps/web/scripts/check-seo-exposure.mjs", seoExposureScript, [
    "SEO exposure check failed",
    "og:image:alt",
    "twitter:image:alt",
    "WebPage",
    "sitemap lastmod",
    "robots.txt",
  ]);

  requirePhrases("apps/web/quality-budgets.json", qualityBudgetsRaw, [
    "lighthouse_style_thresholds",
    "performance_score",
    "accessibility_score",
    "best_practices_score",
    "seo_score",
    "static_assets",
    "max_local_load_ms",
    "required_static_checks",
    "contrast_pairs",
    "nng_heuristics_required",
  ]);

  assert(
    qualityBudgets.lighthouse_style_thresholds?.performance_score >= 0.9,
    "quality budgets must preserve a Lighthouse-style performance target of at least 0.90.",
  );
  assert(
    qualityBudgets.lighthouse_style_thresholds?.accessibility_score >= 0.95,
    "quality budgets must preserve a Lighthouse-style accessibility target of at least 0.95.",
  );
  assert(
    qualityBudgets.lighthouse_style_thresholds?.seo_score >= 0.95,
    "quality budgets must preserve a Lighthouse-style SEO target of at least 0.95.",
  );
  assert(
    qualityBudgets.usability?.nng_heuristics_required === 10,
    "quality budgets must preserve all 10 Nielsen Norman Group heuristic rows.",
  );

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
    "repository issue templates",
    "personal health information",
    "private disclosure route",
  ]);

  requirePhrases("SECURITY.md", securityPolicy, [
    "Security Policy",
    "Private Vulnerability Reporting",
    "COSMOS-CQA vulnerability report",
    "Public Safety And Accessibility Reports",
    "AI-Bio Synergy Holdings LLC",
    "not approved for production deployment",
  ]);

  requirePhrases("docs/security-disclosure.md", securityDisclosureDoc, [
    "Security And Safety Disclosure",
    "Private vulnerability reports",
    "Public safety reports",
    "Public accessibility reports",
    "What To Keep Out Of Public Reports",
    "AI-Bio Synergy Holdings LLC",
  ]);

  requirePhrases("apps/web/security.html", securityPage, [
    "Security and responsible disclosure",
    "Private vulnerabilities",
    "Public safety reports",
    "Public accessibility reports",
    "What not to share publicly",
    "COSMOS-CQA vulnerability report",
    "Repository Security Policy",
  ]);

  requirePhrases("docs/data-governance.md", dataGovernanceDoc, [
    "Public Reporting Data",
    "GitHub issues, pull requests, and public discussion surfaces are public by default",
    "restricted datasets",
    "Vulnerability reports",
    "local-first",
    "Imported files, labels, bookmarks, exported reports",
  ]);

  requirePhrases("apps/web/user-data.html", userDataPage, [
    "not a substitute for counsel-reviewed privacy terms",
    "No account system",
    "Local imports and exports",
    "Selective-access boundary",
    "outside this public local-first demo",
    "GitHub issues and public reports",
    "Operational logs and third-party routes",
    "Issue Templates",
    "Security and Disclosure",
    "Do not submit restricted datasets",
  ]);

  requirePhrases(".github/ISSUE_TEMPLATE/config.yml", issueTemplateConfig, [
    "Public Safety And Use Boundaries",
    "User Data Notice",
    "Private Vulnerability And Disclosure Policy",
    "cosmos-cqa.org/user-data.html",
    "cosmos-cqa.org/security.html",
  ]);

  requirePhrases(".github/ISSUE_TEMPLATE/safety_report.md", safetyIssueTemplate, [
    "Safety report",
    "Audio sonification",
    "Sensitive Information Guardrail",
    "medical/audiology advice",
  ]);

  requirePhrases(".github/ISSUE_TEMPLATE/accessibility_report.md", accessibilityIssueTemplate, [
    "Accessibility report",
    "Assistive technology",
    "Screenshots Or Recordings",
    "regulated data",
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
    "v0.1.1-research-alpha.md",
    "https://zenodo.org/records/21315776",
    "https://zenodo.org/records/21285595",
    "https://zenodo.org/records/21142690",
    "https://zenodo.org/records/21112699",
    zenodoConceptDoi,
    zenodoPriorReleaseDoi,
    zenodoEarlierReleaseDoi,
    zenodoPreviousReleaseDoi,
    zenodoCurrentReleaseDoi,
    currentDoiReleaseId,
    releaseId,
    "known limitations",
    canonicalUrl.slice(0, -1),
    "COSMOS-CQA Research-Only Public License",
    "Zenodo DOI status: active.",
  ]);

  requirePhrases(`docs/releases/${releaseId}.md`, releaseNotes, [
    "COSMOS-CQA v0.1.4 Research Alpha",
    "Zenodo record: [https://zenodo.org/records/21315776]",
    zenodoCurrentReleaseDoi,
    zenodoConceptDoi,
    "external computational references",
    "not an API client or MCP configuration",
    `${releaseId}-validation-report.json`,
    `${releaseId}-sbom.json`,
    "research-only public use",
    "No public API calls, MCP configuration, API keys, endpoint code, or provider-response redistribution are included.",
  ]);

  requirePhrases("docs/releases/v0.1.1-research-alpha.md", await readText("docs/releases/v0.1.1-research-alpha.md"), [
    "COSMOS-CQA v0.1.1 Research Alpha",
    "Zenodo record: [https://zenodo.org/records/21112699]",
    zenodoConceptDoi,
    zenodoPriorReleaseDoi,
    "other-closed",
    "research-only public use",
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
      phrases: ["COSMOS-CQA Research Workbench", "Hosted demo mode is loading the synthetic contract Core Pack fixture.", "Export Validation Report JSON"],
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
        `${canonicalUrl}partner-readiness.html`,
        `${canonicalUrl}safety.html`,
        `${canonicalUrl}security.html`,
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
      label: "synthetic Core Pack fixture manifest",
      phrases: ["corepack_synthetic-contract-v0.1.1", "synthetic_residual_stripe_001"],
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
  const linkPattern = /\]\((v0\.\d+\.\d+-research-alpha[^)]+)\)/g;
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
