import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../schemas/src/index.js";

export const DIAGNOSTIC_CONCEPTS = Object.freeze([
  {
    diagnostic_id: "diag_kappa_y_crosscheck",
    name: "Kappa-y cross-correlation review placeholder",
    status: "prototype-note",
    implementation_state: "documentation-only",
    source: "Roadmap and archive provenance note for the missing nested CSSFP/Core Pack prototype; no prototype code is imported.",
    caveat:
      "This is a review concept only. It is not a validated cosmology diagnostic, does not estimate physical parameters, and must not be reported as evidence of foreground detection, lensing quality, or survey performance without independent scientific review.",
    allowed_use:
      "Use only as a research-triage note for future expert review of possible cross-map QA features.",
    blocked_until: [
      "the original CSSFP/Core Pack prototype source is available with provenance",
      "license and redistribution terms are reviewed",
      "the proposed statistic is independently reviewed by qualified domain experts",
      "validation fixtures define expected inputs, outputs, and failure modes",
    ],
    claim_boundary_refs: ["docs/claim-boundaries.md", "docs/scientific-scope.md"],
  },
  {
    diagnostic_id: "diag_eb_residual_placeholder",
    name: "E/B residual review placeholder",
    status: "prototype-note",
    implementation_state: "documentation-only",
    source: "Roadmap and archive provenance note for the missing nested CSSFP/Core Pack prototype; no prototype code is imported.",
    caveat:
      "This is a review concept only. It is not a validated weak-lensing diagnostic, does not separate physical E/B modes, and must not be used to claim survey calibration, bias reduction, or artifact detection performance without independent scientific review.",
    allowed_use:
      "Use only as a research-triage note for future expert review of possible residual-map QA features.",
    blocked_until: [
      "the original CSSFP/Core Pack prototype source is available with provenance",
      "license and redistribution terms are reviewed",
      "domain experts define scientifically meaningful E/B inputs and outputs",
      "validation fixtures define expected inputs, outputs, and failure modes",
    ],
    claim_boundary_refs: ["docs/claim-boundaries.md", "docs/scientific-scope.md"],
  },
]);

const CLAIM_BOUNDARY_REFS = Object.freeze(["docs/claim-boundaries.md", "docs/scientific-scope.md"]);

export function getDiagnosticConcept(diagnosticId) {
  return DIAGNOSTIC_CONCEPTS.find((concept) => concept.diagnostic_id === diagnosticId) || null;
}

export function diagnosticRefsForCorePack() {
  return DIAGNOSTIC_CONCEPTS.map((concept) => ({
    ...concept,
    blocked_until: [...concept.blocked_until],
    claim_boundary_refs: [...concept.claim_boundary_refs],
  }));
}

export function validateDiagnosticConcepts(concepts) {
  const errors = [];
  for (const concept of concepts) {
    if (!concept.caveat || concept.caveat.length < 80) {
      errors.push(`${concept.diagnostic_id || "diagnostic"}: caveat must be explicit and at least 80 characters`);
    }
    if (!["not-implemented", "documentation-only"].includes(concept.implementation_state)) {
      errors.push(`${concept.diagnostic_id}: executable diagnostic implementations are blocked in the intake lane`);
    }
    if (!concept.blocked_until?.length) {
      errors.push(`${concept.diagnostic_id}: blocked_until must list scientific and provenance gates`);
    }
  }
  return errors;
}

export function createKappaYPlaceholder({ manifest, generatedAt = new Date().toISOString() } = {}) {
  const summary = summarizeManifestInput(manifest);
  const coordinateSignal = round6(mean(summary.tiles.map((tile) => normalizeRa(tile.ra))) * 0.58);
  const latitudeSignal = round6(mean(summary.tiles.map((tile) => normalizeDec(tile.dec))) * 0.27);
  const checksumSignal = round6(mean(summary.tiles.map((tile) => checksumUnit(tile.checksum))) * 0.15);
  const placeholderScore = round6(coordinateSignal + latitudeSignal + checksumSignal);

  return assertContract("diagnosticResult", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    diagnostic_id: "diag_kappa_y_crosscheck",
    name: "Kappa-y cross-correlation review placeholder",
    status: "placeholder",
    implementation_state: "placeholder",
    generated_at: generatedAt,
    input_summary: {
      source: summary.source,
      tile_count: summary.tiles.length,
      dataset_ids: summary.datasetIds,
    },
    outputs: [
      {
        key: "placeholder_score",
        label: "Placeholder score",
        value: placeholderScore,
        unit: "unitless",
        meaning:
          "Deterministic synthetic triage score derived from sample coordinates and checksums; it is not a kappa-y statistic.",
      },
      {
        key: "coordinate_component",
        label: "Coordinate component",
        value: coordinateSignal,
        unit: "unitless",
        meaning: "Normalized RA contribution used only to make the placeholder replayable.",
      },
      {
        key: "latitude_component",
        label: "Latitude component",
        value: latitudeSignal,
        unit: "unitless",
        meaning: "Normalized declination contribution used only to make the placeholder replayable.",
      },
      {
        key: "checksum_component",
        label: "Checksum component",
        value: checksumSignal,
        unit: "unitless",
        meaning: "Checksum-derived contribution used only to make the placeholder deterministic.",
      },
    ],
    caveat:
      "This placeholder is not a validated cosmology diagnostic, does not estimate a physical kappa-y cross-correlation, and must not be used as evidence of foreground detection, lensing quality, survey performance, or scientific validity.",
    limitations: [
      "Uses synthetic Core Pack contract fixture fields only; no CMB, lensing, Compton-y, mask, covariance, or survey data are analyzed.",
      "The score is a deterministic replay fixture for research workflow plumbing and expert review planning.",
      "Any future scientific implementation requires source provenance, rights review, domain review, fixtures, and validation.",
    ],
    claim_boundary_refs: [...CLAIM_BOUNDARY_REFS],
  });
}

