# Reproducibility

COSMOS-CQA treats deterministic replay as a release requirement. The current replay fixture is intentionally small and synthetic, but it exercises the same modules used by the browser workbench.

## Golden Fixture

The first golden fixture lives at:

```text
examples/core-pack/replay-fixture.json
```

It records:

- seeded synthetic tile metadata and pixel digest;
- deterministic sidecar audio-map digest;
- provenance bookmark payload and encoded state;
- label export CSV rows and digest;
- Core Pack manifest validation summary;
- caveated diagnostic placeholder outputs and digest;
- validation report and SBOM digests;
- research session serialized digest and reload plan;
- public/dev truth-label display policy.

## Replay Check

Run replay tests from the repository root:

```bash
npm --prefix apps/web run test:replay
```

The main verification command also runs replay tests:

```bash
npm --prefix apps/web run check
```

## Guarantee

For a given fixture seed, schema version, synthetic Core Pack fixture manifest, research session fixture, and module version, the replay suite must produce the same tile digest, sidecar digest, bookmark state, CSV export, Core Pack validation summary, diagnostic placeholder outputs, report summary, session reload plan, and public/dev visibility policy.

Any intentional change to these outputs should update the fixture and explain the reason in the commit or release notes.
