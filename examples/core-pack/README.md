# Example Core Pack

This directory will contain small sample manifests and permitted demo references.

Current examples:

- `core-pack.manifest.json`: synthetic Core Pack intake sample with tile passports, SBOM/evidence references, and documentation-only diagnostic concepts.
- `replay-fixture.json`: synthetic deterministic replay fixture used by `npm --prefix apps/web run test:replay`.

The browser workbench loads `core-pack.manifest.json` through the public sample button when served by `apps/web/scripts/serve.mjs`. Uploading a JSON feed or Core Pack manifest records a research artifact source hash for validation report export.

Do not commit restricted third-party datasets here. Prefer:

- synthetic previews;
- tiny permitted examples;
- checksums;
- source URLs;
- access instructions;
- data-use notes.

Validate the intake sample from the repository root:

```bash
npm --prefix apps/web run validate:core-pack
```
