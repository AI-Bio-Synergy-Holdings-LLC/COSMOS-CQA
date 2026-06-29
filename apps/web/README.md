# COSMOS QA Web

This directory contains the public portal and browser workbench source for COSMOS-CQA.

Planned responsibilities:

- tile viewer;
- artifact labeling workflow;
- deterministic sidecar playback;
- calibration flow;
- expert queue;
- metrics dashboard;
- provenance export;
- validation report export.

The first canonical import comes from the stable COSMOS v3 public/dev demo after duplicate exports are filtered. The byte-preserved legacy artifacts live in `../../archive/original-materials/legacy-v3/`.

## Current Verification

Run checks from the repository root:

Use Node.js 24 or newer. The repository root `.node-version` pins the maintained CI runtime family.

```bash
npm --prefix apps/web run check:repo-health
npm --prefix apps/web run check:source
npm --prefix apps/web run test:contracts
npm --prefix apps/web run test:unit
npm --prefix apps/web run test:core-pack
npm --prefix apps/web run validate:core-pack
npm --prefix apps/web run test:replay
npm --prefix apps/web run test:browser
npm --prefix apps/web run check:legacy
npm --prefix apps/web run check
```

`check:repo-health` validates required governance and release guardrails, including the research-only license, stewardship, CODEOWNERS, security policy, and release checklist. `check:source` validates the maintained ES module source. `test:contracts` verifies labels, feeds, provenance/bookmarks, and reports against the first contract set. `test:unit` covers cheap domain assertions outside the browser. `test:core-pack` verifies Core Pack intake, research artifact loading, provenance hashes, SBOM references, and validation report JSON. `validate:core-pack` validates the sample manifest, local evidence paths, and SBOM checksum. `test:replay` verifies deterministic golden fixtures. `test:browser` runs Playwright domain specs for migrated checklist targets, including Core Pack sample load and validation-report export. `check:legacy` validates JavaScript syntax in the imported v3 HTML files.

Install dependencies and Chromium before running the full browser-backed check locally:

```bash
npm --prefix apps/web ci
npm --prefix apps/web exec -- playwright install chromium
```

## Local Development

The maintained source app uses native browser modules, so use a local static server:

```bash
npm --prefix apps/web run serve
```

Then open the public portal:

```text
http://localhost:4173/
```

The maintained demo workbench is served at:

```text
http://localhost:4173/workbench.html
```

The hosted public demo workflow preloads the sample Core Pack at:

```text
http://localhost:4173/workbench.html?demo=core-pack#workspace-core-pack
```

Use `?dev=1` to show dev-only truth labels:

```text
http://localhost:4173/workbench.html?dev=1
```

## Migration Target

The source now separates:

- `tile-synthesis`
- `sidecars`
- `contracts`
- `feeds`
- `labels`
- `metrics`
- `expert-review`
- `provenance`
- `reports`
- `ui`
