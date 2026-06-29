# Public Portal Release/Deployment Validation

This document defines the validation responsibilities for the public portal at `https://cosmos-cqa.org`.

The portal is a research-only public entry point stewarded by AI-Bio Synergy Holdings LLC. Deployment validation protects the public identity from drift: canonical URL metadata, research-only license notice, release artifact links, SBOM references, validation report evidence, and hosted demo route health must remain consistent before public release or deployment.

## Validation Surface

The maintained validation command is:

```bash
npm --prefix apps/web run check:portal-deploy
```

Without a server, the command checks repository files and release artifacts:

- `apps/web/CNAME` contains only `cosmos-cqa.org`;
- `apps/web/index.html` includes canonical URL metadata, Open Graph URL metadata, public research-only copy, license boundaries, GitHub release links, release artifact index links, and the hosted demo route;
- `CITATION.cff` points to `https://cosmos-cqa.org` and the research-only license reference;
- `docs/releases/README.md` links release notes, validation report JSON, SBOM JSON, known limitations, and verification commands;
- published release validation JSON records a non-dev public build, passing checks, the canonical public URL, research-only license notice, and SBOM artifact;
- published SBOM JSON is parseable CycloneDX with components.

With a local server, the same command also smoke checks the deployment surface over HTTP:

```bash
$env:COSMOS_CQA_PORTAL_BASE_URL="http://127.0.0.1:4173"; npm --prefix apps/web run check:portal-deploy
```

The HTTP mode checks:

- portal root page loads;
- hosted demo workbench shell loads at `/workbench.html?demo=core-pack`;
- `CNAME` is served from the static root;
- portal and workbench modules are reachable;
- sample Core Pack manifest is reachable;
- shared `packages/schemas` and `packages/core` browser entrypoints are reachable.

## GitHub Pages Deployment

The GitHub Pages workflow lives at `.github/workflows/pages.yml`. It deploys from `main` and may also be started manually with `workflow_dispatch`.

The workflow builds a lean Pages artifact with:

```bash
npm --prefix apps/web run pages:prepare
```

That command writes `apps/web/dist-pages` with:

- `apps/web/index.html`, `apps/web/workbench.html`, `apps/web/CNAME`, and `apps/web/src/` as the public site root;
- `packages/` so browser ES module imports resolve on GitHub Pages;
- `examples/` so the hosted sample Core Pack workflow can load public sample manifests;
- `.nojekyll` so GitHub Pages serves static module paths without Jekyll processing.

The Pages workflow uses official GitHub Pages Actions: `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. It uploads `apps/web/dist-pages`, deploys to the `github-pages` environment, and runs post-deploy validation with `COSMOS_CQA_PORTAL_BASE_URL` set to the deployed Pages URL.

After the first custom-domain deployment, confirm that GitHub Pages has provisioned the `cosmos-cqa.org` certificate and that HTTPS enforcement is enabled. GitHub may report the certificate as unavailable until DNS and Pages deployment propagation complete.

Check whether Squarespace DNS has been handed off to GitHub Pages with:

```bash
npm --prefix apps/web run pages:check-dns
```

## CI Responsibility

Pull requests and pushes to `main` run the portal deployment validation in CI. The CI workflow starts the static server, sets `COSMOS_CQA_PORTAL_BASE_URL=http://127.0.0.1:4173`, and validates the served portal surface after the full repository check.

Pushes to `main` also run the GitHub Pages deployment workflow. The deployment workflow serves the prepared artifact locally with `COSMOS_CQA_STATIC_ROOT=apps/web/dist-pages` before upload, then checks DNS readiness and validates the deployed public URL after `actions/deploy-pages` completes. If DNS still points to Squarespace, the workflow emits a warning and live custom-domain validation waits for DNS propagation instead of treating an external DNS handoff as a code failure.

This is intentionally release/deployment validation, not scientific validation. Passing this workflow does not certify diagnostics, production readiness, clinical use, regulatory use, commercial use, or OSI open-source status.

## Release Responsibility

Before a public release or portal deployment, confirm:

- `npm --prefix apps/web run check` passes;
- `npm --prefix apps/web run check:portal-deploy` passes locally;
- `npm --prefix apps/web run pages:prepare` produces a deploy artifact with `CNAME`, `packages/`, and `examples/`;
- `npm --prefix apps/web run pages:check-dns` passes after the Squarespace DNS handoff is complete;
- CI public portal deployment validation passes on the release PR or merge commit;
- GitHub Pages post-deploy validation passes on the `main` deployment run;
- GitHub Pages custom-domain HTTPS enforcement is enabled after certificate provisioning;
- release notes, validation report JSON, SBOM JSON, known limitations, archive/provenance notes, and research-only license notice are linked from `docs/releases/README.md`.
