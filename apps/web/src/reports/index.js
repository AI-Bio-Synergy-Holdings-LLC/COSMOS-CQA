export { createSbom, createValidationReport } from "../../../../packages/core/src/reports/index.js";

export function downloadBlob({ contents, type, filename }) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadJson(data, filename) {
  downloadBlob({
    contents: JSON.stringify(data, null, 2),
    type: "application/json",
    filename,
  });
}

export function downloadCsv(csv, filename) {
  downloadBlob({
    contents: csv,
    type: "text/csv",
    filename,
  });
}
