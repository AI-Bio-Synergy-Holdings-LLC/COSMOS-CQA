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

Use the public safety page before optional audio playback:

```text
https://cosmos-cqa.org/safety.html
```

## Walkthrough

1. Open the hosted demo and confirm the banner reports that the sample Core Pack is ready.
2. Inspect Core Pack intake: manifest summary, tile passports, evidence references, SBOM references, and diagnostic references.
3. Review the first tile, change one overlay and one palette, and confirm the caption and tile passport remain readable.
4. Use Zoom, Pan, Rotate, and Reset once; confirm the tile remains targetable and the viewer status returns to 100 percent zoom, 0 degree rotation, and pan 0, 0 after reset.
5. Check audio safety before playback: read the Audio and Captions notice, keep device volume low, and leave Loop off unless you intentionally need repeat playback.
6. Pin one tile sector, enter a short spatial note, submit the label, and confirm the Evidence Workspace shows the pinned observation map.
7. Select the submitted observation in Observation Review, confirm the marker is highlighted, edit class/severity/note once, and inspect the review revision fields in reports or exported JSON.
8. Delete the reviewed observation, confirm it leaves active exports, then use Undo Delete to restore the synced label and observation pair.
9. Undo the label and confirm the linked observation is removed.
10. Create a bookmark, reload the copied state URL, and confirm tile, overlay, palette, rate, loop, and caption settings return.
11. Read diagnostic caveats before treating any diagnostic surface as evidence.
12. Refresh the validation report preview and inspect observation summary fields when pinned observations exist.
13. Export SBOM JSON, validation report JSON, session JSON, and evidence bundle JSON for local review.
14. Read the research experiment page, tile observation notes, and public safety page; confirm the sonic loop is treated as an optional sonification sidecar, not a detector, therapeutic signal, or validated diagnostic.

## Review Notes To Capture

- Demo URL, browser, viewport size, timestamp, and public or dev mode.
- Manifest id, tile passport ids, evidence references, SBOM references, and provenance hash subjects.
- Tile navigation, overlay/palette changes, label submit/undo behavior, bookmark reload result, and export filenames.
- Viewer transform status after zoom, pan, rotate, and reset; transformed clicks should still export normalized source-tile coordinates.
- Pinned tile sector, normalized observation coordinates if exported, review edit revision fields, delete/restore result, note text quality, and whether observation summaries appear only as review-process evidence.
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
- Optional audio is user initiated, loop-off by default, and bounded by shared sidecar constants, but device volume and individual sensitivity remain outside browser control.
- The static portal has no account system or server-side workspace.
- Downloads, bookmarks, imports, and exported evidence remain local to the browser unless the user shares them.
- Tile observation pins are reviewer-authored location cues, not measured sky coordinates or validated detections. See `docs/tile-observation-notes.md`.
