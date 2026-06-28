export const KPI_WINDOWS = {
  pr: 256,
  reliability: 512,
  latency: 50,
};

export function ema(previous, value, alpha) {
  return previous == null || Number.isNaN(previous) ? value : alpha * value + (1 - alpha) * previous;
}

export function prAUC(points) {
  if (points.length < 2) {
    return 0;
  }

  const sorted = [...points].sort((a, b) => b.thresh - a.thresh);
  let previousPrecision = 0;
  let previousRecall = 0;
  let auc = 0;

  for (const point of sorted) {
    auc += (point.r - previousRecall) * ((point.p + previousPrecision) / 2);
    previousPrecision = point.p;
    previousRecall = point.r;
  }

  return Math.max(0, Math.min(1, auc));
}

export function computePR(scores, windowSize = KPI_WINDOWS.pr) {
  if (scores.length < 3) {
    return { p: 0, r: 0, auc: 0, pts: [] };
  }

  const windowed = scores.slice(-windowSize);
  const thresholds = [...new Set(windowed.map((score) => score.score).sort((a, b) => b - a))];
  const pts = [];

  for (const threshold of thresholds) {
    let tp = 0;
    let fp = 0;
    let fn = 0;

    for (const score of windowed) {
      const predicted = score.score >= threshold;
      if (predicted && score.truth) {
        tp += 1;
      } else if (predicted && !score.truth) {
        fp += 1;
      } else if (!predicted && score.truth) {
        fn += 1;
      }
    }

    pts.push({
      thresh: threshold,
      p: tp / (tp + fp + 1e-6),
      r: tp / (tp + fn + 1e-6),
    });
  }

  const first = pts[0] || { p: 0, r: 0 };
  return { p: first.p, r: first.r, auc: prAUC(pts), pts };
}

export function recordVolunteerFlag(state, timestamp) {
  const previous = state.lastFlagTs;
  state.lastFlagTs = timestamp;

  if (previous) {
    const deltaMinutes = (timestamp - previous) / 60000;
    state.rateEMA = ema(state.rateEMA, deltaMinutes > 0 ? 1 / deltaMinutes : 0, 0.3);
  } else {
    state.rateEMA = ema(state.rateEMA, 1, 0.3);
  }

  state.histTime.push(timestamp);
  state.histRate.push(Number(state.rateEMA.toFixed(3)));
}

export function recordExpertMetric(state, timestamp, confidence, latency) {
  state.latEMA = ema(state.latEMA, latency, 0.25);
  const bin = confidence <= 0.65 ? "low" : confidence < 0.85 ? "mid" : "high";

  for (const key of ["low", "mid", "high"]) {
    state.confEMA[key] = ema(state.confEMA[key], key === bin ? 1 : 0, 0.3);
  }

  state.histTime.push(timestamp);
  state.histLat.push(Number(state.latEMA.toFixed(3)));
}

export function calculateReliability(labels, weight) {
  if (!labels.length) {
    return null;
  }

  let agree = 0;
  for (const label of labels.slice(-KPI_WINDOWS.reliability)) {
    const truthIsResidual = label._truth && label._truth.class !== "clean";
    const predictedResidual = label.clazz !== "clean";
    if (truthIsResidual === predictedResidual) {
      agree += 1;
    }
  }

  const windowedLength = labels.slice(-KPI_WINDOWS.reliability).length;
  const observed = agree / windowedLength;
  const expected = 0.5;
  const kappa = (observed - expected) / (1 - expected);
  const alpha = Math.max(0, Math.min(1, weight * 0.8));

  return {
    kappa: Number.isFinite(kappa) ? kappa : 0,
    alpha,
  };
}

export function calculateMedianLatency(startTimes) {
  const times = Object.values(startTimes).slice(-KPI_WINDOWS.latency);
  if (!times.length) {
    return null;
  }
  return (Date.now() - Math.min(...times)) / 1000;
}

export function calculateAccessibilityCoverage({ captions, usedKeyboard, palette }) {
  let pass = 0;
  const total = 3;
  if (captions) pass += 1;
  if (usedKeyboard) pass += 1;
  if (["viridis", "cividis"].includes(palette)) pass += 1;
  return pass / total;
}
