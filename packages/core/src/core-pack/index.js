import { assertContract, validateContract } from "../../../schemas/src/index.js";
import { DIAGNOSTIC_CONCEPTS, validateDiagnosticConcepts } from "../diagnostics/index.js";

export const CORE_PACK_STEWARD = "AI-Bio Synergy Holdings LLC";
export const CORE_PACK_LICENSE_PATTERN = /research-only/i;
export const REQUIRED_EVIDENCE_KINDS = Object.freeze([
  "archive-original-materials-manifest",
  "core-pack-import-checklist",
]);

export function validateCorePackManifest(manifest) {
  const errors = [];
  const warnings = [];
  const contract = validateContract("corePackManifest", manifest);

  for (const error of contract.errors) {
    errors.push(`${error.path}: ${error.message}`);
  }

  if (manifest.steward !== CORE_PACK_STEWARD) {
    errors.push(`corePackManifest.steward: expected ${CORE_PACK_STEWARD}`);
  }

  if (!CORE_PACK_LICENSE_PATTERN.test(manifest.license)) {
    errors.push("corePackManifest.license: must explicitly state research-only use");
  }

  const tiles = Array.isArray(manifest.tiles) ? manifest.tiles : [];
  const tileIds = tiles.map((tile) => tile.tile_id);
  const duplicateTileIds = tileIds.filter((tileId, index) => tileIds.indexOf(tileId) !== index);
  for (const tileId of new Set(duplicateTileIds)) {
    errors.push(`corePackManifest.tiles: duplicate tile_id ${tileId}`);
  }

  const evidenceRefs = Array.isArray(manifest.evidence_refs) ? manifest.evidence_refs : [];
  const evidenceKinds = new Set(evidenceRefs.map((ref) => ref.kind));
  for (const kind of REQUIRED_EVIDENCE_KINDS) {
    if (!evidenceKinds.has(kind)) {
      errors.push(`corePackManifest.evidence_refs: missing required ${kind}`);
    }
  }

  const diagnosticRefs = Array.isArray(manifest.diagnostic_refs) ? manifest.diagnostic_refs : [];
  errors.push(...validateDiagnosticConcepts(diagnosticRefs));

  const knownDiagnosticIds = new Set(DIAGNOSTIC_CONCEPTS.map((concept) => concept.diagnostic_id));
  for (const diagnostic of diagnosticRefs) {
    if (!knownDiagnosticIds.has(diagnostic.diagnostic_id)) {
      warnings.push(`${diagnostic.diagnostic_id}: diagnostic concept is not in the maintained concept registry`);
    }
    if (diagnostic.status === "prototype-note" && !/no prototype code is imported/i.test(diagnostic.source)) {
      errors.push(`${diagnostic.diagnostic_id}: prototype-note source must state that no prototype code is imported`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: summarizeCorePackManifest(manifest),
  };
}

export function assertCorePackManifest(manifest) {
  assertContract("corePackManifest", manifest);
  const result = validateCorePackManifest(manifest);
  if (!result.valid) {
    throw new TypeError(`Invalid Core Pack intake manifest: ${result.errors.join("; ")}`);
  }
  return manifest;
}

export function summarizeCorePackManifest(manifest) {
  return {
    manifest_id: manifest?.manifest_id || "",
    tile_count: manifest?.tiles?.length || 0,
    sbom_ref_count: manifest?.sbom_refs?.length || 0,
    evidence_ref_count: manifest?.evidence_refs?.length || 0,
    diagnostic_ref_count: manifest?.diagnostic_refs?.length || 0,
  };
}
