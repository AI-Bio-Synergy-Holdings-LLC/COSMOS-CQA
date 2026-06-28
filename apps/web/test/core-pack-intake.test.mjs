import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { assertContract } from "../../../packages/schemas/src/index.js";
import {
  assertCorePackManifest,
  validateCorePackManifest,
} from "../../../packages/core/src/core-pack/index.js";
import {
  DIAGNOSTIC_CONCEPTS,
  diagnosticRefsForCorePack,
} from "../../../packages/core/src/diagnostics/index.js";

const manifest = JSON.parse(
  await readFile(new URL("../../../examples/core-pack/core-pack.manifest.json", import.meta.url), "utf8"),
);

test("sample Core Pack manifest satisfies schema and intake validation", () => {
  assertContract("corePackManifest", manifest);
  assertCorePackManifest(manifest);

  const result = validateCorePackManifest(manifest);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.summary, {
    manifest_id: "corepack_demo-v0.1.0-intake",
    tile_count: 2,
    sbom_ref_count: 1,
    evidence_ref_count: 5,
    diagnostic_ref_count: 2,
  });
});

test("diagnostic references remain concept-only and caveated", () => {
  assert.deepEqual(
    manifest.diagnostic_refs.map((concept) => concept.diagnostic_id),
    DIAGNOSTIC_CONCEPTS.map((concept) => concept.diagnostic_id),
  );
  assert.deepEqual(manifest.diagnostic_refs, diagnosticRefsForCorePack());

  for (const concept of manifest.diagnostic_refs) {
    assert.equal(concept.implementation_state, "documentation-only");
    assert.match(concept.caveat, /not a validated/i);
    assert.ok(concept.blocked_until.length >= 4);
    assert.ok(concept.claim_boundary_refs.includes("docs/claim-boundaries.md"));
  }
});

test("Core Pack validator blocks executable or under-caveated diagnostics during intake", () => {
  const unsafe = structuredClone(manifest);
  unsafe.diagnostic_refs[0] = {
    ...unsafe.diagnostic_refs[0],
    implementation_state: "planned",
    caveat: "Too short.",
  };

  const result = validateCorePackManifest(unsafe);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("caveat must be explicit")));
  assert.ok(result.errors.some((error) => error.includes("executable diagnostic implementations are blocked")));
});

test("Core Pack CLI validator accepts the sample manifest", () => {
  const script = fileURLToPath(new URL("../scripts/validate-core-pack.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Core Pack manifest OK/);
  assert.match(result.stdout, /diagnostic_refs=2/);
});
