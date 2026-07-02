# Public Data Source Candidates

This note records public-source opportunities for improving COSMOS-CQA demo credibility without making the hosted static demo depend on live third-party services.

## Current Policy

The default hosted workbench uses a synthetic Core Pack contract fixture. That fixture is intentionally deterministic, small, local to the repository, and safe for browser automation. It is not public observational data and must not be described as a scientific sample.

Public-source candidates may be added as manifests, source URLs, citations, checksums, and review prompts before any external imagery is bundled or fetched by default. The hosted demo should not require live third-party network access until CORS behavior, rate limits, attribution, caching, license terms, and redistribution rights are reviewed.

## Candidate Ranking

1. DESI Legacy Imaging Surveys cutout references.
   - Best immediate fit for tile-review credibility because the public viewer exposes coordinate-based JPEG/FITS cutout concepts, coadd/model/residual views, and sky coordinates.
   - Candidate manifest: `examples/public-data-candidates/legacy-survey-core-pack.manifest.json`.
   - Source docs: `https://www.legacysurvey.org/dr6/description/` and `https://www.legacysurvey.org/svtips/`.
   - Recommended next step: keep source URLs as references first; add cached thumbnails only after attribution and redistribution terms are reviewed.

2. NASA LAMBDA / Planck public data references.
   - Best domain-aligned source family for future cosmology/CMB reference packs.
   - Source docs: `https://lambda.gsfc.nasa.gov/`, `https://lambda.gsfc.nasa.gov/product/planck/curr/planck_prod_esa.html`, and `https://registry.opendata.aws/nasa-lambda/`.
   - Recommended next step: generate a small deterministic public CMB reference pack offline from permitted products, with checksums and preprocessing notes, instead of live browser fetches.

3. IRSA image APIs.
   - Strong public astronomy API surface for image inventories and cutouts.
   - Source docs: `https://irsa.ipac.caltech.edu/docs/program_interface/api_images.html`.
   - Recommended next step: consider after the Core Pack manifest has a stable public-source reference model.

## WebSocket And HTTP Poll Boundary

The workbench already supports WebSocket and HTTP poll inputs for research artifact streams. For the public portal, use repository-hosted fixtures or user-supplied local endpoints first. Public third-party endpoints should remain optional integration candidates because they can fail due to CORS, rate limiting, outages, upstream content changes, or terms changes.

For a future full application with authenticated researchers, live pipelines can be added behind explicit access controls, source agreements, data-use notices, and replayable provenance captures.

## Claim Boundary

Public data source candidates are evidence-plumbing references. They do not provide COSMOS-CQA truth labels, validated detections, diagnostic findings, survey-quality claims, or cosmological inference. Any researcher or citizen observation recorded from these references remains a note-only research artifact until independently reviewed and scientifically validated.
