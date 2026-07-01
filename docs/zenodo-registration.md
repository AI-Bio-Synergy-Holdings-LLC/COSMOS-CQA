# Zenodo Registration And DOI Plan

COSMOS-CQA should be registered on Zenodo as a citable public research software artifact after the repository metadata lands on `main`.

## Citation Identity

- Title: `COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts`
- Creator/steward: `AI-Bio Synergy Holdings LLC`
- Repository: `https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA`
- Canonical URL: `https://cosmos-cqa.org`
- License reference: `COSMOS-CQA Research-Only Public License`
- Zenodo license registry value: `other-closed`

The Zenodo registry value is intentionally conservative. It avoids implying OSI open-source, Creative Commons, commercial reuse, production use, hosted-service use, clinical use, regulatory use, sublicensing, or derivative product rights. The repository `LICENSE.md` controls public-use terms.

## Registration Sequence

1. Merge the Zenodo metadata PR into `main`.
2. In Zenodo, connect the public GitHub repository `AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA`.
3. Confirm Zenodo sees `.zenodo.json` in the repository root.
4. Do not mint a DOI from a partial metadata state.
5. Create the next clean public release tag, expected `v0.1.1-research-alpha`, after CI, CodeQL, and public portal deployment validation are green.
6. Confirm the Zenodo release record uses the controlled title, creator, canonical URL, repository URL, and research-only rights language.
7. Replace pending DOI placeholders with the minted DOI badge and DOI URL in:
   - `README.md`;
   - `CITATION.cff`;
   - `docs/citation.md`;
   - `docs/releases/README.md`;
   - the release notes for the DOI-minted release;
   - `apps/web/citation.html`;
   - `apps/web/releases.html`.

## Current DOI Status

No Zenodo DOI has been minted for COSMOS-CQA yet.

The current public badge and citation pages intentionally say `pending v0.1.1-research-alpha` until the first Zenodo-archived release exists. Do not replace the pending badge with a DOI-like string until Zenodo has issued the actual DOI.

## Post-Mint Citation Pattern

```text
AI-Bio Synergy Holdings LLC. COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts, v0.1.1-research-alpha. Research-source software. Zenodo. https://doi.org/[issued-doi]
```

Also cite the canonical portal and repository when needed:

```text
https://cosmos-cqa.org
https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA
```
