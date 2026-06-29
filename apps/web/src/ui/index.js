import { createExpertDecision, enqueueExpert, getRecentScores, saveExpertDecisions } from "../expert-review/index.js";
import { tileMetasFromCorePack } from "../core-pack/index.js";
import { createDiagnosticPlaceholders } from "../diagnostics/index.js";
import { buildCSV, createVolunteerLabel, labelsToRows, saveLabels, undoLastLabel } from "../labels/index.js";
import {
  calculateAccessibilityCoverage,
  calculateMedianLatency,
  calculateReliability,
  computePR,
  ema,
  prAUC,
  recordExpertMetric,
  recordVolunteerFlag,
} from "../metrics/index.js";
import {
  createBookmarkPayload,
  createBookmarkUrl,
  createBuildInfo,
  createProvenanceHash,
  decodeBookmarkPayload,
  notifyTestBridge,
  sha256Text,
  writeClipboard,
} from "../provenance/index.js";
import { parseResearchArtifactPayload } from "../research-artifacts/index.js";
import { createSbom, createSbomReference, createValidationReport, downloadCsv, downloadJson } from "../reports/index.js";
import { applyPalette, createAudioController, drawOverlay, makeAudioMapForTile } from "../sidecars/index.js";
import { createDemoTiles, synthTile } from "../tile-synthesis/index.js";

const HINTS = {
  stripe: "Hint: scan-synchronous lines often appear as vertical or horizontal banding; check line energy.",
  dipole: "Hint: dipole patterns show a left-right or up-down gradient.",
  ringing: "Hint: ringing appears as concentric ripples around bright structures.",
  point: "Hint: residual point sources are small bright dots; look for high-frequency peaks.",
  clean: "Hint: if none of the artifact cues are evident, mark clean.",
};

export function formatTileOptionLabel(meta, config = {}) {
  return config.dev && meta.truth?.class ? `${meta.tile_id} - ${meta.truth.class}` : meta.tile_id;
}

export function truthTagDisplay(config = {}) {
  return config.dev ? "" : "none";
}

