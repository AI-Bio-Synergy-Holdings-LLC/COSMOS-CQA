# Tile Observation Notes

Tile observations are reviewer-authored spatial notes linked to a submitted label. They preserve where a reviewer clicked on the source tile, what label was submitted, what visual sidecars were active, and the note text that explains the observation.

## What The Pin Means

- `x_norm` and `y_norm` are normalized source-tile coordinates from 0 to 1.
- `zone_id` and `zone_label` identify the deterministic 3x3 review sector.
- `zone_taxonomy` adds row band, column band, quadrant, radial band, and coordinate-percent context for summaries.
- Viewer zoom, pan, and rotation are display transforms only. Submitted observations store normalized source-tile coordinates after the screen click is mapped back through the inverse viewer transform.
- The note field auto-inserts a compact coordinate cue such as `Tile coordinates: x=0.4200, y=0.2100 (42% x, 21% y; top center). Observation:`. The cue is a source-tile location reference, and the reviewer should add the actual observation text after it.
- The pin is a location cue inside the reviewed tile. It is not a measured sky coordinate, source catalog position, physical parameter estimate, or validated detection.

## How To Write Notes

Use notes to describe:

- what visual cue was seen;
- where it appears relative to the tile sector;
- which overlay, palette, or sidecar made it easier to see;
- whether the cue is tentative, ambiguous, repeated, or isolated.

Good notes are short, observational, and bounded. Example:

```text
Tile coordinates: x=0.4200, y=0.2100 (42% x, 21% y; top center). Observation: faint vertical band in top center zone; clearer with gradient overlay
```

Avoid personal data, medical claims, private identifiers, unsupported diagnostic conclusions, and claims that the observation proves a cosmological effect.

## How To Interpret Summaries

Observation summaries aggregate reviewer-authored pins into counts by tile, zone, tile-zone pair, row band, column band, radial band, class, severity, note status, review state, review status, consensus placeholder status, and QA metrics. These summaries can help reviewers find repeated attention patterns, compare review sessions, and inspect whether observations cluster in particular sectors.

Observation summaries do not prove artifact presence, model performance, data quality, or scientific validity. They are evidence about the review process and should be interpreted alongside tile passports, provenance hashes, validation reports, diagnostic caveats, and claim-boundary documents.

## Review And QA Edits

The Observation Review workspace lets a reviewer select a submitted pin, highlight its tile marker, revise the synced class/severity/note fields, and remove the observation from active exports when it should not be carried forward. Saved edits add review metadata to the active label and observation records:

- `review_state`
- `review_revision`
- `updated_at`
- `updated_by`
- `edit_summary`
- `review_status`
- `reviewer_confidence`
- `consensus_status`
- `adjudication_state`

Create, edit, delete, and restore actions also append `observationReviewEvent` records to an immutable review ledger. The ledger remains exportable in research sessions, validation reports, and evidence bundles even when a delete action removes the synced label and observation from active exports. The in-session Undo Delete control restores the exact deleted pair while the page remains open.

`review_status=needs-adjudication` and `consensus_status=needs-adjudication` are workflow placeholders. They mean the observation should receive independent expert review before any consensus interpretation. They are not clinical claims, validated detections, scientific consensus, or production adjudication.

## Adjudication Queue

The Adjudication Queue filters active observations whose review or consensus status is `needs-adjudication`. Selecting a queued row highlights the tile marker, shows the active observation fields, and lists the selected observation's ledger history.

Queue decisions are intentionally narrow:

- `defer`: keeps the observation in the queue for later review.
- `request-second-review`: records that independent review is needed before any consensus interpretation.
- `mark-reviewed`: moves the observation out of the queue as a single-reviewer QA workflow state only.

Each queue action requires an adjudication note and appends an `observationReviewEvent` such as `adjudication-defer`, `adjudication-second-review`, or `adjudication-reviewed`. These events preserve workflow history; they do not validate the observation, assert scientific consensus, or convert the pin into measured sky coordinates.

## Contract Surfaces

- `tileObservation`: raw linked observation record.
- `observationReviewEvent`: append-only audit event for create/edit/delete/restore and adjudication-queue review actions.
- `tileObservationSummary`: derived counts for validation reports and evidence bundles.
- `validationReport.observation_summary`: report-level observation summary when pins exist.
- `validationReport.observation_review_events`: report-level review ledger history.
- `evidenceBundle.observation_summary`: bundle-level observation summary when pins exist.
- `evidenceBundle.observation_review_events`: bundle-level review ledger history.

These surfaces are additive and preserve replay. Source tile pixels are not modified.

## Viewer Transforms

The workbench supports zoom, pan, rotate, and reset controls for closer inspection. These controls do not change the tile pixels or the observation contract. Pins remain tied to source-tile coordinates, and marker placement is recalculated from the active viewer transform.

Use reset when comparing observations across reviewers or when preparing screenshots for issue reports.
