# Evidence Bundle Fixtures

This directory contains synthetic contract fixtures for the Phase 3 evidence workspace.

- `research-session.json` is a valid `researchSession` fixture with loaded artifact metadata, selected tile state, validation report evidence, provenance hash references, and SBOM references.
- `evidence-bundle.json` is a valid `evidenceBundle` fixture that wraps the same session with steward, research-only license notice, limitations, claim-boundary references, and summary counts.
- `session-roundtrip.json` records the deterministic serialized-session hash and reload plan used by replay tests.

These files are contract fixtures only. They are not scientific validation results.
