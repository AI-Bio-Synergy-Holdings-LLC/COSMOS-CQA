import { assertContract } from "../../../schemas/src/index.js";

export function buildCSV(rows, columns) {
  if (!rows || !rows.length) {
    return "";
  }

  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = columns.join(",");
  const body = rows.map((row) => columns.map((column) => escape(row[column])).join(",")).join("\n");
  return `${header}\n${body}\n`;
}

export function createVolunteerLabel({ tile, state, controls }) {
  return assertContract("labelRecord", {
    label_id: `lbl_${Math.random().toString(36).slice(2, 6)}`,
    tile_id: tile.meta.tile_id,
    dataset: tile.meta.dataset,
    volunteer_id: state.volunteerId,
    _truth: tile.meta.truth,
    clazz: controls.classSelect.value,
    severity: controls.severitySelect.value,
    note: (controls.noteInput.value || "").slice(0, 240),
    weight: state.weight,
    ts: new Date().toISOString(),
  });
}

export function labelsToRows(labels, tiles, expertDecisions) {
  return labels.map((label) => {
    const meta = tiles.find((tile) => tile.meta.tile_id === label.tile_id)?.meta || {};
    const expert = expertDecisions.find((decision) => decision.tile_id === label.tile_id) || {};

    return assertContract("labelExportRow", {
      tile_id: label.tile_id,
      dataset: meta.dataset || "",
      volunteer_id: label.volunteer_id,
      clazz: label.clazz,
      severity: label.severity,
      note: label.note,
      weight: label.weight,
      ts: label.ts,
      expert_class: expert.expert_class || "",
      expert_confidence: expert.expert_confidence || "",
      expert_latency: expert.latency_s || "",
    });
  });
}
