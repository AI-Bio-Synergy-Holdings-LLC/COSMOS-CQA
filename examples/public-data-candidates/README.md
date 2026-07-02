# Public Data Candidates

This directory holds source-linked candidate manifests for future public-data Core Pack work.

These files do not make the hosted demo depend on live third-party services. They preserve official source URLs, review prompts, citation notes, and rights-review boundaries so COSMOS-CQA can evaluate public tiles before deciding whether to cache, preprocess, or serve any external material.

Current candidates:

- `legacy-survey-core-pack.manifest.json`: DESI Legacy Imaging Surveys cutout references for coadd and residual image review concepts.

Validate the candidate manifest from the repository root:

```bash
node apps/web/scripts/validate-core-pack.mjs examples/public-data-candidates/legacy-survey-core-pack.manifest.json
```
