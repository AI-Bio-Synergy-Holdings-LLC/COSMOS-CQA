import {
  ARTIFACT_CLASSES,
  CONTRACT_SCHEMA_VERSION,
  OBSERVATION_ADJUDICATION_DECISIONS,
  OBSERVATION_CONSENSUS_STATUSES,
  OBSERVATION_REVIEW_CLAIM_BOUNDARY,
  OBSERVATION_REVIEW_EVENT_ACTIONS,
  OBSERVATION_REVIEW_STATUSES,
  SEVERITY_LEVELS,
  assertContract,
} from "../../../schemas/src/index.js";

export const TILE_OBSERVATION_GRID_SIZE = 3;
export const DEFAULT_VIEWER_TRANSFORM = Object.freeze({
  zoom: 1,
  panX: 0,
  panY: 0,
  rotationDeg: 0,
});
export const VIEWER_TRANSFORM_LIMITS = Object.freeze({
  minZoom: 1,
  maxZoom: 4,
  zoomStep: 0.25,
  panStep: 32,
  maxPan: 320,
  rotationStepDeg: 90,
});

const ROW_LABELS = ["top", "middle", "bottom"];
const COL_LABELS = ["left", "center", "right"];
const OBSERVATION_CLAIM_BOUNDARY =
  "Reviewer-authored spatial target; interpret as a source-tile location cue, not measured sky coordinates or a validated detection.";
const DEFAULT_REVIEW_STATUS = "pending-review";
const DEFAULT_CONSENSUS_STATUS = "not-assessed";
const ADJUDICATION_DECISION_CONFIG = Object.freeze({
  defer: Object.freeze({
    action: "adjudication-defer",
    reviewStatus: "needs-adjudication",
    consensusStatus: "needs-adjudication",
    adjudicationState: "adjudication deferred placeholder; independent expert review still required before consensus claims",
    summary: "Adjudication deferred; independent expert review remains required.",
  }),
  "request-second-review": Object.freeze({
    action: "adjudication-second-review",
    reviewStatus: "needs-adjudication",
    consensusStatus: "needs-adjudication",
    adjudicationState: "second-review requested placeholder; no validated scientific consensus claim",
    summary: "Second review requested; consensus remains unresolved.",
  }),
  "mark-reviewed": Object.freeze({
    action: "adjudication-reviewed",
    reviewStatus: "reviewed",
    consensusStatus: "single-reviewer",
    adjudicationState: "single-reviewer QA completion only; not validated scientific consensus",
    summary: "Observation marked reviewed after adjudication queue triage; no scientific consensus claim.",
  }),
});

export const TILE_OBSERVATION_ZONE_CELLS = Object.freeze(
  ROW_LABELS.flatMap((rowLabel, rowIndex) =>
    COL_LABELS.map((columnLabel, columnIndex) =>
      Object.freeze({
        zone_id: `r${rowIndex + 1}c${columnIndex + 1}`,
        zone_label: `${rowLabel} ${columnLabel}`,
        zone_row: rowIndex + 1,
        zone_col: columnIndex + 1,
      }),
    ),
  ),
);

export function normalizeObservationCoordinate(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}

export function roundObservationCoordinate(value) {
  return Number(normalizeObservationCoordinate(value).toFixed(4));
}

export function normalizeViewerTransform(transform = {}) {
  return {
    zoom: clampNumber(transform.zoom, VIEWER_TRANSFORM_LIMITS.minZoom, VIEWER_TRANSFORM_LIMITS.maxZoom, DEFAULT_VIEWER_TRANSFORM.zoom),
    panX: clampNumber(transform.panX, -VIEWER_TRANSFORM_LIMITS.maxPan, VIEWER_TRANSFORM_LIMITS.maxPan, DEFAULT_VIEWER_TRANSFORM.panX),
    panY: clampNumber(transform.panY, -VIEWER_TRANSFORM_LIMITS.maxPan, VIEWER_TRANSFORM_LIMITS.maxPan, DEFAULT_VIEWER_TRANSFORM.panY),
    rotationDeg: normalizeRotation(transform.rotationDeg),
  };
}

