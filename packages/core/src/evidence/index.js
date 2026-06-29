import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";
import { createBuildInfo } from "../provenance/index.js";

export const EVIDENCE_BUNDLE_STEWARD = "AI-Bio Synergy Holdings LLC";
export const EVIDENCE_BUNDLE_LICENSE = "Research-only public use; all other rights reserved.";
export const EVIDENCE_BUNDLE_LIMITATIONS = Object.freeze([
  "Evidence bundles are research artifacts, not production decision-system certifications.",
  "Diagnostic entries may include caveated placeholders and must not be treated as validated scientific results.",
  "External datasets, SBOM references, and source artifacts remain subject to their own terms and provenance limits.",
]);

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
