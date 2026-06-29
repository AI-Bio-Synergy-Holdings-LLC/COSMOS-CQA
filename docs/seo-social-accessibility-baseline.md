# SEO, Social Preview, Accessibility, and Usability Baseline

This baseline covers the public portal and hosted research workbench at `https://cosmos-cqa.org`.

It is a research-infrastructure quality gate, not a claim of formal WCAG certification, scientific validation, production readiness, regulatory suitability, or OSI open-source status.

## Reference Standards

- WCAG reference: W3C Web Content Accessibility Guidelines 2.2, `https://www.w3.org/TR/WCAG22/`
- Usability reference: Nielsen Norman Group 10 Usability Heuristics for User Interface Design, `https://www.nngroup.com/articles/ten-usability-heuristics/`

## SEO Baseline

| Surface | Current Baseline | Status | Next Evidence Move |
| --- | --- | --- | --- |
| Canonical identity | `https://cosmos-cqa.org` is the single canonical public URL. | In place | Recheck after redirect-domain propagation completes. |
| Crawl controls | `robots.txt` allows indexing and points to `sitemap.xml`. | In place | Confirm through live hosted fetch after each Pages deployment. |
| Sitemap | Sitemap lists the portal root and canonical workbench route. | In place | Add release/docs portal routes if they move from GitHub links into hosted pages. |
| Page titles | Portal and workbench use specific, project-name-led titles. | In place | Keep titles below truncation-prone lengths when adding new pages. |
| Meta descriptions | Portal and workbench describe research-only artifact QA, evidence, provenance, and replay. | In place | Maintain claim-boundary review before future public copy changes. |
| Structured data | Portal publishes `Organization`, `WebSite`, and `SoftwareSourceCode` JSON-LD. | In place | Add release DOI/schema fields only after release DOI metadata exists. |
| Indexable routes | Root portal and workbench route are indexable. | In place | Avoid indexing generated test artifacts, package source paths, or dev-only routes. |

## Social Preview Baseline

| Surface | Current Baseline | Status | Next Evidence Move |
| --- | --- | --- | --- |
| Open Graph | Portal and workbench define `og:title`, `og:description`, `og:url`, `og:type`, and large preview image metadata. | In place | Validate with platform preview tools after DNS and cache propagation. |
| Twitter/X card | Portal and workbench define `summary_large_image` card metadata. | In place | Recheck after social cache refreshes. |
| Preview image | `apps/web/assets/social-preview.png` is 1200x630 and generated from `apps/web/social-preview.html`, which reuses the `portal-hero-canvas` rendering. | In place | Regenerate if public positioning or visual identity materially changes. |
| Alt text | Social image metadata describes the research-only portal and evidence/replay scope. | In place | Keep alt text claim-boundary safe. |

## WCAG 2.2 Baseline Assessment

| WCAG Area | Current Baseline | Status | Next Evidence Move |
| --- | --- | --- | --- |
| Perceivable | Semantic text is used for primary portal/workbench content; decorative canvases are hidden from assistive tech; form controls and key selects have accessible names. | Partially covered | Add automated contrast and non-text-content checks with an accessibility scanner. |
| Operable | Portal and workbench expose skip links, keyboard-addressable native controls, visible focus checks, and reduced-motion handling for the portal canvas. | Partially covered | Add full keyboard traversal tests for portal nav, workbench rail, dialogs, imports, exports, and evidence drawer. |
| Understandable | Public copy states research-only use, claim boundaries, license limits, and stewardship. Workbench controls use stable labels and status captions. | Partially covered | Add error-message tests for import failures, validation failures, and unsupported file paths. |
| Robust | The app uses HTML landmarks, headings, native controls, ARIA labels where needed, and browser automation around key accessibility targets. | Partially covered | Add axe-style regression checks and a screen-reader smoke checklist before claiming higher maturity. |
| WCAG 2.2 additions | Focus visibility is tested; target sizing is mostly supported by existing control dimensions; drag-only workflows are not required for core use. | Early baseline | Add explicit Focus Not Obscured, Target Size, and Accessible Authentication checklist rows before v0.2.x release. |
| Audio control | Optional sonification is user initiated, loop-off by default, visibly caveated, and immediately stoppable. Browser code bounds frequency and software gain but does not control hardware volume or individual sensitivity. | Partially covered | Keep audio safety tests aligned with `docs/public-safety.md` and add screen-reader/audio-conflict review before claiming higher maturity. |

## Nielsen Norman Group Heuristic Baseline

| Heuristic | COSMOS-CQA Baseline | Status | Next Evidence Move |
| --- | --- | --- | --- |
| Visibility of system status | Demo loading, captions, validation status, KPIs, and export states provide feedback. | Partially covered | Add user-visible loading/error states to every import/export path. |
| Match between system and real world | Public copy uses research terms already present in the repo: Core Pack, evidence bundles, provenance hashes, validation reports, deterministic replay. | In place | Add glossary links when docs become hosted pages. |
| User control and freedom | Label undo, bookmarks, local-first import/export, and non-destructive validation support recovery. | Partially covered | Add explicit cancel/reset paths for longer workflows. |
| Consistency and standards | Portal, workbench, docs, citation, and release metadata now share one canonical identity and research-only language. | In place | Keep this enforced through deployment validation. |
| Error prevention | Schemas, validators, and contract tests protect research artifacts before export. | In place | Add browser-visible prevention cues before invalid import attempts. |
| Recognition rather than recall | Navigation, workflow rail labels, and visible control groups keep primary actions discoverable. | Partially covered | Add contextual help only where it reduces research-task friction. |
| Flexibility and efficiency | Keyboard shortcuts and local static operation support repeat workflows. | Partially covered | Add shortcut discoverability without cluttering the main interface. |
| Aesthetic and minimalist design | Portal and workbench keep public positioning focused on evidence, governance, and demo access. | In place | Continue avoiding marketing claims and decorative-only complexity. |
| Help users recognize, diagnose, and recover from errors | Validation report surfaces and import status messages provide early recovery cues. | Partially covered | Improve error copy specificity and link errors to corrective docs. |
| Help and documentation | Quickstart, citation, release artifact index, governance, ownership, and license docs are linked from the portal. | In place | Host a compact docs index on `cosmos-cqa.org` if public search traffic grows. |

## Verification Commands

```bash
npm --prefix apps/web run check:portal-deploy
npm --prefix apps/web run test:browser -- portal.spec.mjs accessibility.spec.mjs
npm --prefix apps/web run pages:prepare
```

For served-route validation:

```powershell
$env:COSMOS_CQA_PORTAL_BASE_URL="http://127.0.0.1:4173"; npm --prefix apps/web run check:portal-deploy
```

## Baseline Limits

- This is not a WCAG conformance claim.
- This is not an accessibility audit by an independent specialist.
- This is not usability testing with representative researchers.
- This is not an audiology, medical, therapeutic, or device-volume safety certification.
- This does not validate diagnostics, scientific findings, regulatory use, clinical use, production service use, or commercial use.
- Social preview rendering can vary by platform cache and crawler behavior.
