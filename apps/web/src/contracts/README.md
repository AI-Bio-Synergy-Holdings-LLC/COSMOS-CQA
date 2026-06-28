# contracts

Schema definitions and lightweight validation for COSMOS-CQA workflow records.

This module owns:

- contract schema versioning;
- label and export row schemas;
- feed event schemas;
- provenance bookmark schemas;
- tile passport and core pack manifest schemas;
- SBOM, SBOM reference, validation report, and checklist target schemas;
- dependency-free validation helpers for browser and Node tests.

Keep producer modules responsible for creating data, and keep this module responsible for deciding whether the data shape is valid.
