import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../packages/schemas/src/index.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const source = "archive/original-materials/legacy-v3/COSMOS_TEST_CHECKLIST_v3.html";
const output = "tests/evidence/legacy-v3-checklist-targets.json";
const sourcePath = path.join(repoRoot, source);
const outputPath = path.join(repoRoot, output);
const legacyClaimedTotal = 100;
const expectedManualTargetCount = 86;
const expectedBridgeTargetCount = 7;
const bridgeSection = "Auto-Validated Checks (Bridge)";
const browserWorkflowSpec = "apps/web/test/browser/workflows.spec.mjs";
const migratedTargetCoverage = new Map(
  [
    "legacy-v3.manual.1-tile-navigation-display.001",
    "legacy-v3.manual.1-tile-navigation-display.002",
    "legacy-v3.manual.1-tile-navigation-display.003",
    "legacy-v3.manual.1-tile-navigation-display.004",
    "legacy-v3.manual.1-tile-navigation-display.005",
    "legacy-v3.manual.1-tile-navigation-display.006",
    "legacy-v3.manual.1-tile-navigation-display.007",
    "legacy-v3.manual.2-overlays-visualization.001",
    "legacy-v3.manual.2-overlays-visualization.002",
    "legacy-v3.manual.2-overlays-visualization.003",
    "legacy-v3.manual.2-overlays-visualization.004",
    "legacy-v3.manual.2-overlays-visualization.005",
    "legacy-v3.manual.2-overlays-visualization.006",
    "legacy-v3.manual.2-overlays-visualization.007",
    "legacy-v3.manual.3-audio-sonification.001",
    "legacy-v3.manual.3-audio-sonification.002",
    "legacy-v3.manual.3-audio-sonification.003",
    "legacy-v3.manual.3-audio-sonification.004",
    "legacy-v3.manual.3-audio-sonification.005",
    "legacy-v3.manual.3-audio-sonification.006",
    "legacy-v3.manual.3-audio-sonification.007",
    "legacy-v3.manual.3-audio-sonification.008",
    "legacy-v3.manual.4-classification-submission.001",
    "legacy-v3.manual.4-classification-submission.002",
    "legacy-v3.manual.4-classification-submission.003",
    "legacy-v3.manual.4-classification-submission.004",
    "legacy-v3.manual.4-classification-submission.005",
    "legacy-v3.manual.4-classification-submission.006",
    "legacy-v3.manual.4-classification-submission.007",
    "legacy-v3.manual.4-classification-submission.008",
    "legacy-v3.manual.5-calibration-wizard.001",
    "legacy-v3.manual.5-calibration-wizard.002",
    "legacy-v3.manual.5-calibration-wizard.003",
    "legacy-v3.manual.5-calibration-wizard.004",
    "legacy-v3.manual.5-calibration-wizard.005",
    "legacy-v3.manual.5-calibration-wizard.006",
    "legacy-v3.manual.5-calibration-wizard.007",
    "legacy-v3.manual.5-calibration-wizard.008",
    "legacy-v3.manual.5-calibration-wizard.009",
    "legacy-v3.manual.6-expert-queue.001",
    "legacy-v3.manual.6-expert-queue.002",
    "legacy-v3.manual.6-expert-queue.003",
    "legacy-v3.manual.6-expert-queue.004",
    "legacy-v3.manual.6-expert-queue.005",
    "legacy-v3.manual.6-expert-queue.006",
    "legacy-v3.manual.6-expert-queue.007",
    "legacy-v3.manual.7-live-metrics-charts.001",
    "legacy-v3.manual.7-live-metrics-charts.002",
    "legacy-v3.manual.7-live-metrics-charts.003",
    "legacy-v3.manual.7-live-metrics-charts.004",
    "legacy-v3.manual.7-live-metrics-charts.005",
    "legacy-v3.manual.7-live-metrics-charts.006",
    "legacy-v3.manual.7-live-metrics-charts.007",
    "legacy-v3.manual.7-live-metrics-charts.008",
    "legacy-v3.manual.7-live-metrics-charts.009",
    "legacy-v3.manual.8-data-import-export.001",
    "legacy-v3.manual.8-data-import-export.002",
    "legacy-v3.manual.8-data-import-export.003",
    "legacy-v3.manual.8-data-import-export.004",
    "legacy-v3.manual.8-data-import-export.005",
    "legacy-v3.manual.8-data-import-export.006",
    "legacy-v3.manual.8-data-import-export.007",
    "legacy-v3.manual.8-data-import-export.008",
    "legacy-v3.manual.8-data-import-export.009",
    "legacy-v3.manual.9-built-in-tests.001",
    "legacy-v3.manual.9-built-in-tests.002",
    "legacy-v3.manual.9-built-in-tests.003",
    "legacy-v3.manual.9-built-in-tests.004",
    "legacy-v3.manual.9-built-in-tests.005",
    "legacy-v3.manual.9-built-in-tests.006",
    "legacy-v3.manual.10-ui-ux-polish.001",
    "legacy-v3.manual.10-ui-ux-polish.002",
    "legacy-v3.manual.10-ui-ux-polish.003",
    "legacy-v3.manual.10-ui-ux-polish.004",
    "legacy-v3.manual.10-ui-ux-polish.005",
    "legacy-v3.manual.10-ui-ux-polish.006",
    "legacy-v3.manual.10-ui-ux-polish.007",
    "legacy-v3.manual.10-ui-ux-polish.008",
    "legacy-v3.manual.10-ui-ux-polish.009",
    "legacy-v3.manual.10-ui-ux-polish.010",
    "legacy-v3.manual.11-accessibility.001",
    "legacy-v3.manual.11-accessibility.002",
    "legacy-v3.manual.11-accessibility.003",
    "legacy-v3.manual.11-accessibility.004",
    "legacy-v3.manual.11-accessibility.005",
    "legacy-v3.manual.11-accessibility.006",
    "legacy-v3.bridge.a11y-95",
    "legacy-v3.bridge.audio-deterministic",
    "legacy-v3.bridge.bookmark-created",
    "legacy-v3.bridge.bookmark-roundtrip",
    "legacy-v3.bridge.irr-alpha-ok",
    "legacy-v3.bridge.sbom-exported",
    "legacy-v3.bridge.truth-hidden-public",
  ].map((targetId) => [targetId, browserWorkflowSpec]),
);

