import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CONTRACT_SCHEMA_VERSION, assertContract } from "../../../packages/schemas/src/index.js";
import { TARGET_COVERAGE } from "../test/browser/fixtures/legacy-targets.mjs";

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
const migratedTargetCoverage = TARGET_COVERAGE;

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
