# COSMOS-CQA Demo Workbook

This workbook is the practical public walkthrough for the hosted COSMOS-CQA sample Core Pack workflow.

COSMOS-CQA is available for research-only public use under the project-specific COSMOS-CQA Research-Only Public License. It is not an OSI open-source release, not a production decision system, and all rights not expressly granted are reserved by AI-Bio Synergy Holdings LLC.

## Hosted Demo

Open:

```text
https://cosmos-cqa.org/workbench.html?demo=core-pack#workspace-core-pack
```

The hosted demo loads the public sample Core Pack, keeps public truth labels hidden by default, prepares the validation report preview, and exposes Core Pack, report, evidence, and provenance inspection panels.

Use the public research experiment page for the scientific framing and sonic loop boundaries:

```text
https://cosmos-cqa.org/research-experiment.html
```

## Walkthrough

1. Open the hosted demo and confirm the banner reports that the sample Core Pack is ready.
2. Inspect Core Pack intake: manifest summary, tile passports, evidence references, SBOM references, and diagnostic references.
3. Review the first tile, change one overlay and one palette, and confirm the caption and tile passport remain readable.
4. Submit a short label note, then undo the label.
5. Create a bookmark, reload the copied state URL, and confirm tile, overlay, palette, rate, loop, and caption settings return.
6. Read diagnostic caveats before treating any diagnostic surface as evidence.
7. Refresh the validation report preview.
8. Export SBOM JSON, validation report JSON, session JSON, and evidence bundle JSON for local review.
9. Read the research experiment page and confirm the sonic loop is treated as a sonification sidecar, not a detector or validated diagnostic.

## Review Notes To Capture

- Demo URL, browser, viewport size, timestamp, and public or dev mode.
- Manifest id, tile passport ids, evidence references, SBOM references, and provenance hash subjects.
- Tile navigation, overlay/palette changes, label submit/undo behavior, bookmark reload result, and export filenames.
- Known limitations, diagnostic caveats, public truth-label hiding, and any accessibility or visual issues observed.

## Verification Commands

Run focused checks:

```bash
npm --prefix apps/web run test:browser -- test/browser/hosted-demo.spec.mjs
npm --prefix apps/web run test:browser -- test/browser/portal.spec.mjs
npm --prefix apps/web run check:portal-deploy
```

Run the full maintained check:

```bash
npm --prefix apps/web run check
```

## Public Boundaries

- Public truth labels remain hidden in the visible workflow and public DOM text.
- Diagnostic placeholders are caveated research concepts, not validated scientific results.
- The static portal has no account system or server-side workspace.
- Downloads, bookmarks, imports, and exported evidence remain local to the browser unless the user shares them.
