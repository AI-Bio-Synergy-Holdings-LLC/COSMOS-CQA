import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";
import {
  EVIDENCE_BUNDLE_LICENSE,
  EVIDENCE_BUNDLE_STEWARD,
  createEvidenceBundle,
  normalizeEvidenceBundle,
  normalizeResearchSession,
  serializeEvidenceBundle,
  serializeResearchSession,
} from "../evidence/index.js";
import { sha256Text } from "../provenance/index.js";

export const REVIEW_PACKET_CLAIM_BOUNDARY =
  "Reviewer packet identity fields are metadata only on the static public portal; authenticated reviewer access and transport require a separately verified service boundary.";
export const REVIEW_PACKET_DATA_USE_NOTICE =
  "Reviewer handoff packets are local research artifacts intended for non-confidential COSMOS-CQA review. Do not include personal data, regulated data, restricted datasets, credentials, private screenshots, or clinical/scientific claims that have not been independently reviewed.";
export const REVIEW_PACKET_TASK =
  "Review submitted tile observations, notes, normalized source-tile coordinates, and audit ledger events under COSMOS-CQA research-only claim boundaries.";

export function createReviewerIdentityClaim({
  reviewerId = "local-reviewer",
  displayName = "Local workbench reviewer",
  role = "public-demo-reviewer",
  authState = "unauthenticated-local",
  authProvider = "none",
  verifiedAt,
  claimBoundary = REVIEW_PACKET_CLAIM_BOUNDARY,
} = {}) {
  return assertContract(
    "reviewerIdentityClaim",
    withoutUndefined({
      schema_version: CONTRACT_SCHEMA_VERSION,
      reviewer_id: safeId(reviewerId || "local-reviewer") || "local-reviewer",
      display_name: String(displayName || "Local workbench reviewer").slice(0, 128),
      role,
      auth_state: authState,
      auth_provider: authProvider ? String(authProvider).slice(0, 128) : undefined,
      verified_at: verifiedAt,
      claim_boundary: claimBoundary,
    }),
  );
}

export function createReviewDataUseConsent({
  scope = "local-demo-handoff",
  allowsResearchReview = true,
  allowsPublicIssueSharing = false,
  containsPersonalData = false,
  notice = REVIEW_PACKET_DATA_USE_NOTICE,
  steward = EVIDENCE_BUNDLE_STEWARD,
} = {}) {
  return assertContract("reviewDataUseConsent", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    scope,
    allows_research_review: Boolean(allowsResearchReview),
    allows_public_issue_sharing: Boolean(allowsPublicIssueSharing),
    contains_personal_data: Boolean(containsPersonalData),
    notice,
    steward,
  });
}

export function createReviewAssignment({
  assignmentId,
  createdAt = new Date().toISOString(),
  assignmentStatus = "prepared",
  sourceSessionId,
  sourceBundleId,
  sourceSessionSha256,
  sourceBundleSha256,
  tileIds = [],
  observationIds = [],
  reviewTask = REVIEW_PACKET_TASK,
  transportState = "local-export",
  dataUseNotice = REVIEW_PACKET_DATA_USE_NOTICE,
  license = EVIDENCE_BUNDLE_LICENSE,
  claimBoundary = REVIEW_PACKET_CLAIM_BOUNDARY,
} = {}) {
  return assertContract("reviewAssignment", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    assignment_id: assignmentId || `rasn_${safeId(sourceSessionId || createdAt)}`,
    created_at: createdAt,
    assignment_status: assignmentStatus,
    source_session_id: sourceSessionId,
    source_bundle_id: sourceBundleId,
    source_session_sha256: ensureSha256(sourceSessionSha256),
    source_bundle_sha256: ensureSha256(sourceBundleSha256),
    tile_ids: uniqueIds(tileIds),
    observation_ids: uniqueIds(observationIds),
    review_task: reviewTask,
    transport_state: transportState,
    data_use_notice: dataUseNotice,
    license,
    claim_boundary: claimBoundary,
  });
}

