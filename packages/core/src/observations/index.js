import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";

export const TILE_OBSERVATION_GRID_SIZE = 3;

const ROW_LABELS = ["top", "middle", "bottom"];
const COL_LABELS = ["left", "center", "right"];
const OBSERVATION_CLAIM_BOUNDARY =
  "Reviewer-authored spatial target; interpret as a source-tile location cue, not measured sky coordinates or a validated detection.";

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
  });
}

export function summarizeTileObservations(observations = []) {
  const records = observations.filter(Boolean);
  const zoneCounts = countRecords(records, (observation) => observation.zone_id, (observation) => observation.zone_label);
  const summary = {
    schema_version: CONTRACT_SCHEMA_VERSION,
    observation_count: records.length,
    observed_tile_count: new Set(records.map((observation) => observation.tile_id)).size,
    observed_zone_count: zoneCounts.length,
    note_count: records.filter((observation) => String(observation.note || "").trim()).length,
    zone_counts: zoneCounts,
    row_band_counts: countTaxonomy(records, "row_band"),
    column_band_counts: countTaxonomy(records, "column_band"),
    radial_band_counts: countTaxonomy(records, "radial_band"),
    class_counts: countRecords(records, (observation) => observation.clazz, (observation) => observation.clazz),
    severity_counts: countRecords(records, (observation) => observation.severity, (observation) => observation.severity),
  };
  const dominantZone = zoneCounts[0];
  if (dominantZone) {
    summary.dominant_zone_label = dominantZone.label;
  }

  return assertContract("tileObservationSummary", summary);
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
