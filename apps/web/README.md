# COSMOS QA Workbench

This directory will contain the browser workbench source for COSMOS-CQA.

Planned responsibilities:

- tile viewer;
- artifact labeling workflow;
- deterministic sidecar playback;
- calibration flow;
- expert queue;
- metrics dashboard;
- provenance export;
- validation report export.

The first canonical import comes from the stable COSMOS v3 public/dev demo after duplicate exports are filtered. The byte-preserved legacy artifacts live in `../../archive/original-materials/legacy-v3/`.

## Current Verification

Run the legacy syntax check from the repository root:

```bash
npm --prefix apps/web run check:legacy
```

This validates JavaScript syntax in the imported v3 HTML files before they are split into maintainable modules.

## Migration Target

The long-term source should separate:

- `tile-synthesis`
- `sidecars`
- `labels`
- `metrics`
- `expert-review`
- `provenance`
- `reports`
- `ui`

