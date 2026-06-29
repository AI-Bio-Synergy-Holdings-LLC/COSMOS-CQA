#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const guardrails = [
  {
    path: "LICENSE.md",
    label: "research-only license",
    phrases: [
      "COSMOS-CQA Research-Only Public License",
      "AI-Bio Synergy Holdings LLC",
      "All rights not expressly granted",
      "not an OSI-approved open-source license",
    ],
  },
  {
    path: "NOTICE",
    label: "notice",
    phrases: [
      "AI-Bio Synergy Holdings LLC",
      "Research-Only Public License",
      "All rights not expressly granted",
    ],
  },
  {
    path: "OWNERSHIP_AND_USE.md",
    label: "ownership and use",
    phrases: [
      "owned and stewarded by AI-Bio Synergy Holdings LLC",
      "retains all rights and intellectual property",
      "separate written agreement",
    ],
  },
  {
    path: "GOVERNANCE.md",
    label: "governance",
    phrases: ["owned and stewarded by AI-Bio Synergy Holdings LLC", "steward", "Scope Guardrails"],
  },
  {
    path: "CONTRIBUTING.md",
    label: "contributing",
    phrases: [
      "COSMOS-CQA Research-Only Public License",
      "AI-Bio Synergy Holdings LLC may use",
      "restricted third-party materials",
    ],
  },
  {
    path: "CODE_OF_CONDUCT.md",
    label: "code of conduct",
    phrases: ["research-only license", "AI-Bio Synergy Holdings LLC", "research integrity"],
  },
  {
    path: "SECURITY.md",
    label: "security",
    phrases: [
      "AI-Bio Synergy Holdings LLC",
      "research-only public license",
      "not approved for production deployment",
      "Private Vulnerability Reporting",
      "COSMOS-CQA vulnerability report",
      "Public Safety And Accessibility Reports",
    ],
  },
  {
    path: "docs/security-disclosure.md",
    label: "security disclosure",
    phrases: [
      "Security And Safety Disclosure",
      "Private vulnerability reports",
      "public safety reports",
      "public accessibility reports",
      "AI-Bio Synergy Holdings LLC",
    ],
  },
  {
    path: ".github/CODEOWNERS",
    label: "CODEOWNERS",
    phrases: ["@SIONSOULSION", "/LICENSE.md", "/NOTICE", "/SECURITY.md", "/docs/releases/"],
  },
  {
    path: "README.md",
    label: "README",
    phrases: [
      "Canonical public URL",
      "COSMOS-CQA Research-Only Public License",
      "AI-Bio Synergy Holdings LLC",
      "not an OSI open-source license",
    ],
  },
  {
    path: "docs/release-checklist.md",
    label: "release checklist",
    phrases: ["License, notice, citation, and ownership docs", "SBOM", "known limitations"],
  },
  {
    path: "docs/project-notes.md",
    label: "project notes",
    phrases: ["PR #51", "live portal validation", "privacy and user-data wording"],
  },
  {
    path: "docs/quickstart.md",
    label: "public quickstart",
    phrases: [
      "sample Core Pack workflow",
      "Export Validation Report JSON",
      "npm --prefix apps/web run check",
      "COSMOS-CQA Research-Only Public License",
      "not an OSI open-source release",
      "AI-Bio Synergy Holdings LLC",
    ],
  },
  {
    path: "docs/citation.md",
    label: "citation guide",
    phrases: [
      "CITATION.cff",
      "https://cosmos-cqa.org",
      "LicenseRef-COSMOS-CQA-Research-Only",
      "not an OSI open-source release",
      "AI-Bio Synergy Holdings LLC",
    ],
  },
  {
    path: "docs/releases/README.md",
    label: "release artifact index",
    phrases: [
      "Release Artifact Index",
      "v0.1.0-research-alpha-validation-report.json",
      "v0.1.0-research-alpha-sbom.json",
      "known limitations",
      "COSMOS-CQA Research-Only Public License",
      "AI-Bio Synergy Holdings LLC",
    ],
  },
  {
    path: ".github/ISSUE_TEMPLATE/safety_report.md",
    label: "safety issue template",
    phrases: ["Safety report", "Audio sonification", "Sensitive Information Guardrail"],
  },
  {
    path: ".github/ISSUE_TEMPLATE/accessibility_report.md",
    label: "accessibility issue template",
    phrases: ["Accessibility report", "Assistive technology", "Screenshots Or Recordings"],
  },
  {
    path: ".github/ISSUE_TEMPLATE/config.yml",
    label: "issue template chooser",
    phrases: [
      "Public Safety And Use Boundaries",
      "User Data Notice",
      "Private Vulnerability And Disclosure Policy",
      "cosmos-cqa.org/security.html",
    ],
  },
];

const failures = [];

for (const guardrail of guardrails) {
  const absolutePath = path.join(repoRoot, guardrail.path);
  let text = "";

  try {
    await access(absolutePath, constants.R_OK);
    text = await readFile(absolutePath, "utf8");
  } catch (error) {
    failures.push(`${guardrail.path}: missing or unreadable ${guardrail.label} file`);
    continue;
  }

  if (!text.trim()) {
    failures.push(`${guardrail.path}: ${guardrail.label} file is empty`);
    continue;
  }

  const normalizedText = normalize(text);
  for (const phrase of guardrail.phrases) {
    if (!normalizedText.includes(normalize(phrase))) {
      failures.push(`${guardrail.path}: missing guardrail phrase "${phrase}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("Repository health check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Repository health OK: ${guardrails.length} governance/release guardrails verified.`);
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
