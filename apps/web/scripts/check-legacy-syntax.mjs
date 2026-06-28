import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = resolve(import.meta.dirname, "../../..");
const legacyRoot = resolve(repoRoot, "archive/original-materials/legacy-v3");

const files = [
  "COSMOS_v3_public.html",
  "COSMOS_v3_dev.html",
  "COSMOS_v3_1_dev.html",
];

export function extractScripts(html) {
  const scripts = [];
  const normalized = html.toLowerCase();
  let offset = 0;

  while (offset < html.length) {
    const start = normalized.indexOf("<script", offset);
    if (start === -1) {
      break;
    }

    const afterName = start + "<script".length;
    if (!isTagBoundary(html[afterName])) {
      offset = afterName;
      continue;
    }

    const startClose = findTagClose(html, afterName);
    if (startClose === -1) {
      break;
    }

    const end = findScriptEnd(html, normalized, startClose + 1);
    if (!end) {
      break;
    }

    scripts.push(html.slice(startClose + 1, end.open));
    offset = end.close + 1;
  }

  return scripts.join("\n");
}

function findScriptEnd(html, normalized, offset) {
  let cursor = offset;
  while (cursor < html.length) {
    const open = normalized.indexOf("</script", cursor);
    if (open === -1) {
      return null;
    }

    const afterName = open + "</script".length;
    if (!isTagBoundary(html[afterName])) {
      cursor = afterName;
      continue;
    }

    const close = findTagClose(html, afterName);
    if (close === -1) {
      return null;
    }

    return { open, close };
  }

  return null;
}

function findTagClose(html, offset) {
  let quote = "";
  for (let index = offset; index < html.length; index += 1) {
    const char = html[index];
    if (quote) {
      if (char === quote) {
        quote = "";
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ">") {
      return index;
    }
  }
  return -1;
}

function isTagBoundary(char) {
  return !char || char === ">" || char === "/" || isHtmlWhitespace(char);
}

function isHtmlWhitespace(char) {
  return char === " " || char === "\n" || char === "\r" || char === "\t" || char === "\f";
}

export function checkLegacySyntax() {
  let failures = 0;

  for (const file of files) {
    const path = resolve(legacyRoot, file);
    const html = readFileSync(path, "utf8");
    const scripts = extractScripts(html);

    try {
      new Function(scripts);
      console.log(`${file}: JavaScript syntax OK`);
    } catch (error) {
      failures += 1;
      console.error(`${file}: JavaScript syntax failed`);
      console.error(error.message);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
  }

  return failures;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkLegacySyntax();
}
