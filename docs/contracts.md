# Data Contracts

COSMOS-CQA uses explicit browser-native contracts for research workflow data. The first contract set covers labels, feed events, provenance bookmarks, SBOM exports, and validation reports.

The canonical contract implementation lives in `apps/web/src/contracts/`.

## Contract Version

Current version:

```text
cosmos-cqa.contracts.v0.1.0
```

Bookmark payloads and validation reports include this version as `schema_version`.

## Covered Shapes

- `labelRecord`: local volunteer label records before export.
- `labelExportRow`: flattened CSV export rows with optional expert adjudication fields.
- `feedTileEvent`: tile ingest records from upload, HTTP polling, or WebSocket feeds.
- `feedExpertEvent`: expert adjudication records from upload, HTTP polling, or WebSocket feeds.
- `bookmarkPayload`: encoded replay/provenance state for shareable bookmarks.
- `cycloneDxSbom`: minimal CycloneDX SBOM JSON export.
- `validationReport`: structured report summary for contract and workflow checks.

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