export function createCosmosWorkbench({ documentRef = document, windowRef = window, tiles, state, config }) {
  const dom = bindDom(documentRef);
  const ctx = dom.tileCanvas.getContext("2d");
  const build = createBuildInfo(config);
  let feedWS = null;
  let feedTimer = null;
  let charts = { pr: null, live: null, ops: null, conf: null };
  const liveSeries = [];
  const calibration = { mode: "wizard", gate: "learning", active: false, tiles: [], index: 0, correct: 0 };

  const audio = createAudioController({
    state,
    controls: {
      playButton: dom.playBtn,
      progressBar: dom.prog,
    },
    getPalette: () => dom.paletteSel.value,
    setCaption,
  });

  function setCaption(message) {
    if (dom.captionsChk.checked || message === "") {
      dom.caption.textContent = message;
    }
  }

  function populateTileSelect() {
    dom.tileSelect.innerHTML = "";
    tiles.forEach((tile, index) => {
      const option = documentRef.createElement("option");
      option.value = String(index);
      option.textContent = formatTileOptionLabel(tile.meta, config);
      dom.tileSelect.appendChild(option);
    });
  }

  function drawTile(index = state.idx) {
    const tile = tiles[index];
    if (!tile) {
      return;
    }

    state.idx = index;
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(tile.canvas, 0, 0, 512, 512);
    applyPalette(ctx, dom.paletteSel.value);
    drawOverlay(ctx, dom.overlaySel.value);
    dom.tileId.textContent = tile.meta.tile_id;
    dom.truthTag.textContent = `truth: ${tile.meta.truth.class}`;
    dom.truthTag.style.display = truthTagDisplay(config);
    dom.tileSelect.value = String(index);
  }

  function updateChart(chartRef, id, configValue) {
    const canvas = documentRef.getElementById(id);
    if (!windowRef.Chart) {
      return updateFallbackChart(chartRef, canvas, configValue);
    }

    if (chartRef) {
      chartRef.data = configValue.data;
      chartRef.options = configValue.options || chartRef.options;
      chartRef.update();
      return chartRef;
    }

    return new windowRef.Chart(canvas.getContext("2d"), configValue);
  }

  function updateFallbackChart(chartRef, canvas, configValue) {
    const chart = chartRef?.fallback
      ? chartRef
      : {
          fallback: true,
          type: configValue.type,
          data: configValue.data,
          options: configValue.options || {},
          update() {
            drawFallbackChart(canvas, this.type, this.data);
          },
        };

    chart.type = configValue.type;
    chart.data = configValue.data;
    chart.options = configValue.options || {};
    chart.update();
    return chart;
  }

  function updatePRChart() {
    const { pts } = computePR(state.scores);
    charts.pr = updateChart(charts.pr, "prChart", {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "PR",
            data: pts.map((point) => ({ x: point.r, y: point.p })),
            borderColor: "#60a5fa",
            backgroundColor: "#60a5fa",
            showLine: true,
            tension: 0.2,
          },
        ],
      },
      options: {
        animation: false,
        scales: {
          x: { min: 0, max: 1, title: { display: true, text: "Recall" } },
          y: { min: 0, max: 1, title: { display: true, text: "Precision" } },
        },
      },
    });
  }

  function updateOpsChart() {
    const labels = state.histTime.slice(-100).map((timestamp) => new Date(timestamp).toLocaleTimeString());
    charts.ops = updateChart(charts.ops, "opsChart", {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Flags/min",
            data: state.histRate.slice(-100),
            borderColor: "#60a5fa",
            backgroundColor: "rgba(96,165,250,0.2)",
            tension: 0.25,
          },
          {
            label: "Latency (s)",
            data: state.histLat.slice(-100),
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.15)",
            tension: 0.25,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        animation: false,
        scales: {
          y: { beginAtZero: true },
          y1: { beginAtZero: true, position: "right" },
        },
      },
    });
  }

  function updateConfChart() {
    charts.conf = updateChart(charts.conf, "confChart", {
      type: "bar",
      data: {
        labels: ["0.6", "0.75", "0.9"],
        datasets: [
          {
            label: "Expert confidence",
            data: [state.confEMA.low, state.confEMA.mid, state.confEMA.high],
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.35)",
          },
        ],
      },
      options: {
        animation: false,
        scales: { y: { beginAtZero: true, max: 1 } },
      },
    });
  }

  function updateLiveChart() {
    const points = liveSeries.slice(-200);
    charts.live = updateChart(charts.live, "liveChart", {
      type: "line",
      data: {
        labels: points.map((point) => new Date(point.t).toLocaleTimeString()),
        datasets: [
          {
            label: "Residual score",
            data: points.map((point) => point.v),
            borderColor: "#e0b35a",
            backgroundColor: "rgba(224,179,90,0.2)",
            tension: 0.2,
          },
        ],
      },
      options: {
        animation: false,
        scales: { y: { min: 0, max: 1 } },
      },
    });
  }

  function recalcKPIs(fromCalibration = false) {
    const pr = computePR(state.scores);
    dom.kpiPR.textContent = `${pr.p.toFixed(2)} / ${pr.r.toFixed(2)}`;
    dom.kpiAUC.textContent = pr.auc.toFixed(2);

    updatePRChart();
    updateOpsChart();
    updateConfChart();

    const reliability = calculateReliability(state.labels, state.weight);
    if (reliability) {
      dom.kpiIRR.textContent = `${reliability.kappa.toFixed(2)} / ${reliability.alpha.toFixed(2)}`;
    }

    const medianLatency = calculateMedianLatency(state.startTimes);
    if (medianLatency) {
      dom.kpiLatency.textContent = `${medianLatency.toFixed(1)}s`;
    }

    const coverage = calculateAccessibilityCoverage({
      captions: dom.captionsChk.checked,
      usedKeyboard: state.usedKeyboard,
      palette: dom.paletteSel.value,
    });
    dom.kpiA11y.textContent = `${Math.round(coverage * 100)}%`;
    dom.kpiA11y.className = coverage >= 0.95 ? "ok" : coverage >= 0.7 ? "warn" : "bad";

    if (fromCalibration) {
      setCaption("Calibration complete; reliability weight increased; IRR updated.");
    }
  }

  function submitLabel() {
    const tile = tiles[state.idx];
    const label = createVolunteerLabel({
      tile,
      state,
      controls: {
        classSelect: dom.classSel,
        severitySelect: dom.sevSel,
        noteInput: dom.note,
      },
    });

    state.labels.push(label);
    saveLabels(state.labels);
    setCaption(`Submitted: ${label.clazz} (${label.severity}).`);

    const timestamp = Date.now();
    state.startTimes[tile.meta.tile_id] = timestamp;
    recordVolunteerFlag(state, timestamp);

    const isResidualTruth = tile.meta.truth && tile.meta.truth.class !== "clean";
    const residualScore = Math.min(1, Math.max(0, (label.clazz === "clean" ? 0.25 : 0.85) + (Math.random() - 0.5) * 0.2));
    state.scores.push({ tile_id: tile.meta.tile_id, score: residualScore, truth: isResidualTruth });

    enqueueExpert(state, tile.meta);
    renderExpertPane();

    if (!state.simDisabled) {
      simulateExpertDecision(tile.meta);
    }

    updatePRChart();
    recalcKPIs(false);
    return label;
  }

  function simulateExpertDecision(meta) {
    const latencySeconds = 2 + Math.random() * 5;
    const confidence = 0.75;

    setTimeout(() => {
      const decision = {
        tile_id: meta.tile_id,
        decision: "confirm",
        expert_class: "residual",
        expert_confidence: confidence,
        note: "",
        latency_s: latencySeconds.toFixed(2),
      };
      state.expert.push(decision);
      saveExpertDecisions(state.expert);
      recordExpertMetric(state, Date.now(), confidence, latencySeconds);
      recalcKPIs(true);
    }, Math.round(latencySeconds * 1000));
  }

  function renderExpertPane() {
    const recentScores = getRecentScores(state);

    if (!recentScores.length) {
      dom.expertPane.textContent = "Queue is empty.";
      return;
    }

    dom.expertPane.innerHTML = "";

    recentScores.forEach((scoreEntry, index) => {
      const wrapper = documentRef.createElement("div");
      wrapper.style.borderTop = "1px solid #24314d";
      wrapper.style.padding = "8px 0";
      wrapper.innerHTML = `
        <div><strong>${scoreEntry.tile_id}</strong> - residual: ${scoreEntry.score.toFixed(2)} - truth residual: ${scoreEntry.truth}</div>
        <div class="row">
          <button type="button" data-i="${index}" data-d="confirm">Confirm</button>
          <button type="button" data-i="${index}" data-d="override">Override</button>
          <select data-i="${index}" data-c="conf">
            <option value="0.6">0.6</option>
            <option value="0.75" selected>0.75</option>
            <option value="0.9">0.9</option>
          </select>
          <input data-i="${index}" data-c="note" placeholder="expert note" class="small">
        </div>`;
      dom.expertPane.appendChild(wrapper);
    });

    dom.expertPane.querySelectorAll("button[data-d]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const localIndex = Number(event.currentTarget.dataset.i);
        const scoreEntry = recentScores[localIndex];
        const row = event.currentTarget.closest(".row");
        const confidence = parseFloat(row.querySelector('select[data-c="conf"]').value || "0.75");
        const note = row.querySelector('input[data-c="note"]').value || "";
        const decision = event.currentTarget.dataset.d;
        const decidedAt = Date.now();
        const expertDecision = createExpertDecision({
          scoreEntry,
          decision,
          confidence,
          note,
          startedAt: state.startTimes[scoreEntry.tile_id],
          decidedAt,
        });

        state.expert.push(expertDecision);
        saveExpertDecisions(state.expert);
        recordExpertMetric(state, decidedAt, confidence, parseFloat(expertDecision.latency_s));
        liveSeries.push({ t: decidedAt, v: scoreEntry.score });
        updateLiveChart();
        setCaption(`Expert ${expertDecision.expert_class} recorded for ${scoreEntry.tile_id} (conf ${confidence}).`);
        recalcKPIs();
      });
    });
  }

  function pickGold(count) {
    return tiles
      .filter((tile) => tile.meta.truth.class !== "clean")
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  function updateCalibrationUI() {
    dom.calibStep.textContent = calibration.active ? `${calibration.index + 1}/3` : "";
    const explainOk = dom.calibExplain.dataset.ok === "1";
    dom.nextStep.disabled = !calibration.active || (calibration.gate === "gated" && !explainOk);

    const meta = calibration.active ? calibration.tiles[calibration.index].meta : null;
    dom.calibHint.textContent = meta ? HINTS[meta.truth.class] : "";
  }

  function startCalibFlow() {
    calibration.mode = dom.calibMode.value;
    calibration.gate = dom.gatePolicy.value;
    calibration.active = true;
    calibration.tiles = pickGold(3);
    calibration.index = 0;
    calibration.correct = 0;

    state.idx = tiles.indexOf(calibration.tiles[0]);
    drawTile(state.idx);
    dom.calibExplain.textContent = "Choose class and Submit, then Next.";
    dom.calibExplain.dataset.ok = "0";
    updateCalibrationUI();
  }

  function onCalibSubmit(label) {
    if (!calibration.active || !label) {
      return;
    }

    const truth = calibration.tiles[calibration.index].meta.truth.class;
    const ok = label.clazz === truth;
    calibration.correct += ok ? 1 : 0;
    dom.calibExplain.textContent = ok ? "Correct: class matches expected residual." : `Expected ${truth}. ${HINTS[truth]}`;
    dom.calibExplain.dataset.ok = ok ? "1" : "0";
    updateCalibrationUI();
  }

  function nextCalibStep() {
    if (!calibration.active) {
      return;
    }

    if (calibration.index >= calibration.tiles.length - 1) {
      calibration.active = false;
      dom.calibStep.textContent = "Done";
      dom.calibStatus.textContent = `Score: ${calibration.correct}/3`;
      return;
    }

    calibration.index += 1;
    state.idx = tiles.indexOf(calibration.tiles[calibration.index]);
    drawTile(state.idx);
    dom.calibExplain.textContent = "Choose class and Submit, then Next.";
    dom.calibExplain.dataset.ok = "0";
    updateCalibrationUI();
  }

  function processFeedObject(object) {
    if (!object || !object.type) {
      return;
    }

    if (object.type === "tile" && object.png) {
      const image = new Image();
      image.onload = () => {
        const canvas = documentRef.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        canvas.getContext("2d").drawImage(image, 0, 0, 256, 256);
        tiles.push({
          meta: {
            tile_id: object.tile_id || `tile_${Date.now()}`,
            dataset: object.dataset || "EXT",
            band: object.band || "T",
            ra: object.ra || 0,
            dec: object.dec || 0,
            release: object.release || "v0",
            doi: object.doi || "",
            truth: { class: "clean", severity: "low" },
            checksum: object.checksum || "",
          },
          canvas,
        });

        if (object.overlay) {
          dom.overlaySel.value = object.overlay;
        }

        populateTileSelect();
        drawTile(tiles.length - 1);
      };
      image.src = object.png;
      return;
    }

    if (object.type === "expert" && object.tile_id) {
      const decidedAt = Date.now();
      const latency = typeof object.latency_s === "number" ? object.latency_s : parseFloat(object.latency_s || "0");
      const confidence =
        typeof object.expert_confidence === "number" ? object.expert_confidence : parseFloat(object.expert_confidence || "0.75");
      state.expert.push({
        tile_id: object.tile_id,
        expert_class: object.expert_class || "residual",
        expert_confidence: confidence,
        note: object.note || "",
        latency_s: latency,
      });
      saveExpertDecisions(state.expert);
      recordExpertMetric(state, decidedAt, confidence, latency);
      recalcKPIs();
    }
  }

  function processCorePackManifest(manifest) {
    const corePackTiles = tileMetasFromCorePack(manifest).map((meta) => ({
      meta,
      canvas: synthTile(meta.truth || { class: "clean", severity: "low" }),
    }));

    tiles.push(...corePackTiles);
    populateTileSelect();
    drawTile(tiles.length - corePackTiles.length);
    upsertByKey(state.corePacks, "manifest_id", {
      manifest_id: manifest.manifest_id,
      name: manifest.name,
      tile_count: manifest.tiles.length,
      diagnostic_ref_count: manifest.diagnostic_refs?.length || 0,
    });

    for (const sbomRef of manifest.sbom_refs || []) {
      upsertByKey(state.sbomRefs, "sbom_id", sbomRef);
    }

    state.diagnostics = createDiagnosticPlaceholders({ manifest });
    renderDiagnostics();
  }

  function renderDiagnostics() {
    if (!dom.diagnosticSummary || !dom.diagnosticList) {
      return;
    }

    dom.diagnosticList.replaceChildren();

    if (!state.diagnostics.length) {
      dom.diagnosticSummary.textContent = "No diagnostic placeholders loaded.";
      return;
    }

    dom.diagnosticSummary.textContent = `${state.diagnostics.length} caveated diagnostic placeholder(s). Not validated scientific results.`;
    for (const diagnostic of state.diagnostics) {
      const card = documentRef.createElement("div");
      card.className = "diagnostic-card";
      const score = diagnostic.outputs.find((output) => output.key === "placeholder_score");
      const limitation = diagnostic.limitations[0] || "Placeholder limitations are documented in claim boundaries.";
      const title = documentRef.createElement("strong");
      const status = documentRef.createElement("div");
      const caveat = documentRef.createElement("div");
      const limitationLine = documentRef.createElement("div");

      title.textContent = diagnostic.name;
      status.className = "small";
      status.textContent = `Status: ${diagnostic.status}; implementation: ${diagnostic.implementation_state}; score: ${score?.value ?? "n/a"} ${score?.unit || ""}`;
      caveat.className = "small warn-text";
      caveat.textContent = diagnostic.caveat;
      limitationLine.className = "small";
      limitationLine.textContent = `Limitation: ${limitation}`;

      card.append(title, status, caveat, limitationLine);
      dom.diagnosticList.appendChild(card);
    }

    notifyTestBridge("diagnostics.rendered", { diagnostics: state.diagnostics });
  }

  function recordArtifactImport(result) {
    upsertByKey(state.researchArtifacts, "artifact_id", result.artifact);
    upsertByKey(state.provenanceHashes, "subject", result.provenanceHash);
    state.feedErrors.push(...result.errors);
  }

  async function importResearchArtifactText(text, { source }) {
    const result = await parseResearchArtifactPayload(String(text || ""), { source });
    recordArtifactImport(result);

    if (result.kind === "core-pack") {
      if (result.errors.length) {
        dom.feedStatus.textContent = `Core Pack rejected ${result.errors.length} intake check(s): ${result.errors[0].message}`;
        return result;
      }

      processCorePackManifest(result.manifest);
      dom.feedStatus.textContent = `Loaded Core Pack ${result.manifest.manifest_id}: ${result.manifest.tiles.length} tile passport(s).`;
      notifyTestBridge("corePack.loaded", { manifest: result.manifest, artifact: result.artifact });
      return result;
    }

    result.events.forEach(processFeedObject);
    const hashLabel = result.provenanceHash.value.slice("sha256:".length, "sha256:".length + 12);
    dom.feedStatus.textContent = result.errors.length
      ? `Loaded ${result.events.length} feed object(s); rejected ${result.errors.length} by contract. sha256:${hashLabel}`
      : `Loaded ${result.events.length} feed object(s) from research artifact. sha256:${hashLabel}`;
    return result;
  }

  async function loadPublicSample() {
    try {
      const response = await fetch("/examples/core-pack/core-pack.manifest.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      await importResearchArtifactText(text, { source: "examples/core-pack/core-pack.manifest.json" });
    } catch {
      dom.feedStatus.textContent = "Public sample Core Pack unavailable.";
    }
  }

  function startWs(url) {
    try {
      if (feedWS) {
        feedWS.close();
        feedWS = null;
      }

      state.simDisabled = true;
      feedWS = new WebSocket(url);
      feedWS.onopen = () => {
        dom.feedStatus.textContent = `WS connected: ${url} (sim disabled)`;
      };
      feedWS.onmessage = (event) => {
        void importResearchArtifactText(event.data, { source: `ws:${url}` });
      };
      feedWS.onerror = () => {
        dom.feedStatus.textContent = "WS error";
      };
      feedWS.onclose = () => {
        dom.feedStatus.textContent = "WS closed";
        feedWS = null;
      };
    } catch {
      dom.feedStatus.textContent = "WS connect failed";
    }
  }

  function startHttp(url) {
    try {
      if (feedTimer) {
        clearInterval(feedTimer);
        feedTimer = null;
      }

      state.simDisabled = true;
      dom.feedStatus.textContent = `HTTP polling: ${url} (sim disabled)`;
      let lastETag = "";

      feedTimer = setInterval(async () => {
        try {
          const response = await fetch(url, {
            headers: lastETag ? { "If-None-Match": lastETag } : {},
          });
          if (response.status === 304) {
            return;
          }
          const text = await response.text();
          const etag = response.headers.get("ETag");
          if (etag) {
            lastETag = etag;
          }
          if (text) {
            await importResearchArtifactText(text, { source: `http:${url}` });
          }
        } catch {
          dom.feedStatus.textContent = "HTTP poll error";
        }
      }, 2000);
    } catch {
      dom.feedStatus.textContent = "HTTP start failed";
    }
  }

  function stopFeed() {
    if (feedWS) {
      try {
        feedWS.close();
      } catch {
        // Ignore close errors.
      }
      feedWS = null;
    }

    if (feedTimer) {
      clearInterval(feedTimer);
      feedTimer = null;
    }

    dom.feedStatus.textContent = "Feed stopped (sim enabled)";
    state.simDisabled = false;
  }

  function handleFeedUrl() {
    const url = dom.feedUrl.value.trim();
    if (!url) {
      dom.feedStatus.textContent = "Enter a URL";
      return;
    }

    if (dom.feedMethod.value === "ws") {
      startWs(url);
    } else {
      startHttp(url);
    }
  }

  function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) {
      dom.feedStatus.textContent = "No file chosen";
      return;
    }

    state.simDisabled = true;
    const name = file.name.toLowerCase();

    if (!name.endsWith(".json") && !name.endsWith(".ndjson")) {
      dom.feedStatus.textContent = `Unsupported research artifact: ${file.name}. Load JSON or NDJSON.`;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      void importResearchArtifactText(reader.result, { source: `file:${file.name}` });
    };
    reader.readAsText(file);
  }

  function exportLabelsCsv() {
    const rows = labelsToRows(state.labels, tiles, state.expert);
    const columns = [
      "tile_id",
      "dataset",
      "volunteer_id",
      "clazz",
      "severity",
      "note",
      "weight",
      "ts",
      "expert_class",
      "expert_confidence",
      "expert_latency",
    ];
    downloadCsv(buildCSV(rows, columns), "labels.csv");
    setCaption("CSV exported.");
  }

  async function exportSbom() {
    const generatedAt = new Date().toISOString();
    const sbom = createSbom({ generatedAt });
    const sbomContents = JSON.stringify(sbom, null, 2);
    const sbomHash = createProvenanceHash({
      subject: "download:sbom.json",
      sha256: await sha256Text(sbomContents),
      generatedAt,
    });
    const sbomRef = createSbomReference({
      sbom,
      path: "sbom.json",
      checksum: sbomHash.value,
      generatedAt,
    });
    upsertByKey(state.sbomRefs, "sbom_id", sbomRef);
    upsertByKey(state.provenanceHashes, "subject", sbomHash);
    downloadJson(sbom, "sbom.json");
    setCaption("SBOM exported. Provenance hash recorded.");
    notifyTestBridge("sbom.exported", { sbom, sbomRef, provenanceHash: sbomHash });
  }

  async function exportValidationReport() {
    const generatedAt = new Date().toISOString();
    const report = createValidationReport({
      build,
      labels: state.labels,
      feedErrors: state.feedErrors,
      checks: buildValidationChecks(),
      artifacts: state.researchArtifacts,
      sbomRefs: state.sbomRefs,
      provenanceHashes: state.provenanceHashes,
      diagnostics: state.diagnostics,
      generatedAt,
    });
    downloadJson(report, "validation-report.json");
    setCaption("Validation report JSON exported.");
    notifyTestBridge("validationReport.exported", { report });
  }

  function buildValidationChecks() {
    const hasArtifacts = state.researchArtifacts.length > 0;
    const hasCorePack = state.corePacks.length > 0;
    const hasSbomRefs = state.sbomRefs.length > 0;
    const hasHashes = state.provenanceHashes.length > 0;
    const hasDiagnostics = state.diagnostics.length > 0;

    return [
      {
        name: "label records",
        status: "pass",
        detail: `${state.labels.length} label record(s) available for validation report export.`,
      },
      {
        name: "feed and Core Pack imports",
        status: hasArtifacts && state.feedErrors.length === 0 ? "pass" : hasArtifacts ? "warn" : "warn",
        detail: `${state.researchArtifacts.length} artifact(s), ${state.feedErrors.length} contract/intake error(s), ${state.corePacks.length} Core Pack manifest(s).`,
      },
      {
        name: "Core Pack manifest",
        status: hasCorePack ? "pass" : "warn",
        detail: hasCorePack ? `${state.corePacks[0].manifest_id} loaded.` : "No Core Pack manifest loaded in this session.",
      },
      {
        name: "SBOM references",
        status: hasSbomRefs ? "pass" : "warn",
        detail: `${state.sbomRefs.length} SBOM reference(s) attached.`,
      },
      {
        name: "provenance hashes",
        status: hasHashes ? "pass" : "warn",
        detail: `${state.provenanceHashes.length} SHA-256 provenance hash(es) attached.`,
      },
      {
        name: "diagnostic placeholders",
        status: hasDiagnostics ? "pass" : "warn",
        detail: hasDiagnostics
          ? `${state.diagnostics.length} caveated placeholder diagnostic(s) attached; not scientific results.`
          : "No diagnostic placeholders attached.",
      },
      {
        name: "report JSON",
        status: "pass",
        detail: "Validation report JSON is generated before any PDF workflow.",
      },
    ];
  }

  function runSelfChecks() {
    dom.testLog.textContent = "Running tests...\n";
    const tests = [
      { name: "CSV builder", fn: () => buildCSV([{ a: 1, b: "x" }], ["a", "b"]).includes("1") },
      {
        name: "PR-AUC",
        fn: () => {
          const auc = prAUC([
            { thresh: 0.9, p: 1, r: 0.2 },
            { thresh: 0.5, p: 0.8, r: 0.6 },
          ]);
          return auc >= 0 && auc <= 1;
        },
      },
      { name: "Tile synth", fn: () => synthTile({ class: "stripe" }).width === 256 },
      { name: "EMA", fn: () => Math.abs(ema(0.5, 1, 0.5) - 0.75) < 0.01 },
    ];

    let pass = 0;
    for (const test of tests) {
      try {
        const ok = test.fn();
        dom.testLog.textContent += `${ok ? "OK" : "FAIL"} ${test.name}\n`;
        if (ok) {
          pass += 1;
        }
      } catch {
        dom.testLog.textContent += `FAIL ${test.name} (error)\n`;
      }
    }
    dom.testLog.textContent += `\n${pass}/${tests.length} passed.`;
  }

  function createBookmark() {
    const payload = createBookmarkPayload({
      tile: tiles[state.idx],
      overlay: dom.overlaySel.value,
      palette: dom.paletteSel.value,
      rate: parseFloat(dom.rateSel.value),
      loop: state.looping,
      captions: dom.captionsChk.checked,
      seed: state.seed,
    });
    const url = createBookmarkUrl(payload, windowRef.location);
    writeClipboard(url).then(() => setCaption("Bookmark URL copied (state encoded)."));
    notifyTestBridge("bookmark.created", { payload, url });
  }

  function restoreBookmarkFromHash({ notifyMissing = false } = {}) {
    const encoded = getEncodedBookmark(windowRef.location.hash);
    if (!encoded) {
      if (notifyMissing) {
        notifyTestBridge("bookmark.reload", { ok: false, reason: "missing-state" });
      }
      return false;
    }

    try {
      const payload = decodeBookmarkPayload(encoded);
      const tileIndex = tiles.findIndex((tile) => tile.meta.tile_id === payload.tile.id);
      if (tileIndex < 0) {
        notifyTestBridge("bookmark.reload", { ok: false, reason: "tile-not-found", payload });
        return false;
      }

      dom.overlaySel.value = payload.overlay;
      dom.paletteSel.value = payload.palette;
      setRateSelection(payload.env.audio.rate);
      state.rate = payload.env.audio.rate;
      state.looping = payload.env.audio.loop;
      dom.loopBtn.textContent = `Loop: ${state.looping ? "on" : "off"}`;
      dom.loopBtn.setAttribute("aria-pressed", state.looping ? "true" : "false");
      dom.captionsChk.checked = payload.captions;
      state.seed = payload.env.seed;

      drawTile(tileIndex);
      recalcKPIs();
      setCaption("Bookmark restored.");
      notifyTestBridge("bookmark.reload", {
        ok: true,
        payload,
        tile_id: payload.tile.id,
        overlay: payload.overlay,
        palette: payload.palette,
      });
      return true;
    } catch (error) {
      notifyTestBridge("bookmark.reload", { ok: false, reason: "invalid-state", message: error.message });
      return false;
    }
  }

  function setRateSelection(rate) {
    const match = Array.from(dom.rateSel.options).find((option) => Number(option.value) === rate);
    dom.rateSel.value = match ? match.value : String(rate);
  }

  function installKeyboardScope() {
    windowRef.__HOTKEYS_MASTER__ = true;

    const markKeyboardUsed = () => {
      const firstUse = !state.usedKeyboard;
      state.usedKeyboard = true;
      if (firstUse) {
        recalcKPIs();
      }
    };

    const isTypingTarget = (element) => {
      if (!element) return false;
      if (element.isContentEditable) return true;
      const tag = (element.tagName || "").toUpperCase();
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || element.getAttribute?.("role") === "textbox";
    };

    const guarded = new Set([" ", "Spacebar", "l", "L", "s", "S", "c", "C", "ArrowLeft", "ArrowRight", "z", "Z"]);
    windowRef.addEventListener(
      "keydown",
      (event) => {
        const guard = guarded.has(event.key) || (event.ctrlKey && ["z", "Z"].includes(event.key));
        if (!guard) return;
        if (!windowRef.__HOTKEYS_MASTER__ || isTypingTarget(event.target)) {
          event.stopImmediatePropagation();
        }
      },
      true,
    );

    documentRef.addEventListener("keydown", (event) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (["Tab", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        markKeyboardUsed();
      }

      if (event.ctrlKey && event.key === "ArrowLeft") {
        markKeyboardUsed();
        dom.prevBtn.click();
        event.preventDefault();
      } else if (event.ctrlKey && event.key === "ArrowRight") {
        markKeyboardUsed();
        dom.nextBtn.click();
        event.preventDefault();
      } else if (event.ctrlKey && event.key.toLowerCase() === "z") {
        markKeyboardUsed();
        dom.undoBtn.click();
        event.preventDefault();
      } else if (event.key === " ") {
        dom.playBtn.click();
        event.preventDefault();
        markKeyboardUsed();
      } else if (event.key.toLowerCase() === "l") {
        dom.loopBtn.click();
        event.preventDefault();
        markKeyboardUsed();
      } else if (event.key.toLowerCase() === "s") {
        dom.submitBtn.click();
        event.preventDefault();
        markKeyboardUsed();
      } else if (event.key.toLowerCase() === "c") {
        dom.calibBtn.click();
        event.preventDefault();
        markKeyboardUsed();
      }
    });
  }

  function addHotkeyToggle() {
    if (documentRef.getElementById("hotkeyToggle")) {
      return;
    }

    const button = documentRef.createElement("button");
    button.id = "hotkeyToggle";
    button.type = "button";
    button.title = "Toggle global keyboard shortcuts";
    button.className = "pill hotkey-toggle";

    const update = () => {
      const on = windowRef.__HOTKEYS_MASTER__;
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.textContent = on ? "Hotkeys: ON" : "Hotkeys: OFF";
      button.style.opacity = on ? "1" : "0.7";
    };

    button.addEventListener("click", () => {
      windowRef.__HOTKEYS_MASTER__ = !windowRef.__HOTKEYS_MASTER__;
      update();
    });

    documentRef.body.appendChild(button);
    update();
  }

  function wireEvents() {
    dom.prevBtn.addEventListener("click", () => drawTile((state.idx - 1 + tiles.length) % tiles.length));
    dom.nextBtn.addEventListener("click", () => drawTile((state.idx + 1) % tiles.length));
    dom.tileSelect.addEventListener("change", (event) => drawTile(Number(event.target.value)));
    dom.overlaySel.addEventListener("change", () => drawTile(state.idx));
    dom.paletteSel.addEventListener("change", () => {
      drawTile(state.idx);
      recalcKPIs();
    });
    dom.fullscreenBtn.addEventListener("click", () => documentRef.documentElement.requestFullscreen?.());
    dom.playBtn.addEventListener("click", () => {
      audio.toggle();
      notifyTestBridge("audio.play", {
        deterministic: true,
        preview: makeAudioMapForTile(tiles[state.idx]).slice(0, 5).map((point) => point.freq),
      });
    });
    dom.loopBtn.addEventListener("click", () => {
      state.looping = !state.looping;
      dom.loopBtn.textContent = `Loop: ${state.looping ? "on" : "off"}`;
      dom.loopBtn.setAttribute("aria-pressed", state.looping ? "true" : "false");
      setCaption(`Loop ${state.looping ? "on" : "off"}.`);
    });
    dom.rateSel.addEventListener("change", () => {
      state.rate = parseFloat(dom.rateSel.value);
      setCaption(`Rate ${state.rate}x.`);
    });
    dom.captionsChk.addEventListener("change", () => {
      setCaption(dom.captionsChk.checked ? "Captions on." : "");
      recalcKPIs();
    });
    dom.submitBtn.addEventListener("click", () => onCalibSubmit(submitLabel()));
    dom.undoBtn.addEventListener("click", () => {
      undoLastLabel(state);
      setCaption("Undid last label.");
      recalcKPIs();
    });
    dom.calibBtn.addEventListener("click", startCalibFlow);
    dom.expertBtn.addEventListener("click", () => {
      dom.expertDetails.open = true;
      dom.expertDetails.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    dom.bookmarkBtn.addEventListener("click", createBookmark);
    dom.exportCSV.addEventListener("click", exportLabelsCsv);
    dom.exportSBOM.addEventListener("click", exportSbom);
    dom.exportReport.addEventListener("click", exportValidationReport);
    dom.runTests.addEventListener("click", runSelfChecks);
    dom.startCalib.addEventListener("click", startCalibFlow);
    dom.nextStep.addEventListener("click", nextCalibStep);
    dom.startFeed.addEventListener("click", handleFeedUrl);
    dom.stopFeed.addEventListener("click", stopFeed);
    dom.loadSample.addEventListener("click", loadPublicSample);
    dom.fileInput.addEventListener("change", handleFileLoad);
    windowRef.addEventListener("hashchange", () => restoreBookmarkFromHash({ notifyMissing: true }));
  }

  function init() {
    windowRef.COSMOS_BUILD = build;
    windowRef.__COSMOS_DEV__ = config.dev;
    windowRef.DEMO = tiles;
    windowRef.state = state;

    populateTileSelect();
    drawTile(0);
    renderExpertPane();
    wireEvents();
    installKeyboardScope();
    addHotkeyToggle();
    const restoredBookmark = restoreBookmarkFromHash();
    recalcKPIs();
    if (!restoredBookmark) {
      setCaption("Ready. Use keyboard or controls; captions appear here.");
    }

    notifyTestBridge("build.info", build);
    notifyTestBridge("truth.visible", {
      visible: Boolean(dom.truthTag.offsetParent),
      dev: config.dev,
    });
  }

  return {
    init,
    drawTile,
    audioPreview: () => makeAudioMapForTile(tiles[state.idx]).slice(0, 5).map((point) => point.freq),
    recalcKPIs,
    state,
    tiles,
    charts,
  };
}

function drawFallbackChart(canvas, type, data) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width || 300;
  const height = canvas.height || 160;
  const datasets = data?.datasets || [];

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0a1020";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#2a395f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 10);
  ctx.lineTo(24, height - 20);
  ctx.lineTo(width - 10, height - 20);
  ctx.stroke();

  datasets.forEach((dataset, datasetIndex) => {
    const values = normalizeChartValues(dataset.data || []);
    const color = dataset.borderColor || dataset.backgroundColor || (datasetIndex ? "#22c55e" : "#60a5fa");
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    if (!values.length) {
      ctx.fillRect(28 + datasetIndex * 12, height - 28, 8, 8);
      return;
    }

    if (type === "bar") {
      const barWidth = Math.max(8, (width - 44) / values.length - 6);
      values.forEach((value, index) => {
        const x = 30 + index * (barWidth + 6);
        const barHeight = Math.max(3, value * (height - 40));
        ctx.fillRect(x, height - 20 - barHeight, barWidth, barHeight);
      });
      return;
    }

    ctx.beginPath();
    values.forEach((value, index) => {
      const x = 28 + (index / Math.max(1, values.length - 1)) * (width - 44);
      const y = height - 20 - value * (height - 40);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });
    ctx.stroke();
  });
}