const html = await readFile(sourcePath, "utf8");
const lines = html.split("\n");
const sourceSha256 = `sha256:${createHash("sha256").update(html).digest("hex").toUpperCase()}`;
const sectionCounters = new Map();
const manualTargets = [];
const bridgeTargets = [];
let currentSection = "";

lines.forEach((rawLine, index) => {
  const lineNumber = index + 1;
  const line = trimCarriageReturn(rawLine);
  const heading = extractBetween(line, "<h2>", "</h2>");

  if (heading) {
    currentSection = normalizeText(stripTags(heading));
  }

  if (line.includes('class="test-item"') && line.includes("<label>")) {
    const id = buildTargetId("manual", currentSection);
    const label = normalizeText(stripTags(extractBetween(line, "<label>", "</label>")));
    manualTargets.push(applyMigrationCoverage({
      id,
      source_line: lineNumber,
      section: currentSection,
      label,
      mode: "manual",
      automation: "manual",
      status: "tracked",
    }));
  }

  if (line.includes("data-testid=") && line.includes("<input")) {
    const dataTestId = extractAttribute(line, "data-testid");
    const label = normalizeText(stripTags(extractBetween(line, "<label>", "</label>")));
    bridgeTargets.push(applyMigrationCoverage({
      id: `legacy-v3.bridge.${dataTestId}`,
      source_line: lineNumber,
      section: bridgeSection,
      label,
      mode: "bridge",
      automation: "automated",
      status: "migrated",
      data_testid: dataTestId,
    }));
  }
});

if (manualTargets.length !== expectedManualTargetCount) {
  throw new Error(`Expected ${expectedManualTargetCount} manual targets, found ${manualTargets.length}`);
}

if (bridgeTargets.length !== expectedBridgeTargetCount) {
  throw new Error(`Expected ${expectedBridgeTargetCount} bridge targets, found ${bridgeTargets.length}`);
}

const manifest = {
  schema_version: CONTRACT_SCHEMA_VERSION,
  source,
  source_sha256: sourceSha256,
  legacy_claimed_total: legacyClaimedTotal,
  manual_target_count: manualTargets.length,
  bridge_target_count: bridgeTargets.length,
  targets: [...manualTargets, ...bridgeTargets],
};

