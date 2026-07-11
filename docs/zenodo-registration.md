# Zenodo Registration and DOI Record

COSMOS-CQA is registered on Zenodo as a citable public research software artifact.

## Citation Identity

- Title: `COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts`
- Creator/steward: `AI-Bio Synergy Holdings LLC`
- Repository: `https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA`
- Canonical URL: `https://cosmos-cqa.org`
- License reference: `COSMOS-CQA Research-Only Public License`
- Zenodo license registry value: `other-closed`
- Zenodo all-versions DOI: `10.5281/zenodo.21112698`
- Zenodo `v0.1.1-research-alpha` release DOI: `10.5281/zenodo.21112699`
- Zenodo `v0.1.2-research-alpha` release DOI: `10.5281/zenodo.21142690`
- Zenodo `v0.1.3-research-alpha` release DOI: `10.5281/zenodo.21285595`
- Zenodo `v0.1.4-research-alpha` release DOI: `10.5281/zenodo.21315776`

The Zenodo registry value is intentionally conservative. It avoids implying OSI open-source, Creative Commons, commercial reuse, production use, hosted-service use, clinical use, regulatory use, sublicensing, or derivative product rights. The repository `LICENSE.md` controls public-use terms.

## Registration Sequence

Completed for the first DOI-minted release:

1. Merged the Zenodo metadata PR into `main`.
2. Connected the public GitHub repository `AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA` in Zenodo.
3. Confirmed Zenodo used `.zenodo.json` from the repository root.
4. Created GitHub release `v0.1.1-research-alpha` after CI, CodeQL, and public portal deployment validation were green.
5. Confirmed the Zenodo release record uses the controlled title, creator, canonical URL, repository URL, `other-closed` license metadata, and research-only rights language.
6. Replaced pending DOI placeholders with the minted DOI badge and DOI URL in:
   - `README.md`;
   - `CITATION.cff`;
   - `docs/citation.md`;
   - `docs/releases/README.md`;
   - the release notes for the DOI-minted release;
   - `apps/web/index.html`;
   - `apps/web/demo-workbook.html`;
   - `apps/web/workbench.html`;
   - `apps/web/citation.html`;
   - `apps/web/releases.html`.

## Current DOI Status

The first Zenodo DOI has been minted, and `v0.1.4-research-alpha` has been archived as the latest Zenodo version.

- Latest Zenodo record: `https://zenodo.org/records/21315776`
- Latest Zenodo API record: `https://zenodo.org/api/records/21315776`
- All-versions concept DOI: `https://doi.org/10.5281/zenodo.21112698`
- `v0.1.1-research-alpha` release DOI: `https://doi.org/10.5281/zenodo.21112699`
- `v0.1.2-research-alpha` release DOI: `https://doi.org/10.5281/zenodo.21142690`
- `v0.1.3-research-alpha` release DOI: `https://doi.org/10.5281/zenodo.21285595`
- `v0.1.4-research-alpha` release DOI: `https://doi.org/10.5281/zenodo.21315776`

## Alignment Responsibilities

Keep these surfaces aligned when a new DOI-minted release is created:

- `.zenodo.json` title, steward, related identifiers, keywords, version, license registry value, and rights notes;
- `CITATION.cff` DOI, identifiers, canonical URL, repository URL, and research-only license reference;
- `README.md`, `docs/citation.md`, `docs/releases/README.md`, and the release note for the DOI-minted tag;
- `apps/web/index.html` structured data, public citation meta tags, `apps/web/demo-workbook.html`, `apps/web/workbench.html`, `apps/web/citation.html`, `apps/web/releases.html`, and `apps/web/docs.html`;
- GitHub repository description and homepage URL;
- Zenodo record title, creator, publication date, release DOI, all-versions DOI, repository link, canonical portal link, license marker, and rights notes.

## Post-Mint Citation Pattern

```text
AI-Bio Synergy Holdings LLC. COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts, v0.1.1-research-alpha. Research-source software. Zenodo. https://doi.org/10.5281/zenodo.21112699
```

For `v0.1.2-research-alpha`, use the version-specific DOI:

```text
AI-Bio Synergy Holdings LLC. COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts, v0.1.2-research-alpha. Research-source software. Zenodo. https://doi.org/10.5281/zenodo.21142690
```

For `v0.1.3-research-alpha`, use the version-specific DOI:

```text
AI-Bio Synergy Holdings LLC. COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts, v0.1.3-research-alpha. Research-source software. Zenodo. https://doi.org/10.5281/zenodo.21285595
```

For `v0.1.4-research-alpha`, use the version-specific DOI:

```text
AI-Bio Synergy Holdings LLC. COSMOS-CQA: Citizen Quality Assurance for Cosmology Artifacts, v0.1.4-research-alpha. Research-source software. Zenodo. https://doi.org/10.5281/zenodo.21315776
```

Also cite the canonical portal and repository when needed:

```text
https://cosmos-cqa.org
https://github.com/AI-Bio-Synergy-Holdings-LLC/COSMOS-CQA
```
