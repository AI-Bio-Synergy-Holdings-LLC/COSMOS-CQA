import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";

export const TILE_OBSERVATION_GRID_SIZE = 3;

const ROW_LABELS = ["top", "middle", "bottom"];
const COL_LABELS = ["left", "center", "right"];

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

  return {
    zone_id: `r${row}c${col}`,
    zone_label: `${ROW_LABELS[row - 1] || `row ${row}`} ${COL_LABELS[col - 1] || `column ${col}`}`,
    zone_row: row,
    zone_col: col,
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
    clazz: label.clazz,
    severity: label.severity,
    note,
    overlay,
    palette,
    ts: generatedAt,
  });
}
