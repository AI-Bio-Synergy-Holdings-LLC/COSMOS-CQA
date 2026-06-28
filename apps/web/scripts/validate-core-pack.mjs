import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateCorePackManifest } from "../../../packages/core/src/core-pack/index.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const manifestArg = process.argv[2] || "examples/core-pack/core-pack.manifest.json";
const manifestPath = path.isAbsolute(manifestArg) ? manifestArg : path.resolve(repoRoot, manifestArg);

const errors = [];
const warnings = [];

if (!isInsideRepo(manifestPath)) {
  errors.push(`manifest path must stay inside repository: ${manifestPath}`);
} else {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const result = validateCorePackManifest(manifest);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    errors.push(...(await validateReferencedPaths(manifest)));

    if (errors.length === 0) {
      console.log(`Core Pack manifest OK: ${path.relative(repoRoot, manifestPath).replaceAll("\\", "/")}`);
      console.log(
        `tiles=${result.summary.tile_count} sbom_refs=${result.summary.sbom_ref_count} evidence_refs=${result.summary.evidence_ref_count} diagnostic_refs=${result.summary.diagnostic_ref_count}`,
      );
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}

for (const error of errors) {
  console.error(`ERROR ${error}`);
}

if (errors.length > 0) {
  process.exitCode = 1;
}

async function validateReferencedPaths(manifest) {
  const pathErrors = [];

  for (const ref of manifest.sbom_refs || []) {
    pathErrors.push(...(await validateRepoPath(ref.path, `sbom_refs.${ref.sbom_id}.path`)));
    pathErrors.push(...(await validateSha256(ref.path, ref.checksum, `sbom_refs.${ref.sbom_id}.checksum`)));
  }

  for (const ref of manifest.evidence_refs || []) {
    pathErrors.push(...(await validateRepoPath(ref.path, `evidence_refs.${ref.kind}.path`)));
  }

  for (const tile of manifest.tiles || []) {
    if (tile.provenance?.archive_path) {
      pathErrors.push(...(await validateRepoPath(tile.provenance.archive_path, `tiles.${tile.tile_id}.provenance.archive_path`)));
    }
    if (tile.provenance?.source_url && !isExternalReference(tile.provenance.source_url)) {
      pathErrors.push(...(await validateRepoPath(tile.provenance.source_url, `tiles.${tile.tile_id}.provenance.source_url`)));
    }
  }

  return pathErrors;
}

async function validateRepoPath(referencePath, label) {
  if (isExternalReference(referencePath)) {
    return [];
  }

  const resolved = path.resolve(repoRoot, referencePath);
  if (!isInsideRepo(resolved)) {
    return [`${label}: referenced path escapes repository: ${referencePath}`];
  }

  try {
    await access(resolved);
    return [];
  } catch {
    return [`${label}: referenced path does not exist: ${referencePath}`];
  }
}

async function validateSha256(referencePath, checksum, label) {
  if (!checksum?.startsWith("sha256:") || isExternalReference(referencePath)) {
    return [];
  }

  const expected = checksum.slice("sha256:".length).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected)) {
    return [];
  }

  const resolved = path.resolve(repoRoot, referencePath);
  if (!isInsideRepo(resolved)) {
    return [];
  }

  try {
    const bytes = await readFile(resolved);
    const actual = createHash("sha256").update(bytes).digest("hex");
    return actual === expected ? [] : [`${label}: expected ${expected}, got ${actual}`];
  } catch {
    return [];
  }
}

function isExternalReference(value) {
  return /^(https?:|doi:)/i.test(value);
}

function isInsideRepo(resolvedPath) {
  const relative = path.relative(repoRoot, resolvedPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
