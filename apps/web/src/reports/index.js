export function createSbom() {
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.4",
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        type: "application",
        name: "COSMOS-CQA Research Workbench",
        version: "0.0.0-source-split",
      },
    },
    components: [
      {
        type: "library",
        name: "Chart.js",
        version: "4.4.1",
        purl: "pkg:npm/chart.js@4.4.1",
        licenses: [{ license: { id: "MIT" } }],
      },
    ],
  };
}

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

