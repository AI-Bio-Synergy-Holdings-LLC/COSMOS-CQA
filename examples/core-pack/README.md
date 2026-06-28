# Example Core Pack

This directory will contain small sample manifests and permitted demo references.

Current examples:

- `core-pack.manifest.json`: synthetic Core Pack intake sample with tile passports, SBOM/evidence references, and documentation-only diagnostic concepts.
- `replay-fixture.json`: synthetic deterministic replay fixture used by `npm --prefix apps/web run test:replay`.

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
