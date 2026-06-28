# Source Architecture

COSMOS-CQA starts from a monolithic legacy HTML prototype. The maintainable source architecture should keep the public research workbench easy to run, easy to review, and easy to publish as static research-source software.

## Architecture Decision

Use a static browser application built from native ES modules under `apps/web/src/`.

This is the highest-leverage first split because it:

- preserves the current static-demo deployment model;
- avoids adding framework dependencies before schemas and domain boundaries settle;
- keeps GitHub Pages and local static hosting straightforward;
- lets domain logic move into testable modules immediately;
- leaves a clean upgrade path to Vite, React, Web Components, or workers later.

## Module Boundaries

The source split uses these first-class modules:

- `tile-synthesis`: deterministic synthetic tile generation and pixel helpers;
- `sidecars`: overlays, audio maps, and sonification playback;
- `contracts`: schema definitions and dependency-free validation for research workflow records;
- `feeds`: feed payload parsing, normalization, and contract rejection reporting;
- `labels`: volunteer label capture, persistence, and CSV export;
- `metrics`: PR-AUC, precision/recall, EMA, reliability, latency, and KPI helpers;
- `expert-review`: expert queue scoring, confirm/override, and adjudication persistence;
- `provenance`: bookmark payloads, build metadata, test bridge events, and replay handles;
- `reports`: SBOM and validation/export helpers;
- `ui`: DOM binding, event wiring, calibration flow, keyboard scope, and view updates.

Shared state and static data live at the app layer only when they coordinate multiple modules.

## Alternatives Considered

### Keep Strict Single-File HTML

Rejected for active development. It is portable, but it hides coupling, makes testing awkward, and encourages patch stacking.

### Static HTML Plus ES Modules

Accepted for the first maintained source. It gives clean ownership with minimal toolchain risk.

### Vite With Vanilla Modules

Good future option when bundling, hot reload, dependency management, or release artifacts become important. The current source layout can move into Vite without changing domain boundaries.

### React Plus Vite

Good future option if the workbench becomes a dense multi-panel application with heavier local state, routing, or reusable component families. It is premature for the first import because the core schemas and data model are still being stabilized.

### Web Components

Good future option for distributing individual controls or embedding COSMOS-CQA panels into other research sites. It adds component lifecycle complexity before the first source split needs it.

### Worker-Backed Compute Modules

Good future option for expensive diagnostics, FITS/HEALPix transforms, and report generation. The first split keeps computational functions pure enough to move into workers later.

## Near-Term Rule

Do not edit imported legacy HTML to create active behavior. Use `apps/web/index.html` and `apps/web/src/` for maintained source, and keep `archive/original-materials/legacy-v3/` as provenance.