assertContract("checklistTestTargets", manifest);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${output}`);
console.log(`Tracked ${manualTargets.length} manual targets and ${bridgeTargets.length} bridge targets`);

function buildTargetId(mode, section) {
  const sectionSlug = slugify(section);
  const key = `${mode}:${sectionSlug}`;
  const next = (sectionCounters.get(key) || 0) + 1;
  sectionCounters.set(key, next);
  return `legacy-v3.${mode}.${sectionSlug}.${String(next).padStart(3, "0")}`;
}

function applyMigrationCoverage(target) {
  const coveredBy = migratedTargetCoverage.get(target.id);
  if (!coveredBy) {
    return target;
  }

  return {
    ...target,
    automation: "automated",
    status: "migrated",
    covered_by: [coveredBy],
  };
}

function extractAttribute(line, name) {
  const marker = `${name}="`;
  const start = line.indexOf(marker);
  if (start < 0) return "";
  const valueStart = start + marker.length;
  const valueEnd = line.indexOf('"', valueStart);
  if (valueEnd < 0) return "";
  return line.slice(valueStart, valueEnd);
}

function extractBetween(line, startMarker, endMarker) {
  const start = line.indexOf(startMarker);
  if (start < 0) return "";
  const contentStart = start + startMarker.length;
  const end = line.indexOf(endMarker, contentStart);
  if (end < 0) return "";
  return line.slice(contentStart, end);
}

function stripTags(markup) {
  let text = "";
  let insideTag = false;

  for (const char of markup) {
    if (char === "<") {
      insideTag = true;
      continue;
    }
    if (char === ">") {
      insideTag = false;
      continue;
    }
    if (!insideTag) {
      text += char;
    }
  }

  return text;
}

function normalizeText(text) {
  return collapseSpaces(normalizeLegacyGlyphs(decodeEntities(text))).trim();
}

function collapseSpaces(text) {
  let result = "";
  let lastWasSpace = false;

  for (const char of text) {
    const isSpace = char === " " || char === "\t" || char === "\n" || char === "\r";
    if (isSpace && !lastWasSpace) {
      result += " ";
    }
    if (!isSpace) {
      result += char;
    }
    lastWasSpace = isSpace;
  }

  return result;
}

function decodeEntities(text) {
  return [
    ["&amp;", "&"],
    ["&lt;", "<"],
    ["&gt;", ">"],
    ["&quot;", '"'],
    ["&#39;", "'"],
    ["&larr;", "<-"],
    ["&rarr;", "->"],
    ["&ge;", ">="],
  ].reduce((value, [entity, replacement]) => value.split(entity).join(replacement), text);
}

function normalizeLegacyGlyphs(text) {
  return [
    ["◄", "left arrow"],
    ["►", "right arrow"],
    ["←", "Left"],
    ["→", "Right"],
    ["▶", "play"],
    ["⏸", "pause"],
    ["↻", "loop"],
    ["✓", "check"],
    ["↶", "undo"],
    ["⚙", "settings"],
    ["👁", "review"],
    ["🔗", "link"],
    ["⛶", "fullscreen"],
    ["κ", "kappa"],
    ["α", "alpha"],
    ["≥", ">="],
    ["‑", "-"],
  ].reduce((value, [glyph, replacement]) => value.split(glyph).join(replacement), text);
}

function slugify(text) {
  let slug = "";
  let lastWasDash = false;

  for (const char of text.toLowerCase()) {
    const isAlphaNumeric = (char >= "a" && char <= "z") || (char >= "0" && char <= "9");
    if (isAlphaNumeric) {
      slug += char;
      lastWasDash = false;
      continue;
    }
    if (!lastWasDash && slug.length > 0) {
      slug += "-";
      lastWasDash = true;
    }
  }

  return trimDash(slug) || "section";
}

function trimDash(text) {
  let start = 0;
  let end = text.length;

  while (start < end && text[start] === "-") start += 1;
  while (end > start && text[end - 1] === "-") end -= 1;

  return text.slice(start, end);
}

function trimCarriageReturn(text) {
  return text.endsWith("\r") ? text.slice(0, -1) : text;
}
