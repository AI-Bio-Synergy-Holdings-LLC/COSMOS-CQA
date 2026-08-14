import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";
import { summarizeTileObservations } from "../observations/index.js";
import { createBuildInfo, sha256Text } from "../provenance/index.js";

export const EVIDENCE_BUNDLE_STEWARD = "AI-Bio Synergy Holdings LLC";
export const EVIDENCE_BUNDLE_LICENSE = "Research-only public use; all other rights reserved.";
export const EVIDENCE_BUNDLE_LIMITATIONS = Object.freeze([
  "Evidence bundles are research artifacts, not production decision-system certifications.",
  "Diagnostic entries may include caveated placeholders and must not be treated as validated scientific results.",
  "External datasets, SBOM references, and source artifacts remain subject to their own terms and provenance limits.",
]);
export const EVIDENCE_BUNDLE_RECEIPT_VERSION = "cosmos-cqa.evidence-bundle-receipt.v1";
export const EVIDENCE_BUNDLE_CANONICALIZATION = "cosmos-cqa/evidence-bundle-json-v1";
export const EVIDENCE_BUNDLE_RECEIPT_CLAIM_BOUNDARY =
  "SHA-256 verifies canonical byte-level consistency only; it does not establish authorship, authenticity, scientific validity, production readiness, regulatory suitability, or certification.";

export const SESSION_IMPORT_ERROR_PREFIX = "Invalid COSMOS-CQA research session";

export function createResearchSession({
  sessionId = `session_${Date.now().toString(36)}`,
  createdAt = new Date().toISOString(),
  updatedAt = createdAt,
  build = createBuildInfo(),
  artifacts = [],
  selectedTiles = [],
  labels = [],
  observations = [],
  observationReviewEvents = [],
  diagnostics = [],
  reports = [],
  provenanceHashes = [],
  sbomRefs = [],
} = {}) {
  const session = {
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
  };

  if (observations.length) {
    session.observations = observations;
  }
  if (observationReviewEvents.length) {
    session.observation_review_events = observationReviewEvents;
  }

  return assertContract("researchSession", session);
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
  const bundle = {
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
  };

  if (session.observations?.length) {
    bundle.observation_summary = summarizeTileObservations(session.observations, session.observation_review_events || []);
  } else if (session.observation_review_events?.length) {
    bundle.observation_summary = summarizeTileObservations([], session.observation_review_events);
  }
  if (session.observation_review_events?.length) {
    bundle.observation_review_events = session.observation_review_events;
  }

  return assertContract("evidenceBundle", bundle);
}

export function normalizeEvidenceBundle(bundle) {
  const validBundle = assertContract("evidenceBundle", bundle);
  const normalized = {
    schema_version: validBundle.schema_version,
    bundle_id: validBundle.bundle_id,
    generated_at: validBundle.generated_at,
    steward: validBundle.steward,
    license: validBundle.license,
    limitations: cloneJson(validBundle.limitations),
  };

  if (validBundle.intended_use !== undefined) {
    normalized.intended_use = validBundle.intended_use;
  }
  if (validBundle.claim_boundary_refs !== undefined) {
    normalized.claim_boundary_refs = cloneJson(validBundle.claim_boundary_refs);
  }

  normalized.session = normalizeResearchSession(validBundle.session);
  normalized.summary = summarizeResearchSession(normalized.session);
  if (normalized.session.observations?.length || normalized.session.observation_review_events?.length) {
    normalized.observation_summary = summarizeTileObservations(
      normalized.session.observations || [],
      normalized.session.observation_review_events || [],
    );
  }
  if (normalized.session.observation_review_events?.length) {
    normalized.observation_review_events = cloneJson(normalized.session.observation_review_events);
  }
  return assertContract("evidenceBundle", normalized);
}

export function serializeEvidenceBundle(bundle) {
  return `${JSON.stringify(normalizeEvidenceBundle(bundle), null, 2)}\n`;
}

export function parseEvidenceBundleJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(String(text || ""));
  } catch (error) {
    throw new TypeError(`Invalid COSMOS-CQA evidence bundle: malformed JSON (${error.message})`);
  }

  try {
    return normalizeEvidenceBundle(parsed);
  } catch (error) {
    throw new TypeError(`Invalid COSMOS-CQA evidence bundle: ${error.message}`);
  }
}

export function validateEvidenceBundleJson(text) {
  try {
    return {
      valid: true,
      bundle: parseEvidenceBundleJson(text),
      errors: [],
    };
  } catch (error) {
    return {
      valid: false,
      bundle: null,
      errors: [error.message],
    };
  }
}