export function transformSourceToViewportPoint({ xNorm, yNorm, width = 1, height = width, transform = DEFAULT_VIEWER_TRANSFORM } = {}) {
  const view = normalizeViewerTransform(transform);
  const centerX = width / 2;
  const centerY = height / 2;
  const scaledX = (normalizeObservationCoordinate(xNorm) * width - centerX) * view.zoom;
  const scaledY = (normalizeObservationCoordinate(yNorm) * height - centerY) * view.zoom;
  const angle = toRadians(view.rotationDeg);
  const rotatedX = scaledX * Math.cos(angle) - scaledY * Math.sin(angle);
  const rotatedY = scaledX * Math.sin(angle) + scaledY * Math.cos(angle);

  return {
    x: centerX + rotatedX + view.panX,
    y: centerY + rotatedY + view.panY,
  };
}

export function createViewerTransformMatrix({ width = 1, height = width, transform = DEFAULT_VIEWER_TRANSFORM } = {}) {
  const view = normalizeViewerTransform(transform);
  const centerX = width / 2;
  const centerY = height / 2;
  const angle = toRadians(view.rotationDeg);
  const a = view.zoom * Math.cos(angle);
  const b = view.zoom * Math.sin(angle);
  const c = -view.zoom * Math.sin(angle);
  const d = view.zoom * Math.cos(angle);
  const e = centerX + view.panX - (a * centerX + c * centerY);
  const f = centerY + view.panY - (b * centerX + d * centerY);

  return {
    a,
    b,
    c,
    d,
    e,
    f,
    css: `matrix(${formatMatrixNumber(a)}, ${formatMatrixNumber(b)}, ${formatMatrixNumber(c)}, ${formatMatrixNumber(d)}, ${formatMatrixNumber(e)}, ${formatMatrixNumber(f)})`,
  };
}

export function transformViewportPointToSource({ x, y, width = 1, height = width, transform = DEFAULT_VIEWER_TRANSFORM } = {}) {
  const view = normalizeViewerTransform(transform);
  const centerX = width / 2;
  const centerY = height / 2;
  const translatedX = Number(x || 0) - centerX - view.panX;
  const translatedY = Number(y || 0) - centerY - view.panY;
  const angle = toRadians(view.rotationDeg);
  const sourceX = (translatedX * Math.cos(angle) + translatedY * Math.sin(angle)) / view.zoom + centerX;
  const sourceY = (-translatedX * Math.sin(angle) + translatedY * Math.cos(angle)) / view.zoom + centerY;
  const xRaw = sourceX / width;
  const yRaw = sourceY / height;

  return {
    x_norm: roundObservationCoordinate(xRaw),
    y_norm: roundObservationCoordinate(yRaw),
    in_bounds: xRaw >= 0 && xRaw <= 1 && yRaw >= 0 && yRaw <= 1,
  };
}

export function getTileObservationZone({ xNorm, yNorm, gridSize = TILE_OBSERVATION_GRID_SIZE }) {
  const x = normalizeObservationCoordinate(xNorm);
  const y = normalizeObservationCoordinate(yNorm);
  const size = Math.max(1, Math.min(9, Number.parseInt(gridSize, 10) || TILE_OBSERVATION_GRID_SIZE));
  const row = Math.min(size, Math.floor(y * size) + 1);
  const col = Math.min(size, Math.floor(x * size) + 1);
  const canonical =
    size === TILE_OBSERVATION_GRID_SIZE ? TILE_OBSERVATION_ZONE_CELLS.find((cell) => cell.zone_row === row && cell.zone_col === col) : null;

  return {
    zone_id: `r${row}c${col}`,
    zone_label: canonical?.zone_label || `${ROW_LABELS[row - 1] || `row ${row}`} ${COL_LABELS[col - 1] || `column ${col}`}`,
    zone_row: row,
    zone_col: col,
  };
}

export function createTileObservationTaxonomy({ xNorm, yNorm, zone } = {}) {
  const x = roundObservationCoordinate(xNorm);
  const y = roundObservationCoordinate(yNorm);
  const resolvedZone = zone?.zone_id ? zone : getTileObservationZone({ xNorm: x, yNorm: y });
  const rowBand = ROW_LABELS[resolvedZone.zone_row - 1] || `row ${resolvedZone.zone_row}`;
  const columnBand = COL_LABELS[resolvedZone.zone_col - 1] || `column ${resolvedZone.zone_col}`;
  const verticalBand = y < 1 / 3 ? "upper" : y > 2 / 3 ? "lower" : "middle";
  const horizontalBand = x < 1 / 3 ? "left" : x > 2 / 3 ? "right" : "center";
  const quadrant = verticalBand === "middle" && horizontalBand === "center" ? "center" : `${verticalBand}-${horizontalBand}`;
  const centerDistance = Math.hypot(x - 0.5, y - 0.5) / Math.hypot(0.5, 0.5);
  const radialBand = centerDistance <= 0.25 ? "central" : centerDistance <= 0.6 ? "mid-field" : "outer-field";

  return {
    grid_size: TILE_OBSERVATION_GRID_SIZE,
    row_band: rowBand,
    column_band: columnBand,
    quadrant,
    radial_band: radialBand,
    coordinate_percent: `${Math.round(x * 100)}% x, ${Math.round(y * 100)}% y`,
    interpretation: OBSERVATION_CLAIM_BOUNDARY,
  };
}

