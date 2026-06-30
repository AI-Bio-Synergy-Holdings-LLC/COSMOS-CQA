# Roadmap

## Phase 0: Repository Spine

- Establish research-source license, notices, governance, contribution terms, and archive manifest.
- Define naming and scope.

## Phase 1: Canonical Import

- Select the stable COSMOS v3 browser demo as the canonical import source.
- Archive duplicate exports.
- Extract HTML, CSS, and JavaScript into maintainable source files.
- Preserve public and dev build distinction.

## Phase 2: Evidence Model

- Define JSON schemas for labels, tile passports, core pack manifests, SBOM references, validation reports, and checklist target evidence.
- Add deterministic replay tests.
- Add checklist-to-test migration plan with tracked legacy target manifest.

## Phase 3: Core Pack and Diagnostics

- Build the Core Pack intake lane before importing diagnostics.
- Validate sample Core Pack manifests with provenance, SBOM, evidence, and diagnostic concept references.
- Add linked tile-observation targets so reviewers can pin normalized tile coordinates and notes to submitted labels without mutating source tile pixels.
- Keep kappa-y and E/B diagnostic placeholders documentation-only until source provenance, license review, fixtures, and scientific review are complete.
- Repair and merge useful CSSFP Core Pack diagnostic concepts only after intake gates pass.
- Produce report JSON before PDF generation.
- Follow spatial observation foundations with viewer transform tools, such as zoom, pan, rotate, and reset, only after coordinate mapping remains stable under transformed views.

## Phase 4: Public Research Release

- Publish documentation, sample manifests, test reports, and citation metadata.
- Tag a versioned release.
- Add release checks for license, provenance, accessibility, and reproducibility.
