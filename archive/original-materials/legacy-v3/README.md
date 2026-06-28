# Legacy COSMOS v3 Import

This directory contains the first canonical legacy import from the original COSMOS archive.

These files are preserved as source provenance, not as the long-term maintainable application source. The clean source migration lives under `apps/web/`.

## Imported Files

| File | Original archive path | SHA-256 |
| --- | --- | --- |
| `COSMOS_v3_public.html` | `cosmos/COSMOS_v3_public.html` | `1E1F120DCE48CDC88F022390F42AC249C0B3C8F9C4288A69C5864E63B7B5450B` |
| `COSMOS_v3_dev.html` | `cosmos/COSMOS_v3_dev.html` | `8FBA220FE3760D84A28312390C0E017B33E114156D2DBD35731FB5778B2D563D` |
| `COSMOS_v3_1_dev.html` | `cosmos/COSMOS_v3.1_dev.html` | `E31D1962BE2B25EBCEBE1109CEF69AC944AD10ABE552D95DB431A2999B8C9D5C` |
| `COSMOS_TEST_CHECKLIST_v3.html` | `cosmos/COSMOS_TEST_CHECKLIST_v3.html` | `B76893EF9C2D6CD093BF6435D71F2199BDE9712187F9A073E72DD05582E8A160` |
| `COSMOS_test_report.json` | `cosmos/COSMOS_test_report.json` | `3E5AC018F608EB754AA5892E284BD3231ACCF09C95B451997CE80150BA76D4D8` |
| `COSMOS_v3_sbom.json` | `cosmos/COSMOS_v3_sbom (2).json` | `58C8EA72CC6DB4457EA3D1C5241289F8024CFA653E22FBCF33CEB39A46E17ECE` |

## Notes

- `COSMOS_v3.1_dev.html` was renamed to `COSMOS_v3_1_dev.html` for path stability.
- The nested CSSFP Demo v3 package is not imported here because its HTML currently fails JavaScript syntax checks due to doubled template braces.
- The public and dev v3 HTML files pass JavaScript syntax checks with `npm --prefix apps/web run check:legacy`.

