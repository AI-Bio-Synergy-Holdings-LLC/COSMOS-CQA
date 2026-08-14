# Evidence Bundle Fixtures

This directory contains synthetic contract fixtures for the Phase 3 evidence workspace.

- `research-session.json` is a valid `researchSession` fixture with loaded artifact metadata, selected tile state, validation report evidence, provenance hash references, and SBOM references.
- `evidence-bundle.json` is a valid `evidenceBundle` fixture that wraps the same session with steward, research-only license notice, limitations, claim-boundary references, and summary counts.
- `evidence-bundle.receipt.json` is the deterministic checksum-only receipt for the canonical bytes in `evidence-bundle.json`, including its contract version, bundle ID, UTF-8 byte length, SHA-256 digest, and claim boundary.
- `session-roundtrip.json` records the deterministic serialized-session hash and reload plan used by replay tests.
- `core-pack-evidence-bundle-golden.json` pins the deterministic serialized evidence bundle generated from the synthetic Core Pack fixture, diagnostics, SBOM reference, provenance hashes, and validation report.

These files are contract fixtures only. They are not scientific validation results. Receipt verification proves canonical byte consistency only, not authorship, authenticity, scientific validity, production readiness, regulatory suitability, or certification.
