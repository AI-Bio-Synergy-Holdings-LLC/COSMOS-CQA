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
