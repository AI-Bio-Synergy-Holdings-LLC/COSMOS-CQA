# Original Materials Manifest

Inventory date: 2026-06-27

Source folder:

```text
C:\Users\chuck\Desktop\Lex Resonantia (COSMOS open source)
```

## Files

| File | Size bytes | SHA-256 | Notes |
| --- | ---: | --- | --- |
| `cosmos-20260628T025449Z-3-001.zip` | 4489975 | `C7375E180BD99BC294CF53067C56A97142896A662521004C3BC8F9C00C9C7C6D` | Original COSMOS archive containing HTML demos, docs, SBOMs, test reports, nested CSSFP demo package, and sample assets. |
| `Lex Resonantia (software) (RESEARCH) Thread.md` | 26609937 | `E3729A0B1DD389C2107BADA983FEC5C6CF35FCCA32B1045D33DEB650B6831897` | Large research and ideation thread. Treat as source context, not public-facing project documentation. |

## Initial Assessment

The original archive contains:

- multiple duplicate COSMOS HTML exports;
- stable COSMOS v3 public/dev browser demos;
- SBOM JSON exports;
- 93/93 checklist test reports;
- quickstart and CSSFP docs;
- an OSDMP draft;
- a nested CSSFP Demo v3 package with Core Pack diagnostic concepts.

Known issue:

- the nested CSSFP demo HTML contains doubled JavaScript braces and fails syntax checks until repaired.

## Migration Guidance

Recommended canonical import order:

1. Import stable COSMOS v3 public/dev demo source.
2. Convert the single-file demo into maintainable source modules.
3. Archive duplicate exports outside the main source tree.
4. Repair and merge Core Pack diagnostic concepts from the nested CSSFP demo package.
5. Reconcile all docs with the research-only public license.

## Canonical Legacy Import

The first canonical import is recorded in `legacy-v3/`.

Imported:

- `COSMOS_v3_public.html`
- `COSMOS_v3_dev.html`
- `COSMOS_v3_1_dev.html`
- `COSMOS_TEST_CHECKLIST_v3.html`
- `COSMOS_test_report.json`
- `COSMOS_v3_sbom.json`

These files are preserved as legacy provenance artifacts. They should be modularized into `apps/web/` before becoming the active maintained source.
