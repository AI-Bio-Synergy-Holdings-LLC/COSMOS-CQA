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

## CI Responsibility

Pull requests and pushes to `main` run the portal deployment validation in CI. The CI workflow starts the static server, sets `COSMOS_CQA_PORTAL_BASE_URL=http://127.0.0.1:4173`, and validates the served portal surface after the full repository check.

This is intentionally release/deployment validation, not scientific validation. Passing this workflow does not certify diagnostics, production readiness, clinical use, regulatory use, commercial use, or OSI open-source status.

## Release Responsibility

Before a public release or portal deployment, confirm:

- `npm --prefix apps/web run check` passes;
- `npm --prefix apps/web run check:portal-deploy` passes locally;
- CI public portal deployment validation passes on the release PR or merge commit;
- release notes, validation report JSON, SBOM JSON, known limitations, archive/provenance notes, and research-only license notice are linked from `docs/releases/README.md`.
