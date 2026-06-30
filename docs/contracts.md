# Data Contracts

COSMOS-CQA uses explicit browser-native contracts for research workflow data. The first contract set covers labels, tile observations, observation review events, feed events, provenance bookmarks, provenance hashes, research artifacts, tile passports, core pack manifests, SBOM exports/references, validation reports, checklist target evidence, research sessions, and evidence bundles.

The canonical contract implementation lives in `packages/schemas/src/`.
The browser app re-exports that surface through `apps/web/src/contracts/` for compatibility.

## Contract Version

Current version:

```text
cosmos-cqa.contracts.v0.1.0
```

Bookmark payloads, tile passports, core pack manifests, SBOM references, validation reports, checklist target manifests, research sessions, and evidence bundles include this version as `schema_version`.

## Covered Shapes

- `labelRecord`: local volunteer label records before export.
- `tileObservation`: linked spatial observation target for a submitted label, with normalized tile coordinates, deterministic grid zone, zone taxonomy, required note, overlay/palette state, and timestamp.
- `observationReviewEvent`: append-only review ledger event for create, edit, delete, restore, and adjudication-queue placeholder actions, with reviewer confidence, workflow status, consensus/adjudication placeholder state, optional queue decision, active-export state, and claim-boundary text.
- `observationQaMetric`: per-tile or per-zone QA metric row for active observation counts, reviewed counts, adjudication-needed counts, ledger event counts, and average reviewer confidence.
- `tileObservationSummary`: derived observation evidence counts by tile, zone, row band, column band, radial band, class, severity, review status, consensus placeholder status, and QA metrics.
- `labelExportRow`: flattened CSV export rows with optional expert adjudication and tile-observation fields.
- `feedTileEvent`: tile ingest records from upload, HTTP polling, or WebSocket feeds.
- `feedExpertEvent`: expert adjudication records from upload, HTTP polling, or WebSocket feeds.
- `bookmarkPayload`: encoded replay/provenance state for shareable bookmarks.
- `provenanceHash`: SHA-256 subject/value record for imported or exported research artifacts.
- `researchArtifact`: imported feed, Core Pack, SBOM, or validation-report artifact metadata with source hash and counts.
- `tilePassport`: tile-level provenance, checksum, truth, coordinate, and sidecar metadata.
- `diagnosticConcept`: review-gated diagnostic concept metadata with required scientific caveats.
- `diagnosticResult`: deterministic placeholder diagnostic output for report plumbing, with required caveats, limitations, and claim-boundary references.
- `sbomReference`: release or core-pack pointer to a generated SBOM artifact.
- `corePackManifest`: bundle manifest tying tile passports, SBOM references, steward, license, evidence references, and optional diagnostic concept references together.
- `cycloneDxSbom`: minimal CycloneDX SBOM JSON export.
- `validationReport`: structured report JSON with research-only license notice, limitations, checks, optional observation summary, observation review ledger events, research artifacts, SBOM references, provenance hashes, and caveated diagnostic placeholder results. This is the report artifact lane before any PDF generation.
- `checklistTestTargets`: generated manifest that converts the legacy manual checklist into tracked evidence targets.
- `researchSession`: replayable working-state contract that ties loaded artifacts, selected tiles, labels, tile observations, observation review events, diagnostics, validation reports, provenance hashes, SBOM references, and build metadata together.
- `evidenceBundle`: export-ready wrapper around a research session with steward, research-only license notice, limitations, generated metadata, claim-boundary references, evidence counts, and exportable observation review history.

Checklist targets may include `covered_by` entries that point to automated tests responsible for migrated targets.

Research sessions are intended to capture what was loaded, selected, generated, and reviewed during a reproducible COSMOS-CQA workflow. Evidence bundles are the portable citation/review layer for those sessions. They do not certify scientific validity or production readiness on their own; claim boundaries remain governed by `docs/claim-boundaries.md` and `docs/scientific-scope.md`.

Spatial observation notes are interpreted under `docs/tile-observation-notes.md`. They are reviewer-authored location cues inside the reviewed tile, not measured sky coordinates or validated detections. Observation review ledger fields are QA workflow records only; `needs-adjudication`, adjudication queue decisions, and consensus placeholder values do not create scientific validation claims.

## Verification

Run the contract test suite from the repository root:

```bash
npm --prefix apps/web run test:contracts
```

The main web check also runs contract tests:

```bash
npm --prefix apps/web run check
```

## Extension Rule

Additive fields should be introduced by updating the schema, producer, and contract tests together. Breaking changes should bump `CONTRACT_SCHEMA_VERSION` and include a migration note.
