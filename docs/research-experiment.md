# COSMOS-CQA Research Experiment

COSMOS-CQA asks whether a browser-native, public, human-in-the-loop workbench can make cosmology artifact review more reproducible, inspectable, accessible, and scientifically careful.

COSMOS-CQA is available for research-only public use under the project-specific COSMOS-CQA Research-Only Public License. It is not an OSI open-source release, not a production decision system, and all rights not expressly granted are reserved by AI-Bio Synergy Holdings LLC.

## What Experiment Is This Workbench Modeling?

The modeled experiment is a research-infrastructure experiment:

Can visual tiles, sidecar views, spatial tile observations, observation review ledgers, labels, evidence bundles, provenance hashes, and deterministic replay help researchers and public contributors review artifact candidates in a way that is auditable after the session ends?

The current public sample uses synthetic Core Pack material to exercise this workflow safely. It models a quality-assurance surface that could support future artifact review for public cosmology data cultures around CMB maps, weak-lensing products, survey images, and catalog release evidence.

## What Does The Current Prototype Demonstrate?

- Core Pack intake for tile passports, evidence references, SBOM references, diagnostics, and provenance context.
- Tile review controls for navigation, overlays, palettes, captions, spatial observation pinning, labels, undo, bookmarks, calibration, and public truth-label hiding.
- Evidence exports for validation report JSON, session JSON, evidence bundle JSON, SBOM JSON, and replayable bookmark state.
- Deterministic replay tests and golden fixtures for the sample workflow and public/dev display boundaries.

## Core Engine Fundamentals Exposed Publicly

COSMOS-CQA exposes the research workflow fundamentals needed to audit the public prototype:

- Data contract: Core Pack manifests identify tiles, passports, evidence references, SBOM references, diagnostic placeholders, and release stewardship.
- Tile passport: each tile can carry dataset context, coordinates, checksum, sidecars, provenance, and truth-policy language.
- Review sidecars: overlays, palettes, captions, spatial observation pins, and sonic loops provide alternate ways to inspect the same review object.
- Evidence chain: tile observations, observation review events, labels, bookmarks, reports, hashes, sessions, and bundles preserve what happened during review.

The public project does not expose or imply proprietary future diagnostic claims.

Tile observation pins are interpreted as reviewer-authored source-tile location cues. The detailed note boundary is maintained in `docs/tile-observation-notes.md`.

Observation review events record create, edit, delete, and restore workflow history. Reviewer confidence, review status, and adjudication/consensus placeholders are audit fields only; they do not establish validated detections or scientific consensus.

## How The Sonic Loop Must Be Explained

The sonic loop is a deterministic sonification sidecar. In the current workbench, it turns selected tile-derived values into a short repeatable auditory contour so a reviewer can listen for changes in rhythm, pitch, or texture while still using visual overlays, captions, and written evidence.

It must be described as a perception, accessibility, attention, and training aid.

It must also be described as optional, user initiated, and bounded. Browser code can limit frequency and software gain, but it cannot control device volume, headphones, room acoustics, or individual sensitivity.

It must not be described as:

- an independent detector;
- a classifier;
- a scientific measurement;
- a validated diagnostic;
- a replacement for visual, statistical, or expert review.

Any future scientific use would require a documented mapping, controlled evaluation, accessibility review, bias/error analysis, and reproducible evidence.

Public explanation:

> The sound is another way to inspect the same tile-sidecar data. It helps people notice patterns, compare states, and include contributors who benefit from auditory review. It does not decide the label.

## How Researchers And Citizens Benefit

Researchers benefit from a lightweight way to prototype artifact QA protocols, inspect evidence trails, test public review workflows, and discuss limitations before scaling.

Public contributors benefit from a transparent path into research participation that teaches evidence structure, uncertainty, reproducibility, and responsible claim boundaries.

Open research benefits when citizen science participation is paired with contracts, provenance, validation reports, accessibility, and local-first data handling.

## What Is Explicitly Not Claimed Yet?

- The current public demo does not validate a cosmology diagnostic or publish scientific results.
- The sonic loop does not classify artifacts, discover signals, or replace visual/statistical review.
- The sonic loop is not a therapeutic, medical, or biologically active sound-frequency system.
- The sample Core Pack is synthetic demonstration material, not a restricted third-party science dataset.
- Public mode hides truth labels; dev truth display is only for explicit local development review.
- COSMOS-CQA is research-only public infrastructure, not an OSI open-source release and not a production decision system.

## Public References

- [ESA Planck Legacy Archive](https://pla.esac.esa.int/)
- [NASA LAMBDA WMAP data products](https://lambda.gsfc.nasa.gov/product/wmap/current/)
- [NASA LAMBDA ACT products](https://lambda.gsfc.nasa.gov/product/act/)
- [Dark Energy Survey Data Release 2](https://des.ncsa.illinois.edu/releases/dr2)
- [Galaxy Zoo / Zooniverse](https://www.zooniverse.org/projects/zookeeper/galaxy-zoo/)
- [NASA Chandra Data Sonification](https://chandra.si.edu/sound/)
- [The Sonification Handbook](https://sonification.de/handbook/)

These references ground the public science, citizen science, and sonification context. They do not imply endorsement, data redistribution permission, scientific validation, or production fitness for COSMOS-CQA.
