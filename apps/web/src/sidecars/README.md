# Sidecars

Owns deterministic audio and visual sidecars for tile review.

Initial extraction targets from legacy v3:

- audio envelope generation;
- playback controls;
- centralized audio safety limits;
- overlay rendering;
- bookmarkable sidecar parameters;
- caption-safe and accessibility-aware sidecar behavior.

Public audio must remain optional, user initiated, loop-off by default, bounded by shared sidecar constants, and described as a review aid rather than a diagnostic, therapeutic, or scientific-result signal.
