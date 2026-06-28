# Tests

This directory will contain automated and manual verification assets.

Initial test targets:

- schema validation;
- deterministic replay;
- public build truth-label hiding;
- export format checks;
- accessibility checks;
- report generation checks.

Evidence target manifests:

- `evidence/legacy-v3-checklist-targets.json` tracks the 86 manual checklist items and 7 bridge auto-checks extracted from the archived legacy v3 checklist. The current browser migration covers all 93 tracked targets through `apps/web/test/browser/workflows.spec.mjs`.