export async function createEvidenceBundleReceipt(bundle, { cryptoRef = globalThis.crypto } = {}) {
  const normalizedBundle = normalizeEvidenceBundle(bundle);
  const canonicalBundle = `${JSON.stringify(normalizedBundle, null, 2)}\n`;
  const receipt = {
    receipt_version: EVIDENCE_BUNDLE_RECEIPT_VERSION,
    canonicalization: EVIDENCE_BUNDLE_CANONICALIZATION,
    bundle_schema_version: normalizedBundle.schema_version,
    bundle_id: normalizedBundle.bundle_id,
    canonical_byte_length: new TextEncoder().encode(canonicalBundle).byteLength,
    bundle_sha256: `sha256:${await sha256Text(canonicalBundle, cryptoRef)}`,
    claim_boundary: EVIDENCE_BUNDLE_RECEIPT_CLAIM_BOUNDARY,
  };

  return normalizeEvidenceBundleReceipt(receipt);
}

export function normalizeEvidenceBundleReceipt(receipt) {
  const validReceipt = assertContract("evidenceBundleReceipt", receipt);
  return {
    receipt_version: validReceipt.receipt_version,
    canonicalization: validReceipt.canonicalization,
    bundle_schema_version: validReceipt.bundle_schema_version,
    bundle_id: validReceipt.bundle_id,
    canonical_byte_length: validReceipt.canonical_byte_length,
    bundle_sha256: validReceipt.bundle_sha256,
    claim_boundary: validReceipt.claim_boundary,
  };
}

export function serializeEvidenceBundleReceipt(receipt) {
  return `${JSON.stringify(normalizeEvidenceBundleReceipt(receipt), null, 2)}\n`;
}

export function parseEvidenceBundleReceiptJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(String(text || ""));
  } catch (error) {
    throw new TypeError(`Invalid COSMOS-CQA evidence bundle receipt: malformed JSON (${error.message})`);
  }

  try {
    return normalizeEvidenceBundleReceipt(parsed);
  } catch (error) {
    throw new TypeError(`Invalid COSMOS-CQA evidence bundle receipt: ${error.message}`);
  }
}

export function validateEvidenceBundleReceiptJson(text) {
  try {
    return {
      valid: true,
      receipt: parseEvidenceBundleReceiptJson(text),
      errors: [],
    };
  } catch (error) {
    return {
      valid: false,
      receipt: null,
      errors: [error.message],
    };
  }
}

export async function verifyEvidenceBundleReceipt(bundleText, receiptText, { cryptoRef = globalThis.crypto } = {}) {
  try {
    const sourceBundleText = String(bundleText || "");
    const bundle = parseEvidenceBundleJson(sourceBundleText);
    const canonicalBundle = serializeEvidenceBundle(bundle);
    if (sourceBundleText !== canonicalBundle) {
      throw new TypeError("Evidence bundle bytes are not canonical for cosmos-cqa/evidence-bundle-json-v1.");
    }

    const sourceReceiptText = String(receiptText || "");
    const receipt = parseEvidenceBundleReceiptJson(sourceReceiptText);
    if (sourceReceiptText !== serializeEvidenceBundleReceipt(receipt)) {
      throw new TypeError("Evidence bundle receipt bytes are not canonical.");
    }
    if (receipt.bundle_schema_version !== bundle.schema_version) {
      throw new TypeError("Evidence bundle schema version does not match the receipt.");
    }
    if (receipt.bundle_id !== bundle.bundle_id) {
      throw new TypeError("Evidence bundle identifier does not match the receipt.");
    }

    const canonicalByteLength = new TextEncoder().encode(canonicalBundle).byteLength;
    if (receipt.canonical_byte_length !== canonicalByteLength) {
      throw new TypeError("Evidence bundle canonical byte length does not match the receipt.");
    }

    const bundleSha256 = `sha256:${await sha256Text(canonicalBundle, cryptoRef)}`;
    if (receipt.bundle_sha256 !== bundleSha256) {
      throw new TypeError("Evidence bundle SHA-256 digest does not match the receipt.");
    }

    return { valid: true, bundle, receipt, errors: [] };
  } catch (error) {
    return { valid: false, bundle: null, receipt: null, errors: [error.message] };
  }
}

export function summarizeResearchSession(session) {
  const summary = {
    artifact_count: session.artifacts.length,
    selected_tile_count: session.selected_tiles.length,
    label_count: session.labels.length,
    diagnostic_count: session.diagnostics.length,
    report_count: session.reports.length,
    provenance_hash_count: session.provenance_hashes.length,
    sbom_ref_count: session.sbom_refs.length,
  };

  if (session.observations !== undefined) {
    const observationSummary = summarizeTileObservations(session.observations, session.observation_review_events || []);
    summary.observation_count = observationSummary.observation_count;
    summary.observed_tile_count = observationSummary.observed_tile_count;
    summary.observed_zone_count = observationSummary.observed_zone_count;
    summary.observation_note_count = observationSummary.note_count;
  }
  if (session.observation_review_events !== undefined) {
    summary.observation_review_event_count = session.observation_review_events.length;
  }

  return summary;
}

export function normalizeResearchSession(session) {
  const validSession = assertContract("researchSession", session);
  const normalized = {
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

  if (validSession.observations !== undefined) {
    normalized.observations = cloneJson(validSession.observations);
  }
  if (validSession.observation_review_events !== undefined) {
    normalized.observation_review_events = cloneJson(validSession.observation_review_events);
  }

  return normalized;
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
