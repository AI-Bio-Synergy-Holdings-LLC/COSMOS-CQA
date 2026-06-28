export { buildCSV, createVolunteerLabel, labelsToRows } from "../../../../packages/core/src/labels/index.js";

export function saveLabels(labels, storage = localStorage) {
  storage.setItem("labels", JSON.stringify(labels));
}

export function undoLastLabel(state, storage = localStorage) {
  const removed = state.labels.pop();
  saveLabels(state.labels, storage);
  return removed;
}