export function createTileObservation({ tile, label, target, overlay = "none", palette = "viridis", generatedAt = label?.ts || new Date().toISOString() }) {
  const xNorm = roundObservationCoordinate(target?.x_norm);
  const yNorm = roundObservationCoordinate(target?.y_norm);
  const zone = target?.zone_id ? target : getTileObservationZone({ xNorm, yNorm });
  const note = String(label?.note || "").trim().slice(0, 240);

  return assertContract("tileObservation", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    observation_id: `obs_${String(label?.label_id || Date.now().toString(36)).replace(/^lbl_/, "")}`,
    label_id: label.label_id,
    tile_id: tile.meta.tile_id,
    dataset: tile.meta.dataset || target?.dataset || "unknown",
    volunteer_id: label.volunteer_id,
    x_norm: xNorm,
    y_norm: yNorm,
    zone_id: zone.zone_id,
    zone_label: zone.zone_label,
    zone_row: zone.zone_row,
    zone_col: zone.zone_col,
    zone_taxonomy: createTileObservationTaxonomy({ xNorm, yNorm, zone }),
    clazz: label.clazz,
    severity: label.severity,
    note,
    overlay,
    palette,
    ts: generatedAt,
    review_status: DEFAULT_REVIEW_STATUS,
    reviewer_confidence: clampNumber(label?.weight, 0, 1, 0.5),
    consensus_status: DEFAULT_CONSENSUS_STATUS,
    adjudication_state: "single-reviewer placeholder; not validated consensus",
  });
}

export function createObservationReviewEvent({
  action,
  observation,
  label,
  eventIndex = 0,
  eventTs = new Date().toISOString(),
  reviewerId = observation?.updated_by || observation?.volunteer_id || label?.volunteer_id || "local-reviewer",
  reviewStatus = observation?.review_status || DEFAULT_REVIEW_STATUS,
  reviewerConfidence = observation?.reviewer_confidence ?? label?.weight ?? 0.5,
  consensusStatus = observation?.consensus_status || consensusStatusForReview(reviewStatus),
  revision = observation?.review_revision || 0,
  eventSummary,
  activeAfter = action !== "delete",
  adjudicationDecision,
  adjudicationState = observation?.adjudication_state,
  adjudicationNote = observation?.adjudication_note,
} = {}) {
  if (!observation?.observation_id) {
    throw new TypeError("Observation review events require a linked tile observation.");
  }
  const normalizedAction = normalizeReviewChoice(action, OBSERVATION_REVIEW_EVENT_ACTIONS, "event action");
  const normalizedStatus = normalizeReviewChoice(reviewStatus, OBSERVATION_REVIEW_STATUSES, "status");
  const normalizedConsensus = normalizeReviewChoice(consensusStatus, OBSERVATION_CONSENSUS_STATUSES, "consensus status");
  const normalizedDecision =
    adjudicationDecision === undefined
      ? undefined
      : normalizeReviewChoice(adjudicationDecision, OBSERVATION_ADJUDICATION_DECISIONS, "adjudication decision");
  const normalizedEventIndex = Math.max(0, Number.parseInt(eventIndex, 10) || 0);
  const normalizedRevision = Math.max(0, Number.parseInt(revision, 10) || 0);
  const summary = String(eventSummary || defaultReviewEventSummary(normalizedAction, observation, normalizedStatus)).trim().slice(0, 512);

  return assertContract(
    "observationReviewEvent",
    withoutUndefined({
      schema_version: CONTRACT_SCHEMA_VERSION,
      event_id: `orev_${normalizedEventIndex}_${safeId(observation.observation_id)}_${normalizedAction}_${safeId(eventTs)}`,
      event_index: normalizedEventIndex,
      observation_id: observation.observation_id,
      label_id: observation.label_id,
      tile_id: observation.tile_id,
      zone_id: observation.zone_id,
      zone_label: observation.zone_label,
      action: normalizedAction,
      reviewer_id: String(reviewerId || "local-reviewer").slice(0, 128),
      review_status: normalizedStatus,
      reviewer_confidence: roundConfidence(reviewerConfidence),
      consensus_status: normalizedConsensus,
      revision: normalizedRevision,
      event_ts: eventTs,
      event_summary: summary || "Observation review event recorded.",
      active_after: Boolean(activeAfter),
      claim_boundary: OBSERVATION_REVIEW_CLAIM_BOUNDARY,
      adjudication_decision: normalizedDecision,
      adjudication_state: adjudicationState ? String(adjudicationState).slice(0, 256) : undefined,
      adjudication_note: adjudicationNote ? String(adjudicationNote).slice(0, 512) : undefined,
    }),
  );
}

