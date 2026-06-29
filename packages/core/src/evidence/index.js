import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";
import { createBuildInfo } from "../provenance/index.js";

export const EVIDENCE_BUNDLE_STEWARD = "AI-Bio Synergy Holdings LLC";
export const EVIDENCE_BUNDLE_LICENSE = "Research-only public use; all other rights reserved.";
export const EVIDENCE_BUNDLE_LIMITATIONS = Object.freeze([
  "Evidence bundles are research artifacts, not production decision-system certifications.",
  "Diagnostic entries may include caveated placeholders and must not be treated as validated scientific results.",
  "External datasets, SBOM references, and source artifacts remain subject to their own terms and provenance limits.",
]);

export const SESSION_IMPORT_ERROR_PREFIX = "Invalid COSMOS-CQA research session";

export function createResearchSession({
  sessionId = `session_${Date.now().toString(36)}`,
  createdAt = new Date().toISOString(),
  updatedAt = createdAt,
  build = createBuildInfo(),
  artifacts = [],
  selectedTiles = [],
  labels = [],
  diagnostics = [],
  reports = [],
  provenanceHashes = [],
  sbomRefs = [],
} = {}) {
  return assertContract("researchSession", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    session_id: sessionId,
    created_at: createdAt,
    updated_at: updatedAt,
    build,
    artifacts,
    selected_tiles: selectedTiles,
    labels,
    diagnostics,
    reports,
    provenance_hashes: provenanceHashes,
    sbom_refs: sbomRefs,
  });
}

export function createEvidenceBundle({
  bundleId = `bundle_${Date.now().toString(36)}`,
  generatedAt = new Date().toISOString(),
  steward = EVIDENCE_BUNDLE_STEWARD,
  license = EVIDENCE_BUNDLE_LICENSE,
  limitations = [...EVIDENCE_BUNDLE_LIMITATIONS],
  intendedUse = "Export-ready COSMOS-CQA research session evidence for replay, citation, and expert review.",
  claimBoundaryRefs = ["docs/claim-boundaries.md", "docs/scientific-scope.md"],
  session = createResearchSession({ createdAt: generatedAt, updatedAt: generatedAt }),
} = {}) {
  return assertContract("evidenceBundle", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    bundle_id: bundleId,
    generated_at: generatedAt,
    steward,
    license,
    limitations,
    intended_use: intendedUse,
    claim_boundary_refs: claimBoundaryRefs,
    session,
    summary: summarizeResearchSession(session),
  });
}

export function summarizeResearchSession(session) {
  return {
    artifact_count: session.artifacts.length,
    selected_tile_count: session.selected_tiles.length,
    label_count: session.labels.length,
    diagnostic_count: session.diagnostics.length,
    report_count: session.reports.length,
    provenance_hash_count: session.provenance_hashes.length,
    sbom_ref_count: session.sbom_refs.length,
  };
}

export function normalizeResearchSession(session) {
  const validSession = assertContract("researchSession", session);
  return {
    schema_version: validSession.schema_version,
    session_id: validSession.session_id,
    created_at: validSession.created_at,
    updated_at: validSession.updated_at,
    build: cloneJson(validSession.build),
    artifacts: cloneJson(validSession.artifacts),
    selected_tiles: validSession.selected_tiles.map((tile) => normalizeSelectedTile(tile)),
    labels: cloneJson(validSession.labels),
    diagnostics: cloneJson(validSession.diagnostics),
    reports: cloneJson(validSession.reports),
    provenance_hashes: cloneJson(validSession.provenance_hashes),
    sbom_refs: cloneJson(validSession.sbom_refs),
  };
}

export function serializeResearchSession(session) {
  return `${JSON.stringify(normalizeResearchSession(session), null, 2)}\n`;
}

export function parseResearchSessionJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(String(text || ""));
  } catch (error) {
    throw new TypeError(`${SESSION_IMPORT_ERROR_PREFIX}: malformed JSON (${error.message})`);
  }

  try {
    return normalizeResearchSession(parsed);
  } catch (error) {
    throw new TypeError(`${SESSION_IMPORT_ERROR_PREFIX}: ${error.message}`);
  }
}

export function validateResearchSessionJson(text) {
  try {
    return {
      valid: true,
      session: parseResearchSessionJson(text),
      errors: [],
    };
  } catch (error) {
    return {
      valid: false,
      session: null,
      errors: [error.message],
    };
  }
}

export function createResearchSessionReloadPlan(session) {
  const normalizedSession = normalizeResearchSession(session);
  const selectedTile = normalizedSession.selected_tiles.at(-1) || null;
  const report = normalizedSession.reports.at(-1) || null;

  return {
    schema_version: normalizedSession.schema_version,
    session_id: normalizedSession.session_id,
    selected_tile_id: selectedTile?.tile_id || "",
    selected_tile_checksum: selectedTile?.checksum || "",
    selected_tile_manifest_id: selectedTile?.manifest_id || "",
    overlay: selectedTile?.overlay || "none",
    palette: selectedTile?.palette || "viridis",
    report_id: report?.report_id || "",
    report_generated_at: report?.generated_at || "",
    summary: summarizeResearchSession(normalizedSession),
  };
}

function normalizeSelectedTile(tile) {
  const normalized = {
    tile_id: tile.tile_id,
    dataset: tile.dataset,
    checksum: tile.checksum,
  };

  if (tile.manifest_id !== undefined) {
    normalized.manifest_id = tile.manifest_id;
  }
  if (tile.selected_at !== undefined) {
    normalized.selected_at = tile.selected_at;
  }
  if (tile.overlay !== undefined) {
    normalized.overlay = tile.overlay;
  }
  if (tile.palette !== undefined) {
    normalized.palette = tile.palette;
  }
  if (tile.review_state !== undefined) {
    normalized.review_state = tile.review_state;
  }

  return normalized;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