export function createEbResidualPlaceholder({ manifest, generatedAt = new Date().toISOString() } = {}) {
  const summary = summarizeManifestInput(manifest);
  const residualFraction = round6(residualTileFraction(summary.tiles));
  const paritySignal = round6(mean(summary.tiles.map((tile, index) => parityUnit(tile, index))) * 0.62);
  const checksumSignal = round6(mean(summary.tiles.map((tile) => checksumUnit(tile.checksum))) * 0.38);
  const placeholderScore = round6(paritySignal + checksumSignal);

  return assertContract("diagnosticResult", {
    schema_version: CONTRACT_SCHEMA_VERSION,
    diagnostic_id: "diag_eb_residual_placeholder",
    name: "E/B residual review placeholder",
    status: "placeholder",
    implementation_state: "placeholder",
    generated_at: generatedAt,
    input_summary: {
      source: summary.source,
      tile_count: summary.tiles.length,
      dataset_ids: summary.datasetIds,
    },
    outputs: [
      {
        key: "placeholder_score",
        label: "Placeholder score",
        value: placeholderScore,
        unit: "unitless",
        meaning:
          "Deterministic synthetic triage score derived from sample tile ordering and checksums; it is not an E/B separation.",
      },
      {
        key: "residual_tile_fraction",
        label: "Residual tile fraction",
        value: residualFraction,
        unit: "fraction",
        meaning: "Fraction of sample tiles whose synthetic truth label is not clean; this is not a survey residual estimate.",
      },
      {
        key: "parity_component",
        label: "Parity component",
        value: paritySignal,
        unit: "unitless",
        meaning: "Tile-order parity contribution used only to make the placeholder replayable.",
      },
      {
        key: "checksum_component",
        label: "Checksum component",
        value: checksumSignal,
        unit: "unitless",
        meaning: "Checksum-derived contribution used only to make the placeholder deterministic.",
      },
    ],
    caveat:
      "This placeholder is not a validated weak-lensing diagnostic, does not separate physical E and B modes, and must not be used to claim survey calibration, bias reduction, artifact detection performance, or scientific validity.",
    limitations: [
      "Uses synthetic Core Pack contract fixture fields only; no shear catalog, map transform, mask, covariance, or survey calibration data are analyzed.",
      "The score is a deterministic replay fixture for research workflow plumbing and expert review planning.",
      "Any future scientific implementation requires source provenance, rights review, domain review, fixtures, and validation.",
    ],
    claim_boundary_refs: [...CLAIM_BOUNDARY_REFS],
  });
}

export function createDiagnosticPlaceholders({ manifest, generatedAt = new Date().toISOString() } = {}) {
  return [
    createKappaYPlaceholder({ manifest, generatedAt }),
    createEbResidualPlaceholder({ manifest, generatedAt }),
  ];
}

function summarizeManifestInput(manifest = {}) {
  const tiles = Array.isArray(manifest.tiles) ? manifest.tiles : [];
  const datasetIds = [...new Set(tiles.map((tile) => String(tile.dataset || "unknown")))].sort();
  return {
    source: manifest.manifest_id || "corepack_manifest",
    tiles,
    datasetIds: datasetIds.length ? datasetIds : ["unknown"],
  };
}

function normalizeRa(value) {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number / 360, 0, 1) : 0;
}

function normalizeDec(value) {
  const number = Number(value);
  return Number.isFinite(number) ? clamp((number + 90) / 180, 0, 1) : 0;
}

function checksumUnit(value = "") {
  const text = String(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

function residualTileFraction(tiles) {
  if (!tiles.length) {
    return 0;
  }
  return tiles.filter((tile) => tile.truth?.class && tile.truth.class !== "clean").length / tiles.length;
}

function parityUnit(tile, index) {
  const ra = normalizeRa(tile.ra);
  const dec = normalizeDec(tile.dec);
  const polarity = index % 2 === 0 ? 1 : -1;
  return clamp(0.5 + (ra - dec) * polarity, 0, 1);
}

function mean(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round6(value) {
  return Number(value.toFixed(6));
}
