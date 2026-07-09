# Public Portal

The canonical public portal for COSMOS-CQA is:

```text
https://cosmos-cqa.org
```

The portal is the root static page in `apps/web/index.html`. The maintained research workbench is served from `apps/web/workbench.html`.

Public resource pages are served as top-level static HTML files:

- `docs.html`
- `demo-workbook.html`
- `research-experiment.html`
- `releases.html`
- `citation.html`
- `license.html`
- `governance.html`
- `ownership-and-use.html`
- `story.html`
- `safety.html`
- `security.html`
- `copyright.html`
- `user-data.html`
- `contact.html`

The hosted public demo path is:

```text
https://cosmos-cqa.org/workbench.html?demo=core-pack
```

This path opens the maintained browser workbench tile-first, auto-loads the synthetic contract Core Pack fixture, keeps public truth-label policy active by default, and prepares the validation report preview for JSON export.

The portal may point to a planned separate COSMOS-CQA application for verified researchers and institutions. Public copy must keep that notice narrow: the hosted demo remains static, local-first, account-free, and does not collect observations, authenticate reviewers, assign queues, or transmit review packets.

When `apps/web/` is published as the static site root, `apps/web/CNAME` carries the canonical `cosmos-cqa.org` domain setting.

GitHub Pages deployment is managed by `.github/workflows/pages.yml`. The workflow prepares `apps/web/dist-pages` from the `apps/web` site root plus the shared `packages/` and `examples/` folders needed by the browser workbench, uploads that artifact, deploys it to the `github-pages` environment, and runs post-deploy validation against the deployed Pages URL.

## Public Positioning

The portal must present COSMOS-CQA as research-only public infrastructure, not an OSI open-source project and not a production decision system. Public copy should stay within the project claim boundaries:

- describe artifact QA workflows, evidence bundles, provenance, validation reports, and deterministic replay;
- identify the COSMOS-CQA Research-Only Public License as the public use grant;
- state that all rights not expressly granted are reserved by AI-Bio Synergy Holdings LLC;
- avoid diagnostic, cosmology, clinical, operational, or production claims that are not validated in the repository evidence.
- identify any selective-access application as a separate planned surface, not an active feature of the public demo.

## Required Navigation

The public scaffold exposes:

- Demo: `./workbench.html?demo=core-pack` (tile-first public entry; Core Pack evidence remains available in the inspector)
- Workbook: `./demo-workbook.html`
- Research experiment: `./research-experiment.html`
- Docs: `./docs.html`
- Releases: `./releases.html`
- Citation: `./citation.html`
- License: `./license.html`
- Governance: `./governance.html`
- Ownership and use: `./ownership-and-use.html`
- Story behind the research: `./story.html`
- Safety and use boundaries: `./safety.html`
- Security and disclosure: `./security.html`
- Copyright notice: `./copyright.html`
- User data notice: `./user-data.html`
- Contact: `./contact.html`

## Local Verification

Run the static portal and workbench with:

```bash
npm --prefix apps/web run serve
```

Then open:

```text
http://localhost:4173/
```

The browser regression suite includes portal checks for canonical identity, navigation, workbench handoff, canvas rendering, narrow-screen overflow, hosted demo synthetic fixture loading, and validation report JSON export.

## SEO, Social Preview, Accessibility, and Usability Baseline

The public portal publishes crawl metadata, social preview metadata, structured data, `robots.txt`, and `sitemap.xml` for the canonical domain.

The social preview PNG is generated from `apps/web/social-preview.html`, which reuses the portal `portal-hero-canvas` rendering and dotless portal brand mark.

The baseline assessment is maintained in `docs/seo-social-accessibility-baseline.md`. It maps the current portal/workbench surface to WCAG 2.2 areas and Nielsen Norman Group usability heuristics without claiming formal conformance or certification.

The public safety note is maintained in `docs/public-safety.md` and mirrored by `apps/web/safety.html`. It treats optional audio sonification as the first-class risk surface: no autoplay, loop off by default, bounded frequency/software-gain constants, clear stop behavior, device-volume caveats, and no therapeutic, medical, diagnostic, or scientific-result claims.

The user data notice is maintained in `apps/web/user-data.html` with companion data governance in `docs/data-governance.md`. It describes the static local-first browser posture, public GitHub issue/reporting boundaries, contact email routing, external service logs, and non-confidential reporting guardrails.

The security and disclosure route is maintained in `SECURITY.md`, `docs/security-disclosure.md`, and `apps/web/security.html`. It separates private vulnerability reports from non-sensitive public safety/accessibility reports and warns against sharing exploit details, credentials, personal health information, regulated data, restricted datasets, or private screenshots in public GitHub surfaces.

Run the public portal release/deployment validation with:

```bash
npm --prefix apps/web run check:portal-deploy
```

For served-route validation, start the local static server and run:

```powershell
$env:COSMOS_CQA_PORTAL_BASE_URL="http://127.0.0.1:4173"; npm --prefix apps/web run check:portal-deploy
```

This checks canonical URL metadata, research-only license notice, release artifact links, validation report and SBOM paths, static module reachability, public resource pages, safety notices, security disclosure routing, contact routing, and hosted demo route health. The full validation responsibilities are documented in `docs/public-portal-deployment-validation.md`.

Prepare the GitHub Pages artifact locally with:

```bash
npm --prefix apps/web run pages:prepare
```

Serve the prepared artifact locally with:

```powershell
$env:COSMOS_CQA_STATIC_ROOT="apps/web/dist-pages"; npm --prefix apps/web run serve
```
