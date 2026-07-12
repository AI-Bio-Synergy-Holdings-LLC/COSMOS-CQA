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
- Validate synthetic Core Pack fixtures and public-data candidate manifests with provenance, SBOM, evidence, and diagnostic concept references.
- Add linked tile-observation targets and summaries so reviewers can pin normalized tile coordinates, note the interpreted sector, and inspect observation evidence without mutating source tile pixels.
- Keep kappa-y and E/B diagnostic placeholders documentation-only until source provenance, license review, fixtures, and scientific review are complete.
- Repair and merge useful CSSFP Core Pack diagnostic concepts only after intake gates pass.
- Produce report JSON before PDF generation.
- Follow spatial observation foundations with viewer transform tools, such as zoom, pan, rotate, and reset, only after coordinate mapping remains stable under transformed views.

## Phase 4: Public Research Release

- Publish documentation, sample manifests, test reports, and citation metadata.
- Tag a versioned release.
- Add release checks for license, provenance, accessibility, and reproducibility.

## Phase 5: Private Application Transition

- Freeze a citable public baseline and create a separate private repository as the selective-access application system of record.
- Approve the transition charter, architecture decision record, threat model, identity assurance targets, role matrix, and data classification before implementation.
- Start with a modular monolith and managed identity; keep authorization server-side and deny by default at tenant, project, dataset, assignment, artifact, review, and export boundaries.
- Use synthetic fixtures until data rights, retention, ethics, security, and partner approvals pass the readiness gates.
- Preserve public contract provenance, deterministic replay, evidence bundles, SBOMs, audit history, accessibility, audio safety, and scientific claim boundaries.
- Move implementation issues into the private tracker; keep this public repository limited to control-level transition guidance and approved public contract updates.

Execution map: `docs/private-application-transition-map.md`

Readiness gates: `docs/private-application-readiness-gates.md`

## Public Demo Maintenance

- Keep the hosted demo static, local-first, account-free, and research-only.
- Keep public docs aligned with the current workbench: Core Pack intake, viewer transforms, tile observation pins, Observation Review, Adjudication Queue placeholders, Calibration Wizard, reviewer packet exports/imports, validation reports, sessions, and evidence bundles.
- Point to the planned selective-access COSMOS-CQA application only as a separate future surface for verified researchers and institutions.
- Do not add private backend/auth behavior, onboarding promises, server submission claims, deployment-specific topology, credentials, or confidential partner details to the public demo. Control-level transition guidance may remain public when it does not expose private implementation internals.
