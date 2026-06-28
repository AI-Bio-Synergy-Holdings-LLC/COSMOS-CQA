# Data Contracts

COSMOS-CQA uses explicit browser-native contracts for research workflow data. The first contract set covers labels, feed events, provenance bookmarks, tile passports, core pack manifests, SBOM exports/references, validation reports, and checklist target evidence.

The canonical contract implementation lives in `packages/schemas/src/`.
The browser app re-exports that surface through `apps/web/src/contracts/` for compatibility.

## Contract Version

Current version:

```text
cosmos-cqa.contracts.v0.1.0
```

Bookmark payloads, tile passports, core pack manifests, SBOM references, validation reports, and checklist target manifests include this version as `schema_version`.

## Covered Shapes

- `labelRecord`: local volunteer label records before export.
- `labelExportRow`: flattened CSV export rows with optional expert adjudication fields.
- `feedTileEvent`: tile ingest records from upload, HTTP polling, or WebSocket feeds.
- `feedExpertEvent`: expert adjudication records from upload, HTTP polling, or WebSocket feeds.
- `bookmarkPayload`: encoded replay/provenance state for shareable bookmarks.
- `tilePassport`: tile-level provenance, checksum, truth, coordinate, and sidecar metadata.
- `sbomReference`: release or core-pack pointer to a generated SBOM artifact.
- `corePackManifest`: bundle manifest tying tile passports, SBOM references, steward, license, and evidence references together.
- `cycloneDxSbom`: minimal CycloneDX SBOM JSON export.
- `validationReport`: structured report summary for contract and workflow checks.
- `checklistTestTargets`: generated manifest that converts the legacy manual checklist into tracked evidence targets.

Checklist targets may include `covered_by` entries that point to automated tests responsible for migrated targets.

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
