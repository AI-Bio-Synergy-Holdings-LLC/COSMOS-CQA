# Public Safety And Use Boundaries

COSMOS-CQA is a research-only public workbench. This document records safety and liability hardening boundaries for public surfaces, with audio sonification treated as the first-class risk surface.

This is an engineering and public-copy guardrail, not legal, medical, audiology, or regulatory advice.

## Audio Sonification Boundary

The sonic loop is optional, user initiated, and immediately stoppable. It is a deterministic sonification sidecar for tile review, not a detector, classifier, therapeutic sound, medical tool, accessibility accommodation guarantee, diagnostic, or scientific measurement.

The maintained public workbench must:

- avoid autoplay;
- keep looping off by default;
- expose a visible Play/Pause control and keyboard-accessible stop path;
- keep captions available;
- keep playback frequency and software gain bounded by shared sidecar constants;
- explain that browser code cannot control hardware volume, headphones, room acoustics, or individual sensitivity;
- warn reviewers to keep device volume low and stop if sound is uncomfortable.

The current public bounds are maintained in `packages/core/src/sidecars/index.js`:

- frequency contour: 180 Hz to 600 Hz;
- output gain: 0.04 software gain in the browser audio node;
- base contour duration: 6000 ms before playback-rate adjustment;
- playback-rate control: 0.5x to 2x;
- default looping: off.

## Sensitive User Notice

Public copy should mention that audio may be unsuitable for some reviewers, including people with hearing sensitivity, tinnitus, migraine, sensory sensitivity, assistive audio conflicts, shared audio environments, or any condition where unexpected sound is uncomfortable.

The visual workbench should also avoid implying safety certification. The project should preserve reduced-motion support, avoid flashing content, keep captions/status text available, and route accessibility feedback through the public contact route.

Safety and accessibility reports should use the repository issue templates when the report can be public and non-confidential. Reports must not include personal health information, regulated data, restricted datasets, credentials, private keys, confidential screenshots, private source code, or medical/audiology advice.

Security vulnerabilities or sensitive safety details should follow the private disclosure route in `SECURITY.md` and `docs/security-disclosure.md` rather than public issue templates.

## Claim Boundaries

Do not claim that the sonic loop:

- improves hearing, cognition, wellness, stress, attention, or health;
- uses beneficial or biologically active frequencies;
- detects artifacts, cosmological signals, or scientific anomalies;
- replaces visual, statistical, expert, or reproducibility review;
- is safe for every person, device, volume level, or environment.

Allowed wording:

> The sound is an optional way to inspect the same review object. It can help some reviewers notice patterns or compare states. It does not decide the label, validate an artifact, or produce a result.

## Maintained Checks

The safety boundary should be protected by:

- unit tests for shared audio limits and deterministic audio maps;
- browser tests for no autoplay, loop-off default, visible safety notice, stop behavior, and bounded mock audio parameters;
- portal tests for the public safety page and cross-links;
- deployment validation requiring `safety.html`, `docs/public-safety.md`, private disclosure routing, and safety-page sitemap coverage.

## Reference Anchors

- [WCAG 2.2 Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)
- [WCAG 2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [WCAG 2.2 Three Flashes or Below Threshold](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- [CDC/NIOSH Noise and Hearing Loss Prevention](https://www.cdc.gov/niosh/noise/prevent/understand.html)
- [NASA Chandra Data Sonification](https://chandra.si.edu/sound/)
- [The Sonification Handbook](https://sonification.de/handbook/)