export async function createReviewIntakeEnvelope({
  bundle,
  reviewerIdentity = createReviewerIdentityClaim(),
  contributorConsent = createReviewDataUseConsent(),
  generatedAt = new Date().toISOString(),
  packetId,
  assignment,
  transportState = "local-export",
  steward = EVIDENCE_BUNDLE_STEWARD,
  license = EVIDENCE_BUNDLE_LICENSE,
  dataUseNotice = REVIEW_PACKET_DATA_USE_NOTICE,
  claimBoundary = REVIEW_PACKET_CLAIM_BOUNDARY,
  cryptoRef = globalThis.crypto,
} = {}) {
  const evidenceBundle = normalizeEvidenceBundle(bundle || createEvidenceBundle({ generatedAt }));
  const hashes = await hashBundleSession(evidenceBundle, cryptoRef);
  const reviewAssignment =
    assignment ||
    createReviewAssignment({
      createdAt: generatedAt,
      sourceSessionId: evidenceBundle.session.session_id,
      sourceBundleId: evidenceBundle.bundle_id,
      sourceSessionSha256: hashes.session,
      sourceBundleSha256: hashes.bundle,
      tileIds: collectTileIds(evidenceBundle.session),
      observationIds: collectObservationIds(evidenceBundle.session),
      transportState,
      dataUseNotice,
      license,
      claimBoundary,
    });

  return assertContract("reviewIntakeEnvelope", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    packet_id: packetId || `rint_${safeId(evidenceBundle.bundle_id.replace(/^bundle_/, ""))}`,
    packet_type: "review-intake",
    created_at: generatedAt,
    steward,
    license,
    data_use_notice: dataUseNotice,
    transport_state: transportState,
    authenticated_access: false,
    network_submission: false,
    contributor_consent: contributorConsent,
    reviewer_identity: reviewerIdentity,
    assignment: reviewAssignment,
    evidence_bundle: evidenceBundle,
    source_session_sha256: hashes.session,
    source_bundle_sha256: hashes.bundle,
    claim_boundary: claimBoundary,
  });
}

export async function createReviewReturnEnvelope({
  session,
  bundle,
  reviewerIdentity = createReviewerIdentityClaim(),
  contributorConsent = createReviewDataUseConsent(),
  assignment,
  generatedAt = new Date().toISOString(),
  packetId,
  transportState = "local-export",
  steward = EVIDENCE_BUNDLE_STEWARD,
  license = EVIDENCE_BUNDLE_LICENSE,
  dataUseNotice = REVIEW_PACKET_DATA_USE_NOTICE,
  claimBoundary = REVIEW_PACKET_CLAIM_BOUNDARY,
  cryptoRef = globalThis.crypto,
} = {}) {
  const researchSession = normalizeResearchSession(session || bundle?.session);
  const evidenceBundle = bundle ? normalizeEvidenceBundle(bundle) : createEvidenceBundle({ generatedAt, session: researchSession });
  const hashes = await hashBundleSession(evidenceBundle, cryptoRef);
  const returnedSessionSha256 = ensureSha256(await sha256Text(serializeResearchSession(researchSession), cryptoRef));
  const reviewAssignment =
    assignment ||
    createReviewAssignment({
      createdAt: generatedAt,
      sourceSessionId: evidenceBundle.session.session_id,
      sourceBundleId: evidenceBundle.bundle_id,
      sourceSessionSha256: hashes.session,
      sourceBundleSha256: hashes.bundle,
      tileIds: collectTileIds(researchSession),
      observationIds: collectObservationIds(researchSession),
      assignmentStatus: "returned",
      transportState,
      dataUseNotice,
      license,
      claimBoundary,
    });

  return assertContract("reviewReturnEnvelope", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    packet_id: packetId || `rret_${safeId(researchSession.session_id.replace(/^session_/, ""))}`,
    packet_type: "review-return",
    created_at: generatedAt,
    steward,
    license,
    data_use_notice: dataUseNotice,
    transport_state: transportState,
    authenticated_access: false,
    network_submission: false,
    contributor_consent: contributorConsent,
    reviewer_identity: reviewerIdentity,
    assignment: reviewAssignment,
    research_session: researchSession,
    source_session_sha256: reviewAssignment.source_session_sha256 || hashes.session,
    source_bundle_sha256: reviewAssignment.source_bundle_sha256 || hashes.bundle,
    returned_session_sha256: returnedSessionSha256,
    review_event_count: researchSession.observation_review_events?.length || 0,
    claim_boundary: claimBoundary,
  });
}

