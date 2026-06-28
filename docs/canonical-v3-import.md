# Canonical v3 Import

The COSMOS-CQA rework starts from the stable COSMOS v3 public/dev browser demos rather than from the full duplicate export archive.

## Imported Baseline

The canonical legacy baseline lives in `archive/original-materials/legacy-v3/`.

It includes:

- public demo HTML;
- dev demo HTML;
- v3.1 dev HTML;
- test checklist;
- 93/93 test report;
- v3 SBOM.

## Why This Import Is Narrow

The original archive contains many duplicate HTML exports with identical hashes. Importing only the stable baseline keeps the repository clean while preserving enough evidence to reconstruct the project.

## Active Migration Rule

Legacy files are provenance artifacts. Maintained source should be developed under `apps/web/`.

Do not edit imported legacy HTML in place unless the change is a deliberate archival annotation. Instead:

1. extract logic into modules under `apps/web/src/`;
2. add tests or verification scripts;
3. document any behavior that changes from legacy v3;
4. preserve public/dev behavior boundaries.

## Known Follow-Up

The nested CSSFP/Core Pack prototype should not be imported directly. Its diagnostic concepts may be valuable, but the extracted package is not present in maintained source and the provenance notes report invalid JavaScript caused by doubled template braces.

Core Pack work now starts with the intake lane in `docs/core-pack-intake.md`, the checklist in `docs/core-pack-import-checklist.md`, and the sample manifest in `examples/core-pack/core-pack.manifest.json`. Executable diagnostic repair should only happen after source provenance, rights review, fixtures, and scientific caveat review pass.
