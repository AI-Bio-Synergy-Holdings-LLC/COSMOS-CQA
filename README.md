# COSMOS-CQA

COSMOS-CQA is a research-source workbench for citizen-assisted quality assurance of cosmology artifacts, including CMB and weak-lensing map tiles, deterministic sidecars, expert adjudication, provenance manifests, and validation reports.

## Project Status

This repository is being reworked from the original COSMOS prototype materials into a clean public research project stewarded by AI-Bio Synergy Holdings LLC.

Current status:

- Repository scaffold established.
- Original materials are inventoried in `archive/original-materials/`.
- Canonical COSMOS v3 legacy browser materials are archived under `archive/original-materials/legacy-v3/`.
- The maintained browser workbench is split into native ES modules under `apps/web/src/`.
- Labels, feed events, provenance/bookmarks, tile passports, core pack manifests, SBOM exports/references, validation reports, and checklist targets have first-pass contracts and contract tests.
- Synthetic golden fixtures verify deterministic replay for tile synthesis, sidecars, bookmarks, CSV exports, reports, and public/dev truth-label policy.
- The legacy v3 manual checklist is converted into tracked evidence targets under `tests/evidence/`, with the first browser workflows migrated to Playwright automation.
- Public use is governed by the COSMOS-CQA Research-Only Public License.

## Intended Use

COSMOS-CQA is intended for non-commercial research, education, evaluation, reproducibility review, and scientific collaboration. It is not released for commercial use, production service operation, resale, sublicensing, clinical use, regulatory use, or derivative product development without a separate written agreement from AI-Bio Synergy Holdings LLC.

## Repository Layout

```text
apps/web/                  Browser workbench source
packages/core/             Core artifact QA and provenance logic
packages/schemas/          JSON schemas for labels, manifests, reports, and tile passports
examples/core-pack/        Small sample manifests and demo data references
docs/                      Scientific scope, governance, roadmap, and operating docs
tests/                     Verification plans and future automated tests
archive/original-materials/ Provenance manifest for original COSMOS materials
```

## Current Verification

Run the current verification suite from the repository root:

```bash
npm --prefix apps/web ci
npm --prefix apps/web exec -- playwright install chromium
npm --prefix apps/web run check
```

This runs maintained source syntax checks, contract tests, deterministic replay tests, browser workflow tests, and legacy HTML JavaScript syntax checks. Contract details are documented in [docs/contracts.md](docs/contracts.md), checklist migration is documented in [docs/checklist-to-test-migration.md](docs/checklist-to-test-migration.md), and replay expectations are documented in [docs/reproducibility.md](docs/reproducibility.md).

For local browser review:

```bash
npm --prefix apps/web run serve
```

Then open:

```text
http://localhost:4173/
```

Use `http://localhost:4173/?dev=1` only for dev-mode truth-label review.

## Naming

Public project name: `COSMOS-CQA`

Long name: `COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts`

Recommended edition label: `COSMOS-CQA Research Edition`

## License

COSMOS-CQA is made available under the project-specific [COSMOS-CQA Research-Only Public License](LICENSE.md). All rights not expressly granted are reserved by AI-Bio Synergy Holdings LLC.

This is a research-source license, not an OSI open-source license.

## Stewardship

COSMOS-CQA is owned and stewarded by AI-Bio Synergy Holdings LLC. See [OWNERSHIP_AND_USE.md](OWNERSHIP_AND_USE.md), [GOVERNANCE.md](GOVERNANCE.md), and [CONTRIBUTING.md](CONTRIBUTING.md).
