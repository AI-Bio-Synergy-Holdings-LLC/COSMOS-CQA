# Source Migration

This directory contains the maintainable COSMOS QA Workbench browser source.

Reusable schema and domain logic lives under `packages/`; app modules re-export or adapt those package surfaces where browser behavior needs stable local imports.

The browser app keeps these module boundaries:

- `tile-synthesis`: compatibility re-export for deterministic tile helpers from `packages/core`;
- `sidecars`: browser overlays/audio controls plus deterministic audio helpers from `packages/core`;
- `core-pack`: compatibility re-export for Core Pack intake helpers from `packages/core`;
- `contracts`: compatibility re-export for `packages/schemas`;
- `diagnostics`: compatibility re-export for caveated diagnostic placeholder helpers from `packages/core`;
- `evidence`: compatibility re-export for research session and evidence bundle helpers from `packages/core`;
- `feeds`: compatibility re-export for feed helpers from `packages/core`;
- `labels`: browser storage helpers plus label export helpers from `packages/core`;
- `metrics`: compatibility re-export for metric helpers from `packages/core`;
- `expert-review`: expert queue and adjudication workflow;
- `provenance`: browser test bridge/clipboard helpers plus bookmark helpers from `packages/core`;
- `research-artifacts`: compatibility re-export for feed/Core Pack artifact loading helpers from `packages/core`;
- `reports`: browser download helpers plus report/SBOM assembly from `packages/core`;
- `ui`: browser view composition and accessibility behavior.

Keep public/dev build differences explicit. Public builds must not expose truth labels.
