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

The nested CSSFP/Core Pack prototype should be repaired and merged later. Its diagnostic concepts are valuable, but the extracted package currently contains invalid JavaScript caused by doubled template braces.

