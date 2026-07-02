# Core Pack Intake Plan

The repository does not currently contain the nested CSSFP/Core Pack prototype itself. It only contains provenance notes that the original archive included a nested CSSFP demo package with Core Pack diagnostic concepts, and that the extracted HTML had invalid JavaScript caused by doubled template braces.

This intake lane exists to make Core Pack work reviewable before importing or repairing any prototype code.

## Intake Rule

Core Pack materials must enter the repository in this order:

1. Manifest and provenance metadata.
2. License and stewardship review.
3. Safe synthetic or permitted sample references.
4. Contract validation and path/checksum validation.
5. Diagnostic concept extraction as documentation-only references.
6. Scientific review and fixture design.
7. Only then, repair or implementation of executable diagnostic code.

Until steps 1-6 pass, diagnostic entries must remain concept-only or documentation-only. They must not claim scientific validity, survey performance, foreground detection, lensing quality, calibration quality, or downstream cosmological inference value.

## Current Intake Artifacts

- Synthetic contract fixture manifest: `examples/core-pack/core-pack.manifest.json`
- Public-data candidate manifest: `examples/public-data-candidates/legacy-survey-core-pack.manifest.json`
- Public-source assessment: `docs/public-data-sources.md`
- Validator: `apps/web/scripts/validate-core-pack.mjs`
- Browser loader: JSON feed/Core Pack uploads are classified as research artifacts with SHA-256 provenance hashes.
- Report export: validation report JSON includes the research-only notice, limitations, imported artifacts, SBOM references, provenance hashes, and diagnostic caveats before any PDF workflow.
- Import checklist: `docs/core-pack-import-checklist.md`
- Diagnostic caveats: `docs/diagnostic-concepts.md`
- Archive provenance: `archive/original-materials/MANIFEST.md`

Run the validator from the repository root:

```bash
npm --prefix apps/web run validate:core-pack
```

The full app check also runs Core Pack validation:

```bash
npm --prefix apps/web run check
```

## Accepted During Intake

- JSON manifests that satisfy `corePackManifest`.
- Tile passports for synthetic or permitted sample tiles.
- Public-source candidate references with source URLs, review prompts, citation notes, and explicit no-live-dependency boundaries.
- SBOM references with paths and checksums.
- Evidence references to archive manifests, checklists, release notes, and validation reports.
- Diagnostic concept metadata with explicit caveats and blocked-until gates.

## Blocked During Intake

- Importing the missing nested CSSFP prototype as executable source.
- Repairing minified or malformed prototype JavaScript without preserving provenance.
- Committing restricted third-party data.
- Making the hosted public demo depend on third-party cutout services before CORS, rate-limit, attribution, caching, and redistribution terms are reviewed.
- Adding diagnostics that imply validated scientific performance.
- Producing PDF or public-facing reports that treat placeholder diagnostics as results.

## Exit Criteria

The intake lane can move toward diagnostic repair only when:

- the source package is available with checksum and archive path;
- license and redistribution terms are reviewed;
- useful concepts are separated from UI/demo-only code;
- scientific caveats are approved;
- deterministic fixtures define inputs, outputs, and failure modes;
- contract and validator tests pass in CI.