export function updateTileObservationReview({
  observation,
  label,
  updates = {},
  updatedAt = new Date().toISOString(),
  updatedBy = observation?.volunteer_id || label?.volunteer_id || "local-reviewer",
} = {}) {
  const clazz = normalizeReviewChoice(updates.clazz ?? observation?.clazz ?? label?.clazz, ARTIFACT_CLASSES, "artifact class");
  const severity = normalizeReviewChoice(updates.severity ?? observation?.severity ?? label?.severity, SEVERITY_LEVELS, "severity");
  const reviewStatus = normalizeReviewChoice(updates.reviewStatus ?? observation?.review_status ?? "reviewed", OBSERVATION_REVIEW_STATUSES, "status");
  const reviewerConfidence = roundConfidence(updates.reviewerConfidence ?? observation?.reviewer_confidence ?? label?.weight ?? 0.5);
  const consensusStatus = normalizeReviewChoice(
    updates.consensusStatus ?? consensusStatusForReview(reviewStatus),
    OBSERVATION_CONSENSUS_STATUSES,
    "consensus status",
  );
  const note = String(updates.note ?? observation?.note ?? label?.note ?? "").trim().slice(0, 240);
  if (!note) {
    throw new TypeError("Observation review note is required before saving an edited observation.");
  }

  const reviewRevision = Math.max(0, Number(observation?.review_revision ?? label?.review_revision ?? 0) || 0) + 1;
  const reviewFields = {
    review_state: "edited",
    review_revision: reviewRevision,
    updated_at: updatedAt,
    updated_by: String(updatedBy || "local-reviewer").slice(0, 128),
    edit_summary: summarizeReviewChanges(observation, { clazz, severity, note }),
    review_status: reviewStatus,
    reviewer_confidence: reviewerConfidence,
    consensus_status: consensusStatus,
    adjudication_state: updates.adjudicationState || adjudicationStateForReview(reviewStatus, consensusStatus),
    adjudication_note: updates.adjudicationNote ? String(updates.adjudicationNote).slice(0, 512) : undefined,
  };
  const nextObservation = assertContract("tileObservation", {
    ...observation,
    clazz,
    severity,
    note,
    ...reviewFields,
  });
  const nextLabel = label
    ? assertContract("labelRecord", {
        ...label,
        clazz,
        severity,
        note,
        ...reviewFields,
      })
    : null;

  return {
    observation: nextObservation,
    label: nextLabel,
    edit_summary: reviewFields.edit_summary,
  };
}

export function adjudicateTileObservationReview({
  observation,
  label,
  decision = "defer",
  note = "",
  updatedAt = new Date().toISOString(),
  updatedBy = observation?.volunteer_id || label?.volunteer_id || "local-reviewer",
} = {}) {
  const normalizedDecision = normalizeReviewChoice(decision, OBSERVATION_ADJUDICATION_DECISIONS, "adjudication decision");
  const config = ADJUDICATION_DECISION_CONFIG[normalizedDecision];
  const adjudicationNote = String(note || "").trim().slice(0, 512);
  if (!adjudicationNote) {
    throw new TypeError("Adjudication note is required before recording a queue decision.");
  }
  const result = updateTileObservationReview({
    observation,
    label,
    updates: {
      clazz: observation?.clazz,
      severity: observation?.severity,
      note: observation?.note || label?.note,
      reviewStatus: config.reviewStatus,
      reviewerConfidence: observation?.reviewer_confidence ?? label?.weight ?? 0.5,
      consensusStatus: config.consensusStatus,
      adjudicationState: config.adjudicationState,
      adjudicationNote,
    },
    updatedAt,
    updatedBy,
  });

  return {
    ...result,
    adjudication_decision: normalizedDecision,
    event_action: config.action,
    event_summary: `${config.summary} Note: ${adjudicationNote}`,
  };
}

