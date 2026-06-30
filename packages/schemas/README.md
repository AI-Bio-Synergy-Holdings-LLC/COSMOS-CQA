# Schemas Package

`@ai-bio-synergy/cosmos-cqa-schemas` is the canonical dependency-free schema and contract-validation surface for COSMOS-CQA research workflow records.

The current entrypoint is `src/index.js`.

## Exports

- `CONTRACT_SCHEMA_VERSION`
- schema constants for artifact classes, severities, overlays, palettes, expert classes, and checklist states
- schema constants for diagnostic concept status, diagnostic result status, implementation gates, research artifact kinds, observation review statuses, consensus placeholders, adjudication decisions, and review event actions
- `schemas`
- `validateContract(name, value)`
- `assertContract(name, value)`
- `isValidContract(name, value)`

## Covered Shapes

- label records, tile observations, observation review events, observation QA metrics, tile-observation summaries, and label export rows
- feed tile and expert events
- bookmark provenance payloads
- provenance hashes
- research artifact records
- tile passports
- diagnostic concepts
- diagnostic placeholder results
- SBOM references and CycloneDX SBOM exports
- core pack manifests
- validation reports
- legacy checklist target manifests
- research sessions
- evidence bundles

The browser app re-exports this package through `apps/web/src/contracts/` for compatibility, but new reusable infrastructure should import from this package surface.
