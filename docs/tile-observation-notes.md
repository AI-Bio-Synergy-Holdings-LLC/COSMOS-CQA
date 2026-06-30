# Tile Observation Notes

Tile observations are reviewer-authored spatial notes linked to a submitted label. They preserve where a reviewer clicked on the source tile, what label was submitted, what visual sidecars were active, and the note text that explains the observation.

## What The Pin Means

- `x_norm` and `y_norm` are normalized source-tile coordinates from 0 to 1.
- `zone_id` and `zone_label` identify the deterministic 3x3 review sector.
- `zone_taxonomy` adds row band, column band, quadrant, radial band, and coordinate-percent context for summaries.
- Viewer zoom, pan, and rotation are display transforms only. Submitted observations store normalized source-tile coordinates after the screen click is mapped back through the inverse viewer transform.
- The pin is a location cue inside the reviewed tile. It is not a measured sky coordinate, source catalog position, physical parameter estimate, or validated detection.

## How To Write Notes

Use notes to describe:

- what visual cue was seen;
- where it appears relative to the tile sector;
- which overlay, palette, or sidecar made it easier to see;
- whether the cue is tentative, ambiguous, repeated, or isolated.

Good notes are short, observational, and bounded. Example:

```text
faint vertical band in top center zone; clearer with gradient overlay
```

Avoid personal data, medical claims, private identifiers, unsupported diagnostic conclusions, and claims that the observation proves a cosmological effect.

## How To Interpret Summaries

Observation summaries aggregate reviewer-authored pins into counts by tile, zone, row band, column band, radial band, class, and severity. These summaries can help reviewers find repeated attention patterns, compare review sessions, and inspect whether observations cluster in particular sectors.

Observation summaries do not prove artifact presence, model performance, data quality, or scientific validity. They are evidence about the review process and should be interpreted alongside tile passports, provenance hashes, validation reports, diagnostic caveats, and claim-boundary documents.

## Contract Surfaces

- `tileObservation`: raw linked observation record.
- `tileObservationSummary`: derived counts for validation reports and evidence bundles.
- `validationReport.observation_summary`: report-level observation summary when pins exist.
- `evidenceBundle.observation_summary`: bundle-level observation summary when pins exist.

These surfaces are additive and preserve replay. Source tile pixels are not modified.

## Viewer Transforms

The workbench supports zoom, pan, rotate, and reset controls for closer inspection. These controls do not change the tile pixels or the observation contract. Pins remain tied to source-tile coordinates, and marker placement is recalculated from the active viewer transform.

Use reset when comparing observations across reviewers or when preparing screenshots for issue reports.
