# Quickstart

This quickstart is the public researcher path for running COSMOS-CQA locally, opening the hosted sample workflow, exporting report JSON, and verifying the repository evidence.

COSMOS-CQA is available for research-only public use under the project-specific COSMOS-CQA Research-Only Public License. It is not an OSI open-source release, not a production decision system, and all rights not expressly granted are reserved by AI-Bio Synergy Holdings LLC.

## Requirements

- Node.js 24 or newer.
- npm 10 or newer.
- Chromium installed through Playwright for browser-backed verification.

## Local Run

From a local checkout:

```bash
git clone https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA.git
cd COSMOS-CQA
npm --prefix apps/web ci
npm --prefix apps/web exec -- playwright install chromium
npm --prefix apps/web run serve
```

Open the public portal:

```text
http://localhost:4173/
```

Open the hosted sample Core Pack workflow directly:

```text
http://localhost:4173/workbench.html?demo=core-pack#workspace-core-pack
```

The hosted demo path auto-loads `examples/core-pack/core-pack.manifest.json`, keeps public truth labels hidden by default, and prepares the validation report preview.

The public demo remains local-first: it does not authenticate users, collect observations, operate a reviewer queue, or transmit reviewer packets. A separate COSMOS-CQA application is planned for verified researchers and institutions; see `docs/selective-access-application.md` for the public wording boundary.

The public workbook for the hosted sample workflow is served at:

```text
https://cosmos-cqa.org/demo-workbook.html
```

The bounded research experiment framing is served at:

```text
https://cosmos-cqa.org/research-experiment.html
```

The public safety and use boundaries are served at:

```text
https://cosmos-cqa.org/safety.html
```

## Sample Core Pack Workflow

1. Open the hosted sample Core Pack workflow.
2. Confirm the banner says the hosted demo is ready.
3. Inspect the Core Pack Intake panel, tile passports, diagnostic caveats, evidence workspace, and report preview.
4. Keep public mode active for public review. Use `?dev=1` only for explicit local dev review.
5. Use the demo workbook to record manifest ids, tile passport ids, evidence exports, known limitations, and any visual/accessibility issues found during review.
6. Exercise the current demo controls documented in the workbook: viewer transforms, pinned observations, Observation Review, Adjudication Queue placeholders, Calibration Wizard, reviewer handoff packet export, and evidence exports.
7. Use the research experiment page to distinguish modeled infrastructure, exposed engine fundamentals, sonic loop sidecars, public benefits, and non-claims.
8. Review the safety page before using optional audio. Keep device volume low, leave Loop off unless intentionally needed, and stop if sound is uncomfortable.

## Report Export

Use the Reports panel:

1. Select `Export SBOM` if you want a locally generated SBOM reference in the current session.
2. Select `Export Validation Report JSON`.
3. Review the downloaded `validation-report.json` for:
   - research-only license notice;
   - known limitations;
   - diagnostic caveats;
   - provenance hashes;
   - SBOM references.

The report JSON is research evidence for reproducibility review. It is not a production certification or validated scientific claim.

## Verification

Run the full maintained check:

```bash
npm --prefix apps/web run check
```

This covers repository health guardrails, source syntax, contract tests, Core Pack intake validation, deterministic replay fixtures, browser workflow smoke checks, and legacy syntax extraction.

For a focused hosted demo check:

```bash
npm --prefix apps/web run test:browser -- test/browser/hosted-demo.spec.mjs
```

For public portal release/deployment checks:

```bash
npm --prefix apps/web run check:portal-deploy
```

To prepare the GitHub Pages artifact used for `https://cosmos-cqa.org` deployments:

```bash
npm --prefix apps/web run pages:prepare
```

To verify the canonical domain is ready for GitHub Pages:

```bash
npm --prefix apps/web run pages:check-dns
```

## Citation And Release Evidence

- Citation guide: `docs/citation.md`
- Release artifact index: `docs/releases/README.md`
- Canonical public URL: `https://cosmos-cqa.org`
