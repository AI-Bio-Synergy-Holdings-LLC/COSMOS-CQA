# contracts

Compatibility re-export for the canonical schema package.

The maintained schema definitions and lightweight validators live in `packages/schemas/src/`. This app module re-exports that package surface so legacy app-relative imports keep working.

The schema package owns:

- contract schema versioning;
- label and export row schemas;
- feed event schemas;
- provenance bookmark schemas;
- tile passport and core pack manifest schemas;
- SBOM, SBOM reference, validation report, and checklist target schemas;
- dependency-free validation helpers for browser and Node tests.

Keep producer modules responsible for creating data, and keep the schemas package responsible for deciding whether the data shape is valid.
