# Release Checklist

Before a public COSMOS-CQA release:

- License, notice, citation, and ownership docs are present.
- Third-party data terms are documented.
- No restricted raw datasets are committed.
- Source builds from a clean checkout.
- Tests or manual verification reports are included.
- Deterministic replay fixtures pass.
- SBOM is generated when dependencies exist, either through committed release artifacts or `npm --prefix apps/web sbom --sbom-format cyclonedx --sbom-type application --json`.
- GitHub CodeQL, Dependabot, and secret-scanning open-alert checks are clear or have documented dispositions.
- Security disclosure, data governance, public safety, and public-surface hardening docs are current.
- Public/dev build differences are documented.
- Truth labels are hidden in public demo builds.
- Exported reports include provenance and schema version.
- Public portal, workbook, and hosted demo routes pass deployment validation and rendered smoke checks.
- README describes research-only public use accurately.
- Tag and release notes identify known limitations.
