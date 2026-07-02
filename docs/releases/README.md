# Release Artifact Index

This index points public researchers to release notes, validation reports, SBOM artifacts, known limitations, and verification commands for COSMOS-CQA releases.

COSMOS-CQA release artifacts are research evidence. They are not production certifications, clinical artifacts, regulatory submissions, or OSI open-source distribution grants. Public use remains governed by the COSMOS-CQA Research-Only Public License, with AI-Bio Synergy Holdings LLC as owner and steward.

Zenodo DOI status: active. The all-versions concept DOI is [10.5281/zenodo.21112698](https://doi.org/10.5281/zenodo.21112698). The first DOI-minted public release is `v0.1.1-research-alpha` with release DOI [10.5281/zenodo.21112699](https://doi.org/10.5281/zenodo.21112699). The current `v0.1.2-research-alpha` release DOI is [10.5281/zenodo.21142690](https://doi.org/10.5281/zenodo.21142690).

## v0.1.2-research-alpha

- Release notes: [`v0.1.2-research-alpha.md`](v0.1.2-research-alpha.md)
- Validation report JSON: [`v0.1.2-research-alpha-validation-report.json`](v0.1.2-research-alpha-validation-report.json)
- SBOM JSON: [`v0.1.2-research-alpha-sbom.json`](v0.1.2-research-alpha-sbom.json)
- GitHub release: [`v0.1.2-research-alpha`](https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA/releases/tag/v0.1.2-research-alpha)
- Zenodo record: [https://zenodo.org/records/21142690](https://zenodo.org/records/21142690)
- Zenodo release DOI: [10.5281/zenodo.21142690](https://doi.org/10.5281/zenodo.21142690)
- Zenodo all-versions DOI: [10.5281/zenodo.21112698](https://doi.org/10.5281/zenodo.21112698)
- Tag: `v0.1.2-research-alpha`
- Release title: `COSMOS-CQA v0.1.2 Research Alpha`
- Canonical URL: `https://cosmos-cqa.org`

## v0.1.1-research-alpha

- Release notes: [`v0.1.1-research-alpha.md`](v0.1.1-research-alpha.md)
- GitHub release: [`v0.1.1-research-alpha`](https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA/releases/tag/v0.1.1-research-alpha)
- Zenodo record: [https://zenodo.org/records/21112699](https://zenodo.org/records/21112699)
- Zenodo release DOI: [10.5281/zenodo.21112699](https://doi.org/10.5281/zenodo.21112699)
- Zenodo all-versions DOI: [10.5281/zenodo.21112698](https://doi.org/10.5281/zenodo.21112698)
- Tag: `v0.1.1-research-alpha`
- Release title: `COSMOS-CQA v0.1.1 Research Alpha`
- Canonical URL: `https://cosmos-cqa.org`

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
