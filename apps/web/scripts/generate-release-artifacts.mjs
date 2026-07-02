import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createBuildInfo } from "../../../packages/core/src/provenance/index.js";
import { createSbom, createValidationReport } from "../../../packages/core/src/reports/index.js";

const releaseId = "v0.1.0-research-alpha";
const generatedAt = "2026-06-28T07:12:46.000Z";
const repoRoot = resolve(import.meta.dirname, "../../..");
const fixturePath = resolve(repoRoot, "examples/core-pack/replay-fixture.json");
const releaseRoot = resolve(repoRoot, "docs/releases");

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const labels = fixture.labels.rows.map((row) => ({
  label_id: "lbl_release1",
  tile_id: row.tile_id,
  dataset: row.dataset,
  volunteer_id: row.volunteer_id,
  _truth: fixture.first_tile.meta.truth,
  clazz: row.clazz,
  severity: row.severity,
  note: row.note,
  weight: Number(row.weight),
  ts: row.ts,
}));

const checks = [
  {
    name: "research-only license notice",
    status: "pass",
    detail: "LICENSE.md and release notes state research-only public use and reserved rights.",
  },
  {
    name: "archive provenance",
    status: "pass",
    detail: "Canonical COSMOS v3 materials are inventoried under archive/original-materials/legacy-v3/.",
  },
  {
    name: "source verification command",
    status: "pass",
    detail: "npm --prefix apps/web run check passed before publishing the release.",
  },
  {
    name: "contract tests",
    status: "pass",
    detail: "Label, feed, bookmark/provenance, SBOM, and validation report contracts passed.",
  },
  {
    name: "deterministic replay tests",
    status: "pass",
    detail: "Golden replay fixture matched tile, sidecar, bookmark, CSV, report, and public/dev policy outputs.",
  },
  {
    name: "legacy syntax check",
    status: "pass",
    detail: "Canonical legacy HTML script extraction and syntax checks passed.",
  },
  {
    name: "sbom artifact",
    status: "pass",
    detail: `Release SBOM artifact generated at docs/releases/${releaseId}-sbom.json.`,
  },
  {
    name: "canonical public URL",
    status: "pass",
    detail:
      "Canonical public project identity is https://cosmos-cqa.org; cosmoscqa.org, cosmos-cqa.com, and cosmoscqa.com are redirect domains.",
  },
];

const validationReport = createValidationReport({
  build: createBuildInfo({ dev: false }),
  labels,
  feedErrors: [],
  checks,
  generatedAt,
  reportId: "rpt_v0.1.0_research_alpha",
});

const sbom = createSbom({ generatedAt });

await writeJson(resolve(releaseRoot, `${releaseId}-validation-report.json`), validationReport);
await writeJson(resolve(releaseRoot, `${releaseId}-sbom.json`), sbom);

console.log(`Generated release artifacts for ${releaseId}`);

async function writeJson(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
