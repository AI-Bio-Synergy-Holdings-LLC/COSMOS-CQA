# Core Package

`@ai-bio-synergy/cosmos-cqa-core` is the reusable COSMOS-CQA domain-helper surface.

The current entrypoint is `src/index.js`, with submodule entrypoints for:

- `core-pack`: Core Pack intake manifest validation helpers
- `diagnostics`: review-gated diagnostic concept references and caveated placeholder output helpers
- `evidence`: research session and evidence bundle helpers
- `feeds`: feed parsing, normalization, and validation helpers
- `labels`: label export and CSV helpers
- `metrics`: PR-AUC, reliability, latency, and accessibility helpers
- `provenance`: build info and bookmark payload helpers
- `research-artifacts`: feed/Core Pack payload classification, hashing, and artifact records
- `reports`: SBOM and validation report assembly
- `sidecars`: deterministic audio-map helpers and shared audio safety limits
- `tile-synthesis`: deterministic synthetic tile records and pixel helpers

Browser-only behavior remains in `apps/web/src/`, including DOM drawing, local storage, clipboard, downloads, Web Audio controls, and UI event wiring.

The package imports schemas from `packages/schemas` and is intended to keep deterministic research workflow logic reusable outside the browser app.
