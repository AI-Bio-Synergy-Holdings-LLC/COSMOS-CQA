# Core Pack Import Checklist

Use this checklist before importing any Core Pack or CSSFP-derived material.

## Provenance

- [ ] Source archive path is recorded.
- [ ] SHA-256 checksum is recorded.
- [ ] Source date/version is recorded when available.
- [ ] Importer records whether the source is original, repaired, or derived.
- [ ] Any malformed source files are preserved as archive artifacts, not silently rewritten.

## Rights And Stewardship

- [ ] Research-only project license remains visible.
- [ ] AI-Bio Synergy Holdings LLC stewardship is retained.
- [ ] Third-party data and code licenses are reviewed.
- [ ] Redistribution restrictions are recorded before committing assets.
- [ ] No restricted data is committed without documented permission.

## Scientific Scope

- [ ] Proposed diagnostics are described as research QA aids, not final scientific validation.
- [ ] Caveats are attached to each diagnostic concept.
- [ ] A qualified domain reviewer is identified before executable diagnostic claims are added.
- [ ] Inputs, outputs, assumptions, and failure modes are documented.
- [ ] Claims are checked against `docs/claim-boundaries.md`.

## Engineering

- [ ] Manifest validates with `npm --prefix apps/web run validate:core-pack`.
- [ ] Contracts validate with `npm --prefix apps/web run test:contracts`.
- [ ] Deterministic fixtures exist before executable diagnostics are merged.
- [ ] Diagnostic code is modular and testable outside the browser UI.
- [ ] Generated reports distinguish placeholder concepts from computed results.

## Current Status

The current repository has an intake lane and concept metadata only. The nested CSSFP/Core Pack prototype is not present as maintained source, and no executable diagnostic import is approved yet.
