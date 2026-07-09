# Public Surface Hardening

This checklist defines the public-surface quality standard for COSMOS-CQA. It is an engineering, documentation, and release-readiness gate. It is not a legal opinion, security certification, WCAG certification, scientific validation, production-readiness claim, or regulatory review.

## Public Presence Standard

The public repository and portal should read as a coherent research-source project:

- `COSMOS-CQA` is the public project name.
- `COSMOS-CQA Research Edition` is the public research-source edition label.
- `https://cosmos-cqa.org` is the canonical public URL.
- AI-Bio Synergy Holdings LLC is the owner and steward.
- Public use is research-only under `LICENSE.md`.
- Commercial, production, hosted-service, clinical, regulatory, sublicensing, resale, and derivative product use require a separate written agreement.
- Public copy must not imply OSI open-source status, production readiness, validated diagnostics, scientific discovery claims, clinical use, regulatory use, or therapeutic audio effects.

## Required Public Surfaces

Keep these surfaces present, current, and mutually consistent:

- `README.md`, `CITATION.cff`, `.zenodo.json`, `LICENSE.md`, `NOTICE`, `OWNERSHIP_AND_USE.md`, `GOVERNANCE.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`;
- `.github/CODEOWNERS`, pull request template, issue templates, branch/ruleset expectations, and private vulnerability routing;
- `docs/quickstart.md`, `docs/citation.md`, `docs/public-portal.md`, `docs/public-portal-deployment-validation.md`, `docs/release-checklist.md`, `docs/security-disclosure.md`, `docs/data-governance.md`, `docs/public-safety.md`, `docs/seo-social-accessibility-baseline.md`, `docs/scientific-scope.md`, `docs/claim-boundaries.md`, `docs/releases/README.md`, and this document;
- portal pages for docs, releases, citation, license, governance, ownership and use, story, safety, security, copyright, user data, contact, research experiment, workbook, and hosted demo;
- release validation reports, SBOM artifacts, known limitations, archive/provenance notes, and Zenodo DOI metadata when a DOI-minted release exists.

## Security And Vulnerability Posture

The public security posture should remain simple and explicit:

- private vulnerabilities route through GitHub Security Advisories when available or `cosmos-cqa-developer@ai-biosynergyholdings.com`;
- public issues are only for non-sensitive bugs, safety reports, accessibility reports, schema proposals, and data/provenance questions;
- public reports must not include credentials, private keys, session cookies, personal data, personal health information, regulated data, restricted datasets, confidential screenshots, deployment secrets, private source code, or exploit details;
- GitHub CodeQL, Dependabot, and secret-scanning alerts should be checked before public releases and after public-surface hardening work;
- any open alert should be fixed, dismissed with documented rationale, or tracked before release.

## Data Management

Public examples should prefer manifests, checksums, synthetic examples, small permitted previews, and documented public references. The hosted public demo is static and local-first: imports, labels, bookmarks, sessions, CSVs, SBOMs, validation reports, reviewer packets, and evidence bundles stay in the browser unless the user shares them through GitHub, email, or another external service.

Do not commit restricted raw datasets, private institutional data, regulated data, personal information, personal health information, credentials, private keys, or confidential third-party material.

## Release And SBOM Discipline

Each public release should include or link:

- release notes;
- validation report JSON;
- CycloneDX SBOM JSON or a documented current SBOM export command;
- known limitations;
- verification commands;
- archive/provenance notes;
- research-only license and stewardship notices;
- Zenodo release DOI and all-versions DOI when the release is DOI-minted.

Current SBOM export command for the web package:

```bash
npm --prefix apps/web sbom --sbom-format cyclonedx --sbom-type application --json
```

The project release artifact generator should remain deterministic for committed release artifacts:

```bash
npm --prefix apps/web run release:artifacts
```

## Verification Commands

Run these from the repository root for a public-surface sweep:

```bash
npm --prefix apps/web ci
npm --prefix apps/web run check
npm --prefix apps/web run check:quality-budgets
npm --prefix apps/web run release:artifacts
npm --prefix apps/web run check:portal-deploy
npm --prefix apps/web run pages:prepare
npm --prefix apps/web audit --audit-level=moderate
npm --prefix apps/web sbom --sbom-format cyclonedx --sbom-type application --json
git diff --check
```

When GitHub CLI access is available, also check:

```bash
gh api repos/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA/code-scanning/alerts?state=open --paginate
gh api repos/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA/dependabot/alerts?state=open --paginate
gh api repos/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA/secret-scanning/alerts?state=open --paginate
```

## Portal And Demo Polish

The portal, workbook, and demo should feel like a high-end research tool:

- first-screen copy should be concise, scientific, and claim-bounded;
- navigation should make demo, workbook, experiment, docs, releases, story, safety, and contact easy to reach;
- public pages should use consistent canonical metadata and social preview assets;
- quality budgets should remain explicit in `apps/web/quality-budgets.json` for Lighthouse-style targets, static asset ceilings, WCAG-oriented structure checks, contrast pairs, first-viewport usability checks, and Nielsen Norman Group heuristic coverage;
- the workbench should prioritize tile review, label workflow, calibration, observation review, evidence, validation reports, and export paths without visual clutter;
- audio sonification must remain optional, user initiated, loop-off by default, bounded, captioned, and clearly described as a review aid;
- public truth labels must remain hidden outside dev mode;
- validation reports, SBOM exports, evidence bundles, and reviewer packets must be described as research artifacts, not certifications or submission pipelines.

## Pass Criteria

A public-surface sweep passes when:

- all verification commands pass or any unavailable command has a documented reason;
- GitHub CodeQL, Dependabot, and secret-scanning open-alert checks return no open alerts or have tracked dispositions;
- release artifacts regenerate without drift against deployment validation;
- public quality budgets pass and remain documented without claiming Lighthouse certification, WCAG conformance, independent usability validation, or scientific validation;
- public project names, license posture, DOI metadata, and canonical URL are consistent;
- portal/demo/workbook rendered checks show no blank page, framework overlay, console errors, major overlap, or incoherent navigation;
- no new public copy weakens research-only, safety, security, data, or claim boundaries.