export function summarizeTileObservations(observations = [], reviewEvents = []) {
  const records = observations.filter(Boolean);
  const events = reviewEvents.filter(Boolean);
  const zoneCounts = countRecords(records, (observation) => observation.zone_id, (observation) => observation.zone_label);
  const summary = {
    schema_version: CONTRACT_SCHEMA_VERSION,
    observation_count: records.length,
    observed_tile_count: new Set(records.map((observation) => observation.tile_id)).size,
    observed_zone_count: zoneCounts.length,
    note_count: records.filter((observation) => String(observation.note || "").trim()).length,
    tile_counts: countRecords(records, (observation) => observation.tile_id, (observation) => observation.tile_id),
    zone_counts: zoneCounts,
    tile_zone_counts: countRecords(
      records,
      (observation) => `${observation.tile_id}:${observation.zone_id}`,
      (observation) => `${observation.tile_id} ${observation.zone_label}`,
    ),
    row_band_counts: countTaxonomy(records, "row_band"),
    column_band_counts: countTaxonomy(records, "column_band"),
    radial_band_counts: countTaxonomy(records, "radial_band"),
    class_counts: countRecords(records, (observation) => observation.clazz, (observation) => observation.clazz),
    severity_counts: countRecords(records, (observation) => observation.severity, (observation) => observation.severity),
    note_status_counts: countRecords(
      records,
      (observation) => (String(observation.note || "").trim() ? "with_note" : "missing_note"),
      (observation) => (String(observation.note || "").trim() ? "with note" : "missing note"),
    ),
    review_state_counts: countRecords(
      records,
      (observation) => observation.review_state || "submitted",
      (observation) => observation.review_state || "submitted",
    ),
    review_status_counts: countRecords(
      records,
      (observation) => observation.review_status || DEFAULT_REVIEW_STATUS,
      (observation) => observation.review_status || DEFAULT_REVIEW_STATUS,
    ),
    consensus_status_counts: countRecords(
      records,
      (observation) => observation.consensus_status || DEFAULT_CONSENSUS_STATUS,
      (observation) => observation.consensus_status || DEFAULT_CONSENSUS_STATUS,
    ),
    review_event_count: events.length,
    reviewed_observation_count: records.filter((observation) => observation.review_status === "reviewed").length,
    needs_adjudication_count: records.filter(
      (observation) => observation.review_status === "needs-adjudication" || observation.consensus_status === "needs-adjudication",
    ).length,
    average_reviewer_confidence: averageConfidence(records),
    tile_qa_metrics: createQaMetrics({
      records,
      events,
      recordKey: (observation) => observation.tile_id,
      recordLabel: (observation) => observation.tile_id,
      eventKey: (event) => event.tile_id,
      eventLabel: (event) => event.tile_id,
    }),
    zone_qa_metrics: createQaMetrics({
      records,
      events,
      recordKey: (observation) => observation.zone_id,
      recordLabel: (observation) => observation.zone_label,
      eventKey: (event) => event.zone_id,
      eventLabel: (event) => event.zone_label,
    }),
  };
  const dominantZone = zoneCounts[0];
  if (dominantZone) {
    summary.dominant_zone_label = dominantZone.label;
  }

  return assertContract("tileObservationSummary", summary);
}

function normalizeReviewChoice(value, allowed, label) {
  const normalized = String(value || "");
  if (!allowed.includes(normalized)) {
    throw new TypeError(`Unsupported observation review ${label}: ${normalized || "blank"}`);
  }
  return normalized;
}

function summarizeReviewChanges(previous, next) {
  const changes = [];
  if (previous?.clazz !== next.clazz) {
    changes.push(`class ${previous?.clazz || "unknown"} -> ${next.clazz}`);
  }
  if (previous?.severity !== next.severity) {
    changes.push(`severity ${previous?.severity || "unknown"} -> ${next.severity}`);
  }
  if (String(previous?.note || "") !== next.note) {
    changes.push("note updated");
  }
  return changes.length ? changes.join("; ") : "review metadata refreshed";
}

