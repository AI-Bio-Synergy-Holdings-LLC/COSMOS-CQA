# Data Governance

COSMOS-CQA should prefer manifests, checksums, derived synthetic examples, small permitted previews, and documented download instructions over committing raw third-party datasets.

## Data Principles

- Use public or properly licensed data.
- Preserve source, release, DOI or URL, checksum, and transformation metadata.
- Do not redistribute restricted datasets unless terms explicitly allow redistribution.
- Keep volunteer identifiers hashed or synthetic.
- Avoid personally identifying information.
- Store reproducibility parameters in machine-readable manifests.

## Third-Party Data

NASA, ESA, DES, ACT, Planck, WMAP, and other external datasets remain subject to their own terms. COSMOS-CQA documentation and examples must clearly distinguish project code from external data rights.

## Evidence Artifacts

Expected evidence artifacts include:

- core pack manifest;
- tile passport;
- label export;
- expert adjudication export;
- SBOM;
- validation report JSON;
- validation report PDF or human-readable summary.

