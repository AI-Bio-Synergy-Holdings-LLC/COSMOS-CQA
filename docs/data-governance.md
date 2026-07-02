# Data Governance

COSMOS-CQA should prefer manifests, checksums, derived synthetic examples, small permitted previews, and documented download instructions over committing raw third-party datasets.

## Data Principles

- Use public or properly licensed data.
- Preserve source, release, DOI or URL, checksum, and transformation metadata.
- Do not redistribute restricted datasets unless terms explicitly allow redistribution.
- Keep volunteer identifiers hashed or synthetic.
- Avoid personally identifying information.
- Store reproducibility parameters in machine-readable manifests.
- Route public reports through non-confidential GitHub issue templates or contact email summaries.
- Route vulnerability reports and sensitive safety details through the private disclosure path rather than public issues.
- Prefer synthetic examples, public references, and redacted screenshots in public reports.

## Third-Party Data

NASA, ESA, DES, ACT, Planck, WMAP, and other external datasets remain subject to their own terms. COSMOS-CQA documentation and examples must clearly distinguish project code from external data rights.

## Public Reporting Data

GitHub issues, pull requests, and public discussion surfaces are public by default. Reports about safety, accessibility, bugs, schemas, or data/provenance should not include restricted datasets, personal data, personal health information, regulated data, credentials, private keys, confidential screenshots, private source code, or third-party materials that cannot be shared.

Vulnerability reports, reproducible exploit steps, deployment-secret exposure, and sensitive safety details should follow `SECURITY.md` and `docs/security-disclosure.md` instead of public issue templates.

The hosted portal is static and local-first. Imported files, labels, bookmarks, exported reports, sessions, CSVs, SBOMs, and evidence bundles are handled in the user's browser environment unless the user shares them through GitHub, email, or another external service.

Reviewer handoff and return packets are also local JSON artifacts in the current public portal. Preparing or importing a reviewer packet does not authenticate a reviewer, assign an expert queue, or transmit observations to AI-Bio Synergy Holdings LLC or another review service. Treat `reviewer_id` and related identity fields as metadata unless a future authenticated service verifies them.

A separate selective-access COSMOS-CQA application is planned for verified researchers and institutions. Until that application has its own access terms, data handling, security controls, and operational responsibilities, public documentation should not imply that the hosted demo collects, stores, or routes research submissions.

## Evidence Artifacts

Expected evidence artifacts include:

- core pack manifest;
- tile passport;
- diagnostic concept caveats;
- research artifact record;
- provenance hash;
- label export;
- expert adjudication export;
- SBOM;
- validation report JSON;
- validation report PDF or human-readable summary when implemented;
- reviewer intake and return packets.