function defaultReviewEventSummary(action, observation, reviewStatus) {
  const zone = observation?.zone_label || observation?.zone_id || "unknown zone";
  if (action === "create") {
    return `Observation submitted at ${zone}; review status ${reviewStatus}.`;
  }
  if (action === "edit") {
    return observation?.edit_summary || `Observation review edited at ${zone}; review status ${reviewStatus}.`;
  }
  if (action === "delete") {
    return `Observation removed from active exports at ${zone}; ledger event retained.`;
  }
  if (action === "restore") {
    return `Observation restored to active evidence exports at ${zone}.`;
  }
  if (action === "adjudication-defer") {
    return `Adjudication deferred at ${zone}; independent review remains required.`;
  }
  if (action === "adjudication-second-review") {
    return `Second review requested at ${zone}; consensus remains unresolved.`;
  }
  if (action === "adjudication-reviewed") {
    return `Observation marked reviewed from adjudication queue at ${zone}; no scientific consensus claim.`;
  }
  return `Observation review event recorded at ${zone}.`;
}

function consensusStatusForReview(reviewStatus) {
  if (reviewStatus === "reviewed") {
    return "single-reviewer";
  }
  if (reviewStatus === "needs-adjudication") {
    return "needs-adjudication";
  }
  return DEFAULT_CONSENSUS_STATUS;
}

function adjudicationStateForReview(reviewStatus, consensusStatus) {
  if (reviewStatus === "needs-adjudication" || consensusStatus === "needs-adjudication") {
    return "adjudication placeholder; requires independent expert review before consensus claims";
  }
  if (reviewStatus === "reviewed") {
    return "single-reviewer QA only; not validated scientific consensus";
  }
  return "pending QA review; not validated scientific consensus";
}

function createQaMetrics({ records, events, recordKey, recordLabel, eventKey, eventLabel }) {
  const groupedRecords = groupBy(records, recordKey);
  const groupedEvents = groupBy(events, eventKey);
  const labels = new Map();
  for (const record of records) {
    labels.set(String(recordKey(record) || "unknown"), String(recordLabel(record) || recordKey(record) || "unknown"));
  }
  for (const event of events) {
    labels.set(String(eventKey(event) || "unknown"), String(eventLabel(event) || eventKey(event) || "unknown"));
  }

  return [...labels.keys()]
    .map((key) => {
      const groupRecords = groupedRecords.get(key) || [];
      const groupEvents = groupedEvents.get(key) || [];
      return {
        key,
        label: labels.get(key) || key,
        observation_count: groupRecords.length,
        reviewed_count: groupRecords.filter((observation) => observation.review_status === "reviewed").length,
        needs_adjudication_count: groupRecords.filter(
          (observation) => observation.review_status === "needs-adjudication" || observation.consensus_status === "needs-adjudication",
        ).length,
        ledger_event_count: groupEvents.length,
        average_reviewer_confidence: averageConfidence(groupRecords),
      };
    })
    .sort((left, right) => right.ledger_event_count - left.ledger_event_count || right.observation_count - left.observation_count || left.key.localeCompare(right.key));
}

function groupBy(records, getKey) {
  const groups = new Map();
  for (const record of records) {
    const key = String(getKey(record) || "unknown");
    const group = groups.get(key) || [];
    group.push(record);
    groups.set(key, group);
  }
  return groups;
}

function averageConfidence(records) {
  const values = records.map((record) => Number(record.reviewer_confidence)).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return 0;
  }
  return roundConfidence(values.reduce((total, value) => total + value, 0) / values.length);
}

function roundConfidence(value) {
  return Number(clampNumber(value, 0, 1, 0.5).toFixed(2));
}

function withoutUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

function safeId(value) {
  return String(value || "event").replace(/[^A-Za-z0-9._:-]+/g, "_");
}

function countTaxonomy(records, key) {
  return countRecords(
    records,
    (observation) => (observation.zone_taxonomy || createTileObservationTaxonomy(observation))[key],
    (observation) => (observation.zone_taxonomy || createTileObservationTaxonomy(observation))[key],
  );
}

function countRecords(records, getKey, getLabel) {
  const counts = new Map();
  for (const record of records) {
    const key = String(getKey(record) || "unknown");
    const label = String(getLabel(record) || key);
    const current = counts.get(key) || { key, label, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }

  return [...counts.values()].sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, numeric));
}

function normalizeRotation(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_VIEWER_TRANSFORM.rotationDeg;
  }
  return ((numeric % 360) + 360) % 360;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function formatMatrixNumber(value) {
  return Number(value.toFixed(6));
}