export function serializeReviewIntakeEnvelope(envelope) {
  return `${JSON.stringify(assertContract("reviewIntakeEnvelope", envelope), null, 2)}\n`;
}

export function serializeReviewReturnEnvelope(envelope) {
  return `${JSON.stringify(assertContract("reviewReturnEnvelope", envelope), null, 2)}\n`;
}

export function parseReviewIntakeEnvelopeJson(text) {
  return parseReviewEnvelopeJson(text, "reviewIntakeEnvelope", "review intake envelope");
}

export function parseReviewReturnEnvelopeJson(text) {
  return parseReviewEnvelopeJson(text, "reviewReturnEnvelope", "review return envelope");
}

export function validateReviewIntakeEnvelopeJson(text) {
  return validateReviewEnvelopeJson(text, parseReviewIntakeEnvelopeJson, "intake");
}

export function validateReviewReturnEnvelopeJson(text) {
  return validateReviewEnvelopeJson(text, parseReviewReturnEnvelopeJson, "return");
}

async function hashBundleSession(bundle, cryptoRef) {
  return {
    session: ensureSha256(await sha256Text(serializeResearchSession(bundle.session), cryptoRef)),
    bundle: ensureSha256(await sha256Text(serializeEvidenceBundle(bundle), cryptoRef)),
  };
}

function parseReviewEnvelopeJson(text, schemaName, label) {
  let parsed;
  try {
    parsed = JSON.parse(String(text || ""));
  } catch (error) {
    throw new TypeError(`Invalid COSMOS-CQA ${label}: malformed JSON (${error.message})`);
  }

  try {
    return assertContract(schemaName, parsed);
  } catch (error) {
    throw new TypeError(`Invalid COSMOS-CQA ${label}: ${error.message}`);
  }
}

function validateReviewEnvelopeJson(text, parseEnvelope, kind) {
  try {
    return {
      valid: true,
      kind,
      envelope: parseEnvelope(text),
      errors: [],
    };
  } catch (error) {
    return {
      valid: false,
      kind,
      envelope: null,
      errors: [error.message],
    };
  }
}

function collectTileIds(session) {
  return uniqueIds([
    ...(session.selected_tiles || []).map((tile) => tile.tile_id),
    ...(session.labels || []).map((label) => label.tile_id),
    ...(session.observations || []).map((observation) => observation.tile_id),
  ]);
}

function collectObservationIds(session) {
  return uniqueIds((session.observations || []).map((observation) => observation.observation_id));
}

function uniqueIds(values) {
  return [...new Set(values.map((value) => safeId(value)).filter(Boolean))];
}

function ensureSha256(value) {
  const text = String(value || "");
  return text.startsWith("sha256:") ? text : `sha256:${text}`;
}

function safeId(value) {
  const input = String(value || "").trim();
  let output = "";
  let lastWasUnderscore = false;

  for (const char of input) {
    const next = isSafeIdChar(char) ? char : "_";
    if (next === "_" && lastWasUnderscore) {
      continue;
    }
    output += next;
    lastWasUnderscore = next === "_";
    if (output.length >= 128) {
      break;
    }
  }

  return trimBoundaryUnderscores(output);
}

function trimBoundaryUnderscores(value) {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === "_") {
    start += 1;
  }
  while (end > start && value[end - 1] === "_") {
    end -= 1;
  }
  return value.slice(start, end);
}

function isSafeIdChar(char) {
  const code = char.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    char === "." ||
    char === "_" ||
    char === ":" ||
    char === "-"
  );
}

function withoutUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}
