# Release Artifact Index

This index points public researchers to release notes, validation reports, SBOM artifacts, known limitations, and verification commands for COSMOS-CQA releases.

COSMOS-CQA release artifacts are research evidence. They are not production certifications, clinical artifacts, regulatory submissions, or OSI open-source distribution grants. Public use remains governed by the COSMOS-CQA Research-Only Public License, with AI-Bio Synergy Holdings LLC as owner and steward.

Zenodo DOI status: pending first Zenodo-archived release. The planned first DOI-minted public release is expected to be `v0.1.1-research-alpha` or the next clean public hardening tag after Zenodo registration.

## v0.1.0-research-alpha

- Release notes: [`v0.1.0-research-alpha.md`](v0.1.0-research-alpha.md)
- Validation report JSON: [`v0.1.0-research-alpha-validation-report.json`](v0.1.0-research-alpha-validation-report.json)
- SBOM JSON: [`v0.1.0-research-alpha-sbom.json`](v0.1.0-research-alpha-sbom.json)
- Tag: `v0.1.0-research-alpha`
- Release title: `COSMOS-CQA v0.1.0 Research Alpha`
- Canonical URL: `https://cosmos-cqa.org`
- Zenodo DOI: not minted for this release

### Verification

The release baseline records these verification commands:

```bash
npm --prefix apps/web run check
git diff --check
```

Current repository verification should use:

```bash
npm --prefix apps/web run check
```

### Known Limitations

The v0.1.0 research alpha records these public limitations:

- the workbench is a research alpha and not a production decision system;
- synthetic demo tiles are included for reproducibility testing;
- no restricted third-party datasets are redistributed;
- legacy HTML materials are archived for provenance and are not the maintained development surface;
- report generation is JSON/SBOM-oriented at this stage;
- PDF generation is not yet implemented;
- Core Pack diagnostics and CSSFP repair/import require further provenance, rights, fixture, and scientific review.

## Artifact Discipline

Each public release should include or link:

- release notes;
- validation report JSON;
- SBOM JSON or documented SBOM export path;
- known limitations;
- verification commands;
- archive/provenance notes;
- research-only license notice and stewardship notice.
- Zenodo DOI link and badge once a release has been archived by Zenodo.

Release artifacts should avoid commercial-use, production-use, or OSI open-source ambiguity.
