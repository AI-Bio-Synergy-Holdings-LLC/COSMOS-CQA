# Research Sessions and Evidence Bundles

COSMOS-CQA uses two linked evidence workspace contracts:

- `researchSession` captures replayable working state: loaded artifacts, selected tiles, labels, tile observations, observation review events, diagnostics, validation reports, provenance hashes, SBOM references, and build metadata.
- `evidenceBundle` wraps a session for export, citation, and expert review with schema version, generated timestamp, steward, research-only license notice, limitations, claim-boundary references, summary counts, exportable observation review history, and derived tile-observation summaries when pins or review events exist.

These contracts make Phase 3 evidence work durable without turning prototype diagnostics or browser state into unsupported scientific claims.

## Intended Use

Use research sessions and evidence bundles to:

- replay a COSMOS-CQA research workflow from known artifacts;
- save and import browser workbench state without depending on local storage;
- cite the exact labels, tile observations, observation review events, diagnostics, validation reports, hashes, and SBOM references reviewed together;
- move evidence between browser UI, package consumers, release validation, and expert review;
- preserve build metadata and generated-at timestamps alongside research-only license and steward notices.

Fixture examples live in:

- `examples/evidence-bundle/research-session.json`
- `examples/evidence-bundle/evidence-bundle.json`
- `examples/evidence-bundle/session-roundtrip.json`
- `examples/evidence-bundle/core-pack-evidence-bundle-golden.json`

Reusable helpers live in `packages/core/src/evidence/`, and canonical schemas live in `packages/schemas/src/`.

The browser workbench can export a `researchSession` JSON file and import a valid session file. Invalid session imports are rejected before state mutation so the current review state remains intact. Session JSON restores contracted evidence metadata; external source artifacts may still need to be available or reloaded when a selected tile image is not already present in the workbench.

The Evidence Workspace in the browser UI makes this model inspectable during review. It lists imported/exported research artifacts, linked tile observations, immutable observation review events, provenance hashes, SBOM references, loaded Core Packs, diagnostic placeholder records, and validation checks, with validation report IDs shown alongside related artifacts and references.

Pinned observation evidence is visualized as a 3x3 zone map and a derived summary by tile, zone, row band, column band, radial band, class, severity, review status, consensus placeholder status, and QA metric rows. Adjudication queue decisions are exported as review ledger events with notes and claim-boundary text. These summaries show review attention patterns and workflow state only. `needs-adjudication` and queue decisions are review placeholders, not scientific consensus. The interpretation boundary is documented in `docs/tile-observation-notes.md`.

Evidence bundle exports are schema-validated JSON artifacts suitable for research archive comparison. The golden Core Pack fixture records the serialized bundle hash, steward, research-only license notice, limitations, report summary counts, diagnostics, provenance subjects, and SBOM references so future refactors can prove the archive shape stayed stable.

## Claim Boundaries

Evidence bundles are research artifacts. They are not production decision-system certifications, scientific validation packages, regulatory submissions, or claims that diagnostic placeholder outputs are scientifically validated measurements.

External datasets, source artifacts, SBOM references, imported Core Packs, and generated reports remain subject to their own terms, provenance limits, and caveats. Public descriptions should continue to follow `docs/claim-boundaries.md` and `docs/scientific-scope.md`.

## Verification

Run the contract tests:

```bash
npm --prefix apps/web run test:contracts
```

Run the full app check:

```bash
npm --prefix apps/web run check
```
