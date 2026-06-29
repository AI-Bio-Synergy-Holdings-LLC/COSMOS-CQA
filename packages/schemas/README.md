# Schemas Package

`@ai-bio-synergy/cosmos-cqa-schemas` is the canonical dependency-free schema and contract-validation surface for COSMOS-CQA research workflow records.

The current entrypoint is `src/index.js`.

## Exports

- `CONTRACT_SCHEMA_VERSION`
- schema constants for artifact classes, severities, overlays, palettes, expert classes, and checklist states
- schema constants for diagnostic concept status, diagnostic result status, implementation gates, and research artifact kinds
- `schemas`
- `validateContract(name, value)`
- `assertContract(name, value)`
- `isValidContract(name, value)`

## Covered Shapes

- label records and label export rows
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

The browser app re-exports this package through `apps/web/src/contracts/` for compatibility, but new reusable infrastructure should import from this package surface.
