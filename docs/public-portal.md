# Public Portal

The canonical public portal for COSMOS-CQA is:

```text
https://cosmos-cqa.org
```

The portal is the root static page in `apps/web/index.html`. The maintained research workbench is served from `apps/web/workbench.html`.

The hosted public demo path is:

```text
https://cosmos-cqa.org/workbench.html?demo=core-pack#workspace-core-pack
```

This path opens the maintained browser workbench, auto-loads the public sample Core Pack, keeps public truth-label policy active by default, and prepares the validation report preview for JSON export.

When `apps/web/` is published as the static site root, `apps/web/CNAME` carries the canonical `cosmos-cqa.org` domain setting.

GitHub Pages deployment is managed by `.github/workflows/pages.yml`. The workflow prepares `apps/web/dist-pages` from the `apps/web` site root plus the shared `packages/` and `examples/` folders needed by the browser workbench, uploads that artifact, deploys it to the `github-pages` environment, and runs post-deploy validation against the deployed Pages URL.

## Public Positioning

The portal must present COSMOS-CQA as research-only public infrastructure, not an OSI open-source project and not a production decision system. Public copy should stay within the project claim boundaries:

- describe artifact QA workflows, evidence bundles, provenance, validation reports, and deterministic replay;
- identify the COSMOS-CQA Research-Only Public License as the public use grant;
- state that all rights not expressly granted are reserved by AI-Bio Synergy Holdings LLC;
- avoid diagnostic, cosmology, clinical, operational, or production claims that are not validated in the repository evidence.

## Required Navigation

The first public scaffold exposes:

- Demo: `./workbench.html?demo=core-pack#workspace-core-pack`
- Docs: repository `docs/`, starting with `docs/quickstart.md`
- Releases: GitHub Releases and `docs/releases/README.md`
- Citation: `docs/citation.md` and `CITATION.cff`
- License: `LICENSE.md`
- Stewardship: the portal stewardship section plus governance and ownership documents

## Local Verification

Run the static portal and workbench with:

```bash
npm --prefix apps/web run serve
```

Then open:

```text
http://localhost:4173/
```

The browser regression suite includes portal checks for canonical identity, navigation, workbench handoff, canvas rendering, narrow-screen overflow, hosted demo sample loading, and validation report JSON export.

Run the public portal release/deployment validation with:

```bash
npm --prefix apps/web run check:portal-deploy
```

For served-route validation, start the local static server and run:

```powershell
$env:COSMOS_CQA_PORTAL_BASE_URL="http://127.0.0.1:4173"; npm --prefix apps/web run check:portal-deploy
```

This checks canonical URL metadata, research-only license notice, release artifact links, validation report and SBOM paths, static module reachability, and hosted demo route health. The full validation responsibilities are documented in `docs/public-portal-deployment-validation.md`.

Prepare the GitHub Pages artifact locally with:

```bash
npm --prefix apps/web run pages:prepare
```

Serve the prepared artifact locally with:

```powershell
$env:COSMOS_CQA_STATIC_ROOT="apps/web/dist-pages"; npm --prefix apps/web run serve
```
