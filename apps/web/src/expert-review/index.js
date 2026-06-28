export function scoreResidual(meta, random = Math.random) {
  const truth = meta.truth?.class || "clean";
  const stripe = truth === "stripe" ? 0.9 : 0.2 + random() * 0.3;
  const dipole = truth === "dipole" ? 0.9 : 0.2 + random() * 0.3;
  const ringing = truth === "ringing" ? 0.9 : 0.2 + random() * 0.3;
  return Math.max(stripe, dipole, ringing);
}

export function enqueueExpert(state, meta, random = Math.random) {
  const residualScore = scoreResidual(meta, random);
  const entry = {
    tile_id: meta.tile_id,
    score: residualScore,
    truth: meta.truth?.class !== "clean",
  };

  state.scores.push(entry);
  return entry;
}

export function getRecentScores(state, count = 6) {
  return state.scores.slice(-count);
}

export function createExpertDecision({ scoreEntry, decision, confidence, note, startedAt, decidedAt = Date.now() }) {
  const expertClass = decision === "confirm" ? "residual" : "clean";
  const latency = ((decidedAt - (startedAt || decidedAt)) / 1000).toFixed(2);

  return {
    tile_id: scoreEntry.tile_id,
    expert_class: expertClass,
    expert_confidence: confidence,
    note,
    latency_s: latency,
  };
}

export function saveExpertDecisions(expertDecisions, storage = localStorage) {
  storage.setItem("expert", JSON.stringify(expertDecisions));
}

