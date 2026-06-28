# Source Migration

This directory is reserved for the maintainable COSMOS QA Workbench source.

The initial migration target is to split the legacy v3 single-file demo into modules with clear ownership:

- `tile-synthesis`: deterministic synthetic CMB and weak-lensing tile generation;
- `sidecars`: audio and visual sidecar generation;
- `contracts`: schema definitions and validation for workflow data;
- `feeds`: live/uploaded feed parsing and normalization;
- `labels`: volunteer label capture and export;
- `metrics`: PR-AUC, precision/recall, latency, and reliability metrics;
- `expert-review`: expert queue and adjudication workflow;
- `provenance`: bookmarks, tile passports, checksums, and run parameters;
- `reports`: validation report JSON/PDF assembly;
- `ui`: browser view composition and accessibility behavior.

Keep public/dev build differences explicit. Public builds must not expose truth labels.