function normalizeChartValues(values) {
  const numeric = values.map((value) => {
    if (typeof value === "number") return value;
    if (value && typeof value === "object") return Number(value.y ?? value.v ?? 0);
    return Number(value || 0);
  });
  const max = Math.max(1, ...numeric.map((value) => Math.abs(value)));
  return numeric.map((value) => Math.max(0, Math.min(1, value / max)));
}

function getEncodedBookmark(hash) {
  if (!hash || !hash.startsWith("#")) {
    return "";
  }

  const params = new URLSearchParams(hash.slice(1));
  return params.get("state") || "";
}

function bindDom(documentRef) {
  const get = (id) => documentRef.getElementById(id);

  return {
    tileCanvas: get("tileCanvas"),
    tileSelect: get("tileSelect"),
    prevBtn: get("prevBtn"),
    nextBtn: get("nextBtn"),
    overlaySel: get("overlaySel"),
    paletteSel: get("paletteSel"),
    fullscreenBtn: get("fullscreenBtn"),
    playBtn: get("playBtn"),
    loopBtn: get("loopBtn"),
    rateSel: get("rateSel"),
    captionsChk: get("captionsChk"),
    classSel: get("classSel"),
    sevSel: get("sevSel"),
    note: get("note"),
    submitBtn: get("submitBtn"),
    undoBtn: get("undoBtn"),
    calibBtn: get("calibBtn"),
    expertBtn: get("expertBtn"),
    bookmarkBtn: get("bookmarkBtn"),
    caption: get("caption"),
    tileId: get("tileId"),
    truthTag: get("truthTag"),
    prog: get("prog"),
    kpiAUC: get("kpiAUC"),
    kpiPR: get("kpiPR"),
    kpiIRR: get("kpiIRR"),
    kpiLatency: get("kpiLatency"),
    kpiA11y: get("kpiA11y"),
    calibMode: get("calibMode"),
    gatePolicy: get("gatePolicy"),
    startCalib: get("startCalib"),
    nextStep: get("nextStep"),
    calibStep: get("calibStep"),
    calibHint: get("calibHint"),
    calibExplain: get("calibExplain"),
    calibStatus: get("calibStatus"),
    fileInput: get("fileInput"),
    feedMethod: get("feedMethod"),
    feedUrl: get("feedUrl"),
    startFeed: get("startFeed"),
    stopFeed: get("stopFeed"),
    loadSample: get("loadSample"),
    feedStatus: get("feedStatus"),
    exportSBOM: get("exportSBOM"),
    exportReport: get("exportReport"),
    runTests: get("runTests"),
    testLog: get("testLog"),
    exportCSV: get("exportCSV"),
    expertDetails: get("expertDetails"),
    expertPane: get("expertPane"),
    diagnosticSummary: get("diagnosticSummary"),
    diagnosticList: get("diagnosticList"),
  };
}

function upsertByKey(items, key, value) {
  const index = items.findIndex((item) => item[key] === value[key]);
  if (index >= 0) {
    items[index] = value;
  } else {
    items.push(value);
  }
}
