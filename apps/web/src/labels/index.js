export { buildCSV, createVolunteerLabel, labelsToRows } from "../../../../packages/core/src/labels/index.js";

export function saveLabels(labels, storage = localStorage) {
  storage.setItem("labels", JSON.stringify(labels));
}

export function saveObservations(observations, storage = localStorage) {
  storage.setItem("tileObservations", JSON.stringify(observations));
}

export function undoLastLabel(state, storage = localStorage) {
  const removed = state.labels.pop();
  saveLabels(state.labels, storage);
  return removed;
}

export function removeObservationForLabel(state, labelId, storage = localStorage) {
  const index = state.observations.findIndex((observation) => observation.label_id === labelId);
  if (index < 0) {
    return null;
  }

  const [removed] = state.observations.splice(index, 1);
  saveObservations(state.observations, storage);
  return removed;
}
