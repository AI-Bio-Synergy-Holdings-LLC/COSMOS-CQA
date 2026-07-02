# COSMOS-CQA Demo Workbook

This workbook is the practical public walkthrough for the hosted COSMOS-CQA synthetic Core Pack fixture workflow.

COSMOS-CQA is available for research-only public use under the project-specific COSMOS-CQA Research-Only Public License. It is not an OSI open-source release, not a production decision system, and all rights not expressly granted are reserved by AI-Bio Synergy Holdings LLC.

## Hosted Demo

Open:

```text
https://cosmos-cqa.org/workbench.html?demo=core-pack#workspace-core-pack
```

The hosted demo loads the synthetic contract Core Pack fixture, keeps public truth labels hidden by default, prepares the validation report preview, and exposes Core Pack, report, evidence, and provenance inspection panels.

A separate COSMOS-CQA application is planned for verified researchers and institutions. This workbook covers only the static local-first public demo; it does not describe active onboarding, authenticated review, server submission, or institutional access.

Use the public research experiment page for the scientific framing and sonic loop boundaries:

```text
https://cosmos-cqa.org/research-experiment.html
```

Use the public safety page before optional audio playback:

```text
https://cosmos-cqa.org/safety.html
```

## Walkthrough

1. Open the hosted demo and confirm the banner reports that the synthetic contract Core Pack fixture is ready.
2. Inspect Core Pack intake: manifest summary, tile passports, evidence references, SBOM references, and diagnostic references.
3. Review the first tile, change one overlay and one palette, and confirm the caption and tile passport remain readable.
4. Use Zoom, Pan, Rotate, and Reset once; confirm the tile remains targetable and the viewer status returns to 100 percent zoom, 0 degree rotation, and pan 0, 0 after reset.
5. Check audio safety before playback: read the Audio and Captions notice, keep device volume low, and leave Loop off unless you intentionally need repeat playback.
6. Pin one tile sector, confirm the note field auto-inserts normalized source-tile coordinates, add a short observation after the cue, submit the label, and confirm the Evidence Workspace shows the pinned observation map.
7. Select the submitted observation in Observation Review, confirm the marker is highlighted, edit class/severity/note once, set a review status and reviewer confidence, and inspect the review revision plus ledger fields in reports or exported JSON.
8. Mark an observation as needing adjudication only when independent review is required; treat the consensus/adjudication fields as workflow placeholders, not scientific validation claims.
9. Open the Adjudication Queue, select the queued observation, enter an adjudication note, and record one queue decision such as Defer, Request second review, or Mark reviewed. Confirm the decision appears as a ledger event rather than a validation claim.
10. Delete the reviewed observation, confirm it leaves active exports while the ledger records a delete event, then use Undo Delete to restore the synced label and observation pair.
11. Undo the label and confirm the linked observation is removed while an audit event remains when a synced observation was present.
12. Start the Calibration Wizard in the Evidence Drawer, complete the three-step gold-tile mini-review, and confirm the score/reliability feedback updates the caption and metrics.
13. Create a bookmark, reload the copied state URL, and confirm tile, overlay, palette, rate, loop, and caption settings return.
14. Read diagnostic caveats before treating any diagnostic surface as evidence.
15. Refresh the validation report preview and inspect observation summary, QA metrics, adjudication queue history, and review ledger fields when pinned observations or review events exist.
16. Export SBOM JSON, validation report JSON, session JSON, and evidence bundle JSON for local review; import the session JSON and confirm the observation review ledger replays.
17. Prepare Reviewer Handoff JSON and confirm the reviewer handoff status says no network submission or authenticated reviewer access is active.
18. Import a reviewer packet only as local replay/testing evidence; do not describe it as verified expert review unless a future authenticated service validates identity, assignment, and return history.
19. Read the research experiment page, tile observation notes, reviewer access boundary, selective access notice, and public safety page; confirm the sonic loop is treated as an optional sonification sidecar, not a detector, therapeutic signal, or validated diagnostic.

## Review Notes To Capture

- Demo URL, browser, viewport size, timestamp, and public or dev mode.
- Manifest id, tile passport ids, evidence references, SBOM references, and provenance hash subjects.
- Tile navigation, overlay/palette changes, label submit/undo behavior, bookmark reload result, and export filenames.
- Viewer transform status after zoom, pan, rotate, and reset; transformed clicks should still export normalized source-tile coordinates.
- Calibration Wizard mode, progress policy, 3-step score, caption update, and reliability metric behavior.
- Pinned tile sector, auto-inserted normalized coordinate cue, exported observation coordinates, review edit revision fields, review status, reviewer confidence, adjudication queue decision/note when used, ledger event sequence, delete/restore result, note text quality, and whether observation summaries appear only as review-process evidence.
- Reviewer handoff packet id, source session/bundle hashes, assignment observation ids, `authenticated_access: false`, `network_submission: false`, and whether import restored only local replay state.
- Selective-access application wording, with no claim that verified researcher access is available through the public demo.
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
- The default fixture is synthetic evidence-plumbing material, not public observational data; public-data source candidates are documented separately in `docs/public-data-sources.md`.
- Diagnostic placeholders are caveated research concepts, not validated scientific results.
- Optional audio is user initiated, loop-off by default, and bounded by shared sidecar constants, but device volume and individual sensitivity remain outside browser control.
- The static portal has no account system or server-side workspace.
- Reviewer handoff packets are local JSON artifacts; the static portal does not authenticate reviewers, assign expert queues, or transmit observations to a remote review service. See `docs/reviewer-access-boundary.md`.
- A separate application is planned for verified researchers and institutions; the public demo should only point to that future surface without access promises, backend details, or operational timelines. See `docs/selective-access-application.md`.
- Downloads, bookmarks, imports, and exported evidence remain local to the browser unless the user shares them.
- Tile observation pins are reviewer-authored location cues, not measured sky coordinates or validated detections. See `docs/tile-observation-notes.md`.
