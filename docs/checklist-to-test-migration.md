# Checklist-to-Test Migration Plan

The legacy manual checklist remains archived at `archive/original-materials/legacy-v3/COSMOS_TEST_CHECKLIST_v3.html`.
It is provenance evidence, not the maintained test source.

## Current Baseline

- Source hash: `sha256:B76893EF9C2D6CD093BF6435D71F2199BDE9712187F9A073E72DD05582E8A160`
- Legacy claimed total: `100`
- Extracted manual checklist targets: `86`
- Extracted bridge auto-check targets: `7`
- Current migrated manual targets: `44`
- Current browser-covered targets: `48`
- Tracked manifest: `tests/evidence/legacy-v3-checklist-targets.json`

The legacy page displays a `0/100` counter, but the archived HTML contains 93 trackable targets: 86 manual checklist items plus 7 bridge auto-checks. The tracked manifest preserves that discrepancy instead of treating the UI counter as canonical.

## Migration Rule

Each legacy checklist item becomes a stable target with:

- `id`: deterministic target identifier.
- `source_line`: original archived checklist line.
- `section`: legacy checklist section.
- `label`: ASCII-normalized target text.
- `mode`: `manual` or `bridge`.
- `automation`: current automation state.
- `status`: migration state.
- `data_testid`: bridge target hook when present.
- `covered_by`: automated test path when the target has browser or contract coverage.

Regenerate the manifest from the repository root with:

```bash
npm --prefix apps/web run evidence:checklist
```

The generator validates the output with the `checklistTestTargets` contract before writing the manifest.

## Migration Phases

1. Preserve the source checklist in `archive/original-materials/legacy-v3/`.
2. Track every manual and bridge checklist item in `tests/evidence/legacy-v3-checklist-targets.json`.
3. Keep current contract, replay, browser workflow, source syntax, legacy extraction, and legacy syntax checks under `npm --prefix apps/web run check`.
4. Promote stable manual targets into automated tests as browser coverage becomes available.
5. Retire manual-only status only after an automated assertion covers the target and passes in CI.

## Initial Automation Buckets

- Contracts: labels, feeds, bookmarks, reports, SBOM references, tile passports, core pack manifests, and checklist target manifests.
- Deterministic replay: tile synthesis, sidecars, bookmarks, CSV, reports, and public/dev truth-label policy.
- Legacy bridge targets: audio determinism, bookmark creation, bookmark round trip, IRR alpha threshold, public truth hiding, accessibility threshold, and SBOM export.
- Browser workflows: tile navigation, overlay/palette rendering, label submit/undo, metrics/charts, CSV export, data import/sample load, bookmark creation/reload, accessibility focus/caption checks, and public truth-label hiding.

## Next Test Targets

The migrated browser targets are covered by `apps/web/test/browser/workflows.spec.mjs`.

The highest leverage manual targets to automate next are:

- audio sonification controls and deterministic playback bridge coverage;
- calibration wizard step/score behavior;
- expert queue confirm/override behavior;
- SBOM download content checks;
- remaining UI polish workflows such as fullscreen, disabled states, details toggles, and responsive layout.
